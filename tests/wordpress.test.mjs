import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadConfig } from '../src/config.mjs';
import { transitionState } from '../src/state.mjs';
import { initWorkspace, writeState } from '../src/workspace.mjs';
import { authorizeExistingPost, buildPostPayload, replaceMediaPlaceholders, upsertWordpressDraft } from '../src/wordpress.mjs';

test('media placeholders are replaced and unresolved values fail', () => {
  const media = new Map([['hero.webp', { source_url: 'https://testheon.com/hero.webp' }]]);
  assert.equal(replaceMediaPlaceholders('<img src="{{MEDIA_URL:hero.webp}}">', media), '<img src="https://testheon.com/hero.webp">');
  assert.throws(() => replaceMediaPlaceholders('{{MEDIA_URL:missing.webp}}', media), /Unresolved/);
});

test('post payload always forces draft', () => {
  const payload = buildPostPayload(
    { title: 'Title', slug: 'title', status: 'publish', excerpt: 'Excerpt' },
    { contentHtml: '<p>Body</p>', categoryId: 2, tagIds: [3], featuredMediaId: 4 }
  );
  assert.equal(payload.status, 'draft');
});

test('existing exact slug requires ownership evidence', () => {
  const existing = { id: 17, status: 'draft', title: { raw: 'Existing' } };
  assert.throws(() => authorizeExistingPost(existing, { title: 'New', wordpress: {} }), /already exists/);
  assert.doesNotThrow(() => authorizeExistingPost(existing, { title: 'New', wordpress: { existingPostId: 17 } }));
  assert.doesNotThrow(() => authorizeExistingPost(existing, { title: 'Existing', wordpress: { allowUpdateExisting: true } }));
  assert.throws(
    () => authorizeExistingPost({ ...existing, status: 'publish' }, { title: 'Existing', wordpress: { existingPostId: 17 } }),
    /automatic update is prohibited/
  );
});

test('mocked upsert is gate-checked, draft-only, and re-fetched', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'testheon-wordpress-'));
  try {
    const config = structuredClone(loadConfig());
    config.artifacts.root = root;
    const { workspace, state } = initWorkspace({ topic: 'Mocked WordPress Draft', root });
    const packagePath = path.join(workspace, 'wordpress', 'article-package.json');
    const articlePackage = {
      schemaVersion: 1,
      title: 'Mocked WordPress Draft',
      slug: 'mocked-wordpress-draft',
      status: 'draft',
      excerpt: 'Mock excerpt.',
      contentHtml: '<p>Mock body.</p>',
      taxonomy: { category: 'QA & Testing', tags: ['Automation'] },
      seo: {
        focusKeyword: 'mocked wordpress draft',
        title: 'Mocked WordPress Draft',
        description: 'Mock description.',
        canonicalUrl: 'https://testheon.com/mocked-wordpress-draft/'
      },
      images: [],
      internalLinks: [],
      wordpress: { existingPostId: null, allowUpdateExisting: false }
    };
    fs.writeFileSync(packagePath, JSON.stringify(articlePackage), 'utf8');

    let called = false;
    const neverFetch = async () => { called = true; throw new Error('should not fetch'); };
    await assert.rejects(
      upsertWordpressDraft({ packagePath, workspace, config, env: { USER: 'x' }, fetchImpl: neverFetch }),
      /credentials are unavailable|blocked at stage/
    );
    assert.equal(called, false);

    for (const stage of [
      'trends', 'gsc', 'seo_decision', 'deep_research', 'article_generation', 'head_controller',
      'content_qa', 'image_generation', 'wordpress_package'
    ]) transitionState(state, stage, 'test');
    writeState(workspace, state);

    const requests = [];
    let storedPayload;
    const response = (value, status = 200) => new Response(JSON.stringify(value), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });
    const fetchImpl = async (input, options = {}) => {
      const url = new URL(input);
      const method = options.method || 'GET';
      requests.push(`${method} ${url.pathname}`);
      if (method === 'GET' && url.pathname === '/wp-json/wp/v2/posts') return response([]);
      if (method === 'GET' && url.pathname === '/wp-json/wp/v2/users/me') return response({ id: 1 });
      if (method === 'GET' && url.pathname === '/wp-json/wp/v2/categories') {
        return response(url.searchParams.has('search') ? [] : [{ id: 2, name: 'QA &amp; Testing' }]);
      }
      if (method === 'GET' && url.pathname === '/wp-json/wp/v2/tags') return response([{ id: 3, name: 'Automation' }]);
      if (method === 'POST' && url.pathname === '/wp-json/wp/v2/posts') {
        storedPayload = JSON.parse(options.body);
        return response({ id: 44, ...storedPayload });
      }
      if (method === 'POST' && url.pathname === '/wp-json/rankmath/v1/updateMeta') {
        const rankMath = JSON.parse(options.body);
        assert.deepEqual(Object.keys(rankMath.meta).sort(), config.publishing.rankMathAllowedMetaKeys.toSorted());
        return response({ success: true });
      }
      if (method === 'GET' && url.pathname === '/wp-json/wp/v2/posts/44') {
        return response({
          id: 44,
          status: 'draft',
          slug: storedPayload.slug,
          title: { raw: storedPayload.title },
          content: { raw: storedPayload.content },
          author: storedPayload.author,
          categories: storedPayload.categories,
          tags: storedPayload.tags,
          featured_media: storedPayload.featured_media,
          link: 'https://testheon.com/?p=44'
        });
      }
      return response({ error: `${method} ${url.pathname}` }, 404);
    };

    const result = await upsertWordpressDraft({
      packagePath,
      workspace,
      config,
      env: { TESTHEON_WP_USER: 'test-user', TESTHEON_WP_APP_PASSWORD: 'test-password' },
      fetchImpl
    });
    assert.equal(result.status, 'draft');
    assert.equal(storedPayload.status, 'draft');
    assert.equal(requests.includes('POST /wp-json/wp/v2/categories'), false);
    assert.equal(requests.filter((request) => request === 'GET /wp-json/wp/v2/categories').length, 2);
    assert.equal(requests.at(-1), 'GET /wp-json/wp/v2/posts/44');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

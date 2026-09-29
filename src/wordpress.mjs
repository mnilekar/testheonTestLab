import fs from 'node:fs';
import path from 'node:path';
import { loadConfig } from './config.mjs';
import { assertValidPackage } from './validate.mjs';
import { atomicWriteJson, resolveWorkspace, slugify } from './workspace.mjs';

function queryString(values) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== null) query.set(key, String(value));
  }
  return query.toString();
}

function normalizedHtml(value) {
  return String(value || '').replace(/\r/g, '').replace(/>\s+</g, '><').trim();
}

function assertSuccessfulVerification(failures) {
  if (failures.length) throw new Error(`WordPress verification failed:\n- ${failures.join('\n- ')}`);
}

export function createWordpressClient({
  config = loadConfig(),
  env = process.env,
  fetchImpl = globalThis.fetch
} = {}) {
  const user = env[config.credentials.wordpressUserEnv];
  const password = env[config.credentials.wordpressPasswordEnv];
  if (!user || !password) {
    throw new Error(
      `WordPress credentials are unavailable. Set ${config.credentials.wordpressUserEnv} and ${config.credentials.wordpressPasswordEnv}.`
    );
  }
  if (typeof fetchImpl !== 'function') throw new Error('A fetch implementation is required.');

  const authorization = `Basic ${Buffer.from(`${user}:${password}`).toString('base64')}`;
  const baseUrl = config.site.url.replace(/\/$/, '');

  async function request(route, { method = 'GET', json, body, headers = {} } = {}) {
    const requestHeaders = { Accept: 'application/json', Authorization: authorization, ...headers };
    let requestBody = body;
    if (json !== undefined) {
      requestHeaders['Content-Type'] = 'application/json';
      requestBody = JSON.stringify(json);
    }
    const response = await fetchImpl(`${baseUrl}${route}`, { method, headers: requestHeaders, body: requestBody });
    const text = await response.text();
    let value = null;
    if (text) {
      try { value = JSON.parse(text); }
      catch { value = text; }
    }
    if (!response.ok) {
      const detail = typeof value === 'string' ? value.slice(0, 500) : JSON.stringify(value).slice(0, 500);
      throw new Error(`WordPress ${method} ${route} failed with HTTP ${response.status}: ${detail}`);
    }
    return value;
  }

  return { request, baseUrl };
}

export function replaceMediaPlaceholders(contentHtml, mediaByPlaceholder) {
  let content = contentHtml;
  for (const [placeholder, media] of mediaByPlaceholder) {
    content = content.replaceAll(`{{MEDIA_URL:${placeholder}}}`, media.source_url);
  }
  const unresolved = [...content.matchAll(/\{\{MEDIA_URL:([^}]+)\}\}/g)].map((match) => match[1]);
  if (unresolved.length) throw new Error(`Unresolved media placeholders: ${unresolved.join(', ')}`);
  return content;
}

export function authorizeExistingPost(existing, articlePackage, state = null) {
  if (!existing) return;
  if (existing.status !== 'draft') {
    throw new Error(`Exact slug belongs to a ${existing.status || 'non-draft'} post (${existing.id}); automatic update is prohibited.`);
  }
  const explicitId = Number(articlePackage.wordpress?.existingPostId || 0);
  const stateId = Number(state?.wordpress?.postId || 0);
  const existingTitle = String(existing.title?.raw || existing.title?.rendered || '').trim();
  const titleOptIn = articlePackage.wordpress?.allowUpdateExisting === true && existingTitle === articlePackage.title.trim();
  if (explicitId !== Number(existing.id) && stateId !== Number(existing.id) && !titleOptIn) {
    throw new Error(
      `Exact slug already exists as post ${existing.id}. Set wordpress.existingPostId to that ID only after confirming ownership.`
    );
  }
}

async function findExactPost(client, slug) {
  const query = queryString({ slug, status: 'any', context: 'edit', per_page: 100 });
  const posts = await client.request(`/wp-json/wp/v2/posts?${query}`);
  const exact = posts.filter((post) => post.slug === slug);
  if (exact.length > 1) throw new Error(`Multiple WordPress posts use exact slug "${slug}".`);
  return exact[0] || null;
}

function decodedWordpressTermName(value) {
  return String(value || '')
    .replace(/&#x([0-9a-f]+);/gi, (_, codePoint) => String.fromCodePoint(Number.parseInt(codePoint, 16)))
    .replace(/&#(\d+);/g, (_, codePoint) => String.fromCodePoint(Number(codePoint)))
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/(?:&#0?39;|&apos;)/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

async function findOrCreateTerm(client, endpoint, name) {
  const expectedName = name.trim().toLowerCase();
  const matchesName = (term) => decodedWordpressTermName(term.name).trim().toLowerCase() === expectedName;
  const terms = await client.request(`/wp-json/wp/v2/${endpoint}?${queryString({ search: name, per_page: 100, context: 'edit' })}`);
  let exact = terms.find(matchesName);
  if (!exact) {
    const unfiltered = await client.request(`/wp-json/wp/v2/${endpoint}?${queryString({ per_page: 100, context: 'edit' })}`);
    exact = unfiltered.find(matchesName);
  }
  if (exact) return exact;
  return client.request(`/wp-json/wp/v2/${endpoint}`, { method: 'POST', json: { name: name.trim() } });
}

async function uploadOrReuseMedia(client, image, packagePath) {
  const imagePath = path.isAbsolute(image.path) ? image.path : path.resolve(path.dirname(packagePath), image.path);
  const filename = path.basename(imagePath);
  const mediaSlug = slugify(path.parse(filename).name);
  const existing = await client.request(`/wp-json/wp/v2/media?${queryString({ slug: mediaSlug, per_page: 100, context: 'edit' })}`);
  const exact = existing.find((media) => media.slug === mediaSlug);
  if (exact) {
    verifyMedia(exact, image, filename, { verifyAlt: false });
    if (exact.alt_text !== image.alt || String(exact.caption?.raw || '') !== String(image.caption || '')) {
      const updated = await client.request(`/wp-json/wp/v2/media/${exact.id}`, {
        method: 'POST',
        json: { alt_text: image.alt, caption: image.caption || '' }
      });
      verifyMedia(updated, image, filename);
      return updated;
    }
    return exact;
  }

  const extension = path.extname(filename).toLowerCase();
  const mimeTypes = { '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg' };
  const contentType = mimeTypes[extension];
  if (!contentType) throw new Error(`Unsupported image type for ${filename}.`);
  const uploaded = await client.request('/wp-json/wp/v2/media', {
    method: 'POST',
    body: fs.readFileSync(imagePath),
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename.replace(/["\r\n]/g, '')}"`
    }
  });
  const updated = await client.request(`/wp-json/wp/v2/media/${uploaded.id}`, {
    method: 'POST',
    json: { alt_text: image.alt, caption: image.caption || '' }
  });
  verifyMedia(updated, image, filename);
  return updated;
}

function verifyMedia(media, image, filename, { verifyAlt = true } = {}) {
  const failures = [];
  if (!media?.source_url) failures.push('source URL is missing');
  if (media?.mime_type !== image.mimeType) failures.push(`MIME type is ${media?.mime_type || 'missing'}, expected ${image.mimeType}`);
  if (Number(media?.media_details?.width) !== image.width) failures.push(`width is ${media?.media_details?.width || 'missing'}, expected ${image.width}`);
  if (Number(media?.media_details?.height) !== image.height) failures.push(`height is ${media?.media_details?.height || 'missing'}, expected ${image.height}`);
  if (verifyAlt && media?.alt_text !== image.alt) failures.push('alt text differs');
  if (failures.length) throw new Error(`WordPress media verification failed for ${filename}: ${failures.join('; ')}`);
}

export function buildPostPayload(articlePackage, { contentHtml, authorId, categoryId, tagIds, featuredMediaId = 0 }) {
  return {
    title: articlePackage.title,
    slug: articlePackage.slug,
    status: 'draft',
    excerpt: articlePackage.excerpt,
    content: contentHtml,
    author: authorId,
    categories: [categoryId],
    tags: tagIds,
    featured_media: featuredMediaId
  };
}

function verifyStoredPost(post, expected) {
  const failures = [];
  if (post.status !== 'draft') failures.push(`status is ${post.status}, not draft`);
  if (post.slug !== expected.slug) failures.push(`slug is ${post.slug}, not ${expected.slug}`);
  if (String(post.title?.raw || '').trim() !== expected.title.trim()) failures.push('stored title differs');
  if (normalizedHtml(post.content?.raw) !== normalizedHtml(expected.content)) failures.push('stored content differs');
  if (Number(post.author) !== Number(expected.author)) failures.push('stored author differs');
  if (!post.categories?.includes(expected.categories[0])) failures.push('stored category differs');
  for (const tagId of expected.tags) if (!post.tags?.includes(tagId)) failures.push(`tag ${tagId} is missing`);
  if (Number(post.featured_media || 0) !== Number(expected.featured_media || 0)) failures.push('featured image differs');
  assertSuccessfulVerification(failures);
}

function backupExistingPost(workspace, post) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(workspace, 'wordpress', 'backups', `${timestamp}-post-${post.id}.json`);
  atomicWriteJson(backupPath, post);
  return backupPath;
}

export async function upsertWordpressDraft({
  packagePath,
  workspace: workspaceInput,
  config = loadConfig(),
  env = process.env,
  fetchImpl = globalThis.fetch
}) {
  const absolutePackagePath = path.resolve(packagePath);
  const workspace = resolveWorkspace(workspaceInput, config);
  const relativePackage = path.relative(workspace, absolutePackagePath);
  if (relativePackage.startsWith('..') || path.isAbsolute(relativePackage)) {
    throw new Error('The executable article package must be inside its article workspace.');
  }

  const { articlePackage } = assertValidPackage(absolutePackagePath);
  const statePath = path.join(workspace, 'state.json');
  const state = fs.existsSync(statePath) ? JSON.parse(fs.readFileSync(statePath, 'utf8')) : null;
  if (!state) throw new Error('Workspace state.json is required before a WordPress write.');
  if (state && state.slug !== articlePackage.slug) throw new Error('Package slug does not match workspace state.');
  if (!['wordpress_package', 'wordpress_draft'].includes(state.stage)) {
    throw new Error(`WordPress write is blocked at stage ${state.stage}; all required gates must reach wordpress_package first.`);
  }

  const client = createWordpressClient({ config, env, fetchImpl });
  const existing = await findExactPost(client, articlePackage.slug);
  authorizeExistingPost(existing, articlePackage, state);

  let backupPath = null;
  if (existing) backupPath = backupExistingPost(workspace, existing);

  const requestedAuthorId = articlePackage.wordpress?.authorId;
  const author = requestedAuthorId
    ? await client.request(`/wp-json/wp/v2/users/${requestedAuthorId}?context=edit`)
    : await client.request('/wp-json/wp/v2/users/me?context=edit');
  if (!Number.isInteger(Number(author?.id)) || (requestedAuthorId && Number(author.id) !== Number(requestedAuthorId))) {
    throw new Error('The intended WordPress author could not be verified.');
  }

  const category = await findOrCreateTerm(client, 'categories', articlePackage.taxonomy.category);
  const tags = [];
  for (const tagName of articlePackage.taxonomy.tags) tags.push(await findOrCreateTerm(client, 'tags', tagName));

  const mediaByPlaceholder = new Map();
  for (const image of articlePackage.images) {
    const media = await uploadOrReuseMedia(client, image, absolutePackagePath);
    mediaByPlaceholder.set(image.placeholder, media);
  }
  const contentHtml = replaceMediaPlaceholders(articlePackage.contentHtml, mediaByPlaceholder);
  const featuredImage = articlePackage.images.find((image) => image.featured === true);
  const featuredMediaId = featuredImage ? mediaByPlaceholder.get(featuredImage.placeholder).id : 0;
  const postPayload = buildPostPayload(articlePackage, {
    contentHtml,
    authorId: Number(author.id),
    categoryId: category.id,
    tagIds: tags.map((tag) => tag.id),
    featuredMediaId
  });

  const post = existing
    ? await client.request(`/wp-json/wp/v2/posts/${existing.id}`, { method: 'POST', json: postPayload })
    : await client.request('/wp-json/wp/v2/posts', { method: 'POST', json: postPayload });

  const allowedKeys = new Set(config.publishing.rankMathAllowedMetaKeys);
  const rankMathMeta = {
    rank_math_focus_keyword: articlePackage.seo.focusKeyword,
    rank_math_title: articlePackage.seo.title,
    rank_math_description: articlePackage.seo.description,
    rank_math_canonical_url: articlePackage.seo.canonicalUrl
  };
  for (const key of Object.keys(rankMathMeta)) {
    if (!allowedKeys.has(key)) throw new Error(`Rank Math key is not allowlisted: ${key}`);
  }
  await client.request(config.publishing.rankMathRoute, {
    method: 'POST',
    json: { objectType: 'post', objectID: post.id, meta: rankMathMeta }
  });

  const stored = await client.request(`/wp-json/wp/v2/posts/${post.id}?context=edit`);
  verifyStoredPost(stored, postPayload);

  const result = {
    postId: post.id,
    status: 'draft',
    slug: articlePackage.slug,
    editUrl: `${client.baseUrl}/wp-admin/post.php?post=${post.id}&action=edit`,
    previewUrl: `${client.baseUrl}/?p=${post.id}&preview=true`,
    permalink: stored.link,
    updatedExisting: Boolean(existing),
    backupPath,
    verifiedAt: new Date().toISOString()
  };
  atomicWriteJson(path.join(workspace, 'wordpress', 'draft-result.json'), result);
  return result;
}

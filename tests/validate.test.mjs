import test from 'node:test';
import assert from 'node:assert/strict';
import { validateArticlePackage } from '../src/validate.mjs';

function validPackage() {
  return {
    schemaVersion: 1,
    title: 'Playwright Fixtures',
    slug: 'playwright-fixtures',
    status: 'draft',
    excerpt: 'A concise guide.',
    contentHtml: '<p>Approved body.</p>',
    taxonomy: { category: 'QA & Testing', tags: ['Playwright'] },
    seo: {
      focusKeyword: 'playwright fixtures',
      title: 'Playwright Fixtures Guide',
      description: 'A practical guide to Playwright fixtures.',
      canonicalUrl: 'https://testheon.com/playwright-fixtures/'
    },
    images: [],
    internalLinks: []
  };
}

test('valid draft package passes', () => {
  assert.equal(validateArticlePackage(validPackage()).ok, true);
});

test('published status and H1 are rejected', () => {
  const value = validPackage();
  value.status = 'publish';
  value.contentHtml = '<h1>Forbidden</h1>';
  const result = validateArticlePackage(value);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes('draft')));
  assert.ok(result.errors.some((error) => error.includes('H1')));
});

test('unknown placeholders are rejected', () => {
  const value = validPackage();
  value.contentHtml = '<p>{{TODO}}</p>';
  assert.equal(validateArticlePackage(value).ok, false);
});

test('HTTPS links are not mistaken for Windows filesystem paths', () => {
  const value = validPackage();
  value.contentHtml = '<p>Read the <a href="https://playwright.dev/docs/intro">official guide</a>.</p>';
  assert.equal(validateArticlePackage(value).ok, true);
});

test('local filesystem references are rejected', () => {
  for (const contentHtml of [
    '<p>C:\\Users\\example\\secret.txt</p>',
    '<p>/home/example/secret.txt</p>',
    '<img src="file:///Users/example/secret.png">'
  ]) {
    const value = validPackage();
    value.contentHtml = contentHtml;
    const result = validateArticlePackage(value);
    assert.equal(result.ok, false);
    assert.ok(result.errors.some((error) => error.includes('local filesystem')));
  }
});

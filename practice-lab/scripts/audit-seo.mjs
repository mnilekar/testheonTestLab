import { readFile, readdir } from 'node:fs/promises';
import { join, relative, resolve, sep } from 'node:path';
import { indexPages } from '../src/config/seo.ts';

const dist = resolve('dist');
const release = JSON.parse(await readFile(join(dist, 'release.json'), 'utf8'));
const target = release.target;
const origin =
  target === 'staging'
    ? (process.env.PRACTICE_LAB_STAGING_ORIGIN ??
      'https://practice-staging.testheon.com')
    : 'https://testheon.com';
const failures = [];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const paths = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) paths.push(...(await walk(path)));
    else paths.push(path);
  }
  return paths;
}

function routeFor(file) {
  const path = relative(dist, file).split(sep).join('/');
  if (path === 'index.html') return '/practice/';
  if (path.endsWith('/index.html'))
    return `/practice/${path.slice(0, -'index.html'.length)}`;
  return `/practice/${path}`;
}

function one(html, pattern) {
  return pattern.exec(html)?.[1]?.trim();
}

function decode(value = '') {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#(?:39|x27);/g, "'")
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const files = (await walk(dist)).filter((path) => path.endsWith('.html'));
const pages = new Map();
for (const file of files)
  pages.set(routeFor(file), await readFile(file, 'utf8'));

const allowlist = new Map(
  indexPages.map((page) => [`/practice${page.path}`, page]),
);
const seenTitles = new Map();
const seenDescriptions = new Map();

for (const [route, html] of pages) {
  const robots = one(
    html,
    /<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i,
  );
  if (!robots) failures.push(`${route}: missing robots meta`);

  if (target === 'staging') {
    if (robots !== 'noindex,nofollow')
      failures.push(`${route}: staging robots is ${robots}`);
    continue;
  }

  const definition = allowlist.get(route);
  if (!definition) {
    if (robots !== 'noindex,follow')
      failures.push(`${route}: NOINDEX route uses ${robots}`);
    continue;
  }

  if (robots !== 'index,follow')
    failures.push(`${route}: INDEX route uses ${robots}`);
  const title = decode(one(html, /<title>([\s\S]*?)<\/title>/i));
  const description = decode(
    one(html, /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i),
  );
  const canonical = one(
    html,
    /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i,
  );
  const expectedCanonical = new URL(route, `${origin}/`).toString();
  const h1Count = (html.match(/<h1(?:\s|>)/gi) ?? []).length;
  const breadcrumbLists = (html.match(/"@type":"BreadcrumbList"/g) ?? [])
    .length;
  const internalLinks = (html.match(/href=["']\/practice\//g) ?? []).length;

  if (!title || title.length > 60)
    failures.push(`${route}: title length is ${title.length}`);
  if (seenTitles.has(title))
    failures.push(`${route}: duplicate title with ${seenTitles.get(title)}`);
  else seenTitles.set(title, route);
  if (!description) failures.push(`${route}: missing description`);
  if (seenDescriptions.has(description))
    failures.push(
      `${route}: duplicate description with ${seenDescriptions.get(description)}`,
    );
  else seenDescriptions.set(description, route);
  if (h1Count !== 1) failures.push(`${route}: has ${h1Count} H1 elements`);
  if (!/class=["'][^"']*lede/.test(html))
    failures.push(`${route}: missing useful lede intro`);
  if (!html.includes('data-seo-objective'))
    failures.push(`${route}: missing learning objective`);
  if (!html.includes('aria-label="Breadcrumb"') || breadcrumbLists !== 1)
    failures.push(`${route}: breadcrumb HTML/JSON-LD mismatch`);
  if (canonical !== expectedCanonical)
    failures.push(`${route}: canonical ${canonical} != ${expectedCanonical}`);
  if (!html.includes('data-seo-guide'))
    failures.push(`${route}: missing related Testheon guide`);
  if (!html.includes('data-seo-siblings') || internalLinks < 2)
    failures.push(`${route}: missing sibling practice links in HTML`);
}

for (const route of allowlist.keys())
  if (!pages.has(route)) failures.push(`${route}: INDEX page was not emitted`);

const sitemap = await readFile(join(dist, 'sitemap.xml'), 'utf8');
const sitemapEntries = [
  ...sitemap.matchAll(
    /<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>\s*<\/url>/g,
  ),
].map((match) => ({ loc: match[1], lastmod: match[2] }));

if (target === 'staging' && sitemapEntries.length !== 0)
  failures.push('staging sitemap must be empty');
if (target !== 'staging') {
  if (sitemapEntries.length !== indexPages.length)
    failures.push(
      `sitemap has ${sitemapEntries.length} URLs, expected ${indexPages.length}`,
    );
  for (const page of indexPages) {
    const expected = new URL(`/practice${page.path}`, `${origin}/`).toString();
    const entry = sitemapEntries.find(
      (candidate) => candidate.loc === expected,
    );
    if (!entry) failures.push(`sitemap missing ${expected}`);
    else if (entry.lastmod !== page.lastmod)
      failures.push(`${expected}: wrong lastmod ${entry.lastmod}`);
  }
}

if (failures.length) {
  console.error(`SEO audit failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `SEO audit passed: ${pages.size} HTML routes, ${allowlist.size} INDEX routes, ${sitemapEntries.length} sitemap URLs (${target}).`,
);

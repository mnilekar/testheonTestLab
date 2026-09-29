import fs from 'node:fs';
import path from 'node:path';
import { loadConfig, REPO_ROOT, repoPath } from './config.mjs';
import { slugify } from './workspace.mjs';

const REQUIRED_FILES = Object.freeze([
  'AGENTS.md',
  'config/testheon.config.json',
  'docs/00_TESTHEON_FULLY_AUTOMATED_ARTICLE_PIPELINE.md',
  'docs/ROLE_INDEX.md',
  'docs/SECURITY_AND_CAPABILITIES.md',
  'docs/roles/01_SEO_MANAGER.md',
  'docs/roles/02_HEAD_CONTROLLER.md',
  'docs/roles/03_DEEP_RESEARCH_WRITER.md',
  'docs/roles/04_IMAGE_MANAGER.md',
  'docs/roles/05_CONTENT_ROADMAP_LINEAR.md',
  'docs/roles/06_WORDPRESS_PUBLISHER.md',
  'docs/roles/07_CONTENT_REVIEWER.md',
  'scripts/testheon.mjs',
  'templates/article-package.json'
]);

function walkFiles(directory, results = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (['.git', '.mcp-inspect', 'node_modules', 'artifacts'].includes(entry.name)) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) walkFiles(fullPath, results);
    else if (entry.isFile()) results.push(fullPath);
  }
  return results;
}

export function validateSetup({ env = process.env, root = REPO_ROOT } = {}) {
  const config = loadConfig(path.join(root, 'config', 'testheon.config.json'));
  const errors = [];
  const warnings = [];
  for (const relative of REQUIRED_FILES) {
    if (!fs.existsSync(path.join(root, relative))) errors.push(`Missing required file: ${relative}`);
  }

  const agentsPath = path.join(root, 'AGENTS.md');
  if (fs.existsSync(agentsPath) && fs.statSync(agentsPath).size > 32 * 1024) {
    errors.push('AGENTS.md exceeds Codex discovery limit of 32 KiB.');
  }

  for (const envName of [config.credentials.wordpressUserEnv, config.credentials.wordpressPasswordEnv]) {
    if (!env[envName]) warnings.push(`${envName} is not available in this process; WordPress writes will be blocked.`);
  }

  const secretAssignment = /\b(TESTHEON_WP_USER|TESTHEON_WP_APP_PASSWORD)\s*=\s*["']?([^\s"']+)/g;
  for (const filePath of walkFiles(root)) {
    const relative = path.relative(root, filePath).replaceAll('\\', '/');
    const content = fs.readFileSync(filePath, 'utf8');
    for (const match of content.matchAll(secretAssignment)) {
      const value = match[2];
      if (!value.startsWith('$') && !value.startsWith('<') && !value.includes('process.env')) {
        errors.push(`Possible credential value stored in ${relative}.`);
      }
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    checks: {
      requiredFiles: REQUIRED_FILES.length,
      agentsBytes: fs.existsSync(agentsPath) ? fs.statSync(agentsPath).size : null,
      draftOnly: config.publishing.requiredStatus === 'draft' && config.publishing.manualPublishOnly === true,
      wordpressCredentialsAvailable: Boolean(
        env[config.credentials.wordpressUserEnv] && env[config.credentials.wordpressPasswordEnv]
      )
    }
  };
}

export function loadPackage(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export function validateArticlePackage(articlePackage, { packagePath = null, config = loadConfig() } = {}) {
  const errors = [];
  const warnings = [];
  const requiredStrings = ['title', 'slug', 'excerpt', 'contentHtml'];
  for (const key of requiredStrings) {
    if (typeof articlePackage?.[key] !== 'string' || !articlePackage[key].trim()) {
      errors.push(`${key} must be a non-empty string.`);
    }
  }

  if (articlePackage?.schemaVersion !== 1) errors.push('schemaVersion must be 1.');
  if (articlePackage?.status !== 'draft') errors.push('status must be exactly "draft".');
  if (articlePackage?.slug && articlePackage.slug !== slugify(articlePackage.slug)) {
    errors.push('slug must already be lowercase, ASCII, and hyphenated.');
  }
  if (/<h1\b/i.test(articlePackage?.contentHtml || '')) errors.push('contentHtml must not contain an H1.');
  const localPathPattern = /(?:file:\/\/|(?:^|[\s"'(>=])(?:[A-Za-z]:[\\/]|\/(?:Users|home)\/))/im;
  if (localPathPattern.test(articlePackage?.contentHtml || '')) {
    errors.push('contentHtml contains a local filesystem reference.');
  }

  const unresolved = [...String(articlePackage?.contentHtml || '').matchAll(/\{\{([^}]+)\}\}/g)]
    .map((match) => match[1])
    .filter((value) => !value.startsWith('MEDIA_URL:'));
  if (unresolved.length) errors.push(`Unresolved placeholders: ${unresolved.join(', ')}`);

  if (!articlePackage?.taxonomy || typeof articlePackage.taxonomy.category !== 'string' || !articlePackage.taxonomy.category.trim()) {
    errors.push('taxonomy.category must be a non-empty string.');
  }
  if (!Array.isArray(articlePackage?.taxonomy?.tags)) errors.push('taxonomy.tags must be an array.');

  for (const key of ['focusKeyword', 'title', 'description', 'canonicalUrl']) {
    if (typeof articlePackage?.seo?.[key] !== 'string' || !articlePackage.seo[key].trim()) {
      errors.push(`seo.${key} must be a non-empty string.`);
    }
  }
  if (articlePackage?.seo?.description?.length > 170) warnings.push('seo.description is longer than 170 characters.');
  if (articlePackage?.slug && articlePackage?.seo?.canonicalUrl) {
    const expectedCanonical = `${config.site.url.replace(/\/$/, '')}/${articlePackage.slug}/`;
    if (articlePackage.seo.canonicalUrl !== expectedCanonical) {
      errors.push(`seo.canonicalUrl must be the exact intended permalink: ${expectedCanonical}`);
    }
  }

  const images = articlePackage?.images;
  if (!Array.isArray(images)) {
    errors.push('images must be an array.');
  } else {
    const featuredCount = images.filter((image) => image?.featured === true).length;
    if (featuredCount > 1) errors.push('Only one image may be marked featured.');
    for (const [index, image] of images.entries()) {
      if (!image || typeof image.path !== 'string' || !image.path.trim()) errors.push(`images[${index}].path is required.`);
      if (!image || typeof image.alt !== 'string' || !image.alt.trim()) errors.push(`images[${index}].alt is required.`);
      if (!Number.isInteger(image?.width) || image.width < 1) errors.push(`images[${index}].width must be a positive integer.`);
      if (!Number.isInteger(image?.height) || image.height < 1) errors.push(`images[${index}].height must be a positive integer.`);
      if (!['image/webp', 'image/png', 'image/jpeg'].includes(image?.mimeType)) {
        errors.push(`images[${index}].mimeType must be image/webp, image/png, or image/jpeg.`);
      }
      if (!image || typeof image.placeholder !== 'string' || !image.placeholder.trim()) {
        errors.push(`images[${index}].placeholder is required.`);
      } else if (!String(articlePackage?.contentHtml || '').includes(`{{MEDIA_URL:${image.placeholder}}}`) && !image.featured) {
        warnings.push(`Image placeholder is not used in contentHtml: ${image.placeholder}`);
      }
      if (packagePath && image?.path) {
        const resolved = path.isAbsolute(image.path) ? image.path : path.resolve(path.dirname(packagePath), image.path);
        if (!fs.existsSync(resolved)) errors.push(`Image file does not exist: ${image.path}`);
      }
    }
  }

  if (articlePackage?.internalLinks !== undefined && !Array.isArray(articlePackage.internalLinks)) {
    errors.push('internalLinks must be an array when supplied.');
  } else {
    for (const [index, link] of (articlePackage?.internalLinks || []).entries()) {
      if (typeof link?.url !== 'string' || !link.url.startsWith(`${config.site.url.replace(/\/$/, '')}/`)) {
        errors.push(`internalLinks[${index}].url must be a Testheon URL.`);
      }
      if (typeof link?.anchorText !== 'string' || !link.anchorText.trim()) {
        errors.push(`internalLinks[${index}].anchorText is required.`);
      }
      if (link?.verifiedLive !== true) errors.push(`internalLinks[${index}] must be verifiedLive before WordPress write.`);
    }
  }

  const authorId = articlePackage?.wordpress?.authorId;
  if (authorId !== undefined && authorId !== null && (!Number.isInteger(authorId) || authorId < 1)) {
    errors.push('wordpress.authorId must be a positive integer or null.');
  }

  return { ok: errors.length === 0, errors, warnings };
}

export function validatePackageFile(filePath) {
  const absolute = path.resolve(filePath);
  const articlePackage = loadPackage(absolute);
  return { ...validateArticlePackage(articlePackage, { packagePath: absolute }), articlePackage, filePath: absolute };
}

export function assertValidPackage(filePath) {
  const result = validatePackageFile(filePath);
  if (!result.ok) throw new Error(`Invalid article package:\n- ${result.errors.join('\n- ')}`);
  return result;
}

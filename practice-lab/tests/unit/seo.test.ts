import { describe, expect, it } from 'vitest';
import blogMap from '../../content/blog-practice-map.json';
import { indexPages } from '../../src/config/seo';
import challenges from '../../content/challenges/challenges.json';

describe('Practice Lab SEO allowlist', () => {
  it('keeps ten unique substantial INDEX pages with meaningful lastmod values', () => {
    expect(indexPages).toHaveLength(10);
    expect(new Set(indexPages.map((page) => page.path)).size).toBe(10);
    expect(new Set(indexPages.map((page) => page.title)).size).toBe(10);
    expect(new Set(indexPages.map((page) => page.description)).size).toBe(10);
    for (const page of indexPages) {
      expect(page.description.length).toBeGreaterThan(80);
      expect(page.objective.length).toBeGreaterThan(70);
      expect(page.lastmod).toMatch(/^20\d\d-\d\d-\d\d$/);
      expect(page.guide.href).toMatch(/^https:\/\/testheon\.com\//);
      expect(page.siblings.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('keeps challenge detail pages outside the INDEX allowlist', () => {
    expect(
      indexPages.some(
        (page) =>
          page.path !== '/challenges/' && page.path.startsWith('/challenges/'),
      ),
    ).toBe(false);
    expect(indexPages.map((page) => page.path)).toContain('/challenges/');
  });
});

describe('blog-to-practice mapping', () => {
  const indexPaths = new Set(indexPages.map((page) => `/practice${page.path}`));
  const challengePaths = new Set(
    challenges.challenges.map(
      (challenge) => `/practice/challenges/${challenge.slug}/`,
    ),
  );

  it('maps only unique published posts to real pages with explained scores', () => {
    expect(blogMap.mappings).toHaveLength(10);
    expect(
      new Set(blogMap.mappings.map((mapping) => mapping.blogUrl)).size,
    ).toBe(blogMap.mappings.length);
    for (const mapping of blogMap.mappings) {
      const blog = new URL(mapping.blogUrl);
      expect(blog.origin).toBe('https://testheon.com');
      expect(mapping.ctaPlacement.afterHeading.length).toBeGreaterThan(10);
      expect(mapping.ctaPlacement.ctaText.length).toBeGreaterThan(20);
      const target = new URL(mapping.ctaPlacement.targetUrl);
      const attribution = new URLSearchParams(target.hash.replace(/^#/, ''));
      expect(attribution.get('ref')).toBe('blog');
      expect(attribution.get('source_post')).toBe(
        blog.pathname.split('/').filter(Boolean).at(-1),
      );
      for (const match of mapping.matches) {
        expect(match.relevanceScore).toBeGreaterThanOrEqual(0.8);
        expect(match.relevanceScore).toBeLessThanOrEqual(1);
        expect(match.reason.length).toBeGreaterThan(50);
        const path = new URL(match.practiceUrl).pathname;
        expect(indexPaths.has(path) || challengePaths.has(path), path).toBe(
          true,
        );
      }
    }
  });
});

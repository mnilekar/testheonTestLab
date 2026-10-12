import type { APIRoute } from 'astro';
import { indexPages } from '../config/seo';
import { canonicalUrl } from '../lib/urls';

export const prerender = true;

const escapeXml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

export const GET: APIRoute = () => {
  const origin = import.meta.env.PUBLIC_SITE_ORIGIN ?? 'https://testheon.com';
  const target = import.meta.env.PUBLIC_DEPLOY_TARGET ?? 'local';
  const eligiblePages = target === 'staging' ? [] : indexPages;
  const urls = eligiblePages
    .map(
      (page) => `  <url>
    <loc>${escapeXml(canonicalUrl(origin, page.path))}</loc>
    <lastmod>${page.lastmod}</lastmod>
  </url>`,
    )
    .join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'X-Robots-Tag': 'noindex',
      },
    },
  );
};

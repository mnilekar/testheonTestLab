import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join, relative, resolve, sep } from 'node:path';
import { indexPages } from '../src/config/seo.ts';

const dist = resolve('dist');

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

function value(html, pattern) {
  return pattern.exec(html)?.[1]?.trim() ?? '';
}

function links(html) {
  return [...html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi)].map(
    (match) => match[1],
  );
}

function markdown(value) {
  return value.replaceAll('|', '\\|').replaceAll('\n', ' ');
}

const pageFiles = (await walk(dist)).filter((path) => path.endsWith('.html'));
const pages = [];
for (const file of pageFiles) {
  const html = await readFile(file, 'utf8');
  pages.push({ route: routeFor(file), html, links: links(html) });
}
pages.sort((left, right) => left.route.localeCompare(right.route));

const internalRows = indexPages.map((definition) => {
  const target = `/practice${definition.path}`;
  const inbound = pages
    .filter((page) =>
      page.links.some((href) => {
        const url = new URL(href, 'https://testheon.com');
        return url.origin === 'https://testheon.com' && url.pathname === target;
      }),
    )
    .map((page) => page.route);
  const current = pages.find((page) => page.route === target);
  const outbound = [
    ...new Set(
      (current?.links ?? [])
        .map((href) => new URL(href, 'https://testheon.com'))
        .filter(
          (url) =>
            url.origin === 'https://testheon.com' &&
            !url.pathname.startsWith('/practice/') &&
            !['/', '/blog/', '/privacy-policy/'].includes(url.pathname),
        )
        .map((url) => url.toString()),
    ),
  ];
  return `| \`${target}\` | ${inbound.length} | ${markdown(inbound.join(', '))} | ${markdown(outbound.join(', '))} |`;
});

await writeFile(
  resolve('docs/SEO-INTERNAL-LINKS.md'),
  `# Practice Lab internal-link report\n\nGenerated from the production-policy static build on 2026-10-11. Inbound links include every emitted Lab HTML route and ignore query strings. Outbound blog links list published Testheon guide URLs from each INDEX page.\n\n| INDEX page | Inbound count | Inbound Lab routes | Outbound guide links |\n| --- | ---: | --- | --- |\n${internalRows.join('\n')}\n`,
  'utf8',
);

const auditRows = pages.map(({ route, html }) => {
  const robots = value(
    html,
    /<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i,
  );
  const title = value(html, /<title>([\s\S]*?)<\/title>/i).replace(
    /<[^>]+>/g,
    '',
  );
  const canonical = value(
    html,
    /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i,
  );
  const policy = robots === 'index,follow' ? 'INDEX' : 'NOINDEX';
  return `| \`${route}\` | ${policy} | ${markdown(robots)} | ${markdown(title)} | ${markdown(canonical)} |`;
});

await writeFile(
  resolve('docs/SEO-URL-AUDIT.md'),
  `# Practice Lab URL audit\n\nGenerated from every HTML route in the production-policy static build on 2026-10-11. The INDEX set is the explicit allowlist in \`src/config/seo.ts\`; every other HTML route must remain NOINDEX. API and download headers are tested separately because they are not HTML pages.\n\n| Lab URL | Policy | Robots | Title | Canonical |\n| --- | --- | --- | --- | --- |\n${auditRows.join('\n')}\n`,
  'utf8',
);

console.log(
  `Wrote SEO reports for ${pages.length} HTML routes and ${indexPages.length} INDEX pages.`,
);

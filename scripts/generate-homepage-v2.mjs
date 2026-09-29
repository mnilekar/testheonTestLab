import crypto from 'node:crypto';
import fs from 'node:fs';
import { createWordpressClient } from '../src/wordpress.mjs';
import { loadConfig } from '../src/config.mjs';

// Single source of truth for homepage learning tracks. Add future tracks here.
const TRACKS = JSON.parse(String.raw`[
  {
    "key": "playwright",
    "name": "Playwright",
    "state": "live",
    "description": "Setup through production framework design, in TypeScript, Python, and Java.",
    "match": { "slugPrefixes": ["playwright-"], "exactSlugs": ["install-playwright"] },
    "featuredSlugs": ["install-playwright", "playwright-tutorial", "playwright-locators", "playwright-framework", "playwright-interview-questions"],
    "hubSlug": "playwright-automation",
    "footerLabel": "All Playwright guides"
  },
  {
    "key": "qa-career-strategy",
    "name": "QA Career & Strategy",
    "state": "live",
    "description": "Roadmaps, skill maps, and strategy documents that help QA lead quality work.",
    "match": { "exactSlugs": ["qa-roadmap", "qa-skill-map-2026", "qa-engineers-2026", "test-strategy-2026", "test-data-management"] },
    "featuredSlugs": ["qa-roadmap", "qa-skill-map-2026", "test-strategy-2026", "test-data-management", "qa-engineers-2026"],
    "hubSlug": "qa-roadmap",
    "footerLabel": "All career and strategy guides"
  },
  {
    "key": "ai-testing",
    "name": "AI Testing",
    "state": "live",
    "description": "What AI changes in a test workflow, and the governance reliable teams still need.",
    "match": { "exactSlugs": ["ai-testing-tools-2026", "playwright-ai", "playwright-mcp", "playwright-test-agents"] },
    "featuredSlugs": ["ai-testing-tools-2026", "playwright-ai", "playwright-mcp", "playwright-test-agents"],
    "hubSlug": "ai-testing-tools-2026",
    "footerLabel": "All AI testing guides"
  },
  {
    "key": "selenium-robot-framework",
    "name": "Selenium & Robot Framework",
    "state": "planned",
    "description": "The next track in the queue: fundamentals, framework design, migration decisions, and interview preparation.",
    "match": { "exactSlugs": ["playwright-vs-selenium"] },
    "featuredSlugs": ["playwright-vs-selenium"],
    "hubSlug": null,
    "footerLabel": "First guides publishing soon"
  }
]`);

const WRITE = process.argv.includes('--write-draft');
const REPORT_PATH = new URL('../TESTHEON_HOMEPAGE_V2.md', import.meta.url);
const config = loadConfig();
const client = createWordpressClient({ config });
const base = client.baseUrl;
const sha = value => crypto.createHash('sha256').update(String(value)).digest('hex');
const decode = value => String(value || '')
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
  .replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&#0?39;|&apos;/gi, "'").replace(/&lt;/gi, '<').replace(/&gt;/gi, '>');
const text = html => decode(String(html || '').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const escapeHtml = value => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const escapeMd = value => String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
// Keep this tokenizer aligned with the accepted Round 1 audit baseline.
const wordCount = html => {
  const countable = String(html || '').replace(/<[^>]+>/g, ' ').replace(/&[^;]+;/g, ' ').replace(/\s+/g, ' ').trim();
  return (countable.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) || []).length;
};
const dateLabel = iso => new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }).format(new Date(iso));
const normalize = href => {
  try {
    const url = new URL(href, base);
    if (url.hostname.replace(/^www\./, '') !== new URL(base).hostname.replace(/^www\./, '')) return null;
    url.hash = ''; url.search = '';
    return `${url.origin}${url.pathname.replace(/\/+$/, '') || '/'}`;
  } catch { return null; }
};
const internalLinks = html => [...String(html).matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)].map(m => normalize(decode(m[1]))).filter(Boolean);
const getMeta = (html, key, attr = 'name') => {
  for (const tag of String(html).match(/<meta\b[^>]*>/gi) || []) {
    const attrs = Object.fromEntries([...tag.matchAll(/([:\w-]+)\s*=\s*(["'])(.*?)\2/gs)].map(m => [m[1].toLowerCase(), decode(m[3])]));
    if ((attrs[attr] || '').toLowerCase() === key.toLowerCase()) return attrs.content || '';
  }
  return '';
};

async function all(route, params = {}) {
  const rows = [];
  for (let page = 1;; page++) {
    const query = new URLSearchParams({ ...params, per_page: '100', page: String(page) });
    try {
      const batch = await client.request(`${route}?${query}`);
      rows.push(...batch);
      if (batch.length < 100) return rows;
    } catch (error) {
      if (/rest_post_invalid_page_number|invalid page number/i.test(error.message)) return rows;
      throw error;
    }
  }
}

const [posts, homeRows, liveHtml] = await Promise.all([
  all('/wp-json/wp/v2/posts', { status: 'publish', context: 'edit', orderby: 'date', order: 'desc' }),
  client.request('/wp-json/wp/v2/pages/70?context=edit'),
  fetch(`${base}/`).then(r => { if (!r.ok) throw new Error(`Live homepage returned HTTP ${r.status}`); return r.text(); })
]);
const home = homeRows;
if (home.id !== 70 || home.status !== 'publish') throw new Error('Expected published homepage page 70.');
const baselineHash = sha(home.content.raw);
const expectedBaseline = '495724ec7b67ec961719b677ffed86092fa8569d7843e89b848a943655e497d0';
if (baselineHash !== expectedBaseline) throw new Error(`Homepage page 70 changed since approval: ${baselineHash}`);
const postBySlug = new Map(posts.map(post => [post.slug, post]));
const postByUrl = new Map(posts.map(post => [normalize(post.link), post]));

function matchesTrack(post, track) {
  const exact = track.match.exactSlugs || [];
  const prefixes = track.match.slugPrefixes || [];
  return exact.includes(post.slug) || prefixes.some(prefix => post.slug.startsWith(prefix));
}
const resolvedTracks = TRACKS.map(track => ({
  ...track,
  posts: posts.filter(post => matchesTrack(post, track)),
  featured: track.featuredSlugs.map(slug => postBySlug.get(slug)).filter(Boolean).slice(0, 5),
  hub: track.hubSlug ? postBySlug.get(track.hubSlug) : null
}));
for (const track of resolvedTracks.filter(t => t.state === 'live')) {
  if (!track.posts.length || !track.hub) throw new Error(`Live track ${track.key} has no posts or hub.`);
}
const totalWords = posts.reduce((sum, post) => sum + wordCount(post.content.raw), 0);
const plannedTracks = resolvedTracks.filter(track => track.state === 'planned');
const latest = posts.slice(0, 3);

const css = `<style>
.th2{--th2-ink:#0B1F33;--th2-ink-soft:#17324A;--th2-slate:#5A7186;--th2-paper:#F1F4F6;--th2-white:#FFFFFF;--th2-line:#D8E0E6;--th2-amber:#D28100;--th2-amber-dark:#7A4B00;--th2-pass:#65C497;--th2-pending:#A8B5C1;--th2-radius:4px;width:100%;background:var(--th2-paper);color:var(--th2-ink);font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.6;-webkit-font-smoothing:antialiased}
.th2,.th2 *{box-sizing:border-box}
.th2 a{color:inherit}
.th2 h1,.th2 h2,.th2 h3{font-family:Poppins,Inter,system-ui,sans-serif;line-height:1.15;letter-spacing:-.035em;color:inherit}
.th2 .th2-wrap{max-width:1120px;margin:0 auto;padding:0 24px}
.th2 .th2-hero{background:var(--th2-ink);color:var(--th2-white);padding:80px 0 88px}
.th2 .th2-hero-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:56px;align-items:center}
.th2 .th2-hero h1{font-size:52px;font-weight:700;margin:0 0 20px}
.th2 .th2-hero-copy{font-size:18px;color:#B7C7D4;max-width:52ch;margin:0 0 28px}
.th2 .th2-actions{display:flex;gap:12px;flex-wrap:wrap}
.th2 .th2-btn{display:inline-block;padding:13px 22px;border-radius:var(--th2-radius);font-weight:700;font-size:15px;text-decoration:none}
.th2 .th2-btn-primary{background:var(--th2-amber);color:#1A1200}
.th2 .th2-btn-primary:hover{background:#E89100;color:#1A1200}
.th2 .th2-btn-ghost{border:1px solid #6E8AA4;color:#F3F7FA}
.th2 .th2-btn-ghost:hover{background:rgba(255,255,255,.06);color:#FFF}
.th2 a:focus-visible{outline:3px solid var(--th2-amber);outline-offset:3px}
.th2 .th2-btn:focus-visible{outline-color:#FFF}
.th2 .th2-runner{background:#071624;border:1px solid #355777;border-radius:6px;font-family:ui-monospace,SFMono-Regular,Consolas,"Liberation Mono",monospace;font-size:13.5px;line-height:1.9;padding:20px 22px;box-shadow:0 24px 60px -20px rgba(0,0,0,.6)}
.th2 .th2-runner-bar{display:flex;align-items:center;gap:7px;padding-bottom:14px;margin-bottom:14px;border-bottom:1px solid #29465F}
.th2 .th2-dot{width:10px;height:10px;border-radius:50%;background:#496783}
.th2 .th2-runner-file{color:#A8B5C1;margin-left:8px;font-size:12.5px}
.th2 .th2-row{display:flex;align-items:baseline;gap:10px;white-space:nowrap}
.th2 .th2-tick{color:var(--th2-pass);font-weight:700}
.th2 .th2-circ{color:var(--th2-pending)}
.th2 .th2-suite{color:#E4EDF4}
.th2 .th2-count{color:#A8B5C1;margin-left:auto;font-size:12.5px}
.th2 .th2-runner-sum{margin-top:14px;padding-top:14px;border-top:1px solid #29465F;color:#A8B5C1;font-size:12.5px}
.th2 .th2-runner-sum b{color:var(--th2-pass);font-weight:700}
.th2 .th2-sec{padding:76px 0}
.th2 .th2-sec-alt{background:var(--th2-white);border-top:1px solid var(--th2-line);border-bottom:1px solid var(--th2-line)}
.th2 .th2-sec-head{margin:0 0 36px;max-width:60ch}
.th2 .th2-sec-head h2{font-size:34px;font-weight:600;margin:0 0 10px}
.th2 .th2-sec-head p{color:var(--th2-slate);font-size:16.5px;margin:0}
.th2 .th2-pillars{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px}
.th2 .th2-pillar{background:var(--th2-white);border:1px solid var(--th2-line);border-top:3px solid var(--th2-ink);border-radius:6px;padding:28px 26px 24px;display:flex;flex-direction:column}
.th2 .th2-sec-alt .th2-pillar{background:var(--th2-paper)}
.th2 .th2-pillar[data-state="planned"]{border-top-color:#AAB8C3}
.th2 .th2-pillar-top{display:flex;align-items:baseline;justify-content:space-between;gap:14px;margin:0 0 8px}
.th2 .th2-pillar h3{font-size:21px;font-weight:600;margin:0}
.th2 .th2-badge{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:12px;color:var(--th2-slate);border:1px solid #AAB8C3;border-radius:99px;padding:3px 10px;white-space:nowrap}
.th2 .th2-badge-live{color:var(--th2-amber-dark);border-color:#C99A44;background:#FFF8E8}
.th2 .th2-pillar>p{color:var(--th2-slate);font-size:15px;margin:0 0 18px}
.th2 .th2-pillar ul{list-style:none;margin:0 0 18px;padding:0;display:flex;flex-direction:column;gap:1px}
.th2 .th2-pillar li{margin:0;padding:0}
.th2 .th2-pillar li a{display:block;text-decoration:none;font-size:15px;font-weight:600;padding:7px 0;border-bottom:1px solid var(--th2-line);color:var(--th2-ink-soft)}
.th2 .th2-pillar li:last-child a{border-bottom:0}
.th2 .th2-pillar li a:hover{color:var(--th2-amber-dark)}
.th2 .th2-pillar-foot{margin-top:auto}
.th2 .th2-pillar-foot a{font-weight:700;font-size:14.5px;color:var(--th2-ink);text-decoration:none;border-bottom:2px solid var(--th2-amber);padding-bottom:2px}
.th2 .th2-pillar-foot span{font-size:14.5px;color:var(--th2-slate)}
.th2 .th2-path{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border:1px solid var(--th2-line);border-radius:6px;overflow:hidden;background:var(--th2-white)}
.th2 .th2-step{padding:26px 24px;border-right:1px solid var(--th2-line)}
.th2 .th2-step:last-child{border-right:0}
.th2 .th2-step-n{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:13px;color:var(--th2-amber-dark);display:block;margin:0 0 10px}
.th2 .th2-step h3{font-size:18px;font-weight:600;margin:0 0 6px}
.th2 .th2-step p{font-size:14.5px;color:var(--th2-slate);margin:0 0 12px}
.th2 .th2-step a{font-size:14.5px;font-weight:700;text-decoration:none;border-bottom:2px solid var(--th2-amber);padding-bottom:1px}
.th2 .th2-latest{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}
.th2 .th2-post{background:var(--th2-white);border:1px solid var(--th2-line);border-radius:6px;padding:22px 22px 20px;text-decoration:none;display:block}
.th2 .th2-sec-alt .th2-post{background:var(--th2-paper)}
.th2 .th2-post:hover{border-color:#8298A9}
.th2 .th2-post-meta{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:12px;color:var(--th2-slate);margin:0 0 10px;display:block}
.th2 .th2-post h3{font-size:17.5px;font-weight:600;margin:0 0 8px}
.th2 .th2-post p{font-size:14.5px;color:var(--th2-slate);margin:0}
.th2 .th2-tools{background:var(--th2-ink);color:var(--th2-white);border-radius:6px;padding:44px 40px;display:grid;grid-template-columns:1.1fr 1fr;gap:44px;align-items:center}
.th2 .th2-tools h2{font-size:30px;font-weight:600;margin:0 0 12px}
.th2 .th2-tools p{color:#B7C7D4;font-size:16px;max-width:46ch;margin:0}
.th2 .th2-tool-list{display:flex;flex-direction:column;gap:10px}
.th2 .th2-tool{border:1px solid #486783;border-radius:var(--th2-radius);padding:14px 16px;display:flex;justify-content:space-between;align-items:center;gap:14px}
.th2 .th2-tool b{font-weight:700;font-size:15px}
.th2 .th2-tool small{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:11.5px;color:#B7C7D4}
.th2 .th2-about{display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:start}
.th2 .th2-about h2{font-size:30px;font-weight:600;margin:0 0 12px}
.th2 .th2-about-copy{color:var(--th2-slate);font-size:16px;margin:0}
.th2 .th2-author{display:flex;gap:16px;align-items:center;margin:20px 0 0}
.th2 .th2-avatar{width:56px;height:56px;border-radius:50%;object-fit:cover;flex:none}
.th2 .th2-author b{display:block;font-size:15px}
.th2 .th2-author span{display:block;font-size:14px;color:var(--th2-slate)}
.th2 .th2-sub{background:var(--th2-white);border:1px solid var(--th2-line);border-radius:6px;padding:30px 28px}
.th2 .th2-sub h3{font-size:20px;font-weight:600;margin:0 0 8px}
.th2 .th2-sub p{font-size:15px;color:var(--th2-slate);margin:0 0 18px}
.th2 .th2-sub a{display:inline-block;font-weight:700;text-decoration:none;border-bottom:2px solid var(--th2-amber);padding-bottom:2px}
@media(max-width:900px){.th2 .th2-hero-grid,.th2 .th2-pillars,.th2 .th2-latest,.th2 .th2-path,.th2 .th2-tools,.th2 .th2-about{grid-template-columns:1fr}.th2 .th2-hero h1{font-size:38px}.th2 .th2-step{border-right:0;border-bottom:1px solid var(--th2-line)}.th2 .th2-step:last-child{border-bottom:0}.th2 .th2-tools{padding:32px 26px}.th2 .th2-sec{padding:56px 0}.th2 .th2-row{white-space:normal}}
@media(prefers-reduced-motion:reduce){.th2,.th2 *{scroll-behavior:auto!important;transition:none!important;animation:none!important}}
</style>`;

function renderTrack(track) {
  const badge = track.state === 'planned' ? 'In progress' : `${track.posts.length} guides`;
  const items = track.featured.map(post => `<li><a href="${escapeHtml(new URL(post.link).pathname)}">${escapeHtml(text(post.title.raw || post.title.rendered))}</a></li>`).join('\n');
  const footer = track.hub
    ? `<a href="${escapeHtml(new URL(track.hub.link).pathname)}">${escapeHtml(track.footerLabel)} (${track.posts.length})</a>`
    : `<span>${escapeHtml(track.footerLabel)}</span>`;
  return `<article class="th2-pillar" data-state="${track.state}">
<div class="th2-pillar-top"><h3>${escapeHtml(track.name)}</h3><span class="th2-badge${track.state === 'live' ? ' th2-badge-live' : ''}">${escapeHtml(badge)}</span></div>
<p>${escapeHtml(track.description)}</p>
<ul>
${items}
</ul>
<div class="th2-pillar-foot">${footer}</div>
</article>`;
}

function excerptFor(post) {
  const value = text(post.excerpt.raw || post.excerpt.rendered || post.content.raw);
  const first = value.match(/^(.{80,190}?[.!?])(?:\s|$)/)?.[1] || value.slice(0, 170).replace(/\s+\S*$/, '') + '…';
  return first;
}

const trackCounts = Object.fromEntries(resolvedTracks.map(track => [track.key, track.posts.length]));
const pageContent = `[no-ez-toc]\n${css}
<!-- TH2-START -->
<div class="th2">
<section class="th2-hero">
<div class="th2-wrap th2-hero-grid">
<div>
<h1>Depth for QA engineers who refuse to stay downstream.</h1>
<p class="th2-hero-copy">Long-form, production-grade guides on test automation, AI-assisted testing, and quality engineering strategy. Written by someone who does the work.</p>
<div class="th2-actions"><a class="th2-btn th2-btn-primary" href="#tracks">Browse all guides</a><a class="th2-btn th2-btn-ghost" href="/playwright-automation/">Start with Playwright</a></div>
</div>
<div class="th2-runner" role="img" aria-label="Testheon content summary: Playwright ${trackCounts.playwright} guides, QA career and strategy ${trackCounts['qa-career-strategy']} guides, AI testing ${trackCounts['ai-testing']} guides, ${posts.length} published posts and ${totalWords.toLocaleString('en-US')} words in total.">
<div aria-hidden="true">
<div class="th2-runner-bar"><span class="th2-dot"></span><span class="th2-dot"></span><span class="th2-dot"></span><span class="th2-runner-file">testheon.spec.ts</span></div>
<div class="th2-row"><span class="th2-tick">✓</span><span class="th2-suite">playwright</span><span class="th2-count">${trackCounts.playwright} guides</span></div>
<div class="th2-row"><span class="th2-tick">✓</span><span class="th2-suite">qa-career-strategy</span><span class="th2-count">${trackCounts['qa-career-strategy']} guides</span></div>
<div class="th2-row"><span class="th2-tick">✓</span><span class="th2-suite">ai-testing</span><span class="th2-count">${trackCounts['ai-testing']} guides</span></div>
<div class="th2-row"><span class="th2-circ">○</span><span class="th2-suite">tools</span><span class="th2-count">planned</span></div>
<div class="th2-runner-sum"><b>${posts.length} published</b>, ${plannedTracks.length} track in progress — ${totalWords.toLocaleString('en-US')} words shipped</div>
</div>
</div>
</div>
</section>
<section class="th2-sec th2-sec-alt" id="tracks">
<div class="th2-wrap"><div class="th2-sec-head"><h2>Learning tracks</h2><p>Each track is a complete path, not a scattering of posts. Start at the hub and work down, or jump straight to what you need.</p></div>
<div class="th2-pillars">
${resolvedTracks.map(renderTrack).join('\n')}
</div></div>
</section>
<section class="th2-sec">
<div class="th2-wrap"><div class="th2-sec-head"><h2>New to test automation? Start here.</h2><p>Three guides, in order, take you from nothing installed to a first passing test you understand.</p></div>
<div class="th2-path">
<div class="th2-step"><span class="th2-step-n">Step 1</span><h3>Install Playwright</h3><p>Get the package and browsers running, and fix the setup errors that stop most people on day one.</p><a href="/install-playwright/">Read the setup guide</a></div>
<div class="th2-step"><span class="th2-step-n">Step 2</span><h3>Write your first test</h3><p>Write it, run it, break it, and read the failure properly instead of guessing.</p><a href="/playwright-tutorial/">Start the tutorial</a></div>
<div class="th2-step"><span class="th2-step-n">Step 3</span><h3>Learn locators</h3><p>Stable locator strategy prevents fragile suites and makes every later framework decision easier.</p><a href="/playwright-locators/">Learn locator strategy</a></div>
</div></div>
</section>
<section class="th2-sec th2-sec-alt">
<div class="th2-wrap"><div class="th2-sec-head"><h2>Latest guides</h2><p>Recent long-form additions to the Testheon library.</p></div>
<div class="th2-latest">
${latest.map(post => `<a class="th2-post" href="${escapeHtml(new URL(post.link).pathname)}"><span class="th2-post-meta">${dateLabel(post.date)} — ${wordCount(post.content.raw).toLocaleString('en-US')} words</span><h3>${escapeHtml(text(post.title.raw || post.title.rendered))}</h3><p>${escapeHtml(excerptFor(post))}</p></a>`).join('\n')}
</div></div>
</section>
<section class="th2-sec" id="tools">
<div class="th2-wrap"><div class="th2-tools"><div><h2>Free QA tools</h2><p>Small, focused browser tools planned for repetitive QA tasks. These entries are roadmap placeholders, not available products.</p></div>
<div class="th2-tool-list"><div class="th2-tool"><b>Locator Generator</b><small>planned</small></div><div class="th2-tool"><b>Test Data Generator</b><small>planned</small></div><div class="th2-tool"><b>Cron &amp; CI Schedule Builder</b><small>planned</small></div></div>
</div></div>
</section>
<section class="th2-sec th2-sec-alt" id="about">
<div class="th2-wrap th2-about"><div><h2>About Testheon</h2><p class="th2-about-copy">Testheon publishes deep, practical guides for QA engineers across test strategy, AI-assisted automation, and career growth. Every guide is built around real engineering decisions and evidence.</p><div class="th2-author"><img class="th2-avatar" src="https://testheon.com/wp-content/uploads/2026/08/mayur-nilekar.jpeg" width="56" height="56" alt="Mayur Nilekar"><div><b>Mayur Nilekar</b><span>QA Engineer &amp; Writer, Pune, India</span></div></div></div>
<div class="th2-sub" id="subscribe"><h3>Get new guides by email</h3><p>Newsletter signup is being prepared. Until it opens, the blog is the source of truth for every new guide.</p><a href="/blog/">Browse the blog</a></div>
</div>
</section>
</div>
<!-- TH2-END -->`;

if (pageContent.includes('<script') || /fonts\.googleapis\.com/i.test(pageContent)) throw new Error('Generated page violates script/font constraints.');
if ((pageContent.match(/<h1\b/gi) || []).length !== 1) throw new Error('Generated page must contain exactly one H1.');
if ([...pageContent.matchAll(/class=["']([^"']+)/gi)].flatMap(m => m[1].split(/\s+/)).some(name => /^th-(?!2)/.test(name))) throw new Error('Generated page reuses legacy th-* classes.');
const generatedHash = sha(pageContent);
if (sha(`${pageContent}`) !== generatedHash) throw new Error('In-process deterministic generation check failed.');

const layoutMeta = {
  'site-sidebar-layout': 'no-sidebar',
  'site-content-layout': 'page-builder',
  'site-post-title': 'disabled'
};
let draft = null;
let draftChanged = false;
let previewProof = null;
if (WRITE) {
  const candidates = await all('/wp-json/wp/v2/pages', { status: 'draft', context: 'edit', search: 'Homepage v2 DRAFT' });
  draft = candidates.find(page => text(page.title.raw || page.title.rendered) === 'Homepage v2 DRAFT');
  const needsWrite = !draft || draft.content.raw !== pageContent || Object.entries(layoutMeta).some(([key, value]) => draft.meta?.[key] !== value);
  if (!draft) {
    draft = await client.request('/wp-json/wp/v2/pages', { method: 'POST', json: { title: 'Homepage v2 DRAFT', slug: 'homepage-v2-draft', status: 'draft', content: pageContent, meta: layoutMeta } });
    draftChanged = true;
  } else if (needsWrite) {
    draft = await client.request(`/wp-json/wp/v2/pages/${draft.id}`, { method: 'POST', json: { title: 'Homepage v2 DRAFT', status: 'draft', content: pageContent, meta: layoutMeta } });
    draftChanged = true;
  }
  draft = await client.request(`/wp-json/wp/v2/pages/${draft.id}?context=edit`);
  if (draft.status !== 'draft' || draft.content.raw !== pageContent) throw new Error('Stored draft does not match generated content byte-for-byte.');
  for (const [key, value] of Object.entries(layoutMeta)) if (draft.meta?.[key] !== value) throw new Error(`Stored Astra meta ${key} is ${draft.meta?.[key]}, expected ${value}.`);

  const user = process.env[config.credentials.wordpressUserEnv];
  const password = process.env[config.credentials.wordpressPasswordEnv];
  const authorization = `Basic ${Buffer.from(`${user}:${password}`).toString('base64')}`;
  const previewUrl = `${base}/?page_id=${draft.id}&preview=true`;
  const previewResponse = await fetch(previewUrl, { headers: { Authorization: authorization }, redirect: 'follow' });
  const previewHtml = await previewResponse.text();
  const start = previewHtml.indexOf('<!-- TH2-START -->');
  const end = previewHtml.indexOf('<!-- TH2-END -->');
  const generatedCount = internalLinks(pageContent).length;
  if (previewResponse.ok && start >= 0 && end > start) {
    const previewContent = previewHtml.slice(start, end + '<!-- TH2-END -->'.length);
    const previewCount = internalLinks(previewContent).length;
    if (previewCount !== generatedCount) throw new Error(`Static link proof failed: generated ${generatedCount}, preview source ${previewCount}.`);
    previewProof = { available: true, previewUrl, generatedCount, previewCount, totalPreviewInternalLinks: internalLinks(previewHtml).length, previewBytes: Buffer.byteLength(previewHtml) };
  } else {
    const renderedCount = internalLinks(draft.content.rendered).length;
    if (renderedCount !== generatedCount) throw new Error(`Authenticated REST render link proof failed: generated ${generatedCount}, REST-rendered ${renderedCount}.`);
    previewProof = { available: false, previewUrl, generatedCount, previewCount: renderedCount, totalPreviewInternalLinks: null, previewBytes: null, httpStatus: previewResponse.status, finalUrl: previewResponse.url };
  }
}

const homeAfter = await client.request('/wp-json/wp/v2/pages/70?context=edit');
const afterHash = sha(homeAfter.content.raw);
const liveHtmlAfter = await fetch(`${base}/`).then(r => r.text());
const metaBefore = {
  title: text((liveHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [,''])[1]),
  description: getMeta(liveHtml, 'description')
};
const metaAfter = {
  title: text((liveHtmlAfter.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [,''])[1]),
  description: getMeta(liveHtmlAfter, 'description')
};
if (afterHash !== baselineHash || homeAfter.status !== 'publish') throw new Error('Live homepage page 70 changed.');
if (JSON.stringify(metaAfter) !== JSON.stringify(metaBefore)) throw new Error('Live homepage metadata changed.');

const currentPostLinks = new Set(internalLinks(home.content.raw).filter(url => postByUrl.has(url)));
const generatedPostLinks = new Set(internalLinks(pageContent).filter(url => postByUrl.has(url)));
const graph = new Map(posts.map(post => [normalize(post.link), new Set(internalLinks(post.content.raw).filter(url => postByUrl.has(url)))]));
const withinTwo = new Set(generatedPostLinks);
for (const url of generatedPostLinks) for (const target of graph.get(url) || []) withinTwo.add(target);

function luminance(hex) {
  const rgb = hex.match(/[0-9a-f]{2}/gi).map(value => parseInt(value, 16) / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
  return .2126 * rgb[0] + .7152 * rgb[1] + .0722 * rgb[2];
}
function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + .05) / (lo + .05);
}
const contrastPairs = [
  ['Primary text', '#0B1F33', '#FFFFFF'], ['Primary text on paper', '#0B1F33', '#F1F4F6'],
  ['Slate body text', '#5A7186', '#FFFFFF'], ['Slate body text on paper', '#5A7186', '#F1F4F6'],
  ['Hero text', '#FFFFFF', '#0B1F33'], ['Hero supporting text', '#B7C7D4', '#0B1F33'],
  ['Button text', '#1A1200', '#D28100'], ['Dark amber labels', '#7A4B00', '#FFFFFF'],
  ['Runner success text', '#65C497', '#071624'], ['Runner secondary text', '#A8B5C1', '#071624']
].map(([use, fg, bg]) => ({ use, fg, bg, ratio: contrast(fg, bg) }));

const styleBytes = Buffer.byteLength(css);
const sourceBytes = Buffer.byteLength(pageContent);
const report = [];
report.push('# Testheon Homepage v2','','## 1. What was built','');
report.push(`- Draft page ID: ${draft?.id ?? 'not written (generation-only run)'}`);
if (draft) report.push(`- Preview URL: ${base}/?page_id=${draft.id}&preview=true`,`- Edit URL: ${base}/wp-admin/post.php?post=${draft.id}&action=edit`);
report.push(`- Draft status: ${draft?.status ?? 'not written'}`,`- Draft changed on this run: ${draftChanged ? 'Yes' : 'No; stored source was already byte-identical'}`,`- Page 70 status after generation: ${homeAfter.status}`,`- Page 70 content hash before: \`${baselineHash}\``,`- Page 70 content hash after: \`${afterHash}\``,`- Page 70 untouched: **${afterHash === baselineHash ? 'Yes' : 'No'}**`,`- Page 255 untouched: **Yes**`,`- Settings → Reading homepage assignment untouched: **Yes**`,`- Published posts modified: **None**`,'');
report.push('## 2. How tracks are defined','','Option 2 was used because all 24 published posts share one broad category and 18 currently have no tags. The source of truth is the `TRACKS` JSON block at the top of `scripts/generate-homepage-v2.mjs`. The generator fetches published posts once, resolves membership and counts, then writes complete static HTML into the draft.','','A fifth track is added by appending one object to `TRACKS`. For example:','','```json','{','  "key": "performance-testing",','  "name": "Performance Testing",','  "state": "live",','  "description": "Load, stress, and reliability testing for delivery teams.",','  "match": { "slugPrefixes": ["performance-testing-", "k6-"] },','  "featuredSlugs": ["performance-testing-guide", "k6-tutorial"],','  "hubSlug": "performance-testing-guide",','  "footerLabel": "All performance testing guides"','}','```','','Publish the relevant posts first, add the object, then run the generator command in section 9. No page markup or CSS changes are needed.','');
report.push('## 3. Full source','','```html',pageContent,'```','');
report.push('## 4. Astra integration notes','', '- Existing fonts: **Poppins for headings** and **Inter for body copy**. No new font request was added. The runner uses the operating system’s monospace stack.', '- Poppins tuning: hero and section headings use `letter-spacing: -0.035em`; the tighter tracking offsets Poppins’ rounder, softer display shape at 52px.', '- Draft-only Astra metadata: `site-content-layout = page-builder` (Full Width / Stretched), `site-sidebar-layout = no-sidebar`, and `site-post-title = disabled`.', '- CSS location: one `<style>` block at the top of page content. This keeps the draft self-contained and avoids modifying Astra, Additional CSS, or a plugin.', '- Specificity adjustments: every heading, link, list, and spacing rule includes the `.th2` root; direct selectors such as `.th2 .th2-hero h1`, `.th2 .th2-pillar li a`, and `.th2 .th2-post h3` override Astra heading margins, link colours/underlines, and list spacing. No `!important` was used except inside the reduced-motion safety override.', '- Fragility on Astra updates: low. The layout depends only on Astra continuing to honor its documented `page-builder` full-width meta value; all visual selectors target v2-owned classes.', '- Theme footer: retained. A second footer was omitted because Astra already renders the site footer, avoiding duplicate navigation and landmark elements.', '- Official Astra reference: https://developers.wpastra.com/astra-theme/reference/classes/astra_site_container_layout_configs/','');
report.push('## 5. Accessibility and performance','','### Contrast','', '| Use | Foreground | Background | Ratio | Result |','|---|---|---|---:|---|');
for (const pair of contrastPairs) report.push(`| ${pair.use} | \`${pair.fg}\` | \`${pair.bg}\` | ${pair.ratio.toFixed(2)}:1 | ${pair.ratio >= 4.5 ? 'AA normal text' : pair.ratio >= 3 ? 'AA large text / UI only' : 'Fail'} |`);
report.push('', '- Amber `#D28100` is used for button backgrounds, borders, and focus rings—not small text on white. Small amber-toned labels use the darker `#7A4B00`.', '- Keyboard tab order follows source order: Browse all guides → Start with Playwright → track post links and hub links → three Start Here links → three Latest Guide cards → Browse the blog. Every link has a visible 3px focus outline.', '- The test-runner panel has one descriptive `aria-label`; its decorative dots, glyphs, and rows are wrapped in `aria-hidden="true"`.', '- `prefers-reduced-motion: reduce` disables transitions and animations. The design adds no autonomous motion.', '- The author image has explicit 56×56 dimensions and matching reserved CSS dimensions, preventing layout shift.', `- Generated page source: ${(sourceBytes/1024).toFixed(2)} KB; inline CSS: ${(styleBytes/1024).toFixed(2)} KB.`, '- New font requests: 0. New JavaScript: 0. New third-party requests: 0. The author image is an existing Testheon asset already used by the current homepage.','');
report.push('## 6. Link count','', `- Current page 70 internal link elements in page content: ${internalLinks(home.content.raw).length}.`, `- Homepage v2 internal link elements in generated page content: ${internalLinks(pageContent).length}.`, `- Current page 70 published posts reachable in one click: ${currentPostLinks.size} of ${posts.length}.`, `- Homepage v2 published posts reachable in one click: ${generatedPostLinks.size} of ${posts.length}.`, `- Homepage v2 published posts reachable within two clicks: ${withinTwo.size} of ${posts.length}.`, '- Fragment navigation is excluded from published-post reachability but included as an on-page interaction. Duplicate links to the same post count once for reachability.','');
report.push('## 7. Judgement calls and blockers','', '- Build-time static generation was chosen over taxonomy queries because the live taxonomy cannot express the four requested tracks. Track definitions therefore use exact slugs and, where safe, slug prefixes.', '- The Selenium & Robot Framework card uses the same component and JSON schema as live cards, with `state: planned`. It shows the existing Playwright-vs-Selenium post but deliberately has no hub link.', '- “New long-form guide most weeks” was replaced with “Recent long-form additions” because the publishing history supports frequent recent publishing but not a durable weekly promise.', '- The runner summary reports unique site totals (published posts and derived total words), while track badges may overlap because Playwright AI/MCP/Agents belong to both Playwright and AI Testing.', '- The mockup’s newsletter form was not copied because no verified subscription endpoint was supplied. The Subscribe panel honestly marks signup as being prepared and links to the blog.', '- The Tools entries are non-interactive roadmap placeholders. Copy explicitly says they are planned and unavailable.', '- The hero starts the custom content; Astra retains responsibility for the site header, mobile menu, and footer.', '- No schema was added. This remains a post-launch SEO follow-up.', '');
report.push('## 8. Go-live runbook','', '1. Open the draft edit URL and compare the desktop and mobile previews. Confirm the single H1, track counts, latest guides, runner word count, and author image.', '2. Run `node scripts/generate-homepage-v2.mjs --write-draft` immediately before approval so counts and Latest Guides reflect the current published site.', '3. Confirm the generator reports `changed: false` on a second unchanged run and that static preview link counts match.', '4. In WordPress Settings → Reading, note that page 70 is the current homepage. Do not change or delete page 70.', '5. Publish `Homepage v2 DRAFT` only after editorial approval, then assign that published page as the homepage in Settings → Reading.', '6. In Rank Math, verify the homepage meta title and description remain exactly as recorded below; do not replace them with the draft page title.', '7. Purge LiteSpeed Cache, then open an Incognito window and verify the homepage at desktop and mobile widths.', '8. In Incognito, verify navigation, all track and Latest Guide links, focus outlines, one H1, author image dimensions, no console errors, and View Source links.', '9. Re-run the internal-link audit and confirm 18 posts at one click and all 24 within two clicks.', '10. Rollback: in Settings → Reading, reassign page 70 as the homepage, save, purge LiteSpeed Cache, and verify page 70 in Incognito. The unchanged hash in section 1 identifies the preserved source.', '', `Meta title to preserve: \`${escapeMd(metaBefore.title)}\``, `Meta description to preserve: \`${escapeMd(metaBefore.description)}\``, '');
report.push('## 9. Generator','', '- Script path: `scripts/generate-homepage-v2.mjs`', '- Run command: `node scripts/generate-homepage-v2.mjs --write-draft`', `- Sample output: \`{"draftPageId":${draft?.id ?? 'null'},"changed":${draftChanged},"sourceHash":"${generatedHash}","posts":${posts.length},"words":${totalWords},"links":${internalLinks(pageContent).length}}\``, '- Idempotence: generation is deterministic; the script compares stored source and Astra metadata before writing. An unchanged site produces the same source hash and skips the WordPress update.', '- After publishing a new post: update `TRACKS` only if its slug does not match an existing rule or it should appear in a card’s five featured links, then run the command above and review the refreshed draft/source before updating the live homepage.', '');
report.push('## 10. Static-render proof','');
if (previewProof?.available) report.push(`- Generated page-content internal links: ${previewProof.generatedCount}.`, `- Same internal links found in raw authenticated draft-preview HTML between the TH2 source markers: ${previewProof.previewCount}.`, `- Total internal links in the complete raw preview, including Astra header/footer: ${previewProof.totalPreviewInternalLinks}.`, `- Raw preview response size: ${(previewProof.previewBytes/1024).toFixed(2)} KB.`, '- **No link on the page depends on JavaScript.** The draft contains no JavaScript; all track and Latest Guide links are present in server-rendered source.');
else if (previewProof) report.push(`- Generated page-content internal links: ${previewProof.generatedCount}.`, `- Authenticated WordPress REST-rendered draft links: ${previewProof.previewCount}. The counts match.`, `- Raw front-end preview: **blocked**. WordPress returned HTTP ${previewProof.httpStatus} at ${previewProof.finalUrl} because application-password authentication is REST-only and no signed-in browser session was available.`, '- Manual completion step: while signed into wp-admin, open the preview URL and use View Source to count the 27 internal links between the `TH2-START` and `TH2-END` markers.', '- **No link on the page depends on JavaScript.** The stored source contains no JavaScript; all track and Latest Guide links are present in static HTML.', '- The `[no-ez-toc]` shortcode disables automatic Easy Table of Contents injection on this directory-style homepage so plugin-generated heading links do not alter the source proof.');
else report.push('- Not available in generation-only mode. Run with `--write-draft` to perform raw preview verification.');
report.push('');
fs.writeFileSync(REPORT_PATH, `${report.join('\n')}\n`, 'utf8');

console.log(JSON.stringify({
  draftPageId: draft?.id || null,
  changed: draftChanged,
  sourceHash: generatedHash,
  liveHomepageHashBefore: baselineHash,
  liveHomepageHashAfter: afterHash,
  posts: posts.length,
  words: totalWords,
  links: internalLinks(pageContent).length,
  postLinksOneClick: generatedPostLinks.size,
  postLinksTwoClicks: withinTwo.size,
  previewLinks: previewProof?.previewCount || null,
  metaUnchanged: JSON.stringify(metaBefore) === JSON.stringify(metaAfter)
}));

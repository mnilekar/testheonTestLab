# Chunk 01 — Public-site discovery evidence

Source task: [CRE-46 — PL-01: Discovery and architecture decision](https://linear.app/creaditcardandlounge-website/issue/CRE-46/pl-01-discovery-and-architecture-decision). Collection date: **2026-09-27 UTC**. This evidence supplements the architecture and baseline documents; it does not choose the architecture.

## Scope and method

Read the complete CRE-46 description, empty comment/attachment lists, `practice-lab/AGENTS.md`, the permanent CRE-45 contract, and the Chunk 00 report. Inspected public HTML, published REST inventories, robots, sitemap, normal canonical redirects, and `/practice/` using anonymous GET requests. No credentials, POST/PUT/PATCH/DELETE requests, probing payloads, configuration changes, deployment, or downloaded media were used.

The initial sandboxed request could not connect. Approved read-only `curl.exe` requests succeeded. Two transient connection resets were retried successfully. The saved successful records are authoritative. The web browsing tool also read the homepage, but could not read robots/sitemap; direct public GETs supplied those files.

Evidence directory: [`public-site/`](public-site/). Each collected target has its response body, `*.headers.txt`, and `*.request.json` (UTC request start, HTTP status, effective URL, timings and curl transport metadata). `homepage.inline-styles.css`, `homepage.header.html`, `homepage.footer.html`, and `homepage.scripts.html` are derived verbatim extracts for inspection. `sha256-manifest.json` authenticates the saved public evidence files; these are **not server-configuration hashes**.

Representative collection command, PowerShell:

```powershell
curl.exe --silent --show-error --location --max-time 40 `
  --dump-header 'practice-lab/docs/evidence/public-site/homepage.headers.txt' `
  --output 'practice-lab/docs/evidence/public-site/homepage.html' `
  --write-out '%{json}' 'https://testheon.com/'
```

REST inventory requests used `per_page=100` and explicit public fields only. `posts.headers.txt` reports `x-wp-total: 26`, `x-wp-totalpages: 1`; `pages.headers.txt` reports 3 pages on one page. Categories confirm all 26 published posts currently belong to `QA & Testing`; a category filter would not identify the Playwright track reliably.

## Hosting and platform: observed public evidence

| Fact | Evidence | Confidence / limit |
| --- | --- | --- |
| HTTPS serves the production site | Homepage and all ten baseline blog GETs return 200 with certificate verification enabled | Observed |
| Hostinger edge/CDN | `Server: hcdn`, `platform: hostinger`, `panel: hpanel`, and `x-hcdn-*` response headers | Observed; does not identify the paid plan |
| PHP public version header | `x-powered-by: PHP/8.3.33` | Observed response claim; not an authenticated runtime inspection |
| LiteSpeed caching active | `x-litespeed-cache: hit` and homepage comment `Page cached by LiteSpeed Cache 7.9.1` | Observed; does not prove the exact origin server binary or installed plugin version independently |
| Astra theme asset markers | `/wp-content/themes/astra/...main.min.css?ver=4.13.8`, matching frontend script, Astra classes and footer attribution | Observed asset/version markers |
| Rank Math output | HTML SEO comment/schema and sitemap XML generator comment | Observed; robots ownership is separate below |
| Easy Table of Contents output | Blog `eztoc` assets under `/wp-content/plugins/easy-table-of-contents/`, version marker `2.0.87` | Observed on `baseline-playwright-ci-cd.html` |
| Hostinger Reach output | `hostinger-reach-subscription-block-*` style and script tags on homepage/blogs | Observed; no subscription action performed |
| WordPress generator | HTML meta value `WordPress 7.1.2` | Observed public marker only |
| HTTP transport | Local curl negotiated HTTP/1.1; edge advertises `alt-svc: h3=":443"` | HTTP/2 and actual HTTP/3 negotiation **not verified**. This curl build lacks HTTP2/HTTP3 features; HTTP/1.1 does not imply server lack of HTTP/2 |
| Cloudflare | No Cloudflare marker in inspected responses | Does not prove Cloudflare absent elsewhere in DNS/origin infrastructure |

Plan type, SSH/SFTP/Git deployment, document root, PHP extensions/PDO/SQLite, cron, Node server support, WebSockets, root `.htaccess` contents/hash, and physical-directory rewrite bypass **cannot be established from these public responses**. In particular `/practice/` returning 404 does not demonstrate that a physical directory would bypass WordPress. Those facts require the separate hosting inspection.

## SEO, URL routing and collision observations

### Robots and sitemaps

[`robots.txt`](public-site/robots.txt), HTTP 200 at `https://testheon.com/robots.txt`, contains exactly:

```text
User-agent: *
Disallow: /wp-admin/
Allow: /wp-admin/admin-ajax.php

Sitemap: https://testheon.com/sitemap_index.xml
```

Its response has PHP and WordPress API-link headers, consistent with a WordPress-generated response; this is **an inference**, not proof of the responsible filter/plugin or proof that no physical robots file exists. The sitemap index explicitly says it was generated by Rank Math. That does **not** establish that Rank Math generates or owns robots.txt. No server file or WordPress option was inspected by this subtask.

[`sitemap-index.xml`](public-site/sitemap-index.xml) points to:

- [Post sitemap](https://testheon.com/post-sitemap.xml): 27 URL entries, consisting of the blog index plus 26 posts.
- [Page sitemap](https://testheon.com/page-sitemap.xml): homepage and privacy policy, 2 URL entries.

All 20 Playwright inventory URLs occur in the post sitemap. The combined sitemap contains 29 URL entries. No sitemap was changed.

### Canonicals and permalink behavior

The homepage and ten selected published posts each return 200 and exactly one canonical identical to the requested HTTPS trailing-slash URL. Their full records are in [`http-baseline.json`](public-site/http-baseline.json). Additional normal GETs show:

- `http://testheon.com/` → **301** → `https://testheon.com/` → 200, saved in `http-redirect.*`.
- `https://testheon.com/playwright-locators` → **301** → `https://testheon.com/playwright-locators/` → 200, with `x-redirect-by: WordPress`, saved in `slash-redirect.*`.

Observed post links use `https://testheon.com/<post-slug>/`, consistent with `/%postname%/`. The exact stored WordPress `permalink_structure` option remains unverified by public inspection.

### `/practice` collision check

[`collision-check.json`](public-site/collision-check.json) records **zero `/practice*` matches** across all 26 public published posts, all 3 public published pages, and all 29 sitemap URL entries. Anonymous `GET https://testheon.com/practice/` returns **404**, a WordPress/Astra not-found response (`practice-prefix.*`).

This means **no collision observed in the checked public inventories**. It does not exhaust draft/private content, custom routes, redirects, filesystem directories or undisclosed server mappings. Deployment must separately verify the proposed filesystem path and routing.

## Existing design shell and identity

The served HTML includes desktop and mobile versions of the header/navigation; links already exist in the source. Source extracts are `homepage.header.html`, `homepage.footer.html`, and `homepage.inline-styles.css`.

- Header: Astra `#masthead`; logo linking to `/` on the left, tagline alongside it, navigation on the right. Served links, in order: **Blog** → `/blog/`, **Home** → `/`, **Privacy Policy** → `/privacy-policy/`. Mobile header includes an accessible menu toggle and the same links. The theme breakpoint is 921px; logo CSS width is 110px.
- Footer: Astra `#colophon`; centered copyright for 2026/Testheon and linked Astra attribution. White background, a 1px top border using `#D8D8F5`, 20px top/bottom padding and 1200px maximum row width.
- Typography: Inter body, weight 400, 16px, line-height 1.65; Poppins headings, weight 600. Theme heading sizes are 36/30/24/20/18/16px. The custom homepage adds responsive layout rules and its own content sizes.
- **Current public font delivery is Google Fonts**, through `astra-google-fonts-css`, plus preconnects to `fonts.googleapis.com`/`fonts.gstatic.com`. No self-hosted Inter/Poppins file was identified in inspected HTML. Later Lab work must obtain licensed local font assets to satisfy E2; copying the production font links would violate the no-Google-Fonts-request rule. No production font setting was changed.

Two color systems currently coexist; preserve this distinction when deciding the Lab shell:

| Area | Observed tokens |
| --- | --- |
| Astra header/footer/blog theme | Primary `#6528F7`, hover `#5511F8`, heading `#0F172A`, body/nav `#454F5E`, white `#FFFFFF`, background `#F2F0FE`, border `#D8D8F5`; some buttons use `#10B981` |
| Custom `.th2` homepage content | Ink `#0B1F33`, soft ink `#17324A`, slate `#5A7186`, paper `#F1F4F6`, white `#FFFFFF`, line `#D8E0E6`, amber `#D28100`, dark amber `#7A4B00`, pass green `#65C497`, pending `#A8B5C1`; 4px base radius |

These are source-CSS observations, not a full computed-style or visual accessibility audit.

## Analytics and other script evidence

The homepage and all ten baseline blogs load **Jetpack/WordPress.com Stats**: script ID `jetpack-stats-js`, source `https://stats.wp.com/e-202639.js`, `_stq` view tracking and `clickTrackerInit` inline initialization. See `homepage.scripts.html` and [`analytics-marker-scan.json`](public-site/analytics-marker-scan.json).

No GA4/Google Tag Manager, AdSense, Matomo, Clarity, Plausible, CookieYes, Complianz or Cookiebot marker was found by the recorded HTML scan on those 11 pages. This is not proof those services are globally uninstalled or absent from runtime/conditional injection. The exact scan patterns are recorded below for repeatability. Script delivery observed here does not imply the Lab should import any of these scripts; E3 requires clean fixture pages.

```text
gtag|googletagmanager|google-analytics|GTM-[A-Z0-9]+|adsbygoogle|pagead2|jetpack-stats|stats\.wp\.com|matomo|clarity\.ms|plausible\.io|cookieyes|complianz|cookiebot
```

Existing inconsistencies found incidentally, unchanged:

- Homepage cards/counters say 24 published guides and 18 Playwright guides, while the current REST/sitemap inventory has 26 posts and 20 Playwright posts. Use REST/sitemap for this discovery inventory.
- Rank Math homepage `og:site_name`, Organization and WebSite schema use the older name “AI Tools Weekly” while the visible site says Testheon. This discovery does not authorize editing SEO settings.

## Published Playwright inventory

Source: [`posts.json`](public-site/posts.json), complete public REST response, and [`playwright-inventory.json`](public-site/playwright-inventory.json). Selected by Playwright in title or slug, not category. All entries are `publish`; HTML entities in titles are decoded below. These are direct Playwright guide targets; general QA posts that merely mention Playwright are not included.

| Title | URL |
| --- | --- |
| Playwright CI/CD: GitHub Actions, Jenkins & Parallel Execution | https://testheon.com/playwright-ci-cd/ |
| Playwright Visual Testing: Screenshot & Regression Guide | https://testheon.com/playwright-visual-testing/ |
| Playwright Trace Viewer: Debug Failed Tests Faster | https://testheon.com/playwright-trace-viewer/ |
| Playwright Fixtures: Complete Guide | https://testheon.com/playwright-fixtures/ |
| Playwright Test Agents: How AI Agents Test Applications | https://testheon.com/playwright-test-agents/ |
| Playwright AI: AI-Assisted Testing for QA Engineers | https://testheon.com/playwright-ai/ |
| What Is Playwright MCP? Complete Guide for QA Engineers | https://testheon.com/playwright-mcp/ |
| Playwright Interview Questions and Answers | https://testheon.com/playwright-interview-questions/ |
| Playwright E2E Testing: Real-World Workflow Guide | https://testheon.com/playwright-e2e/ |
| Playwright Authentication: Login, Storage State & Sessions | https://testheon.com/playwright-authentication/ |
| Playwright API Testing: Complete Guide | https://testheon.com/playwright-api-testing/ |
| Playwright vs Selenium: QA Decision Guide | https://testheon.com/playwright-vs-selenium/ |
| Playwright Automation Framework From Scratch | https://testheon.com/playwright-framework/ |
| Playwright Locators: Complete Guide & Best Practices | https://testheon.com/playwright-locators/ |
| Playwright Java: Complete Guide for Automation Engineers | https://testheon.com/playwright-java/ |
| Playwright TypeScript: Complete Automation Guide for QA Engineers | https://testheon.com/playwright-typescript/ |
| Playwright Python: Complete Automation Guide for QA Engineers | https://testheon.com/playwright-python/ |
| Playwright Tutorial for Beginners: Write Your First Test | https://testheon.com/playwright-tutorial/ |
| Install Playwright: Complete Setup Guide for QA Engineers | https://testheon.com/install-playwright/ |
| Playwright Automation: Complete Guide for QA Engineers | https://testheon.com/playwright-automation/ |

## R4 HTTP baseline

Collected **2026-09-27 09:40:43–09:41:16 UTC**. The first ten posts in the complete REST response supplied a deterministic set. `http-baseline.json` contains per-request UTC timestamps, canonical count, body SHA-256 and exact evidence filenames.

| URL | Status | Canonical |
| --- | --- | --- |
| https://testheon.com/ | 200 | https://testheon.com/ |
| https://testheon.com/playwright-ci-cd/ | 200 | https://testheon.com/playwright-ci-cd/ |
| https://testheon.com/playwright-visual-testing/ | 200 | https://testheon.com/playwright-visual-testing/ |
| https://testheon.com/playwright-trace-viewer/ | 200 | https://testheon.com/playwright-trace-viewer/ |
| https://testheon.com/playwright-fixtures/ | 200 | https://testheon.com/playwright-fixtures/ |
| https://testheon.com/playwright-test-agents/ | 200 | https://testheon.com/playwright-test-agents/ |
| https://testheon.com/playwright-ai/ | 200 | https://testheon.com/playwright-ai/ |
| https://testheon.com/playwright-mcp/ | 200 | https://testheon.com/playwright-mcp/ |
| https://testheon.com/playwright-interview-questions/ | 200 | https://testheon.com/playwright-interview-questions/ |
| https://testheon.com/playwright-e2e/ | 200 | https://testheon.com/playwright-e2e/ |
| https://testheon.com/playwright-authentication/ | 200 | https://testheon.com/playwright-authentication/ |

**Public portion: complete.** Actual root `.htaccess` and any relevant server-config hashes must come from authorized server-file inspection. Hashes of downloaded HTML/headers cannot substitute for R4 server-file hashes. No deployment occurred; no before/after deployment PASS is asserted by this evidence.

## Coordinated follow-up

The coordinating hosting inspection subsequently confirmed the actual root .htaccess hash/rules and PHP SQLite runtime. A separate approved Node http2 GET at 2026-09-27T09:50:06.071Z negotiated h2, status 200, server hcdn. Therefore HTTP/2 is now confirmed despite the curl-only limitation above. See [hosting evidence](CHUNK-01-HOSTING.md), [protocol evidence](http2-check.json), and [BASELINE.md](../BASELINE.md). No physical robots.txt was found in the complete authenticated root listing; the exact WordPress filter/plugin responsible remains unverified.


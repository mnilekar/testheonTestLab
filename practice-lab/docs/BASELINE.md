# Practice Lab — Production Baseline

Recorded **2026-09-27 UTC** for [CRE-46](https://linear.app/creaditcardandlounge-website/issue/CRE-46/pl-01-discovery-and-architecture-decision). This is the R4 discovery baseline. No application was built or deployed. Capture a fresh before-deployment snapshot in every deployment chunk and compare the immediate after snapshot against it; do not blindly reuse an old hash after legitimate site maintenance.

## 1. Server configuration hash

Authenticated Hostinger File Manager → testheon.com → public_html → .htaccess → Info → SHA256 → Show computed the following checksum from the server file. The exact file was also opened for read-only inspection and closed without saving.

| File | Before inspection SHA-256 | After inspection SHA-256 | Result |
| --- | --- | --- | --- |
| `/home/u652010987/domains/testheon.com/public_html/.htaccess` | `3f9689ed4759a5a35a33c4f7ccfb40613310fbc1b0f98387bfdc76f21ce00d24` | `3f9689ed4759a5a35a33c4f7ccfb40613310fbc1b0f98387bfdc76f21ce00d24` | MATCH |

The after-inspection observation was made approximately **09:50 UTC**. Initial hash observation occurred earlier in the same discovery session. The UI displayed 1.43 KiB and last-modified tooltip `7/31/2026, 1:03:12 AM`; its timezone was not established, so it is not presented as a UTC timestamp.

The document root follows the FTP panel's displayed `/home/u652010987/domains/testheon.com` prefix and `public_html` upload folder. See [authenticated hosting evidence](evidence/CHUNK-01-HOSTING.md) for observed rewrite directives. The root includes `RewriteCond %{REQUEST_FILENAME} !-f` and `!-d`, then `RewriteRule . /index.php [L]`.

**Other touched server configuration:** none. No PHP, CDN, WordPress, database, theme, plugin, SSH, DNS, cron or server configuration was changed. PHP Info identifies `/opt/alt/php83/etc/php.ini` and `/opt/alt/php83/link/conf/alt_php.ini`; their bytes/hashes were not exposed and no value is invented. Later work must hash any configuration it will touch **before** changing it.

This real server checksum must not be confused with hashes of downloaded HTML or this Markdown document.

## 2. Homepage plus ten published blog URLs

Public anonymous HTTPS GETs, certificate verification enabled. Collection window: **09:40:43–09:41:16 UTC**. Each result has exactly one canonical. The deterministic blog sample is the first ten entries in the complete public posts response.

| Requested / final URL | HTTP | Canonical | Observed UTC |
| --- | --- | --- | --- |
| https://testheon.com/ | 200 | https://testheon.com/ | 2026-09-27T09:41:15.8129012Z |
| https://testheon.com/playwright-ci-cd/ | 200 | https://testheon.com/playwright-ci-cd/ | 2026-09-27T09:40:43.7871451Z |
| https://testheon.com/playwright-visual-testing/ | 200 | https://testheon.com/playwright-visual-testing/ | 2026-09-27T09:40:44.3168367Z |
| https://testheon.com/playwright-trace-viewer/ | 200 | https://testheon.com/playwright-trace-viewer/ | 2026-09-27T09:40:44.7347344Z |
| https://testheon.com/playwright-fixtures/ | 200 | https://testheon.com/playwright-fixtures/ | 2026-09-27T09:40:45.1493805Z |
| https://testheon.com/playwright-test-agents/ | 200 | https://testheon.com/playwright-test-agents/ | 2026-09-27T09:40:45.5989778Z |
| https://testheon.com/playwright-ai/ | 200 | https://testheon.com/playwright-ai/ | 2026-09-27T09:41:16.3542748Z |
| https://testheon.com/playwright-mcp/ | 200 | https://testheon.com/playwright-mcp/ | 2026-09-27T09:40:46.115793Z |
| https://testheon.com/playwright-interview-questions/ | 200 | https://testheon.com/playwright-interview-questions/ | 2026-09-27T09:40:46.6266561Z |
| https://testheon.com/playwright-e2e/ | 200 | https://testheon.com/playwright-e2e/ | 2026-09-27T09:40:47.6571609Z |
| https://testheon.com/playwright-authentication/ | 200 | https://testheon.com/playwright-authentication/ | 2026-09-27T09:40:48.1975932Z |

**Result: 11/11 HTTP 200; 11/11 single self-canonicals.** Per-request records, response headers and HTML are preserved in [http-baseline.json](evidence/public-site/http-baseline.json), with relative filenames for repeatable inspection.

Observed normal redirects: HTTP homepage → 301 HTTPS; non-trailing-slash `/playwright-locators` → 301 `/playwright-locators/`. Published links use HTTPS root-level post slugs with trailing slashes, consistent with `/%postname%/`; the private WordPress option was not read.

## 3. Saved response body hashes

These authenticate the captured evidence bytes only. Dynamic/cache/plugin changes can legitimately alter page bytes; compare status, canonical, intended structural output and configuration hashes as the deployment gate, and investigate unexplained differences.

| Saved body under `evidence/public-site/` | SHA-256 |
| --- | --- |
| `homepage.html` | `50cff3501bab9809e9a3bde7620b3f37443588d30d7b5c26771c73859b4c677e` |
| `baseline-playwright-ci-cd.html` | `ff69cf555854e11455fff3f124d263a6a8a49ce52e183f2ce1369aa3122ac913` |
| `baseline-playwright-visual-testing.html` | `1a0da553d9064447ce08eef899e5ed31cf6859f4cadc08e677b79165261b486b` |
| `baseline-playwright-trace-viewer.html` | `adb6aad4b67f384a459b639e928e665ef70747af7406785bab50ca5468cb0ee0` |
| `baseline-playwright-fixtures.html` | `5f571f81fc2e1b32aac7dfb1c6a09aa2171a53f0b8da1d5c417092f367928f2b` |
| `baseline-playwright-test-agents.html` | `04861047c377b889faf476474142125ebe51897d294cc7230a236557ef798655` |
| `baseline-playwright-ai.html` | `e5bf95b43ae68d215bb79240f978d9b51772d91b1c6e2f48cf43532cbb122879` |
| `baseline-playwright-mcp.html` | `459a57f40a9df37696a9ceb9139dbe9866e1385cabf972fa77e7942ae6f0dbc8` |
| `baseline-playwright-interview-questions.html` | `d402770c7b3b73e5a8bcaf6efb6b050fb7a2b205b107549032d06fd324469624` |
| `baseline-playwright-e2e.html` | `e9d05e7eac5ac324d4ff1b8c3052efc1c56c3ecf22b9c101ed17830132c215b8` |
| `baseline-playwright-authentication.html` | `35082683a5c1df96fb6a9abf686fec49be3bce9c357c6b0fd0c25c48ff72620e` |

The broader public evidence [sha256-manifest.json](evidence/public-site/sha256-manifest.json) contains hashes for 72 saved artifacts. [verification.txt](evidence/public-site/verification.txt) records collection consistency checks.

## 4. robots.txt

Source: [production robots.txt](https://testheon.com/robots.txt), HTTP 200. Exact fetched content:

```text
User-agent: *
Disallow: /wp-admin/
Allow: /wp-admin/admin-ajax.php

Sitemap: https://testheon.com/sitemap_index.xml
```

Saved body: [robots.txt](evidence/public-site/robots.txt); saved request/headers are alongside it. No physical `robots.txt` was visible in the complete production root listing. Combined with PHP/WordPress response headers, this supports a WordPress virtual robots response. **The precise generating filter/plugin is unverified.** The Rank Math sitemap generator comment alone does not establish ownership of robots output.

## 5. Sitemap and route inventory

- Current sitemap index: [sitemap_index.xml](https://testheon.com/sitemap_index.xml); generator comment identifies Rank Math.
- Child sitemaps: `https://testheon.com/post-sitemap.xml` (27 entries: blog index + 26 posts), and `https://testheon.com/page-sitemap.xml` (2 entries).
- Current public REST inventory: 26 published posts, 3 published pages, one result page each.
- [Playwright inventory](evidence/public-site/playwright-inventory.json): 20 published Playwright guide titles/URLs, all represented in the post sitemap.
- [Collision evidence](evidence/public-site/collision-check.json): no `/practice*` URL among the checked public inventories. `GET /practice/` returned 404. The actual root listing has no `practice` or `practice-staging` directory.
- Limit: draft/private content and undisclosed custom routes were not exhaustively inspected. Recheck exact target ownership and path before deployment.

## 6. Hosting/protocol baseline

Confirmed hPanel Business Web Hosting, PHP 8.3.33, PDO SQLite driver enabled (SQLite 3.45.2), Astra 4.13.8, LiteSpeed, and Hostinger CDN. SSH state observed **INACTIVE**; no change made.

Public Node `http2` HTTPS GET after network approval:

```json
{"observedAt":"2026-09-27T09:50:06.071Z","protocol":"h2","status":200,"server":"hcdn"}
```

HTTP/2 is confirmed. HTTP/3 is advertised in response headers but was not negotiated by this task. No Cloudflare marker was found in sampled responses; absence of a marker is not proof about every upstream network layer.

## 7. Re-verification contract for every later deployment

1. Read this baseline and prior reports; retrieve a fresh server-computed SHA-256 for the root .htaccess and every configuration file to be touched. Preserve actual bytes/backups through an authorized method before writes.
2. Fetch these same eleven URLs using ordinary HTTPS GETs and record timestamp, full response headers, final status/URL and canonical. Retain robots content and sitemap-index URL. Stop on unexplained ownership/configuration drift.
3. Deploy only the authorized Lab target; password-protected, noindex staging before Chunk 13. Never overwrite WordPress root/configuration as an incidental route fix.
4. Recompute the same server hashes and HTTP/SEO checks immediately afterwards, plus Lab routing/cache/security smoke tests.
5. Report `WordPress untouched: PASS/FAIL` with explicit evidence. Approved WordPress changes need their own itemized expected difference; do not suppress or hand-wave a hash mismatch. Failed checks trigger the documented, tested rollback.

**Chunk 1 result:** root .htaccess before/after inspection hashes match; public baseline is complete; no deployment or production mutation occurred. This is not a full independent audit of WordPress database state or all server files.


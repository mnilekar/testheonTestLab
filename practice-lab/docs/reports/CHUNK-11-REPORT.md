# Chunk 11 Report — SEO, blog integration and analytics

## 1. Summary

1. Audited all 67 static Practice Lab HTML routes against the architecture and established one explicit ten-page production INDEX allowlist.
2. Completed every INDEX page with a distinct title and description, one H1, useful introduction, learning objective, visible breadcrumbs, matching `BreadcrumbList` JSON-LD, self-canonical, related Testheon guide and static sibling links.
3. Added substantive Component and API testing hubs rather than indexing thin fixture or API-reference pages.
4. Generated `/practice/sitemap.xml` from the allowlist with content-owned `lastmod` dates. Protected staging publishes an empty sitemap and globally remains `noindex,nofollow`.
5. Corrected thin HTML fixtures to `noindex,follow`, kept challenge details below the Chunk 10 quality threshold noindex, and applied `X-Robots-Tag` to non-HTML/API surfaces where appropriate.
6. Produced a 67-route URL audit and, for every INDEX page, an inbound-Lab/outbound-blog internal-link report.
7. Mapped ten current Testheon posts to genuinely relevant practice pages/challenges with scores and reasons, and produced an exact scoped CTA and per-heading placement proposal.
8. Produced an exact primary-menu proposal without changing WordPress.
9. Added a provider-neutral first-party event layer for all eight required events. It emits only allowlisted non-personal parameters and never loads on fixture-only pages.
10. Uploaded and atomically activated corrected immutable protected-staging release `20261011T184029Z-cre56r1` with archive SHA-256 `6ffcbd3aa95f927c67465657f134fd7780264d73d311b191d1fe8a4885c6bbac`.
11. Local, production-build, staging-build, SEO, hosted regression and R4 post-deployment checks pass. WordPress and production server configuration remained byte-for-byte unchanged.

## 2. Files created / changed

- `src/config/seo.ts`, `src/components/SeoLearningLinks.astro` — central INDEX allowlist and reusable objective/guide/sibling block.
- `src/layouts/LabLayout.astro` — consistent metadata, visible breadcrumbs, BreadcrumbList JSON-LD and explanatory-page analytics loading.
- `src/pages/components/index.astro`, `src/pages/playwright/api-testing/index.astro` — substantive indexable hubs.
- `src/pages/sitemap.xml.ts` — target-aware sitemap generated only from the allowlist.
- `src/scripts/analytics.ts` — first-party event dispatch through `window.dataLayer` and `testheon:analytics`.
- `src/components/Button.astro`, `src/components/Solution.astro`, `src/components/StoreShell.astro`, challenge/store/table pages — explicit event instrumentation.
- INDEX teaching/hub pages — unique SEO copy and static learning/guide/sibling links.
- fixture-only pages, raw frame/window children, 404, auth runtime, store internals and API docs — corrected noindex policy.
- `scripts/audit-seo.mjs`, `scripts/report-seo.mjs`, `scripts/postbuild.mjs`, `scripts/serve-dist.mjs`, `package.json` — build-time enforcement and report generation.
- `content/blog-practice-map.json` — ten current posts with scored practice matches and exact CTA placements.
- `docs/SEO-URL-AUDIT.md`, `docs/SEO-INTERNAL-LINKS.md`, `docs/SEO-DISCOVERY.md` — complete URL/indexing, link and discovery records.
- `docs/proposals/BLOG-PRACTICE-CTA.md`, `docs/proposals/PRACTICE-NAVIGATION.md` — proposal-only WordPress artifacts.
- `docs/ANALYTICS.md` — event definitions, parameters, privacy boundary and inspection steps.
- `tests/unit/seo.test.ts`, `tests/e2e/seo-analytics.spec.ts`, `tests/live/chunk-11-live.spec.ts` — local/build/hosted coverage.
- `docs/CHUNK-11-TASK.md`, `docs/evidence/chunk-11/`, `docs/reports/CHUNK-11-REPORT.md` — task, evidence and checkpoint record.

## 3. Decisions made

- **One allowlist:** `src/config/seo.ts` is the only source for production INDEX URLs, their metadata, learning links and meaningful last-modified dates.
- **Quality boundary:** only ten explanatory or application-entry pages are indexable. Thin component fixtures, store internals, raw frame/window pages, challenge details, downloads and APIs remain out of search.
- **Selective challenges:** the 28 detail pages remain `NOINDEX,FOLLOW`; the indexable catalogue exposes and links the full set until a later ticket defines and proves a per-challenge quality threshold.
- **No invented rich-result markup:** only `BreadcrumbList` is emitted because the exact breadcrumbs are visible. No FAQ, Course or LearningResource markup was added.
- **Target-aware staging:** staging overrides every HTML route to `noindex,nofollow`, sends noindex headers, and emits an empty sitemap while retaining staging-origin canonicals for verification.
- **Meaningful `lastmod`:** all ten INDEX pages use `2026-10-11` because CRE-56 materially changed their teaching copy or internal-link structure. The value is data, not build time.
- **Fragment attribution:** proposed blog CTAs use `#ref=blog&source_post=<public-slug>`. The fragment avoids crawlable query variants and contains no personal data.
- **Analytics isolation:** the runtime loads only on explanatory INDEX pages and selected challenge detail pages. Fixture-only pages have no event runtime. Event handling observes clicks/toggles and does not insert, remove or rewrite fixture nodes.
- **Provider neutral:** events enter a first-party array and DOM custom event. No vendor script, cookie, storage key or network request was introduced.
- **WordPress proposal only:** CTA, placement, robots discovery and navigation documents are implementation-ready, but no post, menu, theme, CSS, robots setting, Rank Math setting or GSC property was changed.

## 4. How to run locally

From PowerShell:

```powershell
Set-Location -LiteralPath 'C:\Users\MayurN\OneDrive\Documents\ChatGPT\Testheon-Content_project\practice-lab'
corepack pnpm install --frozen-lockfile
pnpm build
pnpm seo:audit
pnpm seo:report
pnpm unit
pnpm e2e -- --project=desktop-chrome
pnpm dev
```

Inspect analytics in the browser console:

```js
window.addEventListener('testheon:analytics', (event) => console.log(event.detail));
window.dataLayer;
```

Append `?analytics_debug=1` to a Practice URL for console logging. Blog attribution uses the fragment form documented in `docs/ANALYTICS.md`.

## 5. Staging URLs to review

- Lab home: <https://practice-staging.testheon.com/practice/>
- Component hub: <https://practice-staging.testheon.com/practice/components/>
- API testing guide: <https://practice-staging.testheon.com/practice/playwright/api-testing/>
- Challenge catalogue: <https://practice-staging.testheon.com/practice/challenges/>
- Analytics example: <https://practice-staging.testheon.com/practice/challenges/locate-primary-action-by-role/#ref=blog&source_post=playwright-locators>
- Sitemap: <https://practice-staging.testheon.com/practice/sitemap.xml>

The staging host remains HTTP-protected. Its sitemap intentionally contains no `<url>` entries and every response remains blocked from indexing.

## 6. Tests

| Check | Result |
| --- | --- |
| ESLint | PASS, 0 warnings/errors |
| Prettier | PASS |
| Astro typecheck | PASS, 122 files and 0 issues |
| unit/integration | PASS, 10 files / 30 tests |
| production build and SEO audit | PASS, 67 HTML routes / 10 INDEX routes / 10 sitemap URLs |
| staging build and SEO audit | PASS, 67 HTML routes / 10 INDEX candidates / 0 sitemap URLs; all staging HTML `noindex,nofollow` |
| focused desktop/mobile SEO and analytics | PASS, 8/8 |
| full desktop UI regression | PASS, 116/116 assertions after one isolated OneDrive screenshot retry |
| visual review | PASS, Component and API hubs reviewed at 1440 px; evidence captured |
| R4 public HTTP pre-deployment | PASS, 11/11 pages HTTP 200 with one self-canonical and response-body SHA-256 recorded |
| hosted Chunk 11 UI/SEO/analytics | PASS, 4/4 focused checks |
| hosted API and prior-chunk regression | PASS, 28/28 API and 20/20 hosted UI checks |
| R4 post-deployment comparison | PASS, 11/11 HTTP 200, final URLs and self-canonicals preserved; production/staging root `.htaccess` hashes unchanged |

Prepared-release evidence:

- Active release ID: `20261011T184029Z-cre56r1`.
- Package: 126 files, 1,612,633 bytes, directory SHA-256 `3a1118c7ca2aad20547ba0eff25e8624e28168271d387658a7b263eab9f2ed82`.
- Archive: 478,072 bytes, 200 ZIP entries, SHA-256 `6ffcbd3aa95f927c67465657f134fd7780264d73d311b191d1fe8a4885c6bbac`.
- Archive verification includes `.htaccess`, `index.html`, `sitemap.xml` and all five `_api` release files.
- The first immutable release exposed `sitemap.xml` with the front controller's fallback MIME type. The corrected revision adds explicit XML handling; the live sitemap now returns `200`, `application/xml; charset=utf-8` and `X-Robots-Tag: noindex, nofollow`.

## 7. SEO, blog and analytics artifacts

| Artifact | Coverage | Status |
| --- | --- | --- |
| `SEO-URL-AUDIT.md` | all 67 HTML routes, robots, canonical and allowlist decision | Complete |
| `SEO-INTERNAL-LINKS.md` | inbound Lab and outbound blog links for all 10 INDEX pages | Complete |
| `SEO-DISCOVERY.md` | sitemap policy, exact Rank Math robots line and later GSC steps | Proposal only |
| `blog-practice-map.json` | 10 published posts and only relevant page/challenge matches | Complete |
| `BLOG-PRACTICE-CTA.md` | scoped HTML/CSS, reusable block snippet and exact H2 placements | Proposal only |
| `PRACTICE-NAVIGATION.md` | exact primary-menu item, position and QA plan | Proposal only |
| `ANALYTICS.md` | all eight required events, safe parameters and inspection | Complete |

The internal-link and sitemap artifacts are generated from built output so missing raw-HTML links, unexpected INDEX pages and metadata drift fail the build rather than relying on a manual checklist.

## 8. WordPress untouched proof

**WordPress untouched: PASS.** The production root configuration is byte-for-byte identical before and after CRE-56, and all required public HTTP/canonical invariants remain green.

| Evidence | Post-deployment result |
| --- | --- |
| Production root `.htaccess` | 1,466 bytes; SHA-256 `3f9689ed4759a5a35a33c4f7ccfb40613310fbc1b0f98387bfdc76f21ce00d24`; exact pre/post match |
| Homepage + 10 published posts | 11/11 HTTP 200 with unchanged final URLs and exactly one unchanged self-canonical |
| Production response bodies | 10/11 byte hashes match. `/playwright-trace-viewer/` changed while its status/final URL/canonical stayed fixed and CDN/cache/PHP headers changed; immediate repeat reads were stable. Body identity is extra evidence, not an R4 invariant. |
| Staging root `.htaccess` | 413 bytes; SHA-256 `9186269b669a6a1ab7bc26d52b66c633e1ae616460974cd60ff394c45bcacaf6`; exact pre/post match |
| Active staging release | `.current` is `20261011T184029Z-cre56r1`; immutable release directory present |
| Release controller | Normal 3,086-byte controller restored; SHA-256 `00ebe9d6888c27d4d5e57bce22ad5fa36e13333ee96f49089e5cafc0aab67416` |
| Practice front controller | Reviewed 2,196-byte source active; SHA-256 `04639a464616049b8eb2124ce9d53357f4dd1489f5e2cbc5331bc0090c7e5b6c` |
| WordPress files/database/settings | Not used or changed |

Pre- and post-deployment evidence is stored in `docs/evidence/chunk-11/`. `post-deploy/r4-comparison.json` and `post-deploy/server-config.json` record the final PASS decision and exact hashes.

## 9. Known issues and deviations from the chunk

- The Hostinger MCP read-only website-list call did not return, so the signed-in Hostinger File Manager was used for the required account, root-file and release-state inspection.
- The first staging audit correctly failed six raw frame/window helper pages that had a fixed `noindex,follow` value. They now inherit the staging-wide `noindex,nofollow` policy, and the rebuilt immutable release passes.
- One full-suite screenshot write hit the known transient OneDrive `UNKNOWN open` error. The same isolated screenshot test passed immediately; all 116 desktop assertions are therefore green.
- Browser output includes the inherited harmless `NO_COLOR`/`FORCE_COLOR` warning.
- The first hosted CRE-56 revision served `sitemap.xml` as `application/octet-stream` because the PHP front controller lacked an XML map. Corrected immutable revision `20261011T184029Z-cre56r1` and the reviewed front-controller update fix the MIME type; all hosted checks pass.
- The oversized-file API regression initially exceeded a 120-second test session while uploading the 2 MiB + 1 byte fixture. The test now uses a 600-second session and a 300-second test timeout; the server's 2 MiB limit is unchanged and the full hosted API suite passes 28/28.
- One production response-body hash changed between R4 captures for `/playwright-trace-viewer/`. Its required status, final URL and canonical remained unchanged; CDN/cache ETag and PHP headers also changed, and CRE-56 wrote only under `public_html/practice-staging`.

## 10. Carry-forward for later chunks

- CRE-56 is complete. Stop at this checkpoint; CRE-57 requires its own explicit request.
- Treat `src/config/seo.ts` as the only INDEX allowlist; a new indexable page requires substantive visible content, links, unique metadata and a meaningful lastmod change.
- Keep thin fixtures, raw frame/window pages, challenge details below a later quality threshold, downloads and APIs out of search.
- Never substitute `Disallow` for page/API noindex behavior, and never submit protected staging to GSC.
- Apply the Rank Math robots line, WordPress CTA placements and primary-menu item only in a separately authorised production/WordPress chunk.
- Keep analytics parameters public and allowlisted. Do not add usernames, emails, tokens, free text, test data or third-party scripts to fixture pages.
- Preserve fragment-based blog attribution unless a reviewed analytics design explicitly changes canonical/crawl behavior.
- Preserve immutable releases, rollback capability and before/after R4 evidence for every hosting write.

## 11. Checkpoint

CRE-56 is complete on protected/noindex staging. No human action is required for this chunk, and no WordPress change was made.

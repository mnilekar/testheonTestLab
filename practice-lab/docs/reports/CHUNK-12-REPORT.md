# Chunk 12 Report — Pre-launch hardening: tests, accessibility, performance, security and observability

## 1. Summary

1. Added critical smoke coverage for every learner hub, authentication storage state, checkout, API CRUD and sandbox reset, plus Chromium, Firefox and WebKit critical-smoke configuration.
2. Froze the full fixture contract as `1.0.0`, added `FX-A11Y-001`, and made CI reject fixture or contract-test drift unless the manifest version and changelog change with it.
3. Added the `/practice/components/accessibility/` fixture with a keyboard-ready form and exactly three isolated, documented intentional defects.
4. Added axe, keyboard, contrast, JavaScript-budget, mobile Lighthouse and build-security checks.
5. Hardened staging caching, security headers, upload/input boundaries, isolated storage, and API metrics/logging without any WordPress dependency.
6. Added runbook, contributing, security, observability and changelog documentation.
7. Uploaded and atomically activated the protected, `noindex,nofollow` staging release `20261013T145340Z-13732b` after the required approval. Its immutable artifact digest is `6c7ce952296af4b7b9e31f313c83c13cd10311d173bd4cabb0850cea21b47406`.
8. Corrected a CSRF bootstrap race in the token fixture, redeployed the immutable release, and completed final hosted and production-boundary verification.

## 2. Files created / changed

- `fixtures/manifest.json`, `fixtures/contract-v1.0.0.json`, `scripts/verify-fixture-contract.mjs` and `scripts/update-fixture-contract-lock.mjs` — versioned fixture-contract lock, enforcement and update workflow.
- `src/pages/components/accessibility/index.astro`, component/playwright hubs and styles — accessible lesson plus deliberate, scoped anti-patterns.
- `tests/e2e/accessibility.spec.ts`, `hardening-smoke.spec.ts`, `fixture-contract.spec.ts`, `chunk-12-review.spec.ts`, `tests/api/hardening-critical.spec.ts` and unit contracts — automated hardening coverage and review evidence.
- `config/performance-budget.json`, `scripts/audit-js-budget.mjs`, `run-lighthouse.mjs`, `audit-build-security.mjs` — performance/security enforcement and evidence capture.
- `deploy/runtime/api-runtime.php`, `api-store.php`, `scripts/postbuild.mjs` — bounded structured observability, simulation exclusion, no-store API responses and immutable production asset caching.
- `.github/workflows/practice-lab.yml` — frozen fixture, dependency, PHP, cross-browser, budget, security and Lighthouse gates.
- `README.md`, `CONTRIBUTING.md`, `CHANGELOG.md`, `RUNBOOK.md`, `docs/SECURITY.md`, `docs/OBSERVABILITY.md` — operating, rollback, secure-development and metrics documentation.
- `docs/evidence/chunk-12/` and `docs/reports/assets/chunk-12/` — local audit data, R4 pre-deployment baseline and desktop/mobile review captures.

## 3. Decisions made

- Contract snapshots include normalized fixture data and the contract-test digest, so changing either requires an intentional manifest release and changelog entry.
- The three flawed a11y examples are contained in `[data-a11y-exclude="true"]`; axe coverage of the Lab shell excludes only that teaching region.
- Performance thresholds use a 180 KiB per-route JavaScript budget and mobile requirements of performance at least 90, CLS below 0.1 and LCP below 2.5 seconds.
- Fonts preload locally with `font-display: optional` to remove layout shift without any third-party font request.
- API metric history is limited to 1,000 application requests; deterministic simulated errors are tagged and excluded from real-error calculations.
- The Lab remains static/PHP-only on its own staging tree and SQLite sandbox. It never loads WordPress, reads WordPress storage, uses WordPress credentials or exposes `wp-admin`.

## 4. How to run locally

```powershell
Set-Location -LiteralPath 'C:\Users\MayurN\OneDrive\Documents\ChatGPT\Testheon-Content_project\practice-lab'
corepack pnpm install --frozen-lockfile
pnpm lint
pnpm format
pnpm typecheck
pnpm unit
pnpm fixtures:contract
pnpm build:staging
pnpm audit:js
pnpm audit:security
pnpm audit:lighthouse
pnpm e2e
pnpm e2e:cross-browser
```

## 5. Staging URLs to review

- <https://practice-staging.testheon.com/practice/components/accessibility/>
- <https://practice-staging.testheon.com/practice/>
- <https://practice-staging.testheon.com/practice/playwright/locators/>
- <https://practice-staging.testheon.com/practice/components/tables/>
- <https://practice-staging.testheon.com/practice/challenges/>
- <https://practice-staging.testheon.com/practice/apps/ecommerce/>
- <https://practice-staging.testheon.com/practice/api/v1/health>

These URLs will remain password-protected and `noindex,nofollow` after activation.

## 6. Tests

| Check | Result |
| --- | --- |
| ESLint / Prettier / Astro typecheck | PASS; 0 lint errors and 0 Astro diagnostics |
| unit and integration | PASS; 12 files / 39 tests |
| fixture manifest and contract | PASS; 20 fixtures / contract `1.0.0` |
| staging build and SEO audit | PASS; 68 HTML routes, protected staging policy retained |
| accessibility focused desktop + mobile | PASS; 8/8 checks |
| full local E2E regression | PASS; 219 checks with 30 intentional mobile skips; the only discovered mobile focus issue was fixed and its focused rerun passed 4/4 |
| Chromium/WebKit critical cross-browser smoke | PASS locally; 6/6 |
| Firefox critical cross-browser smoke | Pending CI; local Windows runner cannot start its Firefox binary because its side-by-side configuration is unavailable |
| dependency audit | PASS; 0 high or critical vulnerabilities across 648 dependencies |
| JavaScript budget | PASS; 1,589–19,271 bytes per audited route against 184,320-byte budget |
| mobile Lighthouse | PASS; landing performance 1.00, CLS 0, LCP 1,671 ms; all five required routes meet the performance, CLS and LCP limits |
| build security audit | PASS |
| review screenshots | PASS; desktop and mobile captures in `docs/reports/assets/chunk-12/` |
| staging API regression | PASS; 29 checks |
| staging browser regression after final activation | PASS; 22/22 hosted Chromium checks, with no retries |
| final token-fixture regression after CSRF correction | PASS; 2/2 hosted checks with retries disabled |
| production R4 baseline after activation | PASS; 11/11 routes return 200 with the expected final URL and canonical; pre/post comparison is clean |

## 7. Fixture manifest changes

| Fixture | Change |
| --- | --- |
| `FX-A11Y-001` | New stable `1.0.0` accessibility fixture at `/practice/components/accessibility/`; documents the accessible form and exactly three scoped intentional defects. |
| Full manifest | Added `contractVersion: "1.0.0"`; manifest now contains 20 fixtures. |

## 8. Production boundary and remediation proof

**Final result: PASS.** The active staging release is `20261013T145340Z-13732b`, verified through its protected release controller at `https://practice-staging.testheon.com/practice/`. It remains password-protected and sends `X-Robots-Tag: noindex, nofollow`.

`docs/evidence/chunk-12/pre-deploy/http-baseline.json` and `docs/evidence/chunk-12/post-deploy/http-baseline.json` record the homepage plus ten published Testheon posts. The final R4 comparison confirms that all 11 have HTTP 200, the requested final URL, and exactly one matching canonical.

During an earlier deployment attempt, the parent-domain upload target was mistakenly selected. It created `public_html/practice` and replaced the two production routing files, `.htaccess` and `index.php`; it did not alter WordPress content, the database, posts, pages, settings, plugins, themes or Rank Math data. Six sampled blog routes returned 500 until remediation.

After the user's explicit approval, only the mistaken `public_html/practice` directory was deleted. The production `.htaccess` was restored from its existing `.htaccess.bk`, and `index.php` was restored to the standard WordPress front controller. Direct Hostinger reads confirm the WordPress rewrite configuration and `wp-blog-header.php` entry point; `https://testheon.com/practice/` now returns 404 and the Hostinger file listing confirms the directory is absent. The final public baseline above confirms the live homepage and sampled posts are healthy again.

## 9. Known issues and deviations from the chunk

- The initial parent-domain upload selection was a deployment error. The remediation and final checks above resolved the resulting temporary production routing outage. Subsequent activation used credentials scoped to `practice-staging.testheon.com` only.
- The auth token fixture could issue a request before CSRF initialization completed. Commit `44b0729` initializes the Lab session before issuing a token; the corrected release passed the focused no-retry check and the complete 22-test hosted UI suite.
- The local Windows Firefox Playwright binary fails before test execution with a side-by-side configuration error. CI is configured to run the same critical smoke suite on Ubuntu with Chromium, Firefox and WebKit; remote CI needs the approved GitHub push to provide final Firefox evidence.
- Lighthouse gives the deliberately flawed locators fixture an accessibility score of 0.88. That page intentionally includes documented anti-patterns; axe checks pass for every page after excluding only its marked teaching region.

## 10. Carry-forward for later chunks

- Preserve the frozen fixture-contract workflow; any intended fixture break must version the manifest and changelog before it can merge.
- Keep observability bounded, synthetic and isolated. Do not forward Lab metrics to WordPress or a third party without a separately reviewed ticket.
- Production deployment remains a Chunk 13 activity and needs its own explicit approval.

## 11. Completion and follow-up

CRE-57 is complete at its Chunk 12 checkpoint. The source commits are `e4ee2a6` and `44b0729`; the final immutable staging release is `20261013T145340Z-13732b`.

No GitHub push was performed because it was not authorized for CRE-57. The remaining Windows Firefox limitation is documented above; it does not block the completed approved staging checkpoint. A production Practice Lab launch remains a separate Chunk 13 activity and requires its own review and approval.

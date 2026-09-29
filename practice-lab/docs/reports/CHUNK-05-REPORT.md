# Chunk 05 Report — Tables, search, pagination and infinite scroll

## 1. Summary

1. Added a complete Table Lab at `/practice/components/tables/` covering all 13 requested table patterns against deterministic synthetic employee data.
2. Added static, sortable, searchable, filterable, client-paginated, API-paginated, editable, dynamic, selectable, expandable, sticky, virtualized, asynchronous and nested table exercises.
3. Added the required Rahul Sharma/Engineering edit task, Active Pune salary task and Ananya Rao/Wireless Mouse nested-data task.
4. Added `/practice/components/search-and-lists/` with instant, controlled-delay and debounced search, keyboard autocomplete, combined filters, explicit empty state, load more and cursor-backed infinite scroll.
5. Added four executable Playwright TypeScript table examples plus two search/list examples.
6. Added live staging coverage for employee edit persistence, reset, page/limit pagination and cursor end states.
7. Registered `FX-TABLE-001` and `FX-LIST-001`; the fixture manifest is now version `1.2.0` with eight fixtures.
8. Deployed immutable release `20260928T074543Z-85f90b` to protected/noindex staging with two rollback releases retained.
9. Fixed an API-hydration race found during hosted QA and made hosted browser test sandboxes expire after two minutes to prevent repeated runs from filling the isolated-session cap.
10. Passed local verification, hosted UI/API regressions, desktop/mobile behavior coverage and post-deploy release checks.
11. Re-ran R4 evidence: **WordPress untouched: PASS**.

## 2. Files created / changed

- `src/lib/table-data.ts` — typed employee enrichment, deterministic salaries/joining dates and 10,000-row virtual data.
- `src/pages/components/tables/index.astro` — the 13 table patterns, three required business exercises and four Playwright examples.
- `src/scripts/tables.ts` — sorting, search, filters, pagination, validated edit/save/reset, row operations, selection, expansion, sticky/virtual/async behavior and API hydration.
- `src/pages/components/search-and-lists/index.astro` — search timing, autocomplete, filters, empty state, load-more and infinite-scroll fixtures.
- `src/scripts/search-and-lists.ts` — deterministic search timers, ARIA keyboard behavior and API-backed list pagination.
- `src/styles/global.css` — responsive table panels, sticky axes, compact scrollers, virtual rows and search/list layouts.
- `src/pages/playwright/index.astro`, `src/config/categories.ts` — links to the new labs from the track and catalogue.
- `examples/playwright-ts/tables.spec.ts` — row filtering with `has`, salary-column arrays, page-until-found and virtualization examples.
- `examples/playwright-ts/search-lists.spec.ts` — debounced search and API infinite-scroll examples.
- `tests/e2e/table-lab.spec.ts` — all Chunk 5 behavior, responsive and screenshot coverage.
- `tests/live/table-lab-live.spec.ts` — real API persistence/reset and pagination/cursor coverage.
- `tests/e2e/test-fixture.ts` and existing E2E/example imports — two-minute hosted sandboxes for repeatable staging regressions without capacity accumulation.
- `tests/e2e/component-lab.spec.ts`, `tests/unit/manifest.test.ts` — eight-page accessibility coverage and eight-fixture manifest expectation.
- `fixtures/manifest.json` — `FX-TABLE-001`, `FX-LIST-001` and manifest version `1.2.0`.
- `README.md`, `docs/CHUNK-05-TASK.md` — routes, commands and checked-out CRE-50 scope.
- `docs/reports/assets/chunk-05/` — reviewed desktop/mobile images for both new pages.
- `docs/evidence/chunk-05/`, `docs/reports/CHUNK-05-REPORT.md` — R4 evidence and this checkpoint report.

## 3. Decisions made

- **API-first data with a deterministic local fallback:** staging uses all 120 synthetic employees and the real session API. Local static preview uses the matching checked-in seed so the lab remains useful without PHP.
- **Hydrate before interaction:** the table module now completes its initial API read before exposing initialized views. This prevents a late response from resetting a learner's selection or edit state.
- **Visible sort contract:** multi-column sort controls show priority and `aria-sort`, giving both sighted learners and automation stable state to assert.
- **Bounded virtualization:** the 10,000-row example keeps an 18-row window, comfortably below the required 40 mounted data rows.
- **Real persistence only where it teaches something:** inline editing uses the cookie sandbox, CSRF and `PATCH`; reset returns the sandbox to seed data. Other row-manipulation exercises remain deliberately client-scoped.
- **True API pagination:** server pagination sends `page` and `limit`; infinite scrolling follows the API cursor and shows an explicit end state.
- **Nested data kept deterministic:** customer/order/item and department/employee/project hierarchies are fixed learning fixtures, including Ananya Rao's Wireless Mouse quantity.
- **Web-first Playwright examples:** examples wait for applied search/page/readiness state before sampling arrays or continuing pagination.
- **Short-lived hosted test sandboxes:** the normal E2E fixture creates a 120-second sandbox before each hosted test. Expired sessions are reclaimed on later session creation, so retries cannot occupy the 100-session cap for hours.
- **Immutable protected release:** the deployment used the existing verified release path, retained three releases and preserved the one-command rollback.

## 4. How to run locally

From PowerShell:

```powershell
Set-Location -LiteralPath 'C:\Users\MayurN\OneDrive\Documents\ChatGPT\Testheon-Content_project\practice-lab'
corepack pnpm install --frozen-lockfile
pnpm verify
pnpm dev
```

Run the real staging suites after loading the ignored staging environment:

```powershell
$env:PRACTICE_LAB_BASE_URL = "$env:PRACTICE_LAB_STAGING_ORIGIN/practice"
pnpm ui:test:staging

$env:PRACTICE_LAB_API_BASE_URL = $env:PRACTICE_LAB_STAGING_ORIGIN
pnpm api:test:staging
```

Operators with ignored `.env` and short-lived `.deploy.env` values can inspect, deploy or roll back with:

```powershell
pnpm status:staging
pnpm deploy:staging
pnpm rollback:staging
```

## 5. Staging URLs to review

- Table Lab: <https://practice-staging.testheon.com/practice/components/tables/>
- Search and Lists Lab: <https://practice-staging.testheon.com/practice/components/search-and-lists/>
- Playwright track: <https://practice-staging.testheon.com/practice/playwright/>
- Lab home: <https://practice-staging.testheon.com/practice/>

The staging host remains protected by the existing HTTP credentials in ignored `practice-lab/.env` and sends `noindex,nofollow`.

## 6. Tests

| Check | Result |
| --- | --- |
| `pnpm lint` | PASS, 0 warnings/errors |
| `pnpm format` | PASS |
| `pnpm typecheck` | PASS, 0 errors/warnings/hints across 56 files |
| `pnpm unit` | PASS, 7 files / 20 tests |
| `pnpm api:validate` | PASS, 8 resources, fixture 1.0.0, OpenAPI 1.0.0 |
| `pnpm build` | PASS, 11 static pages plus release API package |
| local `pnpm e2e` | PASS, 70/70 desktop/mobile Chrome tests |
| `pnpm manifest:validate` | PASS, 8 fixtures |
| complete local `pnpm verify` before the final test-fixture hardening | PASS |
| live `pnpm ui:test:staging` | PASS, 5/5 actual API integration tests |
| live staging `pnpm e2e` | PASS, 70/70 across the complete run plus one isolated environmental rerun |
| final live `pnpm api:test:staging` | PASS, 15/15 tests |
| deploy smoke | PASS, hub, API docs, health and active release verified |
| R4 public HTTP comparison | PASS, 11/11 URLs unchanged |
| secret-value scan | PASS, 0 matches across 238 repository files; temporary credentials and traces removed |

The 70-case browser suite covers the eight fixture pages, executable examples, shell accessibility checks, documented intentional defects, canonicals, noindex policy, internal links, 404 handling and review screenshots at desktop and mobile widths. Chunk 5 assertions cover sorting, search, filters, empty states, client/API pagination, edit validation/cancel, row creation/deletion, page/all-page selection, bulk action, expansion, sticky axes, 10,000-row virtualization, deterministic async status, both nested-table hierarchies, autocomplete, load more and cursor end state.

The final hosted run passed 69 tests and encountered one `ERR_NETWORK_CHANGED` before the mobile keyboard smoke page loaded. That single test passed immediately in isolation; no assertion or application behavior failed. The earlier complete desktop run passed 35/35, the mobile run plus focused rerun passed 35/35, and every CRE-50 behavior passed in the final complete run.

Hosted QA found one genuine selection race: late initial API hydration could reset selection between “Select all pages” and bulk action. Initialization now awaits hydration, the regression test waits for the visible loaded state, and focused plus full hosted checks passed. Repeated pre-fix browser runs also filled the 100-session staging cap. An explicitly approved, authenticated, control-token-protected maintenance action removed those 100 ephemeral sessions, restored the original release controller before deletion, removed its temporary file and left the permanent cron unchanged. The new two-minute E2E sandbox fixture prevents recurrence.

This checkout has no configured Git remote, so there is no remote GitHub Actions run to link. The frozen-install verification path and hosted suites provide the checkpoint evidence.

Release evidence:

- Active release: `20260928T074543Z-85f90b`.
- Artifact SHA-256: `f78ae7d7f85d695157f7887ac864414c41005407679ed0e5ccb3929d27045e72`.
- Immediate rollback release: `20260928T071250Z-74dea4`.
- Additional retained release: `20260928T041825Z-ec1209`.
- Hostinger `.current` was re-read after deployment and maintenance and matches the active release.
- `practice/__release-control.php` was restored before session deletion; its 3,086-byte server size and normalized content match the local source.
- The existing `pnpm rollback:staging` command remains the one-command rollback.

## 7. Fixture manifest changes

| Fixture ID | Version | Route and anchor | Intentional defect |
| --- | --- | --- | --- |
| `FX-TABLE-001` | `1.0.0` | `/practice/components/tables/#fixture-tables` | None |
| `FX-LIST-001` | `1.0.0` | `/practice/components/search-and-lists/#fixture-search-lists` | None |

`FX-TABLE-001` records the 13 employee-table patterns, page sizes, async delays, 10,000 virtual rows, 18-row DOM window, API persistence/reset and tests. `FX-LIST-001` records the three search timing models, autocomplete, combined filters, load-more size, 20-item cursor pages, empty/end states and tests. The manifest validates at version `1.2.0` with eight total fixtures.

## 8. WordPress untouched proof

**WordPress untouched: PASS.**

| Evidence | Before deployment | After deployment | Result |
| --- | --- | --- | --- |
| Production root `.htaccess` SHA-256 | `3f9689ed4759a5a35a33c4f7ccfb40613310fbc1b0f98387bfdc76f21ce00d24` | `3f9689ed4759a5a35a33c4f7ccfb40613310fbc1b0f98387bfdc76f21ce00d24` | Identical |
| Homepage + 10 published posts | 11/11 HTTP 200 with correct self-canonical | 11/11 HTTP 200 with correct self-canonical | PASS |
| Production response bodies | Eleven SHA-256 values recorded | All eleven SHA-256 values identical | PASS |
| Production final URLs | Eleven expected HTTPS URLs | All unchanged | PASS |
| Staging root `.htaccess` SHA-256 | `9186269b669a6a1ab7bc26d52b66c633e1ae616460974cd60ff394c45bcacaf6` | `9186269b669a6a1ab7bc26d52b66c633e1ae616460974cd60ff394c45bcacaf6` | Identical |
| Nested staging `practice/.htaccess` | 894 bytes; local source SHA-256 `2d58ee3e0335ccd75eb75be940868c1273bb39996560cb1734e55e7591e9bc62` | Same size and local source hash | PASS |
| WordPress files/database/credentials | Not used | Not used | PASS |
| Deployment target | Dedicated protected subdomain | Only immutable staging release changed | PASS |

Evidence is stored in `docs/evidence/chunk-05/pre-deploy/` and `docs/evidence/chunk-05/post-deploy/`. The pre/post comparison found zero differences across requested URL, status, final URL, canonical count/value and body SHA-256 for all 11 production pages. Deployment and maintenance did not edit WordPress core, themes, plugins, configuration, posts, settings, database, media or production root `.htaccess`.

## 9. Known issues and deviations from the chunk

- The Hostinger developer API still returns an upstream Cloudflare challenge for nested `practice/.htaccess` content. Its unchanged 894-byte server size, deployed local source hash and unchanged production/staging-root hashes provide the recorded substitute evidence.
- Newly created Hostinger cron jobs were accepted but did not execute during multiple scheduler boundaries, and the cron-output API remained blank even for the established permanent job. Both temporary jobs were removed. The permanent five-minute cleanup job remains the only cron entry.
- The session-cap recovery used a one-time controller action only after Mayur explicitly approved temporary replacement of the protected endpoint. The controller restored its original bytes before deleting sessions; server size and normalized content were independently verified afterward.
- This checkout has no configured Git remote, so a remote GitHub Actions result is unavailable; complete local and hosted verification passed.
- PHP CLI remains unavailable on this workstation. The hosted API passed all 15 acceptance tests.
- Browser output includes the inherited harmless `NO_COLOR`/`FORCE_COLOR` warning.
- No functional, safety or requested-scope deviation remains open for CRE-50.

## 10. Carry-forward for later chunks

- CRE-51 may start only after its ticket is checked out and read in full.
- Preserve `FX-TABLE-001` and `FX-LIST-001` at version `1.0.0`; bump versions and add changelog entries for breaking DOM or behavior changes.
- Keep API hydration complete before interactive table state can be changed.
- Reuse the short-lived hosted E2E sandbox fixture so repeated browser runs do not consume the session cap.
- Keep API examples web-first: wait for the applied page/search state before reading arrays or issuing the next action.
- Preserve protected/noindex staging, immutable releases, one-command rollback and R4 evidence before and after every deployment.
- Production remains locked until Chunk 13 and its explicit approval gates.

## 11. Questions for Mayur

None. Chunk 5 is complete and stops before CRE-51.

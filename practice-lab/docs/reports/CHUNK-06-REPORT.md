# Chunk 06 Report — Waits, dynamic DOM, dialogs, interactions and controls

## 1. Summary

1. Added the Playwright Waits Lab with deterministic delay controls, synchronization guidance and all requested asynchronous states.
2. Added the Dynamic DOM Lab with generated selectors, seeded order, ambiguous content, hidden duplicates, node replacement and API rendering.
3. Added native browser dialogs, accessible application modals and role-correct configurable toasts.
4. Added pointer, focus, keyboard, shortcut, listbox and autocomplete interactions with one visible event log.
5. Added deterministic date, time, calendar, range, slider, linked-value, stepper and async-progress controls.
6. Added executable Playwright TypeScript examples and desktop/mobile behavior coverage with fast overrides plus real-delay proof.
7. Registered five new fixtures; manifest version `1.3.0` now contains 13 fixtures.
8. Deployed final immutable release `20260928T130939Z-f8497f` to protected/noindex staging with two rollback releases retained.
9. Passed local, hosted UI, hosted API and hosted browser verification; one mobile hover timing race found on staging was fixed and reverified.
10. Repeated R4 evidence and confirmed **WordPress untouched: PASS**.

## 2. Files created / changed

- `src/pages/playwright/waits/index.astro`, `src/scripts/waits.ts` — wait guidance, delay controls and 11 deterministic wait fixtures.
- `src/pages/components/dynamic-dom/index.astro`, `src/scripts/dynamic-dom.ts` — marked selector, order, duplicate, replacement and API-rendered DOM practice.
- `src/pages/components/dialogs/index.astro`, `src/scripts/dialogs.ts` — native dialogs, seven application-modal patterns and configurable semantic toasts.
- `src/pages/components/interactions/index.astro`, `src/scripts/interactions.ts` — pointer, scrolling, focus, shortcut, listbox and autocomplete exercises.
- `src/pages/components/date-time-and-ranges/index.astro`, `src/scripts/date-time-ranges.ts` — native/custom date and time controls, ranges, numeric controls and async progress.
- `src/styles/global.css` — responsive menu, modal, toast, interaction, calendar, range and progress layouts.
- `src/pages/playwright/index.astro` — links to the Waits and interaction/control labs.
- `examples/playwright-ts/waits-dialogs.spec.ts` — visible-state, response, prompt and toast examples.
- `examples/playwright-ts/interactions-controls.spec.ts` — command-palette and custom-calendar examples.
- `tests/e2e/chunk-06-labs.spec.ts` — complete Chunk 06 desktop/mobile behavior and screenshot coverage.
- `tests/live/chunk-06-live.spec.ts` — hosted wait and API-rendered DOM checks.
- `tests/e2e/component-lab.spec.ts`, `tests/e2e/examples.spec.ts`, `tests/e2e/test-fixture.ts` — route registration, executable examples and typed fixture cleanup.
- `fixtures/manifest.json`, `tests/unit/manifest.test.ts` — five fixture registrations and 13-fixture expectation.
- `README.md`, `docs/CHUNK-06-TASK.md` — route inventory, commands and checked-out CRE-51 scope.
- `docs/reports/assets/chunk-06/` — reviewed desktop/mobile images for all five pages.
- `docs/evidence/chunk-06/`, `docs/reports/CHUNK-06-REPORT.md` — R4 evidence and this checkpoint report.

## 3. Decisions made

- **Web-first waits:** every exercise exposes a DOM, URL, network or accessibility state that Playwright can await; examples never teach fixed sleeps.
- **Fast CI with genuine timer proof:** `?delay=0` keeps broad coverage fast, while dedicated desktop tests prove the one-second wait, delayed alert and async job paths.
- **Seeded variability:** random waits and dynamic order remain reproducible from their seed, so learners see changing markup without flaky expected outcomes.
- **Explicit awkward-DOM teaching:** generated selectors and ambiguous duplicates are visibly marked and paired with explanations of why fragile selectors fail.
- **Native and application dialogs stay distinct:** browser events use Playwright's dialog handling; application modals use semantic HTML dialogs, focus containment and Escape behavior.
- **Toast roles follow urgency:** routine success/info messages use status semantics, while error/warning notifications use alert semantics.
- **One interaction log:** pointer and keyboard outcomes append stable human-readable entries, keeping assertions independent of internal event flags.
- **Fixed clock and normalized output:** the control lab accepts a `now` override and renders fixed timezone output so date assertions do not depend on the runner clock.
- **Responsive hover tolerance:** the hover menu keeps its short leave grace period long enough for emulated touch viewports to move from trigger to menu without racing closure.
- **Immutable protected release:** deployment used the existing atomic release controller, kept staging protected/noindex and preserved the one-command rollback.

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
pnpm e2e

$env:PRACTICE_LAB_API_BASE_URL = $env:PRACTICE_LAB_STAGING_ORIGIN
pnpm api:test:staging
```

Operators with the ignored `.env` and a fresh short-lived `.deploy.env` can inspect, deploy or roll back with:

```powershell
pnpm status:staging
pnpm deploy:staging
pnpm rollback:staging
```

## 5. Staging URLs to review

- Playwright Waits Lab: <https://practice-staging.testheon.com/practice/playwright/waits/>
- Dynamic DOM Lab: <https://practice-staging.testheon.com/practice/components/dynamic-dom/>
- Dialogs, Modals and Toasts: <https://practice-staging.testheon.com/practice/components/dialogs/>
- Interaction Lab: <https://practice-staging.testheon.com/practice/components/interactions/>
- Date, Time and Range Controls: <https://practice-staging.testheon.com/practice/components/date-time-and-ranges/>
- Playwright track: <https://practice-staging.testheon.com/practice/playwright/>
- Lab home: <https://practice-staging.testheon.com/practice/>

The staging host remains protected by the existing HTTP credentials in ignored `practice-lab/.env` and sends `noindex,nofollow`.

## 6. Tests

| Check | Result |
| --- | --- |
| ESLint | PASS, 0 warnings/errors |
| Prettier | PASS |
| Astro typecheck | PASS, 0 errors/warnings/hints across 68 files |
| unit/integration | PASS, 7 files / 20 tests |
| API artifact validation | PASS, 8 resources, fixture 1.0.0, OpenAPI 1.0.0 |
| manifest validation | PASS, 13 fixtures |
| production build | PASS, 16 static pages plus release API package |
| local full E2E | PASS, 98 passed / 2 expected mobile real-timer skips |
| final local mobile interaction regression | PASS, 1/1 |
| hosted UI suite | PASS, 7/7 |
| hosted API suite | PASS, 15/15 |
| hosted full E2E plus focused corrective rerun | PASS, all 98 runnable behaviors / 2 expected mobile real-timer skips |
| deploy smoke and release status | PASS, hub, API docs, health and active release verified |
| R4 public HTTP comparison | PASS, 11/11 URLs unchanged |
| secret-value scan | PASS, 0 matches; temporary upload credential files removed |

The 100-case browser matrix covers 13 fixture pages, executable examples, accessibility checks, documented intentional defects, canonicals, noindex policy, internal links, Lab 404 handling and desktop/mobile screenshots. Two mobile cases deliberately skip duplicate one-second timer proofs; the equivalent desktop tests pass against real timers.

The first complete hosted run passed 97 tests, skipped those two expected mobile timer cases and exposed one genuine mobile-only hover race: the menu closed during Playwright's move from the trigger to its menu item. The responsive leave grace period was corrected, rebuilt and activated in a new immutable release. The exact hosted mobile case then passed, while the other 97 runnable cases had already passed against the same Chunk 06 implementation. Local build, formatting, lint, typecheck and the same mobile case passed after the correction.

Release evidence:

- Active release: `20260928T130939Z-f8497f`.
- Artifact SHA-256: `24b3cc7541758ef9450de80f1847d5f7f94124399cbd45b78cf442988dc2de9e`.
- Immediate rollback release: `20260928T105922Z-fb846d`.
- Additional retained release: `20260928T074543Z-85f90b`.
- Hostinger `.current` was re-read after deployment and matches the active release.
- The existing `pnpm rollback:staging` command remains the one-command rollback.

This checkout has no configured Git remote, so there is no remote GitHub Actions run to link. The complete local and hosted suites provide the checkpoint evidence.

## 7. Fixture manifest changes

| Fixture ID | Version | Route and anchor | Intentional defect |
| --- | --- | --- | --- |
| `FX-WAIT-001` | `1.0.0` | `/practice/playwright/waits/#fixture-waits` | None |
| `FX-DOM-001` | `1.0.0` | `/practice/components/dynamic-dom/#fixture-dynamic-dom` | Generated IDs/classes, ambiguous repeated text and a hidden duplicate are visibly marked practice defects |
| `FX-DIALOG-001` | `1.0.0` | `/practice/components/dialogs/#fixture-dialogs` | None |
| `FX-INTERACT-001` | `1.0.0` | `/practice/components/interactions/#fixture-interactions` | None |
| `FX-DATETIME-001` | `1.0.0` | `/practice/components/date-time-and-ranges/#fixture-date-time-ranges` | None |

The Wait fixture records presets `1/2/5/10` seconds, seeded random delay and URL range `0–10000` ms. The DOM fixture records semantic contracts that survive generated selectors and replacement. Dialog, interaction and date/time fixtures record their semantic outcomes, deterministic controls and executable tests. The manifest validates at version `1.3.0` with 13 total fixtures.

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
| Deployment target | Dedicated protected subdomain | Only immutable staging releases changed | PASS |

Evidence is stored in `docs/evidence/chunk-06/pre-deploy/` and `docs/evidence/chunk-06/post-deploy/`. The comparison found zero differences across requested URL, final URL, status, canonical count/value and body SHA-256 for all 11 production pages. Deployment did not edit WordPress core, themes, plugins, configuration, posts, pages, settings, database, media or production root `.htaccess`.

## 9. Known issues and deviations from the chunk

- The Hostinger developer API still returns an upstream Cloudflare challenge for nested `practice/.htaccess` content. Its unchanged 894-byte server size, deployed local source hash and unchanged production/staging-root hashes provide the recorded substitute evidence.
- The complete hosted browser run found one mobile hover timing defect. It was fixed in the final release and its exact hosted regression passed; no requested behavior remains broken.
- This checkout has no configured Git remote, so a remote GitHub Actions result is unavailable; complete local and hosted verification passed.
- PHP CLI remains unavailable on this workstation. The hosted API passed all 15 acceptance tests.
- The sandboxed `tsx` manifest invocation once hit a Windows `uv_os_get_passwd ENOMEM`; direct Node type stripping validated the same manifest successfully, and deployment repeated the manifest check successfully.
- Browser output includes the inherited harmless `NO_COLOR`/`FORCE_COLOR` warning.
- No functional, safety or requested-scope deviation remains open for CRE-51.

## 10. Carry-forward for later chunks

- CRE-52 may start only after its ticket is checked out and read in full.
- Preserve the five Chunk 06 fixture IDs at version `1.0.0`; bump versions and add changelog entries for breaking DOM or behavior changes.
- Keep broad CI on zero-delay controls while retaining at least one real-timer proof for timing-sensitive patterns.
- Keep dynamic fixtures seeded and preserve stable semantic contracts even when IDs, classes, order or nodes change.
- Preserve focus containment, Escape behavior and notification roles when extending dialogs and toasts.
- Reuse the fixed-time override for date-sensitive exercises and the shared visible log for interaction outcomes.
- Preserve protected/noindex staging, immutable releases, one-command rollback and R4 evidence before and after every deployment.
- Production remains locked until Chunk 13 and its explicit approval gates.

## 11. Questions for Mayur

None. Chunk 6 is complete and stops before CRE-52.


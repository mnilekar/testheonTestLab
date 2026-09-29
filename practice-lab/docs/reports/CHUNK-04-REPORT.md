# Chunk 04 Report — Component Lab A: inputs, buttons, choices, dropdowns, forms and locators

## 1. Summary

1. Added six learner-facing Component Lab pages for inputs, buttons, checkboxes/radios, dropdowns, realistic forms and Playwright locators.
2. Added reusable page, fixture and Good DOM/Awkward DOM comparison components with the established Testheon visual system.
3. Added deterministic interactions for input state, gestures, DOM replacement, choice hierarchies, ARIA comboboxes, dependent data and paged data.
4. Added five realistic forms with client validation, summaries, Chunk 3 API success, duplicate conflict, deterministic failure and reset behavior.
5. Added 14 locator comparison exercises and 400–800 words of genuine guidance across all required locator topics.
6. Registered six stable versioned fixtures with anchors, controls, defaults, expected behavior, tests and intentional defects.
7. Added executable Playwright TypeScript examples and desktop/mobile behavior, defect and accessibility-equivalent coverage.
8. Deployed immutable release `20260928T041825Z-ec1209` to protected/noindex staging with two rollback releases retained.
9. Passed local verification, hosted UI/API regressions and the post-deploy release checks.
10. Re-ran R4 evidence: **WordPress untouched: PASS**.

## 2. Files created / changed

- `src/components/ComponentLabPage.astro`, `FixtureSection.astro`, `LocatorComparison.astro` — reusable page shell, marked fixture section and locator comparison presentation.
- `src/pages/components/inputs/index.astro` — native input types, labels, masks, state changes, validation, debounce and keyboard autosuggest fixture.
- `src/pages/components/buttons/index.astro` — button semantics, gestures, delay, DOM replacement, duplicate scoping and delayed appearance fixture.
- `src/pages/components/checkboxes-radios/index.astro` — single/grouped, indeterminate, hierarchical, disabled, conditional and generated choice fixture.
- `src/pages/components/dropdowns/index.astro` — native, multi-select, grouped, searchable, ARIA, dependent and infinite dropdown fixture.
- `src/pages/components/forms/index.astro` — registration, login, contact, job application, support and feedback UI with client/server result handling.
- `src/pages/playwright/locators/index.astro` — locator guidance and 14 Good DOM/Awkward DOM examples.
- `src/pages/playwright/index.astro`, `src/config/categories.ts` — links from the track and category navigation to the new pages.
- `src/scripts/fixture-dom.ts`, `inputs.ts`, `buttons.ts`, `choices.ts`, `dropdowns.ts`, `forms.ts` — small page-specific deterministic interaction modules.
- `src/styles/global.css` — Component Lab fields, controls, comparisons, summaries, responsive layouts and marked anti-pattern styles.
- `examples/playwright-ts/*.spec.ts` — six executable TypeScript example suites used by normal Playwright verification.
- `tests/e2e/component-lab.spec.ts`, `examples.spec.ts` — desktop/mobile behavior, documented defect, accessibility-equivalent, content and screenshot coverage.
- `tests/live/component-lab-live.spec.ts`, `playwright.ui.config.ts` — live staging form/API, dependent data, failure and reset coverage.
- `tests/api/practice-api.spec.ts` — rate-limit acceptance now tolerates one fixed minute-window rollover while still requiring the configured 429 response and retry header.
- `fixtures/manifest.json`, `fixtures/manifest.schema.json`, `tests/unit/manifest.test.ts` — six stable fixture contracts, anchors and validation.
- `package.json`, `playwright.config.ts`, `README.md` — staging UI command, executable examples and routes/documentation.
- `docs/CHUNK-04-TASK.md`, `docs/evidence/chunk-04/`, `docs/reports/CHUNK-04-REPORT.md` — checked-out scope, R4 proof, review images and this report.

## 3. Decisions made

- **One stable fixture per grouped page:** each requested component family has one versioned fixture region with smaller exercises inside it. This keeps URLs and versions stable while avoiding disconnected single-widget pages.
- **Static-first Astro plus small TypeScript modules:** all instructions, links, examples and controls are in served HTML; JavaScript only supplies interaction. A client framework would add weight without improving these fixtures.
- **Semantic baseline with marked exceptions:** normal exercises use roles, labels, names, status regions and keyboard behavior. Placeholder-only input, unnamed icon button, duplicate labels and awkward structures live only inside explicit anti-pattern regions.
- **Real Chunk 3 API use:** forms create cookie sandboxes and CSRF tokens, post to the matching synthetic resources, expose 409 duplicate conflicts and 503 simulation, and reset state. Local E2E isolates presentation with route stubs; a separate live suite proves actual staging integration.
- **Progressive dropdown behavior:** the dependent location control reads customer data and the infinite control pages through products. Native and ARIA variants remain side by side so learners can compare locator strategies.
- **Executable examples in the main test run:** example files contain real assertions and are imported into the normal Playwright configuration, preventing documentation snippets from drifting silently.
- **Accessibility-equivalent scan:** the suite checks names, labels, duplicate IDs, image text, headings and ARIA references on the Lab shell and good fixtures while excluding only the documented anti-pattern regions. No new scanner dependency was needed.
- **Immutable protected staging release:** the existing release-control path activated one content/API-compatible artifact and retained its predecessor for the documented one-command rollback.

## 4. How to run locally

From PowerShell:

```powershell
Set-Location -LiteralPath 'C:\Users\MayurN\OneDrive\Documents\ChatGPT\Testheon-Content_project\practice-lab'
corepack pnpm install --frozen-lockfile
pnpm verify
pnpm dev
```

Run the real staging UI and API suites after loading the ignored staging environment:

```powershell
$env:PRACTICE_LAB_BASE_URL = $env:PRACTICE_LAB_STAGING_ORIGIN
pnpm ui:test:staging

$env:PRACTICE_LAB_API_BASE_URL = $env:PRACTICE_LAB_STAGING_ORIGIN
pnpm api:test:staging
```

Operators with ignored `.env` and short-lived `.deploy.env` values can deploy, inspect or roll back with:

```powershell
pnpm deploy:staging
pnpm status:staging
pnpm rollback:staging
```

## 5. Staging URLs to review

- Inputs: <https://practice-staging.testheon.com/practice/components/inputs/>
- Buttons: <https://practice-staging.testheon.com/practice/components/buttons/>
- Checkboxes and radios: <https://practice-staging.testheon.com/practice/components/checkboxes-radios/>
- Dropdowns: <https://practice-staging.testheon.com/practice/components/dropdowns/>
- Forms: <https://practice-staging.testheon.com/practice/components/forms/>
- Playwright locators: <https://practice-staging.testheon.com/practice/playwright/locators/>

The staging host remains protected by the existing HTTP credentials in ignored `practice-lab/.env` and sends `noindex,nofollow`.

## 6. Tests

| Check | Result |
| --- | --- |
| `pnpm lint` | PASS, 0 warnings/errors |
| `pnpm format` | PASS |
| `pnpm typecheck` | PASS, 0 errors/warnings/hints across 48 files |
| `pnpm unit` | PASS, 7 files / 20 tests |
| `pnpm api:validate` | PASS, 8 resources, fixture 1.0.0, OpenAPI 1.0.0 |
| `pnpm build` | PASS, 9 static pages plus release API package |
| local `pnpm e2e` | PASS, 42/42 desktop/mobile Chrome tests |
| `pnpm manifest:validate` | PASS, 6 fixtures |
| complete local `pnpm verify` | PASS |
| live `pnpm ui:test:staging` | PASS, 3/3 actual API integration tests |
| live staging `pnpm e2e` | PASS, 42/42 desktop/mobile Chrome tests |
| final live `pnpm api:test:staging` | PASS, 15/15 tests |
| deploy smoke | PASS, hub, API docs, health and active release verified |
| R4 public HTTP comparison | PASS, 11/11 URLs unchanged |
| secret-value scan | PASS, 0 matches across 217 repository files; temporary credentials removed |

The 42-case browser suite covers all fixture behavior, every documented intentional defect, the six executable example suites, shell accessibility checks, 400–800-word locator guidance, internal links, canonicals, noindex policy, 404 handling and review screenshots at desktop and mobile widths. The three live Component Lab tests additionally prove real API form success and 409 conflict, dependent customer/product options, deterministic 503 simulation and reset.

An initial inherited API regression run passed 14/15 but crossed the server's fixed minute boundary during its three rate-limit requests. The acceptance test was changed to permit one window rollover while still requiring at least two successful calls followed by 429 and `Retry-After: 60`. Its focused rerun passed, and the final complete API suite passed 15/15. No test is skipped or failing.

This checkout has no configured Git remote, so there is no remote GitHub Actions run to link. The same frozen-install `pnpm verify` workflow path passed locally. PHP application code did not change in this chunk.

Release evidence:

- Active release: `20260928T041825Z-ec1209`, artifact SHA-256 `8a1644f7841dbbd307b10213503339139197e740d72bc407f9a1051b6bf7763a`.
- Immediate rollback release: `20260927T180429Z-5c1f66`.
- Additional retained release: `20260927T180347Z-00ae7b`.
- Hostinger `.current` was re-read after deployment and matches the active release.
- The existing `pnpm rollback:staging` command remains the one-command rollback.

## 7. Fixture manifest changes

| Fixture ID | Version | Route and anchor | Intentional defect |
| --- | --- | --- | --- |
| `FX-INPUT-001` | `1.0.0` | `/practice/components/inputs/#fixture-inputs` | Placeholder-only field without an accessible label |
| `FX-BUTTON-001` | `1.0.0` | `/practice/components/buttons/#fixture-buttons` | Unnamed icon button, duplicate names and nested awkward target |
| `FX-CHOICE-001` | `1.0.0` | `/practice/components/checkboxes-radios/#fixture-choices` | Duplicate scoped labels |
| `FX-DROPDOWN-001` | `1.0.0` | `/practice/components/dropdowns/#fixture-dropdowns` | Custom listbox structure reserved for locator practice |
| `FX-FORM-001` | `1.0.0` | `/practice/components/forms/#fixture-forms` | Server conflict/failure states are intentional deterministic simulations |
| `FX-LOCATOR-001` | `1.0.0` | `/practice/playwright/locators/#fixture-locators` | Marked Awkward DOM examples for every locator topic |

The manifest is version `1.1.0`, validates against its schema and records each fixture's behavior, controls/defaults, expected results, tests and guide relationship.

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

Evidence is stored in `docs/evidence/chunk-04/pre-deploy/` and `docs/evidence/chunk-04/post-deploy/`. The pre/post JSON comparison found zero differences across requested URL, status, final URL, canonical and body SHA-256 for all 11 production pages. Deployment did not edit WordPress core, theme, plugins, configuration, posts, settings, database or production root `.htaccess`.

## 9. Known issues and deviations from the chunk

- The Hostinger developer API still returns an upstream Cloudflare challenge for nested `practice/.htaccess` content. Its unchanged 894-byte server size, deployed local source hash and unchanged production/staging-root hashes provide the recorded substitute evidence.
- This checkout has no configured Git remote, so a remote GitHub Actions result is unavailable; the complete local verification and hosted suites passed.
- PHP CLI remains unavailable on this workstation. No PHP file changed in Chunk 4, and the inherited API passed all 15 hosted acceptance tests.
- Browser output includes the inherited harmless `NO_COLOR`/`FORCE_COLOR` warning.
- No functional, safety or requested-scope deviation remains open for CRE-49.

## 10. Carry-forward for later chunks

- CRE-50 may build the next Practice Lab chunk only after its ticket is checked out and read in full.
- Preserve the six fixture IDs and version `1.0.0`; bump versions and add changelog entries for any later breaking DOM or behavior change.
- Reuse the Component Lab page and fixture components when later controls or realistic application flows need the same patterns.
- Keep Chunk 3 API integration synthetic, sandboxed and deterministic, and keep protected staging/noindex with R4 evidence before and after every deployment.
- Production remains locked until Chunk 13 and its explicit approval gates.

## 11. Questions for Mayur

None. Chunk 4 is complete and stops before CRE-50.

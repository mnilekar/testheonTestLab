# Chunk 10 Report — Challenge system, starter code and test-case downloads

## 1. Summary

1. Added a schema-validated catalogue of 28 Playwright challenges: 8 Beginner, 9 Intermediate, 7 Advanced and 4 Expert.
2. Added the static challenge catalogue with difficulty, skill, feature, application and technology filters.
3. Added 28 statically generated detail pages with scenario, objective, preconditions, test data, expected result, a fixture link, three progressive hints and a collapsed solution.
4. Added a complete TypeScript starter plus Python and Java companion packs with three equivalent examples each.
5. Added downloadable ecommerce test packs in JSON, CSV and Markdown and linked them from the Store.
6. Added three deliberately failing TypeScript debugging exercises and automated solution-contract coverage.
7. Updated the Authentication, Table and Store fixtures required by the challenge scenarios while keeping all data synthetic and Lab-only.
8. Registered challenge links across the fixture manifest, bumped the manifest to `1.7.0` and preserved its 19-fixture total.
9. Deployed immutable release `20261011T070625Z-1f178f` to protected/noindex staging with two rollback releases retained.
10. Passed local, hosted, deployment and R4 validation. **WordPress untouched: PASS.**

## 2. Files created / changed

- `content/challenges/challenge.schema.json`, `content/challenges/challenges.json` — challenge contract and generated 28-item catalogue.
- `scripts/generate-challenges.mjs`, `scripts/validate-challenges.mjs`, `src/lib/challenges.ts` — deterministic generation, Ajv validation and typed catalogue helpers.
- `src/pages/challenges/index.astro`, `src/pages/challenges/[slug]/index.astro`, `src/scripts/challenge-filters.ts` — filterable catalogue and static detail pages.
- `starter/playwright-ts/` — cloneable TypeScript project, one passing example and three deliberately failing debugging exercises.
- `starter/playwright-python/`, `starter/playwright-java/` — setup notes and three locator/API/authentication examples per language.
- `scripts/build-downloads.mjs`, `public/downloads/` — reproducible starter ZIPs and ecommerce JSON/CSV/Markdown packs.
- `src/pages/apps/auth/index.astro`, `src/scripts/auth-app.ts` — stable Account dashboard heading for authentication challenges.
- `src/pages/components/tables/index.astro`, `src/scripts/tables.ts` — refreshable, API-backed customer table for API-to-UI exercises.
- `api/seed/generate-seed.mjs`, `api/seed/fixtures-v1.json` — deterministic Arka 14 Laptop at ₹49,999 with stock 12 and synchronized seeded orders.
- `src/pages/apps/ecommerce/index.astro`, `src/pages/apps/ecommerce/products/index.astro` — ecommerce test-pack downloads and a ₹50,000 maximum-price option.
- `fixtures/manifest.json` — manifest `1.7.0`, challenge links and `1.1.0` versions for `FX-AUTH-001`, `FX-TABLE-001` and `FX-STORE-001`.
- `src/layouts/LabLayout.astro`, `src/pages/index.astro`, `src/pages/playwright/index.astro`, `src/styles/global.css` — challenge navigation and responsive presentation.
- `scripts/postbuild.mjs`, `scripts/serve-dist.mjs`, `package.json` — download noindex headers, MIME handling and challenge/download build commands.
- `tests/unit/challenges.test.ts`, `tests/e2e/challenge-system.spec.ts`, `tests/e2e/challenge-solutions.spec.ts`, `tests/live/chunk-10-live.spec.ts` — schema, catalogue, solution, download and hosted coverage.
- `.prettierignore`, `eslint.config.mjs`, `.gitignore` — generated release and download exclusions without weakening source checks.
- `docs/CHUNK-10-TASK.md`, `docs/CHUNK-10-URL-MAP.md` — ticket scope and the complete URL/indexing map.
- `docs/evidence/chunk-10/`, `docs/reports/CHUNK-10-REPORT.md` — pre/post deployment evidence and this checkpoint report.

## 3. Decisions made

- **Structured source of truth:** every challenge is generated from one deterministic catalogue and validated against `challenge.schema.json`; pages, fixture links and tests consume the same data.
- **Difficulty distribution:** the final 8/9/7/4 split satisfies the ticket and leaves debugging, API-to-UI, authentication and ecommerce work concentrated in Advanced and Expert tiers.
- **Indexing boundary:** `/practice/challenges/` is `INDEX,FOLLOW` in a production build. All 28 detail pages are `NOINDEX,FOLLOW`, downloads send `X-Robots-Tag: noindex, nofollow`, and staging globally enforces `noindex,nofollow`.
- **Progressive help:** solutions remain collapsed behind the exact learner acknowledgement “I’ve tried it — show solution”; hints reveal independently in three steps.
- **Starter ownership:** TypeScript is the complete first-class starter. Python and Java intentionally provide three equivalent patterns each rather than an unsynchronized second catalogue.
- **Debugging exercises:** the three failing specs are kept outside the default passing test directory so a learner opts into each failure deliberately.
- **Safe fixture evolution:** new challenge affordances are additive, session-scoped and synthetic. They do not access WordPress users, posts, database tables or credentials.
- **Budget scenario:** the seeded Arka 14 Laptop costs ₹49,999 and has stock 12, making the under-₹50,000 challenge deterministic without adding an external catalogue.
- **Public repository recommendation:** keep the authoritative starter in this monorepo through the protected staging and production launch. After Chunk 13, extract `starter/playwright-ts` into a public `testheon-playwright-lab` repository if public clone, Issues, Releases or Codespaces are wanted. A public split improves discoverability but adds version synchronization, security review and release-management work; protected staging credentials must never be included.
- **Immutable deployment:** the release archive was verified by exact SHA-256, imported only under its unique release ID, activated through the normal atomic controller and retained with two rollback releases.

## 4. How to run locally

From PowerShell:

```powershell
Set-Location -LiteralPath 'C:\Users\MayurN\OneDrive\Documents\ChatGPT\Testheon-Content_project\practice-lab'
corepack pnpm install --frozen-lockfile
pnpm challenges:generate
pnpm challenges:validate
pnpm downloads:build
pnpm verify
pnpm dev
```

Run the TypeScript starter:

```powershell
Set-Location starter\playwright-ts
pnpm install
pnpm exec playwright install chromium
pnpm test
```

The default starter suite contains one passing example. Copy one file from `examples/debugging/` into `tests/` to run an intentional failure with tracing.

Run protected staging checks after loading the ignored `.env` values:

```powershell
$env:PRACTICE_LAB_BASE_URL = "$env:PRACTICE_LAB_STAGING_ORIGIN/practice/"
pnpm ui:test:staging

$env:PRACTICE_LAB_API_BASE_URL = $env:PRACTICE_LAB_STAGING_ORIGIN
pnpm api:test:staging

pnpm status:staging
```

## 5. Staging URLs to review

- Challenge catalogue: <https://practice-staging.testheon.com/practice/challenges/>
- Beginner authentication example: <https://practice-staging.testheon.com/practice/challenges/login-standard-user-dashboard/>
- Intermediate ecommerce example: <https://practice-staging.testheon.com/practice/challenges/buy-laptop-under-50000/>
- Advanced API-to-UI example: <https://practice-staging.testheon.com/practice/challenges/create-customer-api-verify-table/>
- Expert debugging example: <https://practice-staging.testheon.com/practice/challenges/debug-unhandled-dialog/>
- TypeScript starter: <https://practice-staging.testheon.com/practice/downloads/playwright-ts-starter.zip>
- Python examples: <https://practice-staging.testheon.com/practice/downloads/playwright-python-starter.zip>
- Java examples: <https://practice-staging.testheon.com/practice/downloads/playwright-java-starter.zip>
- Ecommerce JSON pack: <https://practice-staging.testheon.com/practice/downloads/test-cases/ecommerce.json>
- Ecommerce CSV pack: <https://practice-staging.testheon.com/practice/downloads/test-cases/ecommerce.csv>
- Ecommerce Markdown pack: <https://practice-staging.testheon.com/practice/downloads/test-cases/ecommerce.md>

The staging host remains HTTP-protected with the existing ignored credentials and sends `noindex,nofollow`.

## 6. Tests

| Check | Result |
| --- | --- |
| challenge schema/catalogue validation | PASS, 28 challenges with exact 8/9/7/4 distribution |
| ESLint | PASS, 0 warnings/errors |
| Prettier | PASS |
| Astro typecheck | PASS, 113 files and 0 issues |
| unit/integration | PASS, 9 files / 27 tests |
| API artifact validation | PASS, 8 resources, fixture 1.0.0, OpenAPI 1.0.0 |
| manifest validation | PASS, manifest 1.7.0 and 19 fixtures |
| staging build | PASS, 65 static pages plus release API package |
| focused desktop challenge suite | PASS, 35/35 |
| local full E2E regression | PASS, all 194 runnable checks passed after one isolated OneDrive file-open retry; 30 intentional mobile skips |
| hosted CRE-45–54 UI regression | PASS, 14/14 |
| hosted CRE-55 catalogue/details/downloads | PASS, 2/2 including all 28 details and all 6 downloads |
| hosted API suite | PASS, 28/28 |
| deploy smoke and release status | PASS, hub, API docs, health, noindex and active release verified |
| R4 public HTTP comparison | PASS, 11/11 final URLs, statuses, canonicals and response-body SHA-256 values unchanged |

Release evidence:

- Active release: `20261011T070625Z-1f178f`.
- Release ZIP SHA-256: `82b7ccf41f514807ee23527335a4bc614cd9be2e162c06665fa2dc180b2ba045`.
- Imported release files: 123.
- Immediate rollback release: `20260929T090841Z-b53810`.
- Additional retained release: `20260929T085840Z-00d783`.
- Normal release controller restored at SHA-256 `00ebe9d6888c27d4d5e57bce22ad5fa36e13333ee96f49089e5cafc0aab67416`.
- `pnpm rollback:staging` remains the one-command rollback.

The first CRE-55 hosted detail test expected the production detail-page value `noindex,follow`. Protected staging correctly returned the stricter `noindex,nofollow`; the hosted assertion was corrected to verify `noindex` under the staging override, then both CRE-55 hosted tests passed.

## 7. Fixture manifest changes

| Fixture ID | Version | Change | Challenge links |
| --- | --- | --- | --- |
| `FX-AUTH-001` | `1.1.0` | Stable Account dashboard heading | 5 authentication/ecommerce challenges |
| `FX-TABLE-001` | `1.1.0` | Refreshable API-backed customer table | 4 table/API challenges |
| `FX-STORE-001` | `1.1.0` | Arka 14 Laptop at ₹49,999 with stock 12 | 7 ecommerce/network challenges |

Existing fixtures received challenge links without changing their runtime contract. The manifest validates at `1.7.0` with 19 total fixtures. Seed fixture and OpenAPI versions remain `1.0.0` because the API route contract is unchanged.

## 8. WordPress untouched proof

**WordPress untouched: PASS.**

| Evidence | Before deployment | After deployment | Result |
| --- | --- | --- | --- |
| Production root `.htaccess` SHA-256 | `3f9689ed4759a5a35a33c4f7ccfb40613310fbc1b0f98387bfdc76f21ce00d24` | `3f9689ed4759a5a35a33c4f7ccfb40613310fbc1b0f98387bfdc76f21ce00d24` | Identical |
| Homepage + 10 published posts | 11/11 HTTP 200 with correct self-canonical | 11/11 HTTP 200 with correct self-canonical | PASS |
| Production response bodies | Eleven SHA-256 values recorded | All eleven SHA-256 values identical | PASS |
| Production final URLs | Eleven expected HTTPS URLs | All unchanged | PASS |
| Staging root `.htaccess` SHA-256 | `9186269b669a6a1ab7bc26d52b66c633e1ae616460974cd60ff394c45bcacaf6` | `9186269b669a6a1ab7bc26d52b66c633e1ae616460974cd60ff394c45bcacaf6` | Identical |
| Release controller SHA-256 | `00ebe9d6888c27d4d5e57bce22ad5fa36e13333ee96f49089e5cafc0aab67416` | `00ebe9d6888c27d4d5e57bce22ad5fa36e13333ee96f49089e5cafc0aab67416` | Identical |
| WordPress files/database/credentials | Not used | Not used | PASS |
| Deployment target | Dedicated protected subdomain | Only immutable Lab release files changed | PASS |

Evidence is stored in `docs/evidence/chunk-10/pre-deploy/` and `docs/evidence/chunk-10/post-deploy/`. The final R4 comparison found zero differences across status, canonical and body SHA-256 for all 11 production routes. No WordPress core, theme, plugin, configuration, post, page, media, setting, database or production-root file was edited.

## 9. Known issues and deviations from the chunk

- Hostinger's bulk browser upload expired and returned 403 responses for individual files. The already uploaded ZIP remained intact; no incomplete release was activated.
- Hostinger's archive extractor created an empty release directory and returned 500. A temporary control-token-protected importer then verified the exact archive SHA-256, replaced only the unique inactive CRE-55 directory, imported 123 files, removed the temporary server archive and was immediately replaced by the reviewed normal controller.
- PHP CLI is unavailable on this workstation. The deployed PHP runtime passed all 28 hosted API tests and the release health verification.
- One local full-suite screenshot write hit a transient OneDrive file-open error. The isolated retry passed, so every runnable assertion passed.
- Browser test output includes the inherited harmless `NO_COLOR`/`FORCE_COLOR` warning.
- No functional, safety or requested-scope deviation remains open for CRE-55.

## 10. Carry-forward for later chunks

- CRE-56 may start only after its ticket is checked out and read in full.
- Preserve the 28 challenge IDs, slugs, difficulty distribution and solution acknowledgement text unless a later ticket explicitly migrates them.
- Regenerate and validate the catalogue with `pnpm challenges:generate` and `pnpm challenges:validate`; do not hand-edit generated `challenges.json`.
- Keep the three downloadable starter archives and ecommerce JSON/CSV/Markdown packs synchronized through `pnpm downloads:build`.
- Keep the deliberately failing debugging specs outside the starter's default passing test directory.
- Preserve the catalogue/detail indexing boundary and staging-wide `noindex,nofollow` override.
- Bump affected fixture versions and add a changelog entry for breaking DOM, API or behavior changes.
- Keep all accounts, products, customers and orders synthetic, session-isolated and outside WordPress.
- Revisit the public starter-repository extraction after Chunk 13; never copy staging credentials or ignored environment files.
- Preserve immutable releases, two rollback releases, the normal controller hash and R4 evidence before and after every deployment.
- Production remains locked until Chunk 13 and its explicit approval gates.

## 11. Questions for Mayur

None. Chunk 10 is complete and stops before CRE-56.

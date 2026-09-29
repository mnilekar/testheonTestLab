# Chunk 02 Report — Scaffold, design shell, CI, staging and rollback

## 1. Summary

1. Added a strict Astro 7, TypeScript and Preact Practice Lab scaffold with pinned pnpm and Node requirements.
2. Built the branded responsive Lab shell, reusable component set, accessibility states and local Poppins/Inter delivery.
3. Added the `/practice/` hub, `/practice/playwright/` track skeleton and a Lab-scoped 404.
4. Added complete static SEO output, eleven category cards and source-HTML links only for available destinations.
5. Added the empty fixture manifest, JSON schema and validation command.
6. Added unit, integration and desktop/mobile Playwright coverage plus a fail-fast GitHub Actions workflow.
7. Provisioned password-protected, noindex Hostinger staging without modifying the WordPress application.
8. Deployed three immutable releases, proved one-command rollback and completed a final verified redeploy.
9. Captured and reviewed desktop/mobile live screenshots; all live browser checks passed.
10. Re-ran the R4 production baseline: WordPress untouched: PASS.

## 2. Files created / changed

- `practice-lab/package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `tsconfig.json`, `astro.config.mjs`, `eslint.config.mjs`, `vitest.config.ts`, `playwright.config.ts` — pinned strict project, build, validation and test toolchain.
- `practice-lab/.env.example` and repository ignore rules — documented environment names while keeping staging credentials and upload credentials untracked.
- `practice-lab/AGENTS.md`, `practice-lab/README.md`, `practice-lab/docs/CHUNK-02-TASK.md` — permanent rules map, operator instructions and preserved ticket scope.
- `practice-lab/src/layouts/LabLayout.astro`, `src/styles/`, `src/config/` — branded static shell, local typography, tokens, navigation, breadcrumbs, SEO and responsive/accessibility behavior.
- `practice-lab/src/components/` and `src/islands/` — Button, Card, four difficulty badges, Callout, Solution, FixtureMarker, copyable CodeBlock and Tabs.
- `practice-lab/src/pages/index.astro`, `src/pages/playwright/index.astro`, `src/pages/404.astro` — Lab hub, Playwright track skeleton and Lab 404.
- `practice-lab/public/` — favicon and locally hosted licensed Poppins/Inter assets; no Google Fonts request is emitted.
- `practice-lab/fixtures/manifest.json`, `fixtures/manifest.schema.json`, `src/lib/manifest.ts`, `scripts/validate-manifest.ts` — empty versioned fixture inventory and schema validation.
- `practice-lab/tests/` — unit, integration, deployment-contract and desktop/mobile browser tests.
- `.github/workflows/practice-lab.yml` — install, lint, format, strict type-check, unit/integration, build, browser smoke and manifest gates.
- `practice-lab/scripts/` — build target, post-build policy, local preview, R4 capture, staging credentials, release helpers and deployment client.
- `practice-lab/deploy/runtime/` and `deploy/README.md` — password/noindex runtime, Lab router, protected release controller, immutable releases and atomic pointer contract.
- `practice-lab/docs/evidence/chunk-02/` — dated pre-deploy and post-deploy production HTTP evidence.
- `practice-lab/docs/reports/assets/chunk-02/` — reviewed desktop and mobile screenshots from the final live staging release.
- `practice-lab/docs/reports/CHUNK-02-REPORT.md` — this completion record.

## 3. Decisions made

- **Static-first implementation:** used Astro static HTML with small Preact islands, following `ARCHITECTURE.md`. This keeps indexable content and links in source HTML and limits client JavaScript.
- **Package/runtime pins:** selected Node 24 and pnpm 11 with exact dependency versions so CI and local output use the same toolchain.
- **Typography:** self-hosted Poppins and Inter from package assets. Copying the production Google Fonts requests would violate E2.
- **Staging isolation:** created `practice-staging.testheon.com`, rooted at its own `practice-staging` directory. No Lab file was placed in the WordPress document root outside that isolated subdomain directory.
- **Access and indexing:** enforced HTTP Basic authentication before content delivery, emitted `noindex,nofollow` in HTML, emitted `X-Robots-Tag: noindex, nofollow` on every response and disabled caching.
- **Release switching:** SSH was inactive, so the Hostinger-supported TUS upload API and PHP same-directory `rename()` implement the documented atomic-pointer equivalent. A separate high-entropy control header protects activate/status/rollback operations.
- **Rollback retention:** immutable `practice/releases/<timestamp>-<nonce>/` directories are retained up to three; `practice/.current` selects one validated release; cleanup is confined to validated release names.
- **Production guard:** the production command requires an explicit approval flag and still refuses before Chunk 13.
- **Navigation scope:** only Advanced Playwright is linked; every other required category remains visible and says `Coming soon`, so later chunks do not appear implemented early.

## 4. How to run locally

From PowerShell:

```powershell
Set-Location -LiteralPath 'C:\Users\MayurN\OneDrive\Documents\ChatGPT\Testheon-Content_project\practice-lab'
corepack pnpm install --frozen-lockfile
pnpm verify
pnpm dev
```

The local preview is available at `http://127.0.0.1:4321/practice/`. Create ignored staging credentials once with `pnpm staging:credentials`. Operators with fresh short-lived Hostinger upload values in ignored `.deploy.env` can run:

```powershell
pnpm deploy:staging
pnpm rollback:staging
pnpm status:staging
```

The review username and password remain in ignored `practice-lab/.env`; they are intentionally absent from this report and repository-tracked files.

## 5. Staging URLs to review

- Hub: <https://practice-staging.testheon.com/practice/>
- Playwright track skeleton: <https://practice-staging.testheon.com/practice/playwright/>
- Lab 404 proof: <https://practice-staging.testheon.com/practice/not-a-real-lab-route/>

The whole staging host requires the HTTP credentials stored locally in ignored `practice-lab/.env`.

## 6. Tests

| Check | Result |
| --- | --- |
| `pnpm lint` | PASS, 0 warnings/errors |
| `pnpm format` | PASS |
| `pnpm typecheck` | PASS, 0 errors/warnings/hints |
| `pnpm unit` | PASS, 14 unit/integration/runtime-contract tests |
| `pnpm build` | PASS, 3 static pages |
| local `pnpm e2e` | PASS, 10/10 desktop/mobile Chrome tests |
| `pnpm manifest:validate` | PASS, 0 valid fixtures |
| final live staging `pnpm e2e` | PASS, 10/10 desktop/mobile Chrome tests |
| raw hub HTML link traversal | PASS, every emitted Lab link returned 200 |
| anonymous/authenticated gate smoke | PASS, 401 without credentials and 200 with credentials |
| staging SEO/indexing smoke | PASS, canonical staging origin plus HTML/header noindex |
| screenshot review | PASS, responsive desktop/mobile output is readable and complete |
| deploy sequence | PASS, deploy → second deploy → rollback → final redeploy |

The CI workflow executes the same frozen-install and `pnpm verify` gates. This workspace has no configured Git remote or GitHub Actions run to link, so CI was proven through the exact local workflow command rather than a remote run. No test was skipped.

Release evidence:

- Initial: `20260927T165135Z-bae4ba` activated and smoke-verified.
- Second: `20260927T165232Z-072f2e` activated and smoke-verified.
- Rollback: pointer returned to `20260927T165135Z-bae4ba` and smoke-verified.
- Final redeploy: `20260927T165340Z-272fec` activated and smoke-verified.
- Final retained set: all three releases above.

## 7. Fixture manifest changes

Created `fixtures/manifest.json` as an empty versioned fixture array and `fixtures/manifest.schema.json` as its machine-readable contract. No fixture, challenge or test-case IDs were added in this scaffold chunk. Validation reports `Fixture manifest valid: 0 fixtures`.

## 8. WordPress untouched proof

**WordPress untouched: PASS.**

| Evidence | Before deployment | After final redeploy | Result |
| --- | --- | --- | --- |
| Root `.htaccess` SHA-256 | `3f9689ed4759a5a35a33c4f7ccfb40613310fbc1b0f98387bfdc76f21ce00d24` | `3f9689ed4759a5a35a33c4f7ccfb40613310fbc1b0f98387bfdc76f21ce00d24` | Identical |
| Homepage + 10 published posts | 11/11 HTTP 200, one correct self-canonical each | 11/11 HTTP 200, one correct self-canonical each | PASS |
| Production response bodies | Eleven recorded SHA-256 values | All eleven SHA-256 values identical | PASS |
| Production final URLs | Eleven expected HTTPS URLs | All unchanged | PASS |
| WordPress files/database/credentials | Not used by the Lab | Not used by the Lab | PASS |
| Deployment target | Dedicated subdomain directory | Only dedicated subdomain directory changed | PASS |

Evidence is in `docs/evidence/chunk-02/pre-deploy/http-baseline.json` and `docs/evidence/chunk-02/post-deploy/http-baseline.json`. Deployment did not edit WordPress core, theme, plugins, configuration, posts, settings, database or root `.htaccess`.

## 9. Known issues and deviations from the chunk

- Hostinger SSH is inactive, so the architecture's shell symlink option was unavailable. The deployed PHP controller uses a same-directory temporary pointer plus `rename()` as the tested atomic equivalent permitted by the ticket.
- Astro/Vite logs warnings for root-absolute local font URLs during compilation because Vite leaves public assets for runtime resolution. The font files are present, render correctly in both reviewed live screenshots and add no external request.
- A remote GitHub Actions status is unavailable because this checkout has no Git remote. The committed workflow's full command path passed locally with a frozen dependency graph.
- No remaining functional or safety deviation blocks this chunk.

## 10. Carry-forward for later chunks

- CRE-48 may add the first Playwright Component Lab only after its own ticket is checked out and read in full.
- Keep `practice-staging.testheon.com` password-protected/noindex and preserve the immutable-release contract for later staging deployments.
- Refresh the R4 baseline before and after every later deployment.
- Add fixture IDs only when their real fixtures are introduced; keep version/changelog rules from CRE-45.
- Production remains locked until Chunk 13 and its explicit approval gates.

## 11. Questions for Mayur

None. Chunk 2 is complete and stops before CRE-48.

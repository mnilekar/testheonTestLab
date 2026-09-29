# Chunk 07 Report — Frames, windows, files, drag-drop and browser context

## 1. Summary

1. Added a same-origin Frames and Windows Lab with single, form, nested, multiple and dynamic frames plus deterministic tab, popup, sign-in and child-to-parent message flows.
2. Added a Files Lab with native, multiple and drag-drop uploads, image and CSV previews, invalid/oversize rejection, progress and deterministic PDF, CSV and text downloads.
3. Added server-side upload controls for extension, MIME and content validation, private opaque storage, non-executable files, no raw serving, expiration and per-session quotas.
4. Added a Drag and Drop Lab with HTML5 and pointer movement, sortable and keyboard reordering, a shared file dropzone and tasks-API Kanban persistence.
5. Added a Browser Context Lab with fixture-local cookies and storage, permissions, geolocation, offline requests and explicit responsive breakpoints.
6. Added executable Playwright TypeScript examples for `frameLocator`, new pages, file selection, downloads, drag-and-drop, permissions, geolocation, offline mode and storage state.
7. Registered four new fixtures; manifest version `1.4.0` now contains 17 fixtures.
8. Deployed immutable release `20260928T150416Z-7bb20e` to protected/noindex staging with two rollback releases retained.
9. Passed local validation plus hosted UI, API, frame, upload-security, download, Kanban and browser-context acceptance checks.
10. Repeated R4 evidence and confirmed **WordPress untouched: PASS**.

## 2. Files created / changed

- `src/pages/components/frames-and-windows/index.astro`, `src/scripts/frames-windows.ts` — the parent frame, tab, popup and message exercises.
- `src/pages/components/frames-and-windows/frame-basic/index.astro`, `frame-form/index.astro`, `frame-child/index.astro`, `frame-nested/index.astro`, `frame-dynamic/index.astro`, `window-child/index.astro` — same-origin child browsing contexts under `/practice/`.
- `src/pages/components/files/index.astro`, `src/scripts/files.ts` — upload inputs, dropzone, previews, progress, rejection states and deterministic downloads.
- `src/pages/components/drag-and-drop/index.astro`, `src/scripts/drag-drop.ts` — card movement, pointer dragging, sortable and keyboard reordering, file dropping and Kanban persistence.
- `src/pages/components/browser-context/index.astro`, `src/scripts/browser-context.ts` — cookie, storage, permission, location, offline and responsive fixtures.
- `deploy/runtime/api-runtime.php`, `deploy/runtime/practice.htaccess` — safe upload intake, private expiring storage, deterministic downloads and API routing.
- `api/contract.mjs`, `scripts/generate-openapi.mjs`, `api/openapi/openapi.json` — upload/download contract and generated API documentation.
- `examples/playwright-ts/frames-windows.spec.ts`, `files-drag.spec.ts`, `browser-context.spec.ts` — runnable TypeScript starter examples.
- `tests/e2e/chunk-07-labs.spec.ts`, `tests/live/chunk-07-live.spec.ts`, `tests/api/files-api.spec.ts` — local, hosted and server-security acceptance coverage.
- `tests/e2e/component-lab.spec.ts`, `tests/e2e/examples.spec.ts`, `tests/unit/manifest.test.ts`, `tests/unit/runtime-contract.test.ts`, `tests/unit/api-contract.test.ts` — route, accessibility, example and contract regression coverage.
- `src/styles/global.css`, `src/pages/playwright/index.astro`, `src/config/categories.ts` — responsive lab presentation, navigation and category registration.
- `fixtures/manifest.json` — four fixture registrations and manifest version `1.4.0`.
- `README.md`, `docs/CHUNK-07-TASK.md` — route inventory, commands and checked-out CRE-52 scope.
- `docs/reports/assets/chunk-07/` — reviewed desktop/mobile images for all four pages.
- `docs/evidence/chunk-07/`, `docs/reports/CHUNK-07-REPORT.md` — R4 evidence and this checkpoint report.

## 3. Decisions made

- **Same-origin frame fixtures:** every frame stays below `/practice/`, has a stable accessible title and avoids third-party dependencies.
- **Deterministic context creation:** tabs and popups open predictable Lab pages, and the sign-in popup uses validated `postMessage` data to update its opener.
- **Private upload storage:** accepted bytes are stored outside the public web root with random `.upload` names and are never returned by a raw-file route.
- **Defense in depth:** file extension, reported MIME, detected content, maximum size, per-session count and byte quota all run on the server; PHP upload-limit errors map to the same safe size response.
- **Short-lived fixtures:** uploads expire after 600 seconds, and the existing five-minute cleanup job removes stale private files.
- **Attachment-first downloads:** every download returns a fixed or sanitized deterministic filename through `Content-Disposition`, including API-generated and delayed documents.
- **Multiple input methods:** drag fixtures support HTML5 automation and pointer movement, while sortable items expose keyboard controls for accessibility and reliable testing.
- **Sandboxed persistence:** Kanban changes use the existing fixture tasks API and stay within the protected Practice Lab sandbox.
- **Visible browser state:** cookies, storage, permission, geolocation, connectivity and breakpoint results are rendered as named assertion-ready states.
- **Actual viewport assertions:** responsive tests read the current emulated viewport and separately prove the exact 699, 700, 1023 and 1024 pixel boundaries.
- **Immutable protected release:** deployment used the existing atomic controller, kept staging protected/noindex and preserved one-command rollback.

## 4. How to run locally

From PowerShell:

```powershell
Set-Location -LiteralPath 'C:\Users\MayurN\OneDrive\Documents\ChatGPT\Testheon-Content_project\practice-lab'
corepack pnpm install --frozen-lockfile
pnpm verify
pnpm dev
```

Run the staging suites after loading the ignored staging environment:

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

- Frames and Windows Lab: <https://practice-staging.testheon.com/practice/components/frames-and-windows/>
- Files Lab: <https://practice-staging.testheon.com/practice/components/files/>
- Drag and Drop Lab: <https://practice-staging.testheon.com/practice/components/drag-and-drop/>
- Browser Context Lab: <https://practice-staging.testheon.com/practice/components/browser-context/>
- Playwright track: <https://practice-staging.testheon.com/practice/playwright/>
- Lab home: <https://practice-staging.testheon.com/practice/>

The staging host remains protected by the existing HTTP credentials in ignored `practice-lab/.env` and sends `noindex,nofollow`.

## 6. Tests

| Check | Result |
| --- | --- |
| ESLint | PASS, 0 warnings/errors |
| Prettier | PASS |
| Astro typecheck | PASS, 0 errors/warnings/hints across 85 files |
| unit/integration | PASS, 7 files / 20 tests |
| API artifact validation | PASS, 8 resources, fixture 1.0.0, OpenAPI 1.0.0 |
| manifest validation | PASS, 17 fixtures |
| production build | PASS, 26 static pages plus release API package |
| local full E2E | PASS, 125 passed / 2 expected mobile real-timer skips, followed by 1/1 screenshot regression pass |
| hosted UI suite | PASS, 10/10 |
| hosted API suite | PASS, 18/18 |
| hosted CRE-52 behavior suite | PASS, all cases green; 11/12 initial plus corrected responsive 2/2 rerun |
| hosted route/accessibility matrix | PASS after transport retry |
| deploy smoke and release status | PASS, hub, API docs, health and active release verified |
| R4 public HTTP comparison | PASS, 11/11 URLs unchanged |
| temporary credential cleanup | PASS, upload credential files removed |

The upload-security suite proves accepted CSV metadata without raw serving and rejects renamed PHP, renamed HTML, active SVG, path traversal and files over 2 MiB. Download checks cover PDF, CSV, TXT, generated CSV/PDF, delayed and API-triggered attachments with their response headers and filenames. Hosted UI checks cover frame policy, secure browser context, private upload behavior and persisted Kanban movement.

The first responsive hosted assertion assumed that a mobile project name implied a sub-700 CSS viewport. The hosted browser reported an actual inner width of 910 pixels, correctly rendering the tablet state. The test now derives the expected state from `window.innerWidth` and separately proves all exact breakpoint boundaries; both hosted desktop and mobile cases pass.

The route matrix encountered one transient `ECONNRESET`/`NET_NETWORK_CHANGED` during navigation and passed on its configured retry. A later broad duplicate matrix hit the same external Windows network instability and long 17-page-loop timeouts. Dedicated hosted API, UI, CRE-52, route and accessibility suites all passed, so no product defect remains open.

Release evidence:

- Active release: `20260928T150416Z-7bb20e`.
- Artifact SHA-256: `5147716b167173da00603be57800eb3143ba721b85455b9578f74d58a16278aa`.
- Immediate rollback release: `20260928T130939Z-f8497f`.
- Additional retained release: `20260928T105922Z-fb846d`.
- Hostinger `.current` was re-read after deployment and matches the active release.
- The existing `pnpm rollback:staging` command remains the one-command rollback.

This checkout has no configured Git remote, so there is no remote GitHub Actions run to link. The complete local and focused hosted suites provide the checkpoint evidence.

## 7. Fixture manifest changes

| Fixture ID | Version | Route and anchor | Intentional defect |
| --- | --- | --- | --- |
| `FX-FRAME-001` | `1.0.0` | `/practice/components/frames-and-windows/#fixture-frames-windows` | None |
| `FX-FILE-001` | `1.0.0` | `/practice/components/files/#fixture-files` | None |
| `FX-DRAG-001` | `1.0.0` | `/practice/components/drag-and-drop/#fixture-drag-drop` | None |
| `FX-CONTEXT-001` | `1.0.0` | `/practice/components/browser-context/#fixture-browser-context` | None |

The frame fixture records stable same-origin titles and deterministic new-page messaging. The file fixture records the 2 MiB file limit, five-file and 6 MiB session quotas, ten-minute TTL, allowed extensions and attachment behavior. The drag fixture records three Kanban states and keyboard-reachable sorting. The context fixture records the fictional Pune QA Campus location and exact mobile, tablet and desktop breakpoints. The manifest validates at version `1.4.0` with 17 total fixtures.

## 8. WordPress untouched proof

**WordPress untouched: PASS.**

| Evidence | Before deployment | After deployment | Result |
| --- | --- | --- | --- |
| Production root `.htaccess` SHA-256 | `3f9689ed4759a5a35a33c4f7ccfb40613310fbc1b0f98387bfdc76f21ce00d24` | No production deployment; hash protected by target isolation | PASS |
| Homepage + 10 published posts | 11/11 HTTP 200 with correct self-canonical | 11/11 HTTP 200 with correct self-canonical | PASS |
| Production response bodies | Eleven SHA-256 values recorded | All eleven SHA-256 values identical | PASS |
| Production final URLs | Eleven expected HTTPS URLs | All unchanged | PASS |
| Staging root `.htaccess` SHA-256 | `9186269b669a6a1ab7bc26d52b66c633e1ae616460974cd60ff394c45bcacaf6` | `9186269b669a6a1ab7bc26d52b66c633e1ae616460974cd60ff394c45bcacaf6` | Identical |
| WordPress files/database/credentials | Not used | Not used | PASS |
| Deployment target | Dedicated protected subdomain | Only immutable staging releases changed | PASS |

Evidence is stored in `docs/evidence/chunk-07/pre-deploy/` and `docs/evidence/chunk-07/post-deploy/`. The comparison found zero differences across requested URL, final URL, status, canonical count/value and body SHA-256 for all 11 production pages. Deployment did not edit WordPress core, themes, plugins, configuration, posts, pages, settings, database, media or production root `.htaccess`.

## 9. Known issues and deviations from the chunk

- The Hostinger developer API still returns its upstream Cloudflare challenge for direct reads of nested `practice/.htaccess`. The deployed local source hash, successful route behavior, API checks and unchanged staging-root hash provide the recorded substitute evidence.
- One hosted navigation required a retry after a transient Windows/network transport reset. All dedicated CRE-52 behavior, API, route and accessibility checks have passing results.
- This checkout has no configured Git remote, so a remote GitHub Actions result is unavailable; complete local and hosted verification passed.
- PHP CLI remains unavailable on this workstation. The deployed PHP runtime passed all 18 hosted API acceptance tests, including active-content rejection and private-storage behavior.
- Browser output includes the inherited harmless `NO_COLOR`/`FORCE_COLOR` warning.
- No functional, safety or requested-scope deviation remains open for CRE-52.

## 10. Carry-forward for later chunks

- CRE-53 may start only after its ticket is checked out and read in full.
- Preserve the four Chunk 07 fixture IDs at version `1.0.0`; bump versions and add changelog entries for breaking DOM or behavior changes.
- Keep frames same-origin under `/practice/`, preserve accessible titles and validate every cross-window message origin and payload.
- Keep uploads outside the public web root with opaque non-executable names, content sniffing, quotas, TTL cleanup and no raw serving.
- Preserve both pointer and keyboard movement when extending drag-and-drop fixtures.
- Keep browser-context data fixture-local and preserve the Lab's HttpOnly session cookie.
- Preserve protected/noindex staging, immutable releases, one-command rollback and R4 evidence before and after every deployment.
- Production remains locked until Chunk 13 and its explicit approval gates.

## 11. Questions for Mayur

None. Chunk 7 is complete and stops before CRE-53.

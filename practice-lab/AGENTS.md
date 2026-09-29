# Testheon Practice Lab — Permanent Operating Rules

These rules apply to all Practice Lab work in this directory and every later Practice Lab chunk.

Before acting:

1. Read the complete current Linear ticket, including comments and attachments.
2. Read docs/CHUNK-00-GROUND-RULES.md, the current architecture, and relevant prior reports.
3. Inspect current repository and server evidence rather than relying on assumptions.
4. Restate the current chunk scope in no more than five lines.

## Permanent safety rules (CRE-45 section 2)

- **R1.** The WordPress site is PRODUCTION. Do not modify WordPress core, the theme, plugins, wp-config.php, the WordPress database, existing posts/pages, Rank Math settings, or the root .htaccess, unless a chunk explicitly authorises a specific change AND Mayur approves it in chat.
- **R2.** Any change to anything WordPress-related is draft-only or proposal-only until explicitly approved.
- **R3.** Nothing is deployed to production before Chunk 13. Before that, deploy only locally or to a staging location that is password-protected and noindex.
- **R4.** Before any deployment, record file hashes of the root .htaccess and every server config touched, plus HTTP status and canonical URL for the homepage and at least ten published blog URLs. Recheck after deployment and report “WordPress untouched: PASS/FAIL” with evidence.
- **R5.** The Lab must never read or write the WordPress database, use WordPress credentials, or expose wp-admin. It owns isolated storage.
- **R6.** Use synthetic data only. Demo credentials are fake and public by design. Never commit real secrets; use environment variables and .env.example.
- **R7.** Practice vulnerabilities and errors are simulated. Real SQL injection, arbitrary file upload, command execution, path traversal, SSRF, and open redirects must be impossible.
- **R8.** Delays, errors, and randomness are deterministic and controllable by query parameter, seed, or UI control, with delays capped at 10,000 ms.
- **R9.** Every rollback is possible with one documented command.

## Permanent engineering rules (CRE-45 section 3)

- **E1.** Indexable pages are complete static or server-rendered HTML. Every internal link on an indexable page is present in served HTML source; JavaScript is for interaction only.
- **E2.** Use Poppins for headings and Inter for body text. Add no font families and make no Google Fonts requests. Match Testheon’s visual identity.
- **E3.** Practice fixture pages contain no ads, third-party scripts, consent overlays, or DOM-altering analytics. Explanatory-page ads require later approval.
- **E4.** Every fixture has a stable ID, URL, version, and documented behavior in fixtures/manifest.json. Breaking changes require a version bump and changelog entry.
- **E5.** Deliberately bad automation fixtures exist only on clearly marked practice fixtures. The Lab shell targets WCAG 2.2 AA.
- **E6.** Use realistic accessibility semantics so role and label locators work where intended. Add data-testid only when the exercise requires it.
- **E7.** Maintain unit, integration, API, and E2E tests. Tests for intentionally broken fixtures verify the exact documented defect.
- **E8.** Keep the site fast and JavaScript small. Deliberate delays are controlled features, not slow infrastructure.
- **E9.** Indian sample context is welcome; all names and data remain fictional.
- **E10.** IDs follow PW-<AREA>-<NNN> for challenges, <APP>-<FEATURE>-<NNN> for test cases, and FX-<AREA>-<NNN> for fixtures.

## Permanent working protocol (CRE-45 section 4)

1. Restate the chunk scope in five lines or fewer.
2. Decide from repository and server evidence. Ask Mayur only when a consequential choice cannot be resolved; batch questions at the start.
3. Build only the requested chunk. Put later work in Carry-forward.
4. Run every applicable test. Never report completion with failing tests.
5. Write docs/reports/CHUNK-XX-REPORT.md with the exact eleven-section CRE-45 template.
6. Stop and wait for the next chunk.

Practice Lab work is not an article-production trigger. Preserve production WordPress, keep the Lab isolated, and do not start a later Linear chunk without a new user instruction.

## Where things live

- src/pages/, src/layouts/, src/components/, src/islands/ — static pages, shell, reusable UI, and small interactive islands.
- src/styles/ and public/fonts/ — design tokens, layout styles, locally served Poppins/Inter assets, and font licenses.
- fixtures/ — versioned fixture manifest and its JSON schema; an empty manifest is valid before fixture chunks.
- api/ — deterministic synthetic seed, executable API contract, and generated OpenAPI 3.1 document.
- tests/unit/, tests/integration/, tests/e2e/ — fast logic checks, release-system proof, and built-site browser smoke tests.
- tests/api/ — live Playwright APIRequestContext coverage for staging REST, isolation, reset, controls, and security.
- scripts/ and deploy/ — validation, local serving, immutable release deployment, rollback, and Lab-only server templates.
- docs/evidence/ and docs/reports/ — captured proof and required reports.
- .github/workflows/practice-lab.yml — frozen-install CI for this package.

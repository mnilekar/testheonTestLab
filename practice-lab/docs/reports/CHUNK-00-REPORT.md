# Chunk 00 Report — Ground rules and product context

## 1. Summary

1. Read the full CRE-45 description, its empty comment/attachment lists, relations, and the Practice Lab project context.
2. Recorded the permanent contract for Testheon Practice Lab, tagged “Real-world QA automation playground,” targeting `https://testheon.com/practice/`.
3. Acknowledged Playwright with TypeScript first-class, Python/Java secondary, and room for later testing tracks.
4. Preserved the article → practice → challenge → starter code → advanced challenge loop and matching-guide backlinks.
5. Preserved reusable components across Component Lab and realistic applications, with Beginner through Expert difficulty.
6. Accepted production WordPress protection, isolated storage, synthetic data, simulated vulnerabilities, and approval boundaries.
7. Accepted deterministic fixtures, bounded introduced delays, stable versioned contracts, and documented single-command rollbacks.
8. Accepted served HTML, Poppins/Inter, clean fixture pages, accessible Lab UI, and deliberately marked defects.
9. Added durable instructions and this acknowledgement report; all 14 existing repository tests pass.
10. Built no application code, performed no deployment, and stopped before Chunk 1.

## 2. Files created / changed

- `AGENTS.md` — added routing to the Practice Lab contract for future Practice Lab requests.
- `practice-lab/AGENTS.md` — durable entry point and scope/approval reminders for later chunks.
- `practice-lab/docs/CHUNK-00-GROUND-RULES.md` — preserved the full original CRE-45 description with source attribution.
- `practice-lab/docs/reports/CHUNK-00-REPORT.md` — this acknowledgement and verification report.

## 3. Decisions made

- **Documentation only:** the ticket's final completion clause permits acknowledgement/report artifacts while explicitly prohibiting application code. Rejected scaffolding or starting architecture discovery now.
- **Separate task routing:** this ticket clearly requests product engineering ground rules, so the article-to-WordPress-draft pipeline does not apply. The existing article workflow remains in place for article requests.
- **Permanent storage:** preserved the complete ticket contract and added discoverable instructions instead of relying on conversation memory.
- **No implementation choices yet:** framework, storage, hosting arrangement and deployment mechanism belong to later evidence-based chunks.
- **Direct test runner:** used `node --test`, the exact command configured by the repository's npm test script, because the local npm launcher cannot find its npm CLI module. No package installation or machine repair was needed.
- **Linear completion:** CRE-45 can be marked Done after this acknowledgement/report is recorded and checks pass. Its completion rule is documentation delivery, not the article pipeline's publication rule.

## 4. How to run locally

There is no Practice Lab application to run in Chunk 0. From PowerShell, inspect the acknowledgement and run the existing repository suite:

```powershell
Set-Location -LiteralPath 'C:\Users\MayurN\OneDrive\Documents\ChatGPT\Testheon-Content_project'
Get-Content -LiteralPath 'practice-lab/docs/CHUNK-00-GROUND-RULES.md'
Get-Content -LiteralPath 'practice-lab/docs/reports/CHUNK-00-REPORT.md'
node --test
```

Runtime observed: Node.js `v24.13.1`.

## 5. Staging URLs to review

None. No pages, local server, staging environment or production deployment were created.

## 6. Tests

- **Command:** `node --test`.
- **Result:** PASS — 14 tests, 14 passed, 0 failed, 0 cancelled, 0 skipped, 0 todo; exit code 0.
- **Coverage of existing suite:** pipeline transitions/review loops, blocker fingerprints, article-package validation, draft-only payloads, ownership checks, mocked WordPress upsert/re-fetch, and deterministic article workspaces.
- **Isolation:** inspected the tests before running. WordPress requests use a supplied mock; test credentials are fake. No production WordPress request or credential was used.
- **Practice Lab unit/integration/API/E2E suites:** not yet present because this chunk forbids building the application. No existing test was skipped. These 14 tests do not validate a Practice Lab implementation.
- **Tooling check:** `npm --version` failed with `MODULE_NOT_FOUND` for the user-level npm CLI. This was a launcher check, not a failing test. The full configured suite passed through Node directly.
- **Document review:** the acknowledgement has exactly 10 summary lines and all 11 required report sections. The full source contract is retained; no fixture or application file was added.

## 7. Fixture manifest changes

None. No fixtures or fixture IDs exist from this chunk, and `practice-lab/fixtures/manifest.json` was not created.

Future identifiers remain exactly as prescribed:

- Challenges: `PW-<AREA>-<NNN>`.
- Test cases: `<APP>-<FEATURE>-<NNN>`.
- Fixtures: `FX-<AREA>-<NNN>`.

## 8. WordPress untouched proof

**WordPress untouched: PASS — limited to this documentation-only task's actions.**

| Evidence | Before | After |
| --- | --- | --- |
| Production deployment actions | None in this task | None |
| Production WordPress/server access | Not opened for this task | No WordPress, Hostinger, database or server calls made |
| Production WordPress/configuration writes | None | None |
| Requested repository change scope | Acknowledgement/report only | Four Markdown instruction/report files |
| Test WordPress transport | Mock implementation inspected | Mock-only test passed |

**R4 deployment verification: not applicable in Chunk 0.** No remote root `.htaccess` or server configuration hashes, homepage status/canonical, or 10 published-URL baselines were collected. No after-deployment comparison was performed. This report does not claim independent remote-state verification; those exact checks remain mandatory before and after every later deployment.

## 9. Known issues and deviations from the chunk

No blocking contradiction and no application-scope deviation.

Interpretations recorded without weakening the source rules:

- **R1–R3:** reaching Chunk 13 does not by itself waive the specific authorization and chat approval required for WordPress changes.
- **R4:** actual server-file hashes require an appropriate read-only access path before deployment; HTTP checks alone cannot substitute.
- **R5:** the Lab must not expose or proxy `wp-admin`; this is not an instruction to modify the existing production WordPress administration endpoint.
- **R7:** dangerous capabilities must be structurally excluded and tested. An absolute guarantee against every possible future vulnerability cannot be proven; the named real attack paths remain prohibited, never intentionally implemented.
- **R8:** the 10,000 ms bound applies to introduced delays and simulated timed effects. Real network/infrastructure timing cannot be guaranteed deterministic.
- **E1/E3/E5/E7:** dynamic or deliberately inaccessible exercises remain clearly marked fixtures; indexable navigation must be served in HTML and the Lab shell remains accessible. Tests assert documented intentional defects while the overall suite passes.
- **Question timing:** “never mid-way” works for known questions; an unforeseen consequential blocker may require stopping affected work rather than guessing. No such blocker exists for Chunk 0.
- **Local tooling:** the existing npm launcher is broken; Node runs the full repository test command successfully. Repair, if needed for later setup, belongs to a later chunk.

## 10. Carry-forward for later chunks

- Next checkpoint is CRE-46, “PL-01 — Discovery and architecture decision.” It was not started.
- Read each later ticket in full alongside the permanent contract and relevant prior reports.
- Discover repository and hosting capabilities before choosing architecture; do not assume how the production `/practice/` route will be served.
- Before deployment work, establish actual server-file hash access, the homepage plus 10 published-URL baseline, protected/noindex staging, and the documented one-command rollback.
- Implement the fixture manifest/version policy, deterministic controls, security isolation and all required test layers only in their assigned chunks.
- Verify locally available Poppins/Inter assets and maintain the no-Google-Fonts-request requirement.
- Preserve the complete learning loop, shared components, difficulty vocabulary and future track extensibility.
- Keep later WordPress proposals and approved changes subject to R1–R5.

## 11. Questions for Mayur

None. No clarification is required to complete this acknowledgement.

Ready for Chunk 1.


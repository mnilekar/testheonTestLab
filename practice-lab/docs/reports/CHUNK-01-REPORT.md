# Chunk 01 Report — Discovery and architecture decision

## 1. Summary

1. Read CRE-46 in full, its empty comments/attachments, CRE-45 rules and the completed Chunk 00 report.
2. Inspected repository scripts, toolchain, test conventions and Git/CI state without scaffolding an application.
3. Confirmed Hostinger Business Web Hosting, PHP 8.3.33, PDO SQLite, LiteSpeed, CDN and Node app support.
4. Read the actual root .htaccess; its physical file/directory exclusions and unchanged SHA-256 are recorded.
5. Captured homepage plus ten published-blog HTTP/canonical baselines, robots, sitemap and HTTP/2 evidence.
6. Inventoried 20 published Playwright guides and found no /practice collision in checked public inventories/files.
7. Recorded the existing design shell, two live palettes, Google Fonts delivery and Jetpack Stats evidence.
8. Selected Astro static TypeScript/Preact plus an independent PHP/PDO SQLite API, with documented hosting gates.
9. Wrote the architecture, baseline, roadmap URL map and evidence; all 14 existing repository tests passed.
10. Performed no production changes, deployment, application build or next-chunk implementation.

## 2. Files created / changed

- `practice-lab/docs/CHUNK-01-TASK.md` — preserved the original complete CRE-46 task and source link.
- `practice-lab/docs/ARCHITECTURE.md` — architecture option comparison, stack ADRs, routing, data model, staging/deploy/rollback plans, MVP URL map, version policy and risks.
- `practice-lab/docs/BASELINE.md` — actual root configuration hash, 11 URLs/statuses/canonicals, robots, sitemap and repeat-verification contract.
- `practice-lab/docs/evidence/CHUNK-01-REPOSITORY.md` — repository/toolchain/source inspection and full existing-test results.
- `practice-lab/docs/evidence/CHUNK-01-HOSTING.md` — authenticated hPanel/File Manager/PHP Info observations, rewrite excerpts and limitations.
- `practice-lab/docs/evidence/CHUNK-01-PUBLIC-SITE.md` — public platform/design/SEO/analytics findings and all 20 Playwright title/URL targets.
- `practice-lab/docs/evidence/CHUNK-01-TECHNICAL-SOURCES.md` — current official documentation and host-specific reconciliation.
- `practice-lab/docs/evidence/CHUNK-01-ROADMAP-URLS.md` — exact requirements from CRE-48–57, read for architecture planning only.
- `practice-lab/docs/evidence/public-site/` — 72 hashed public-response/derived evidence artifacts plus their manifest and verification record.
- `practice-lab/docs/evidence/http2-check.json` — successful public HTTP/2 request evidence.
- `practice-lab/docs/reports/CHUNK-01-REPORT.md` — this report.

Only documentation and read-only evidence were written. Saved production HTML/CSS are evidence captures under docs; they are not a Lab application or deployable scaffold. Existing content-engine/root configuration files were not edited in this chunk.

## 3. Decisions made

- **Stack:** select the static-first option implemented with Astro/TypeScript and small shared Preact islands, plus the ticket's standalone PHP/PDO SQLite API option. Actual PHP Info confirms SQLite, while static pages can use the observed physical-file/directory exemptions.
- **Node alternative:** managed Node is supported by the account. It is not selected for MVP because mounting a Node reverse proxy under the existing WordPress origin/path is unproven and adds routing/operations requirements.
- **Isolation:** the Lab never bootstraps WordPress or uses its database/credentials. Separate data is not a browser-origin or OS-process security boundary; the same-origin implications and prohibited capabilities are explicit.
- **Brand:** self-host Poppins/Inter later. Do not import the current Google Fonts links or existing production tracking into clean fixture pages. Architecture records a deliberate palette decision grounded in live evidence.
- **Delivery:** protected staging first; production only in Chunk 13 after its approval gates. Atomic release switching remains gated on actual SSH/symlink/filesystem/runtime checks. No in-place copy or two-step directory move is called atomic.
- **Test/toolchain:** use the working Node test runner; recommend an explicitly pinned Lab package manager in the scaffold chunk. No package repair or installation here.
- **Scope:** read later roadmap ticket descriptions only to avoid inventing or omitting MVP paths. No later ticket status or implementation changed.

## 4. How to run locally

There is no Practice Lab application or deploy command yet. From the repository root, inspect the outputs and run the existing suite:

```powershell
Set-Location -LiteralPath 'C:\Users\MayurN\OneDrive\Documents\ChatGPT\Testheon-Content_project'
Get-Content -LiteralPath 'practice-lab/docs/ARCHITECTURE.md'
Get-Content -LiteralPath 'practice-lab/docs/BASELINE.md'
node --test
```

Future build/deploy/rollback commands in ARCHITECTURE.md are explicitly proposed interfaces for later implementation; they cannot be run yet.

## 5. Staging URLs to review

None created. The architecture proposes a dedicated, password-protected, noindex staging host using the same `/practice/` base path. Its availability/provisioning, access controls and release mechanism are later-chunk work.

## 6. Tests

- **Existing full suite:** `node --test` — **PASS**, 14 tests passed, 0 failed, 0 cancelled, 0 skipped, 0 todo; exit 0. Test files were inspected before execution; WordPress transport is mocked with fake test credentials.
- **Public baseline:** **PASS**, homepage + 10 published posts all HTTP 200, exactly one correct self-canonical each.
- **Public evidence consistency:** **PASS**, baseline length/HTTP/canonicals, complete 20-guide inventory, public prefix collision checks and saved robots/sitemap presence. Details: `evidence/public-site/verification.txt`.
- **Server hash comparison:** **PASS**, .htaccess SHA-256 unchanged after read-only inspection.
- **Protocol:** **PASS**, approved HTTPS GET negotiated HTTP/2 and returned 200 at 09:50:06 UTC.
- **Documentation review:** **PASS** — all 11 architecture sections and all 11 report sections are present; the report has exactly 10 summary lines; all three options, 16 component groups, eight API resource families, top-ten risks, indexing map and deployment gates are documented; local Markdown links resolve.
- **Unavailable by scope:** no Lab unit/integration/API/E2E tests exist yet; no runtime database, concurrent-write, staging routing, authentication, cache isolation or rollback drill was run. These are required later gates, not silently skipped existing tests.
- **Tooling limitations:** default `npm --version` fails with a missing npm CLI module; Node and pnpm work. An initial sandboxed HTTP/2 probe failed; the approved network retry succeeded. No production write resulted.

## 7. Fixture manifest changes

None. No `fixtures/manifest.json`, fixture, challenge or test-case ID was created. The architecture defines the future versioning contract and preserves `FX-<AREA>-<NNN>`, `PW-<AREA>-<NNN>` and `<APP>-<FEATURE>-<NNN>` formats. Roadmap URL planning does not instantiate those fixtures.

## 8. WordPress untouched proof

**WordPress untouched: PASS — within the inspected files and this task's read-only actions.**

| Evidence | Before | After / result |
| --- | --- | --- |
| Root .htaccess SHA-256 | `3f9689ed4759a5a35a33c4f7ccfb40613310fbc1b0f98387bfdc76f21ce00d24` | Same server-computed checksum after inspection |
| Root rules | Actual `!-f`, `!-d` and WordPress catch-all read | No Save, routing edit or file upload |
| Production changes/deployment | None authorized in Chunk 1 | None performed |
| hPanel settings | Read dashboard, plan, SSH, PHP, cron, Git, files, FTP | No settings saved, credential changed or integration connected |
| Public homepage + 10 blogs | Baseline captured in this chunk | 11/11 HTTP 200 and matching self-canonicals |
| WordPress credentials/database | Not used/read | No WordPress login/API credentials or database queries |
| robots/sitemap | Public GETs saved | No edit or indexing submission |

This is not a full independent audit of every WordPress file or database row. There was no deployment, so no post-deployment PASS is claimed. BASELINE.md contains real server-file and HTTP evidence for later before/after verification; it explicitly separates server hashes from downloaded response hashes.

## 9. Known issues and deviations from the chunk

No blocking issue prevents completing this discovery/architecture ticket. Deployment readiness is intentionally not asserted.

- SSH is inactive; PHP symlink/link functions are disabled. Shell symlink/atomic rename and web traversal are untested. Staging/deployment must not proceed until an approved, tested release mechanism satisfies the rollback contract.
- hPanel directory password protection may use the same `Authorization` header needed by Bearer-token exercises. Staging must prove a separate gate channel, such as a secure gate cookie, while keeping every API route protected; no API exception is acceptable.
- PHP Info proves PDO SQLite is loaded, not that the proposed private storage path is writable or concurrency/locking safe.
- A physical directory exemption does not automatically cover virtual API/unknown descendants; Lab-local routing must be verified on staging without parent WordPress changes.
- Shared origin/account permissions are not strong isolation. Real exploits and arbitrary executable content remain prohibited; future requirements exceeding those boundaries require separate isolation.
- No Git commit, tracked files, remote or CI currently exists. The default npm launcher is broken. Later CI setup must avoid sweeping local caches or unrelated artifacts into a new repository.
- Production font links call Google Fonts, while the Lab contract forbids that. Self-host matching font families rather than copying the links.
- Public output has two palettes. Homepage counters lag REST/sitemap, and old “AI Tools Weekly” schema names remain; these are recorded, not edited.
- robots is inferred virtual WordPress output from headers plus the absence of a physical file; the exact generating filter/plugin remains unverified.
- Public collision checks do not exhaust private drafts or undocumented mappings. Recheck target ownership before deployment.
- No scope deviation: only local documentation/evidence and CRE-46 progress/completion records are in scope.

## 10. Carry-forward for later chunks

- Next is CRE-47 / Chunk 2; it has not been started. Read ARCHITECTURE.md, BASELINE.md and this report before implementing.
- Establish the reviewed source-control/CI destination and pinned package toolchain; preserve the existing content engine.
- Resolve staging hostname and authorized SSH/SFTP/deployment access; validate real atomic switching and one-command rollback before the first deployment.
- Obtain licensed local Poppins/Inter assets and implement the chosen shell with accessible navigation.
- Validate private SQLite storage, short transaction/lock behavior, session isolation/reset/TTL/caps, all API methods and deterministic simulations in their assigned chunks.
- Test routing including unknown paths, API items, slash canonicals and cache bypass through the actual CDN. Keep server/WordPress configuration untouched unless the required specific approval exists.
- Re-capture a fresh R4 baseline immediately before every deployment; preserve exact observed differences and rollback on unexplained failures.
- Use the 20 verified Playwright guides for later practice-to-blog links. Blog-side changes remain proposal-only pending approval.
- Keep true WebSockets and broader realistic applications in their planned later phases.

## 11. Questions for Mayur

None required to close Chunk 1. ARCHITECTURE.md records consequential choices needed before later provisioning/deployment, with recommendations; no access, purchase, server or WordPress change is authorized by this report.

Discovery and architecture checkpoint complete once final document review passes. Stop before Chunk 2.


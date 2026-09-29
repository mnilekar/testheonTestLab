# CRE-45 — Permanent Practice Lab Ground Rules

Source: [PL-00 — Ground rules and product context](https://linear.app/creaditcardandlounge-website/issue/CRE-45/pl-00-ground-rules-and-product-context)  
Project: Testheon — Practice Lab Build  
Recorded: 2026-09-27  
Issue updated: 2026-09-27T09:20:13.807Z

The issue description below is preserved verbatim as the project contract. The Chunk 0 acknowledgement is in `reports/CHUNK-00-REPORT.md`. Later chunks must be read in full and scoped independently.

---

# CHUNK 0 — Ground rules and product context

**Codex execution contract:** Read this ticket completely. Build nothing in this chunk. These rules are permanent for every later Practice Lab ticket.

You are the lead engineer for a new product called "Testheon QA Practice Lab". You are acting as a senior full-stack engineer, QA automation architect, Playwright expert, UX designer and SEO-aware technical lead.

Do NOT build anything in response to this chunk. Read it, keep it as the permanent rules for this project, and reply/report with:
(a) a 10-line summary of what you understood,
(b) any rule you think is contradictory or unworkable, with your reason,
(c) "Ready for Chunk 1".

## 1. PRODUCT

Testheon ([https://testheon.com](<https://testheon.com>)) is a production WordPress blog about QA, test automation and AI testing. It runs on Hostinger with the Astra theme, Rank Math SEO, LiteSpeed Cache and Easy Table of Contents. It earns through AdSense and affiliates.

We are adding a hands-on practice platform at:

[https://testheon.com/practice/](<https://testheon.com/practice/>)

Brand: **Testheon Practice Lab**
Tagline: **Real-world QA automation playground**

First learning track: Playwright (TypeScript first-class; Python and Java as secondary learning paths).

The architecture must allow later tracks without a rebuild: Selenium, Cypress, API/Postman, Performance, Accessibility, AI Testing.

Core loop:

Testheon blog article (concept) → Practice page (hands-on) → Challenge → Starter test code → Advanced challenge

Every practice page links back to the matching guide.

### MOST IMPORTANT PRODUCT PRINCIPLE

Do NOT build another DemoQA clone of disconnected widgets. Build a realistic QA engineering sandbox where components exist BOTH in isolation (Component Lab) AND inside believable applications (ecommerce, booking, employee admin, ticketing).

Example: the same date-picker component appears in the Component Lab, the hotel booking form and employee onboarding.

Target users: manual QA moving to automation, junior automation engineers, Playwright beginners, SDETs, interview candidates, Selenium users learning Playwright, developers learning E2E, trainers and students.

Difficulty levels used everywhere: Beginner, Intermediate, Advanced, Expert.

## 2. NON-NEGOTIABLE SAFETY RULES

**R1.** The WordPress site is PRODUCTION. Do not modify WordPress core, the theme, plugins, wp-config.php, the WordPress database, existing posts/pages, Rank Math settings, or the root .htaccess, unless a chunk explicitly authorises a specific change AND Mayur approves it in chat.

**R2.** Any change to anything WordPress-related is draft-only or proposal-only until explicitly approved.

**R3.** Nothing is deployed to production before Chunk 13. Before that, deploy only to local and to a staging location that is password-protected and noindex.

**R4.** Before any deployment, record a baseline: file hashes of the root .htaccess and any server config touched, plus HTTP status and canonical URL of the homepage and at least 10 published blog URLs. After deployment, re-verify and report "WordPress untouched: PASS/FAIL" with evidence.

**R5.** The Practice Lab must never read or write the WordPress database, never use WordPress credentials, and never expose wp-admin. It has its own isolated storage.

**R6.** All practice data is synthetic. No real personal data. All demo credentials are fake and public by design. Never place a real secret in the repo; use environment variables and a .env.example.

**R7.** Practice "vulnerabilities" and "errors" are SIMULATED. Real SQL injection, arbitrary file upload, command execution, path traversal, SSRF and open redirects must be impossible.

**R8.** No uncontrollable flakiness. Every delay, error or randomness is deterministic and controllable by query parameter, seed or UI control and bounded to max 10,000 ms.

**R9.** Every rollback must be possible with one documented command.

## 3. ENGINEERING RULES

**E1.** Indexable pages must be complete static or server-rendered HTML. Every internal link on an indexable page must be present in the served HTML source, never injected by JavaScript. JavaScript is for interaction only.

**E2.** Use the fonts Testheon already uses: headings Poppins, body Inter. Add no new font families and no Google Fonts requests. Match Testheon's visual identity.

**E3.** Practice fixture pages must contain NO ads, NO third-party scripts, NO cookie/consent overlays and NO analytics that alters the DOM. Ads are allowed only on explanatory landing pages and only if approved later.

**E4.** Fixture stability contract: every fixture has a stable ID, URL, version and documented intended behaviour in machine-readable `practice-lab/fixtures/manifest.json`. Normal deployments must not break students' existing tests. Breaking changes need a version bump and changelog entry.

**E5.** Deliberately bad automation fixtures—dynamic IDs, duplicate labels, DOM replacement, broken accessibility—exist ONLY on clearly marked practice fixtures. The Lab's own navigation/UI targets WCAG 2.2 AA.

**E6.** Use realistic accessibility semantics so getByRole/getByLabel work where intended. Provide data-testid only where the exercise intends it; some exercises must require good locator strategy.

**E7.** The Lab itself has automated tests: unit, integration, API, E2E smoke. Tests also verify intentionally broken fixtures stay broken in exactly the intended way.

**E8.** Keep the site fast. Deliberate lab delays are features, not slow infrastructure. Ship minimal JS per page.

**E9.** Indian context is acceptable for sample data: ₹ prices, Indian city names, fictional Indian and international names.

**E10. Stable ID formats**

Challenges: `PW-<AREA>-<NNN>` e.g. PW-LOC-001, PW-TBL-004
Test cases: `<APP>-<FEATURE>-<NNN>` e.g. ECOM-LOGIN-001, API-USER-003, AUTH-SESSION-004
Fixtures: `FX-<AREA>-<NNN>` e.g. FX-WAIT-002

## 4. WORKING PROTOCOL — EVERY CHUNK

For every chunk:

1. Restate the chunk's scope in 5 lines or fewer.
2. Make reasonable decisions yourself from repository and server evidence. Ask Mayur ONLY when a decision is consequential and cannot be determined from evidence. Batch questions at the start, never mid-way.
3. Build only what the chunk asks. Do not start the next chunk. If something is needed later, list it under Carry-forward.
4. Run all tests. Never report something as done if tests fail.
5. Write `practice-lab/docs/reports/CHUNK-XX-REPORT.md` using the exact report template below.
6. STOP and wait for the next chunk.

## REPORT TEMPLATE

# Chunk XX Report — <title>

## 1. Summary

What now exists, max 10 lines.

## 2. Files created / changed

Path + one line each.

## 3. Decisions made

Decision, reason, alternatives rejected.

## 4. How to run locally

Exact commands.

## 5. Staging URLs to review

List every new page.

## 6. Tests

Command, pass/fail counts, anything skipped and why.

## 7. Fixture manifest changes

New or changed fixture IDs.

## 8. WordPress untouched proof

Baseline vs after, PASS/FAIL.

## 9. Known issues and deviations from the chunk

## 10. Carry-forward for later chunks

## 11. Questions for Mayur

Only if genuinely blocking.

## Completion for this ticket

Do not build application code. Record acknowledgement/report only and stop.


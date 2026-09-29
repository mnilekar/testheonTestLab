# CRE-48 — PL-03 API foundation, seed data, sandbox sessions and reset

Source: https://linear.app/creaditcardandlounge-website/issue/CRE-48/pl-03-api-foundation-seed-data-sandbox-sessions-and-reset

Status at checkout: Backlog. Comments: none. Attachments: none. Blocked by completed CRE-47; blocks CRE-49.

## Execution protocol

Read CRE-45, `ARCHITECTURE.md`, and the latest chunk report. Build only Chunk 3, test it, deploy it to protected staging, write `CHUNK-03-REPORT.md`, and stop.

## Required work

1. Add the standalone JSON API under `/practice/api/v1/` with the specified error envelope.
2. Generate byte-identical versioned synthetic datasets for users (40), customers (60), employees (120), products (80), orders (150), tasks (50), tickets (60), and bookings (40), including marked edge cases.
3. Add isolated `lab_sid`/`X-Lab-Session` sandboxes, copy-on-write storage, TTLs, quotas, cleanup, reset, and session stats.
4. Implement full REST semantics, page/cursor pagination, filters, search, sorting, deterministic delay/simulation/seed/size controls, status simulation, and simulated throttling.
5. Add real host protection, strict JSON validation, body and storage caps, parameterised SQLite queries, documented CORS, health, noindex/no-store behavior, OpenAPI 3.1, HTML docs, and tagged safe logs.
6. Cover verbs, statuses, pagination, controls, isolation, reset, expiry, simulated throttle, injection strings, traversal, and oversized bodies with automated tests.
7. Deploy to protected staging, verify health/docs/isolation/reset, re-run R4 evidence, report WordPress untouched PASS/FAIL, and stop before CRE-49.

# Chunk 09 Task — Testheon Store ecommerce app, API↔UI, network and errors

Source: [CRE-54 — PL-09](https://linear.app/creaditcardandlounge-website/issue/CRE-54/pl-09-testheon-store-ecommerce-app-apiui-network-and-errors)  
Checked out: 2026-09-29

## Scope

1. Build the indexable `/practice/apps/ecommerce/` overview and noindex catalogue, product, cart, checkout, confirmation, order-history and profile screens.
2. Use the Chunk 3 Practice API and Chunk 8 authentication for a session-isolated guest cart, login-at-checkout, fake cards, dependent addresses, shipping, coupons and synthetic orders.
3. Publish API→UI→API practice scenarios for product creation, user login, order deletion and checkout verification with stable JSON routes suitable for Playwright interception.
4. Add one-shot 401, 403, 404, 409, 422, 429, 500, 503, timeout, malformed-JSON and empty-array scenarios plus visible recovery states and `?visual=stable`.
5. Generate at least 40 functional cases in JSON, Markdown and CSV, and add a runnable TypeScript page object, login fixture, cart object and API-seeding fixture.
6. Verify protected/noindex staging, R4 production evidence and WordPress isolation, write `CHUNK-09-REPORT.md`, then stop before CRE-55.

# Chunk 01 roadmap URL evidence

Recorded 2026-09-27 for CRE-46 architecture discovery. Read all ten complete descriptions of CRE-48 through CRE-57 using the connected Linear `get_issue` tool in parallel. Every read succeeded. Those tickets remain future work: no implementation, status update, comment, or deployment was performed on them. This file extracts requirements for the **planned** MVP URL map; none of the listed Lab paths is asserted to exist today.

## Sources and scope

| Source | Exact title | Description updated (UTC) | Complete description read |
| --- | --- | --- | --- |
| [CRE-48](https://linear.app/creaditcardandlounge-website/issue/CRE-48/pl-03-api-foundation-seed-data-sandbox-sessions-and-reset) | PL-03 — API foundation, seed data, sandbox sessions and reset | 2026-09-27 09:17:46.692 | 4,006 characters |
| [CRE-49](https://linear.app/creaditcardandlounge-website/issue/CRE-49/pl-04-component-lab-a-inputs-buttons-choices-dropdowns-forms-and) | PL-04 — Component Lab A: inputs, buttons, choices, dropdowns, forms and locators | 2026-09-27 09:18:25.401 | 4,482 characters |
| [CRE-50](https://linear.app/creaditcardandlounge-website/issue/CRE-50/pl-05-tables-search-pagination-and-infinite-scroll) | PL-05 — Tables, search, pagination and infinite scroll | 2026-09-27 09:18:28.100 | 2,690 characters |
| [CRE-51](https://linear.app/creaditcardandlounge-website/issue/CRE-51/pl-06-waits-dynamic-dom-dialogs-interactions-and-controls) | PL-06 — Waits, dynamic DOM, dialogs, interactions and controls | 2026-09-27 09:18:32.499 | 2,994 characters |
| [CRE-52](https://linear.app/creaditcardandlounge-website/issue/CRE-52/pl-07-frames-windows-files-drag-drop-and-browser-context) | PL-07 — Frames, windows, files, drag-drop and browser context | 2026-09-27 09:18:35.966 | 3,011 characters |
| [CRE-53](https://linear.app/creaditcardandlounge-website/issue/CRE-53/pl-08-authentication-sessions-roles-and-api-auth) | PL-08 — Authentication, sessions, roles and API auth | 2026-09-27 09:19:27.695 | 2,746 characters |
| [CRE-54](https://linear.app/creaditcardandlounge-website/issue/CRE-54/pl-09-testheon-store-ecommerce-app-apiui-network-and-errors) | PL-09 — Testheon Store ecommerce app, API↔UI, network and errors | 2026-09-27 09:19:30.748 | 2,925 characters |
| [CRE-55](https://linear.app/creaditcardandlounge-website/issue/CRE-55/pl-10-challenge-system-starter-code-and-test-case-downloads) | PL-10 — Challenge system, starter code and test-case downloads | 2026-09-27 09:19:34.442 | 3,212 characters |
| [CRE-56](https://linear.app/creaditcardandlounge-website/issue/CRE-56/pl-11-seo-blog-integration-and-analytics) | PL-11 — SEO, blog integration and analytics | 2026-09-27 09:19:37.760 | 3,255 characters |
| [CRE-57](https://linear.app/creaditcardandlounge-website/issue/CRE-57/pl-12-pre-launch-hardening-tests-accessibility-performance-security) | PL-12 — Pre-launch hardening: tests, accessibility, performance, security and observability | 2026-09-27 09:20:06.138 | 2,890 characters |

The parent task already read CRE-46 and its starter URL proposal. CRE-48–57 are consulted only as roadmap evidence so the Chunk 1 design does not omit later MVP surfaces. They do not authorize starting those chunks.

## Explicit page paths from the tickets

All paths below use the production origin `https://testheon.com` only after the separately authorized production deployment. Staging must retain password protection and noindex for **every** page regardless of eventual production policy.

| Exact path | Source | Explicit ticket indexing requirement | Architecture treatment needed |
| --- | --- | --- | --- |
| `/practice/api/` | CRE-48 | Default NOINDEX; CRE-46 specifically makes API utility docs noindex,follow | NOINDEX,FOLLOW human API documentation. |
| `/practice/components/inputs/` | CRE-49 | Not individually specified | Grouped fixture page; default NOINDEX,FOLLOW unless architecture intentionally assigns a substantial independent teaching page. |
| `/practice/components/buttons/` | CRE-49 | Not individually specified | Same grouped-fixture default. |
| `/practice/components/checkboxes-radios/` | CRE-49 | Not individually specified | Same grouped-fixture default. |
| `/practice/components/dropdowns/` | CRE-49 | Not individually specified | Same grouped-fixture default. |
| `/practice/components/forms/` | CRE-49 | Not individually specified | Same grouped-fixture default. |
| `/practice/playwright/locators/` | CRE-49 | INDEX; 400–800 words of real guidance | INDEX teaching page; separate any bare runtime/state variant. |
| `/practice/components/tables/` | CRE-50 | INDEX with real teaching content | Preserve this explicit INDEX requirement; isolated sub-fixtures may have NOINDEX URLs. |
| `/practice/components/search-and-lists/` | CRE-50 | Not individually specified | Default NOINDEX,FOLLOW until architecture assigns justified teaching value. |
| `/practice/playwright/waits/` | CRE-51 | INDEX with genuine guidance | INDEX; delay/seed variants are not independent indexed pages. |
| `/practice/components/dynamic-dom/` | CRE-51 | Described as a clearly marked fixture page | NOINDEX,FOLLOW recommended; intentional selector anti-patterns. |
| `/practice/components/dialogs/` | CRE-51 | Not individually specified | Grouped fixture page; default NOINDEX,FOLLOW. |
| `/practice/components/interactions/` | CRE-51 | Not individually specified | Grouped fixture page; default NOINDEX,FOLLOW. |
| `/practice/components/date-time-and-ranges/` | CRE-51 | Not individually specified | Grouped fixture page; default NOINDEX,FOLLOW. |
| `/practice/components/frames-and-windows/` | CRE-52 | Not individually specified | Grouped fixture page; default NOINDEX,FOLLOW. Every frame/child popup stays under `/practice/`. |
| `/practice/components/files/` | CRE-52 | Not individually specified | Grouped file fixture page; default NOINDEX,FOLLOW. |
| `/practice/components/drag-and-drop/` | CRE-52 | Not individually specified | Grouped fixture page; default NOINDEX,FOLLOW. |
| `/practice/components/browser-context/` | CRE-52 | Not individually specified | Grouped fixture page; default NOINDEX,FOLLOW. |
| `/practice/apps/auth/` | CRE-53 | NOINDEX | Auth app and all its stateful screens NOINDEX,FOLLOW. |
| `/practice/playwright/authentication/` | CRE-53 | INDEX with real teaching content | INDEX authentication teaching page. |
| `/practice/apps/ecommerce/` | CRE-54 | Overview INDEX; internal screens NOINDEX | Keep an explanatory overview distinct from the runtime store home. |
| `/practice/challenges/` | CRE-55 | INDEX catalogue | Entire list/links served as HTML; filtering is progressive enhancement. |
| `/practice/challenges/<slug>/` | CRE-55 | Default NOINDEX,FOLLOW | Only individually documented, substantial, distinct teaching pages may be INDEX; do not preapprove all detail pages. |
| `/practice/sitemap.xml` | CRE-56 | Contains only INDEX URLs | Discovery utility, not a learning landing page; omit itself and all NOINDEX routes from its entries. |
| `/practice/components/accessibility/` | CRE-57 | Not individually specified | Default NOINDEX,FOLLOW: intentional accessible/flawed fixture comparison with isolation. |

CRE-49 explicitly forbids a separate page for every widget; group related components. The table's default recommendations are architectural recommendations, **not additional ticket mandates**. A grouped page can earn INDEX if the final architecture names it and establishes real standalone learning value; thin widgets cannot.

The CRE-46 starting proposal additionally supplies `/practice/`, `/practice/playwright/`, `/practice/playwright/api-testing/`, and `/practice/components/`. Their final production INDEX decisions belong to `ARCHITECTURE.md`; content-rich hub/teaching pages are reasonable INDEX candidates. They are not extra exact paths extracted from CRE-48–57.

## Explicit API paths and required resources

CRE-48 establishes `/practice/api/v1/` (or a documented equivalent), JSON responses, and **X-Robots-Tag: noindex on every API response**. Never cache these endpoints through LiteSpeed/page caching. CRE-53 extends auth independently of WordPress.

| Exact ticket route | Method | Required role |
| --- | --- | --- |
| `/practice/api/v1/lab/reset` | POST | Reset this client's sandbox. |
| `/practice/api/v1/lab/session` | GET | Session identifier and stats. |
| `/practice/api/v1/sim/status/{code}` | GET | Deterministic status simulation. |
| `/practice/api/v1/health` | GET | Version, fixture version, storage health; no secrets. |
| `/practice/api/v1/openapi.json` | GET | OpenAPI 3.1 generated from or validated against implementation. |
| `/practice/api/v1/auth/token` | POST | Short-lived access token plus refresh token. |

The complete required resource set is **users, products, orders, customers, employees, tasks, tickets, bookings**. Applying normal resource routes to the mandated namespace yields these planned templates (resource names/verbs are explicit; the assembled paths are an architectural normalization):

```text
GET, POST                 /practice/api/v1/users
GET, PUT, PATCH, DELETE    /practice/api/v1/users/{id}
GET, POST                 /practice/api/v1/products
GET, PUT, PATCH, DELETE    /practice/api/v1/products/{id}
GET, POST                 /practice/api/v1/orders
GET, PUT, PATCH, DELETE    /practice/api/v1/orders/{id}
GET, POST                 /practice/api/v1/customers
GET, PUT, PATCH, DELETE    /practice/api/v1/customers/{id}
GET, POST                 /practice/api/v1/employees
GET, PUT, PATCH, DELETE    /practice/api/v1/employees/{id}
GET, POST                 /practice/api/v1/tasks
GET, PUT, PATCH, DELETE    /practice/api/v1/tasks/{id}
GET, POST                 /practice/api/v1/tickets
GET, PUT, PATCH, DELETE    /practice/api/v1/tickets/{id}
GET, POST                 /practice/api/v1/bookings
GET, PUT, PATCH, DELETE    /practice/api/v1/bookings/{id}
```

Collection query contract: `page`, `limit`, `sort=field,-field`, field filters, `q`, bounded page size; cursor pagination on products and employees. Simulation query contract: `delay=0..10000`, `simulate=400|401|403|404|409|422|429|500|503`, `seed=<n>`, `size=small|medium|large`. These are state/query variants, never separate INDEX URLs. CRE-48 requires a session-scoped simulated rate-limit endpoint but leaves its exact path unspecified.

## Required capabilities with proposed route names

The following capabilities are explicitly required by later tickets, but their exact additional URL names are **not specified**. These proposals let the architecture reserve a complete map now; later authorized chunks must settle exact contracts before fixture release. Every runtime page, stateful/API route, utility download, frame, and popup below is **NOINDEX** (HTML uses `noindex,follow`; non-HTML uses `X-Robots-Tag`). The proposed names are not currently implemented.

| Capability and source | Recommended stable planned paths |
| --- | --- |
| Per-session simulated throttling, CRE-48 | `GET /practice/api/v1/sim/rate-limit` |
| Country → State → City API, CRE-49 and CRE-54 | `GET /practice/api/v1/locations/countries`, `GET /practice/api/v1/locations/states?country={id}`, `GET /practice/api/v1/locations/cities?state={id}`; bounded fixed synthetic catalog. |
| Auth app screens, CRE-53 | `/practice/apps/auth/login/`, `/register/`, `/forgot-password/`, `/inbox/`, `/reset-password/`, `/change-password/`, `/dashboard/`, `/roles/`, `/wizard/` relative to `/practice/apps/auth/`. Logout is a state-changing POST action, not a mutating GET page. |
| Session auth and password flows, CRE-53 | Under `/practice/api/v1/auth/`: `POST login`, `POST logout`, `POST register`, `POST forgot-password`, `POST reset-password`, `POST change-password`, `POST refresh`, `GET me`, `GET inbox`, `GET permissions`; exact refresh/CSRF contracts established during auth implementation. The explicitly mandated `POST token` remains unchanged. |
| Store screens, CRE-54 | Under `/practice/apps/ecommerce/`: `store/`, `products/`, `products/{id}/`, `cart/`, `checkout/`, `orders/{id}/confirmation/`, `orders/`, `profile/`. Root overview retains its explicit INDEX status. |
| Cart, coupon, checkout, CRE-54 | Under `/practice/api/v1/store/`: `GET cart`, `POST cart/items`, `PATCH cart/items/{id}`, `DELETE cart/items/{id}`, `POST cart/coupon`, `DELETE cart/coupon`, `POST checkout`. Persist resulting orders through the required orders resource; do not create a second unrelated order model. |
| One-next-request fault panel, CRE-54 | `POST /practice/api/v1/lab/scenario` to configure only this sandbox's next eligible simulated fault; bounded delays, separate from real abuse protection. |
| Isolated runtime fixtures, CRE-50/51/52/57 | `/practice/fixtures/{fixture-id}/`; optional subordinate paths recorded explicitly in the manifest. Anchor-only fixtures can remain on their grouped parent without a separate URL. Do not create an indexed URL for each widget. |
| Frame/popup content, CRE-52 | `/practice/fixtures/{fixture-id}/frame/`, `/nested-frame/`, `/child/`, `/popup/` relative to the stable fixture directory. No outside/third-party frame origin. |
| Upload, sanitized preview, session export, CRE-52 | Under `/practice/api/v1/files/`: `POST uploads`, `DELETE uploads/{id}`, `GET uploads/{id}/preview`, `GET reports/{report}.{csv|pdf}`. Storage remains outside web root or in memory; these endpoints must never expose a raw upload filesystem path. |
| Static downloadable file fixtures, CRE-52 | `/practice/downloads/fixtures/sample.pdf`, `/sample.csv`, `/sample.txt` relative to `/practice/downloads/fixtures/`. Delayed/download-after-API scenarios use bounded API delivery, with a correct Content-Disposition filename. |
| Ready-to-clone TypeScript starter ZIP, CRE-55 | `/practice/downloads/playwright-ts-starter.zip` generated from `practice-lab/starter/playwright-ts/`. |
| Python/Java starter examples, CRE-55 | `/practice/downloads/playwright-python-examples.zip`, `/practice/downloads/playwright-java-examples.zip` if packaged; each contains README pointers plus the three required equivalent examples. ZIP names/package choice are recommendations, not ticket requirements. |
| E-commerce case packs, CRE-54/55 | `/practice/downloads/test-cases/ecommerce.json`, `/ecommerce.csv`, `/ecommerce.md` relative to `/practice/downloads/test-cases/`, generated from `practice-lab/content/test-cases/ecommerce.json`. |
| Reproducible failing challenge materials, CRE-55 | `/practice/downloads/challenges/{challenge-id}/starter.zip` where needed; individual challenge slug remains a content-model field, not an invented fixed slug in this discovery. |

For abbreviated suffixes in the table, prepend the full base explicitly stated in that row; these are path families, not additional root-level `/register/` or `/cart/` routes. Existing fixture IDs/URLs/version policy is authoritative once implemented; do not silently rename paths during later chunks.

## Indexing contract to carry into the final map

- CRE-56 requires every INDEX page to have unique title/description, one H1, useful intro, objective, visible breadcrumbs, matching BreadcrumbList, self-canonical, blog guide link, and sibling links. Served HTML must contain discovery links.
- CRE-55's challenge catalogue is INDEX, but all detail pages initially remain NOINDEX,FOLLOW. No individual challenge is selected for INDEX by this evidence file because its substantial content does not yet exist; future exceptions need explicit names and evidence in the URL map.
- Runtime app screens, utility API docs, API responses, fixture URLs, and per-state/query pages are NOINDEX. The final map should specify how query state returns noindex and points canonically to an appropriate base where useful; it must not turn state variants into indexed landing pages.
- `/practice/sitemap.xml` contains only qualified INDEX canonical URLs with meaningful-content lastmod, never runtime/query/download routes. A robots Sitemap-line change is a later WordPress proposal requiring the applicable authorization.
- All staging routes are protected and NOINDEX, including staging copies of production-INDEX pages. Do not rely only on robots disallow to remove indexed content; authenticated access and robots directives must be enforced as designed.
- The roadmap's realistic-app principle mentions future booking/employee/ticketing examples, but CRE-48–57 only mandate a full auth app and ecommerce app for this MVP. The API datasets exist for later reuse; do not accidentally promise full hotel/HR/ticketing applications in the MVP URL map.

## Scope conclusion

Architecture can be complete without scaffolding any path now. The map must preserve all 16 explicitly named component-group pages, the dedicated learning pages, both mandated app areas, challenge catalogue/detail policy, eight resource families, session/reset/health/simulation/auth/OpenAPI endpoints, and required download capabilities. Exact implementation choices for the proposed names remain visible architectural decisions instead of claims that the tickets specified them.

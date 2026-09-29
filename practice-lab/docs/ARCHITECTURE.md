# Testheon Practice Lab — Architecture

Decision date: **2026-09-27**. Scope: [CRE-46, Chunk 1](https://linear.app/creaditcardandlounge-website/issue/CRE-46/pl-01-discovery-and-architecture-decision), read-only discovery and documentation. Status: **architecture selected; implementation and deployment have not started**. The [CRE-45 ground rules](CHUNK-00-GROUND-RULES.md) remain authoritative. This document authorizes no later chunk, production change, purchase or account setting change.

Select **Astro static HTML + TypeScript, shared small Preact islands, and an independent PHP 8.3/PDO SQLite HTTP API**. Build locally/in CI with Node 24 and pnpm. The intended production location is `https://testheon.com/practice/`; a protected staging subdomain comes first. This is a static site and standalone API, not a WordPress plugin. Hosting and deployment gates below must pass before serving it.

## 1. Facts and evidence

- **Repository:** existing Node ESM article engine, `scripts/testheon.mjs`, `scripts/generate-homepage-v2.mjs`, four test files and 14 passing tests; no Lab application or manifest. The article engine and WordPress client stay outside Lab imports/build/runtime. [Repository evidence](evidence/CHUNK-01-REPOSITORY.md).
- **Local tools:** Node `24.13.1`, pnpm `11.19.0`, Corepack `0.34.6`; the default npm launcher fails to find its CLI. No root dependency lock, Git remote, commit or CI configuration exists. The current branch is `master`, with the existing files untracked. Versions are observations, not installed Lab dependencies. [Commands and output](evidence/CHUNK-01-REPOSITORY.md#runtime-and-package-manager-evidence).
- **Actual plan:** authenticated hPanel shows Business Web Hosting, 50 GB disk, 3072 MB RAM, 2 CPU cores, 120 processes and 60 PHP workers. These resources are shared with existing sites/WordPress. Server location is USA, MA. [Hosting evidence](evidence/CHUNK-01-HOSTING.md).
- **Actual PHP:** hPanel PHP Info shows PHP `8.3.33`, CGI/FastCGI, PDO drivers `mysql, sqlite`, SQLite support enabled and library `3.45.2`. The generic Hostinger database page points SQLite users toward VPS; this account's runtime evidence is more specific. Writable private storage, SQLite contention behavior and PHP CLI parity have not been tested.
- **Access and deployment:** SSH is **INACTIVE**; no working SFTP session is established. hPanel GitHub/GitLab integration and cron creation UI are present but unused. PHP `symlink`, `link`, shell/process execution functions are disabled. Shell symlink/rename support and web-server traversal remain untested. No settings were enabled.
- **Document root:** `/home/u652010987/domains/testheon.com/public_html`, based on the account's FTP directory prefix/upload-folder display. File Manager shows WordPress files and no `practice`, `practice-staging` or physical `robots.txt` in the complete root listing.
- **Root routing:** the actual root `.htaccess` contains `RewriteCond %{REQUEST_FILENAME} !-f`, `!-d`, and the `/index.php` WordPress catch-all. SHA-256 is `3f9689ed4759a5a35a33c4f7ccfb40613310fbc1b0f98387bfdc76f21ce00d24`. Its LiteSpeed block has cache lookup enabled and tracking-query exclusions. [Read-only excerpt and checksum method](evidence/CHUNK-01-HOSTING.md#production-filesystem-and-root-rewrite-evidence); [R4 baseline](BASELINE.md).
- **Node capability:** the plan's Web App details list Node 24/22/20/18 and Astro, Express/Fastify and other frameworks. Neither attaching a Node process beneath the existing WordPress path nor its incoming WebSocket behavior has been demonstrated.
- **Transport/cache:** HTTPS works; hPanel says LiteSpeed/SSL/CDN enabled. Public headers include `server: hcdn`, Hostinger markers and `x-litespeed-cache: hit`. After the local curl limitation, an approved read-only Node HTTP/2 GET at `2026-09-27T09:50:06.071Z` negotiated `h2` and returned 200 from `hcdn`; **HTTP/2 is confirmed**. HTTP/3 is advertised but was not negotiated. No sampled Cloudflare marker was found; that cannot exclude an invisible upstream. [HTTP/2 follow-up](evidence/CHUNK-01-HOSTING.md#protocol-and-uncertainty-notes), [public evidence](evidence/CHUNK-01-PUBLIC-SITE.md).
- **WordPress/SEO:** Astra `4.13.8`, WordPress `7.1.2`, Rank Math output, LiteSpeed output and Easy Table of Contents assets are evidenced. Robots returns the WordPress-style admin disallow and sitemap line; no physical robots file was found. A WordPress-generated response is strongly indicated, but the exact robots filter/plugin owner is not established. Rank Math explicitly generates `https://testheon.com/sitemap_index.xml`. Observed post URLs use `/<post-slug>/`; the stored permalink option was not read.
- **Canonical and collision baseline:** homepage plus ten blog URLs return 200 and correct HTTPS trailing-slash self-canonicals. Public REST contains 26 posts/3 pages; combined sitemaps have 29 entries. No checked URL begins `/practice`; `/practice/` returns WordPress 404 and no corresponding root directory exists. Draft/private/custom route collisions remain a deployment preflight check. [Public baseline and inventories](evidence/CHUNK-01-PUBLIC-SITE.md).
- **Identity and analytics:** existing header source links to Blog, Home and Privacy Policy; Astra footer has centered Testheon copyright/attribution. Poppins headings and Inter body are currently loaded using Google Fonts, so Lab must obtain licensed local assets instead of copying those requests. Jetpack Stats is present on all 11 sampled pages; no GA4/AdSense marker was found in that scan. Import none of these scripts into fixtures. Both Astra purple and the custom homepage ink/amber palette are recorded in the public evidence.
- **Learning inventory:** 20 published Playwright articles and their URLs are listed in [the complete inventory](evidence/CHUNK-01-PUBLIC-SITE.md#published-playwright-inventory) and [JSON](evidence/public-site/playwright-inventory.json). These are the source for future guide backlinks; no WordPress links were edited.

Vendor/framework statements and their current official references are separated from account observations in [Technical sources](evidence/CHUNK-01-TECHNICAL-SOURCES.md). Future ticket descriptions were read only to reconcile the map in [Roadmap URL evidence](evidence/CHUNK-01-ROADMAP-URLS.md); they have not been executed.

## 2. Options and stack decisions

### Architecture options

| Option | Fit to observed hosting and product | Decision |
| --- | --- | --- |
| 1. Static-first generator with a small isolated API | Astro outputs real HTML/files, matching existing physical-path exclusions and E1. Little browser JS; no continuously running frontend server. API runtime must be selected separately. | **Selected frontend approach.** |
| 2. Node server application behind `/practice/` reverse proxy | Business plan lists managed Node, so it is technically credible. However, an app allowance does not establish subpath proxy control for this WordPress site. A proxy may require root/vhost changes, and SSR adds ongoing process use for mostly static teaching material. | **Rejected for MVP.** Preserve as an alternative if isolation or scale needs a separate runtime and routing is explicitly approved/proved. |
| 3. Static frontend plus independent PHP 8 + SQLite API, or external API | PHP/PDO SQLite is confirmed on this account. Standalone PHP under the Lab directory can use real HTTP without WordPress bootstrapping or extra service hosting. Storage and local routing still require staging proof. External API adds another origin/service but can offer stronger process isolation. | **Selected API variant: PHP 8.3 + PDO SQLite.** Separate runtime is the fallback if storage, safe routing or resource/isolation gates fail. |

The selected system combines Option 1's frontend with Option 3's independent PHP API. “Independent” means separate code, data, session and credentials; it does **not** claim a separate OS security identity on this account.

### Short ADRs

| ADR | Context | Decision | Consequences and rejected alternative |
| --- | --- | --- | --- |
| A01 — Frontend | Indexable content/links must exist in the served HTML; most learning content changes at build time. | Astro static output, TypeScript, `base: '/practice'`, directory `index.html` output, trailing-slash page convention. Keep canonical origin/base explicit per target. | Static hosting, minimal runtime and base-aware links. No SPA-only navigation, full client router or WordPress PHP frontend. Pin exact compatible versions in the scaffold chunk. |
| A02 — Styling and identity | Production has two palettes; external font requests violate E2. | Scoped component CSS plus shared CSS custom properties. Use Poppins headings, Inter body from local WOFF2 assets with retained licenses; choose Astra's purple `#6528F7`, hover `#5511F8`, ink `#0F172A`, body `#454F5E`, background `#F2F0FE`, white and border `#D8D8F5` for the Lab shell. | Match the existing header/blog identity consistently; homepage ink/amber remains reference context. Do not copy tracking scripts, live Google Fonts links or unneeded theme CSS. Validate every final contrast pairing. |
| A03 — Interaction and reuse | The same date-picker/form/table must work in Component Lab and realistic apps, with stable behavior. | Shared small Preact islands authored in TypeScript, rendered initially by Astro and hydrated only when needed. Plain TypeScript modules handle native browser primitives where a component framework adds nothing. | One component/behavior implementation serves isolated fixtures and apps. Critical controls hydrate when immediately usable, not lazily in ways that cause unexplained waits. No whole-page hydration or navigation injection. |
| A04 — API | Real HTTP verbs, sessions and controlled faults are required; PHP 8.3/PDO SQLite is present. | Standalone PHP 8.3 front controller, explicit route/method table, JSON validation and OpenAPI 3.1. Composer/PSR-4 for application organization when scaffolded. | No WordPress imports, hooks, database access, credentials or admin proxying. PHP remains small and request scoped; Node is build tooling only for MVP. |
| A05 — Storage | Synthetic mutable data needs per-session isolation/reset; PDO SQLite is confirmed. | Private SQLite database outside every document root, versioned immutable seeds plus session-scoped copy-on-write overlays. WAL only after local filesystem/locking proof. | No WordPress tables or database credentials. SQLite has one writer at a time; short transactions, bounded locks and global quotas are mandatory. Separate Lab MariaDB/external API requires a replacement ADR if SQLite preflight fails. |
| A06 — Build/toolchain | Node 24 and pnpm work; npm launcher fails; no Lab lockfile exists. | Node 24 build line, pnpm with exact `packageManager` pin and committed lockfile in `practice-lab/`; Composer lock for PHP dependencies. Separate package from root article tooling. | Reproducible frozen installs and artifacts; no machine-wide npm repair needed for this decision. Check versions/support again when creating the scaffold rather than fabricate installed package versions. |
| A07 — Tests | Fixture behavior, deliberate defects, API isolation and accessible shell all need proof. | Vitest for TS/component logic; PHPUnit for PHP unit/integration with disposable databases; Playwright TypeScript for HTTP API and browser smoke/full suites; axe integration for the normal shell and fixture-specific expected violations. | Python/Java are learning/starter paths, not duplicate product implementations. Intentionally broken fixtures have passing tests for the documented defect; unexpected violations fail. Include served-HTML link/canonical, all-verb routing, cross-session, reset, upload and cache tests. |
| A08 — CI | No committed baseline, remote or CI exists. | Recommend GitHub Actions: reviewed initial Git baseline, pinned toolchain, frozen dependencies, lint/types/build, all tests, security/dependency checks and immutable artifact with checksum/provenance. | Recommendation is contingent on the user's repository destination; no GitHub repo or workflow is created now. PR checks have no production secrets. Deployment is a separately authorized protected job. Local commands remain the fallback until remote setup. |
| A09 — Deployment | Root WordPress rules cannot change; SSH is inactive and symlink switching unproved. | Upload verified Lab-only release artifacts via approved SSH/SFTP in a later deployment chunk; prefer same-filesystem atomic symlink replacement after all preconditions pass. Keep three compatible releases. | No direct hPanel Git deployment of this whole repository into `public_html`. No claim of deploy readiness. If atomic method cannot work safely, propose separate runtime/host; do not silently switch to risky in-place replacement. |
| A10 — Real-time exercises | Web/Cloud PHP does not establish an incoming WebSocket server and PHP workers are shared. | Bounded short polling for MVP. SSE is optional only after buffering/timeout/worker tests; true WebSockets move to Phase 2 on a verified runtime. | Deterministic exercise semantics survive transport replacement. Do not hold workers indefinitely or imply SSE is automatically supported. |

## 3. Request routing and WordPress boundary

The following is the **planned** production flow, conditional on staging validation. This ASCII diagram is documentation, not deployed routing configuration.

```text
Browser / Playwright APIRequestContext
                |
           HTTPS + Hostinger CDN
                |
        LiteSpeed / existing document root
                |
                +-- /practice/<static-page>/ -> Lab release public/<page>/index.html
                |       Existing physical file/directory exemption; static HTML links
                |
                +-- /practice/_astro/*, fonts, downloads -> Lab release public assets
                |
                +-- /practice/api/ -> static human API documentation (NOINDEX)
                |
                +-- /practice/api/v1/* -> Lab-only child rewrite -> api/index.php
                |       independent PHP router -> private Lab SQLite + seeds
                |       no WordPress bootstrap, database, credentials or admin routes
                |
                +-- all existing WordPress URLs -> existing /index.php + WordPress
                        root .htaccess byte-for-byte unchanged
```

Existing `!-f`/`!-d` rules confirm a suitable physical-path design, but **not** blanket exemption for every virtual descendant. Each static page is a real directory/index file. Lab-local `.htaccess` owns child rewrites, local headers, cache bypass, directory-index behavior, denied private-file access and Lab 404 responses. API clean routes, verb preservation, unknown paths and inheritance must pass tests on the actual staging stack before publication. No root rewrite edit is proposed.

If local clean API routing cannot be proven without touching the parent, use the documented equivalent **physical** `/practice/api/index.php?route=/v1/...` with route allowlisting, strict decoding and no path-to-file mapping. OpenAPI/starter code select this transport consistently before fixture release; never let an API miss silently return WordPress HTML. If even the physical approach cannot satisfy isolation, use a separate API runtime/origin after a scoped decision. API JSON errors remain distinct from HTML Lab 404s. Production `wp-admin` continues to exist for WordPress, but the Lab must not expose, link as a practice feature, proxy or change it.

## 4. Proposed repository and release layout

Only `AGENTS.md` and documentation/evidence presently exist under `practice-lab/`. This tree is a specification for later chunks, not a scaffold created by Chunk 1.

```text
practice-lab/
  AGENTS.md
  README.md
  package.json                 # independent Node/pnpm package
  pnpm-lock.yaml
  astro.config.mjs
  tsconfig.json
  .env.example                 # names/placeholders only; never real secrets
  src/
    pages/                     # static hubs, teaching, grouped fixtures, app shells
    layouts/                   # Lab shell and clean fixture layout
    components/                # shared Preact controls used in fixtures and apps
    styles/                    # tokens, local font declarations, scoped styles
    lib/                       # base-aware URLs, contracts, bounded scenario controls
    islands/                   # app and fixture interaction composition
  content/
    tracks/                    # track-neutral IDs; Playwright first
    guides/                    # learning pages and public blog-link mapping
    challenges/
    test-cases/ecommerce.json
  fixtures/
    manifest.json              # stable IDs, URLs, versions and expected behavior
    seeds/                     # fixed synthetic data and seed version metadata
  api/
    composer.json
    composer.lock
    public/index.php           # only API front controller copied to public release
    src/                       # router, controllers, validators, session/store services
    migrations/
    bin/cleanup.php            # CLI only, never copied into public directory
    openapi.yaml
    tests/                     # PHPUnit
  public/
    fonts/                     # licensed local Poppins/Inter + license records
    downloads/                 # generated safe samples/starter packs/case packs
  starter/
    playwright-ts/             # first-class ready-to-clone suite
    playwright-python/
    playwright-java/
  tests/
    unit/
    integration/
    api/                       # Playwright APIRequestContext
    e2e/
    accessibility/
    contracts/                 # HTML/manifest/route/seed compatibility
  scripts/                     # build, validate, deploy and rollback (future)
  deploy/                      # Lab-only routing/headers/release metadata templates
  docs/
    CHUNK-00-GROUND-RULES.md
    ARCHITECTURE.md
    BASELINE.md
    evidence/
    reports/
  dist/                        # generated public HTML/assets; ignored locally

.github/workflows/practice-lab.yml  # future, only after remote/CI decision

Proposed server paths, subject to permissions and filesystem validation:
  /home/u652010987/practice-lab-releases/<release-id>/public/
  /home/u652010987/practice-lab-releases/<release-id>/private/
  /home/u652010987/practice-lab-data/{lab.sqlite,sidecars,uploads}/
  /home/u652010987/domains/testheon.com/public_html/practice
      -> validated release public directory (conditional symbolic link)
```

No database, source tests, `.env`, SQLite sidecar, upload, Composer development package, deploy key or cleanup command belongs in the public artifact. Development data lives in an ignored private local directory. Shared contracts connect API/app/fixtures without importing the article engine.

## 5. API, data and isolation design

### HTTP contract and deterministic behavior

All eight resource families below support real HTTP `GET/POST/PUT/PATCH/DELETE`, correct status codes and JSON validation. OpenAPI 3.1 defines schemas, method behavior, pagination, examples, errors and authentication; implementation/contract tests must agree. Error envelopes include a stable code and request correlation identifier, never secrets/stack traces. Allowlisted `delay=0..10000`, `simulate=400|401|403|404|409|422|429|500|503`, integer seed and dataset size control synthetic scenarios. Reject invalid values; never sleep longer than the allowed bound. In-memory UI timing uses the same bounded contract.

Fixed dataset seed/version, deterministic IDs and stable sort tiebreakers make repeated exercise inputs reproducible. Clock-dependent scenarios use a documented fixture clock/counter rather than hidden randomness. Session identifiers are cryptographically random capabilities; **do not derive them from the exercise seed**. Real network latency is not controllable. Simulated throttling uses a sandbox request counter with a resettable deterministic window, separate from actual global abuse protection. The “next request fails” control affects only the caller's eligible Lab request.

### Session ownership and copy-on-write

Create an anonymous Lab sandbox with a random high-entropy token. Browser mode may use a host-only `Secure; HttpOnly; SameSite=Lax; Path=/practice/` Lab cookie with a distinct name; standalone API tests use `X-Lab-Session`. Do not reuse WordPress sessions. Validate token syntax/expiry; if cookie and header conflict, reject the request rather than silently choosing another sandbox. Session-info responses never echo unrelated cookies; require explicit header-mode bootstrap to return a bearer rather than defeating HttpOnly by routinely echoing the cookie. Authentication exercises use fake public users inside the sandbox, separately from sandbox ownership.

Every mutable row includes internal `session_id`, resource type and resource ID. Reads overlay session rows/tombstones over immutable seed records; writes never mutate global seeds. Prepared queries always bind the resolved internal session ID; clients cannot choose another session via a resource/body field. Return 404 for records outside the caller's sandbox. Mutating cookie-authenticated requests require origin/CSRF validation and the expected JSON content type; header mode uses its explicit bearer with no permissive credentialed CORS. Do not log token values, Authorization, Cookie, passwords, request bodies or synthetic inbox reset tokens.

`POST /lab/reset` deletes only that session's overlays/scenario counters and invalidates its simulated auth state; seed/version remains fixed. Use a transaction/session generation to prevent an in-flight pre-reset mutation resurrecting old state. Session expiry returns an explicit error; do not silently create a new sandbox when a stale token is supplied. A client explicitly starts again.

### Initial budgets and cleanup

These are conservative **design defaults to validate under load**, not measured hosting capacity. They may only be adjusted with documented test evidence and fixture contract impact.

| Control | Initial design |
| --- | --- |
| Sandbox lifespan | 2-hour idle TTL, 24-hour absolute TTL; expiry checked on every request. |
| Active sandboxes | At most 100; reject new creation with explicit 503/Retry-After at capacity rather than evict an active learner. |
| Data/query caps | At most 2,000 overlay records per sandbox; page limit 100; whitelisted filters/sort fields; bounded search length 200 characters. |
| Bodies/uploads | JSON body maximum 64 KiB. File exercises accept only allowlisted safe formats with inspected content, maximum 1 MiB each, at most 5 files per sandbox. Uploads remain private; previews re-encode/rasterize or show escaped text. No executable SVG/HTML/script delivery. |
| Global disk | Lab allocation ceiling 256 MiB initially, including DB/journal/uploads; reject growth before exhaustion, reserve space for reset/cleanup. Disk utilization and expired counts are health metrics without session identifiers. |
| Simulated waiting | Maximum 10,000 ms per request; at most 4 deliberately delayed requests globally initially, to protect the shared 60 PHP workers. Excess admitted work gets an explicit genuine capacity error, not a fabricated exercise result. |
| SQLite locks | Short transactions, up to 250 ms busy wait, no unbounded retries. Delay simulation occurs outside transactions and PHP session locks. Distinguish a real busy/storage failure from `simulate=503`. |
| Cleanup | CLI job every 5 minutes in UTC, batched with a lock and bounded runtime; remove expired rows/uploads and maintain DB size safely. Opportunistic bounded cleanup may supplement it, never replace a proven job. |

API rate/byte/concurrency limits protect the host even when requests are synthetic. Appropriate limits must be measured against browser concurrency and later performance exercises; do not run load tests on production WordPress. Ordinary health probes do not create sessions. Logging is limited to allowlisted aggregate/status/timing/version fields. Health never reveals filesystem paths, environment values or upstream credentials.

### Security boundaries

The Lab never bootstraps WordPress, reads `wp-config.php`, uses the WordPress database/client/credentials, or proxies admin. Only synthetic data and fixed safe simulated vulnerabilities are allowed. Input must never become SQL text, shell commands, filesystem paths, arbitrary outbound URL targets or redirect destinations. Redirects and downloads are generated from allowlisted routes/IDs. Do not provide public execution, raw arbitrary upload serving, SQL consoles or SSRF fetchers.

`/practice/` is the **same browser origin** as WordPress: root-scoped cookies may accompany requests. The application ignores them, does not log/reflect/forward them, and never treats them as authorization. Cookie Path is not an origin security boundary. Likewise, a separate SQLite file does not make PHP a different OS identity; observed `open_basedir` is unset. No capability proof presently establishes denial of access to sibling WordPress files. The selected approach provides designed application/data isolation, with a residual shared-account risk to be tested/reviewed before production. If a separate process/filesystem identity is required or cannot safely be avoided, move the API to a separately isolated service rather than claim the current account provides it.

Use restrictive CSP, contextual output encoding and fixed trusted scripts; no arbitrary executable user content or origin-wide service worker. Intentional accessibility/dynamic-ID defects stay in explicitly marked fixtures. A future requirement to run untrusted content must use a properly isolated sandbox origin/runtime through a new decision; it cannot be added under the WordPress origin by treating it as another fixture.

## 6. Staging and indexing protection

Preferred future location: **`https://practice-staging.testheon.com/practice/`**, a separate document root with the same `/practice` build base. It does not exist as a deployed Lab today. An independent host avoids modifying production `/practice/` before Chunk 13 and allows routing tests with a staging-only equivalent WordPress catch-all, without cloning production content, database or credentials. Account creation/DNS/TLS/protection are later scoped actions.

Protect every route, asset, download and API response using a server/edge password gate before application processing. Credentials are unique staging secrets stored outside the repository, never fake exercise passwords. Prefer a gate with a separate authentication channel, such as its own secure gate cookie, so the API's real `Authorization: Bearer` exercises still work. Basic Authentication uses that same Authorization header: hPanel directory password protection alone must not be assumed compatible with bearer tests. Prove both layers work together before selecting the staging protection mechanism; do not exempt the API to work around a conflict. Verify anonymous requests receive 401 or the explicit gate login response, never application content, and cannot bypass protection through an alias, direct release path, API or alternate hostname. Use HTTPS, `X-Robots-Tag: noindex, nofollow` globally, HTML noindex and a staging-only `robots.txt` disallow as defense in depth; exclude staging from all sitemaps and public discovery links. Robots disallow alone is insufficient protection. Staging uses its own storage, secrets and quotas; do not point it at production Lab data.

If a subdomain cannot be provisioned safely, remain local until a supported protected environment is selected. A separately protected `/practice-staging/` can be considered as staging, but would need additional production-document-root/cache/cookie checks; the separate host is preferred. This does not permit deploying the public production Lab before Chunk 13. Staging capability is a preflight gate, not an existing PASS.

## 7. Deployment and rollback plan

**No production deployment before Chunk 13.** R1 still requires both specific chunk authorization and Mayur's explicit chat approval for changes to WordPress core/theme/plugins/config/database/content/Rank Math/root `.htaccess`; this design does not request those changes. Never edit WordPress to make the Lab deployment convenient.

1. Before any later deployment, refresh R4: SHA-256 root `.htaccess` and every server configuration file that will be touched, plus homepage/ten published-blog status and canonical records. Preserve the artifact, target, release checksum, manifest version and relevant Lab configuration hashes. A new file has an explicit absent baseline. Discovery's baseline is not a permanent substitute for a fresh deployment baseline.
2. Confirm approved SSH/SFTP access, storage permissions, SQLite/CLI parity, local routing/cache controls, protected staging and safe release paths. SSH is inactive now; PHP cannot create links; no test of shell links/atomic replacement/web traversal has occurred. Do not enable global functions or change WordPress configuration to force this method.
3. Build/test a reproducible artifact off-server. Upload the complete release to its immutable Lab release directory outside public document roots, verify checksum/permissions and compatibility, then test it through an access-controlled preview mechanism. Public output contains only approved distributable files. Never expose private releases or source through guessed URLs.
4. When supported, create a temporary symbolic link beside the live Lab link and atomically rename it over that link using a same-filesystem operation with no directory dereferencing. Validate both link and resolved targets are within allowlisted Lab paths. Never `remove then link`, never describe two directory moves or an in-place upload as atomic. The first installation has an explicit empty-path/collision check; a pre-existing real directory cannot simply be overwritten by this procedure.
5. Serialize deployment/rollback with a lock. Retain **three compatible releases** and their hashed asset sets so in-flight pages remain valid after a switch. Verify PHP realpath/opcache behavior on the actual server; do not restart production PHP workers indiscriminately. Schema changes must be backward compatible across these releases; destructive migrations need their own recovery design. Keep data independent of release folders.
6. Apply Lab-local no-store/cache bypass to all session/API/fixture/staging responses. Keep fingerprinted immutable assets cacheable and Lab HTML revalidated as designed. Test through Hostinger CDN with distinct sessions and repeated requests; ensure no session response becomes a cache hit. Prefer URL/tag-scoped Lab purge if needed. Changes to WordPress LiteSpeed plugin settings, CDN account-wide settings or root rules require their separate authorization; do not purge the whole production site.
7. After the switch, run health/API/browser smoke, session/reset isolation, source-HTML/canonical/indexing and cache checks. Re-hash all baseline files and repeat all R4 URLs; report **WordPress untouched: PASS/FAIL with evidence**. On failure, use the rollback command, verify the restored release, and record remaining failure honestly.

The future **single-command rollback interface** is:

```text
node practice-lab/scripts/deploy.mjs rollback --target staging --release <verified-release-id>
```

This is a **proposed interface, NOT implemented and not runnable now**. The production target is allowed only in the authorized production chunk. The wrapper must validate target/release allowlists, acquire the lock, atomically switch to the retained compatible release, handle only Lab cache state, and perform smoke/R4 verification. A code rollback must not erase learner data or imply that an incompatible schema is recoverable.

If SSH/link traversal/atomic replacement cannot be supported safely, deployment is blocked for this method. Propose an independently hosted release-capable Lab/API or a provider-supported safe equivalent; do not silently edit root WordPress routing or accept partial in-place production copies as the fallback.

## 8. Full planned MVP URL map and SEO policy

Every path below is **planned**, under production `https://testheon.com` only after Chunk 13. Every staging copy is protected/NOINDEX regardless of eventual policy. `INDEX` means eligible only after the required standalone teaching content exists. `NOINDEX` HTML uses `noindex,follow`; non-HTML uses `X-Robots-Tag: noindex` and is omitted from the learning sitemap. Paths labeled proposed normalize capabilities whose future tickets do not fix an exact route. This map preserves the complete [roadmap extraction](evidence/CHUNK-01-ROADMAP-URLS.md).

### Learning hubs and grouped component pages

| Full path | Policy | Reason |
| --- | --- | --- |
| `/practice/` | INDEX | Product/learning-path hub with useful introduction and served-HTML links. |
| `/practice/playwright/` | INDEX | Complete track overview, progression and language paths. |
| `/practice/playwright/locators/` | INDEX | Substantial locator guidance with exercises; CRE-49 requires 400–800 words. |
| `/practice/playwright/waits/` | INDEX | Independent guidance on waiting and deterministic exercise choices. |
| `/practice/playwright/authentication/` | INDEX | Auth/session learning guide separate from the simulated app. |
| `/practice/playwright/api-testing/` | INDEX | Independent APIRequestContext learning guide, not utility API reference. |
| `/practice/components/` | INDEX | Structured Component Lab guide/catalogue with learning value and discovery links. |
| `/practice/components/inputs/` | NOINDEX | Grouped runtime fixtures, not individual indexed widgets. |
| `/practice/components/buttons/` | NOINDEX | Grouped runtime fixtures. |
| `/practice/components/checkboxes-radios/` | NOINDEX | Grouped runtime fixtures. |
| `/practice/components/dropdowns/` | NOINDEX | Grouped runtime fixtures. |
| `/practice/components/forms/` | NOINDEX | Grouped runtime fixtures. |
| `/practice/components/tables/` | INDEX | CRE-50 expressly requires a substantive table-testing teaching page; bare table states remain separate NOINDEX fixtures. |
| `/practice/components/search-and-lists/` | NOINDEX | Grouped search/pagination/infinite-scroll runtime exercises. |
| `/practice/components/dynamic-dom/` | NOINDEX | Clearly marked intentional DOM/locator defects. |
| `/practice/components/dialogs/` | NOINDEX | Runtime dialog exercises. |
| `/practice/components/interactions/` | NOINDEX | Runtime interaction exercises. |
| `/practice/components/date-time-and-ranges/` | NOINDEX | Runtime shared controls. |
| `/practice/components/frames-and-windows/` | NOINDEX | Frame/window runtime exercises. |
| `/practice/components/files/` | NOINDEX | Safe upload/download runtime exercises. |
| `/practice/components/drag-and-drop/` | NOINDEX | Runtime drag/drop exercises. |
| `/practice/components/browser-context/` | NOINDEX | Context/storage runtime exercises. |
| `/practice/components/accessibility/` | NOINDEX | Clearly marked accessible/flawed fixture comparisons. |
| `/practice/apps/ecommerce/` | INDEX | CRE-54's standalone explanatory app overview; actual storefront has its own runtime URL. |
| `/practice/challenges/` | INDEX | Substantial challenge catalogue with complete HTML discovery links. |
| `/practice/challenges/{slug}/` | NOINDEX | Initial detail pages are exercise utilities; no blanket INDEX approval. An individually substantial teaching exception needs a named map/content decision. |
| `/practice/api/` | NOINDEX | Human API reference/testing utility; distinct from API-testing guide. |

### Application, fixture and utility paths

All suffixes below are fully namespaced; the route sets are finite except IDs/slugs generated from the manifest/content/schema. No extra root-level app route is implied.

| Full path or family | Policy | Reason / scope |
| --- | --- | --- |
| `/practice/apps/auth/` | NOINDEX | Simulated auth app entry. |
| `/practice/apps/auth/{screen}/`, screen = `login`, `register`, `forgot-password`, `inbox`, `reset-password`, `change-password`, `dashboard`, `roles`, `wizard` | NOINDEX | Proposed stateful screens; logout is POST, never mutating GET. |
| `/practice/apps/ecommerce/store/` | NOINDEX | Proposed actual storefront home, separate from INDEX overview. |
| `/practice/apps/ecommerce/products/` | NOINDEX | Proposed runtime product catalogue/search. |
| `/practice/apps/ecommerce/products/{id}/` | NOINDEX | Proposed synthetic product detail. |
| `/practice/apps/ecommerce/cart/` | NOINDEX | Proposed session cart. |
| `/practice/apps/ecommerce/checkout/` | NOINDEX | Proposed simulated checkout; no real payments. |
| `/practice/apps/ecommerce/orders/` | NOINDEX | Proposed session order history. |
| `/practice/apps/ecommerce/orders/{id}/confirmation/` | NOINDEX | Proposed synthetic order confirmation. |
| `/practice/apps/ecommerce/profile/` | NOINDEX | Proposed synthetic profile. |
| `/practice/fixtures/{fixture-id}/` | NOINDEX | Isolated runtime contract URL when separate from a grouped page; not every widget needs a URL. |
| `/practice/fixtures/{fixture-id}/{child}/`, child = `frame`, `nested-frame`, `child`, `popup` | NOINDEX | Proposed frame/popup fixtures, explicit children recorded in manifest; no third-party frames. |
| `/practice/downloads/fixtures/sample.{pdf,csv,txt}` | NOINDEX | Safe fixed download utilities. |
| `/practice/downloads/playwright-ts-starter.zip` | NOINDEX | Proposed generated first-class TypeScript starter. |
| `/practice/downloads/playwright-python-examples.zip`, `/practice/downloads/playwright-java-examples.zip` | NOINDEX | Proposed secondary language example packs. |
| `/practice/downloads/test-cases/ecommerce.{json,csv,md}` | NOINDEX | Generated reusable case-pack utilities. |
| `/practice/downloads/challenges/{challenge-id}/starter.zip` | NOINDEX | Reproducible challenge starter materials where needed. |
| `/practice/sitemap.xml` | NOINDEX utility | Lists only approved INDEX canonical pages, with meaningful-content lastmod. |
| `/practice/404.html` and unknown Lab pages | NOINDEX | True HTTP 404; no soft-404/SPA catch-all and no accidental WordPress fallback. |
| `/practice/_astro/*`, `/practice/fonts/*` | NOINDEX assets | Static presentation resources; never landing-page/sitemap entries. |

Static `products/{id}` and fixture/child routes are emitted for their fixed seed/manifest IDs. Newly created session records are viewed through an existing runtime shell with a query ID, not an unlimited statically generated pathname. Any later decision to use dynamic item routes must satisfy the same routing/NOINDEX tests.

### HTTP API paths

Every response in this table is **NOINDEX**, JSON or an explicitly typed safe download, with no-store; paths below follow `/practice/api/v1/` without trailing-slash redirects that could alter methods. The physical front-controller equivalent is reserved only if clean routes fail the staging gate. Resource IDs are validated data, never filenames.

| Full path | Methods | Reason / contract |
| --- | --- | --- |
| `/practice/api/v1/{resource}`, resource = `users`, `products`, `orders`, `customers`, `employees`, `tasks`, `tickets`, `bookings` | GET, POST | Eight required collection resources; synthetic session data. |
| `/practice/api/v1/{resource}/{id}`, same eight resources | GET, PUT, PATCH, DELETE | Single-record operations, session-scoped. |
| `/practice/api/v1/lab/session` | GET, POST | GET mandated session stats; POST proposed explicit creation/bootstrap. |
| `/practice/api/v1/lab/reset` | POST | Required caller-only reset. |
| `/practice/api/v1/lab/scenario` | POST | Proposed next eligible request's caller-scoped fault. |
| `/practice/api/v1/sim/status/{code}` | GET | Required allowlisted deterministic HTTP status simulation. |
| `/practice/api/v1/sim/rate-limit` | GET | Proposed deterministic caller-scoped simulated throttle. |
| `/practice/api/v1/health` | GET | Required minimal version/fixture/storage status; no sensitive paths. |
| `/practice/api/v1/openapi.json` | GET | Required machine-readable OpenAPI 3.1 contract. |
| `/practice/api/v1/locations/countries`, `/practice/api/v1/locations/states?country={id}`, `/practice/api/v1/locations/cities?state={id}` | GET | Proposed bounded synthetic dependent-dropdown catalogues. |
| `/practice/api/v1/auth/token` | POST | Required short-lived simulated access/refresh token flow. |
| `/practice/api/v1/auth/{action}`, action = `login`, `logout`, `register`, `forgot-password`, `reset-password`, `change-password`, `refresh` | POST | Proposed simulated auth mutations, independent of WordPress. |
| `/practice/api/v1/auth/{view}`, view = `me`, `inbox`, `permissions` | GET | Proposed caller's synthetic account state. |
| `/practice/api/v1/store/cart` | GET | Proposed session cart view. |
| `/practice/api/v1/store/cart/items` | POST | Proposed add item. |
| `/practice/api/v1/store/cart/items/{id}` | PATCH, DELETE | Proposed change/remove item. |
| `/practice/api/v1/store/cart/coupon` | POST, DELETE | Proposed fake coupon application/removal. |
| `/practice/api/v1/store/checkout` | POST | Proposed simulated checkout using the shared orders resource. |
| `/practice/api/v1/files/uploads` | POST | Proposed bounded validated private upload. |
| `/practice/api/v1/files/uploads/{id}` | DELETE | Proposed caller-only removal. |
| `/practice/api/v1/files/uploads/{id}/preview` | GET | Proposed sanitized typed preview, never raw arbitrary executable data. |
| `/practice/api/v1/files/reports/{report}.{csv,pdf}` | GET | Proposed allowlisted synthetic export; escaped CSV formulas/safe PDF generation. |

Methods outside each allowlist return 405 with Allow. HEAD/OPTIONS behavior is explicitly implemented/documented where needed, not inherited unpredictably. Query variants (`page`, `limit`, `sort`, filters, `q`, cursors, `delay`, `simulate`, `seed`, `size`, app IDs) do not create additional INDEX pages. Only allowlisted known state controls affect behavior. Keep state on NOINDEX runtime URLs; if state parameters reach a teaching URL, Lab-local headers enforce noindex and the canonical points to the clean teaching URL. Test this in served responses; client-added meta is insufficient. Unknown query fields do not mutate state.

INDEX pages require unique title/description, one H1, objective and useful guidance, visible breadcrumbs/matching BreadcrumbList, HTTPS self-canonical, matching published guide and sibling links **in initial HTML**. The challenge catalogue/filter links and app overview must also exist without JS. `noindex` pages are omitted from `/practice/sitemap.xml`; do not robots-disallow a public runtime page as a substitute for a crawl-visible noindex directive. Adding a Lab sitemap line to production robots or root navigation/blog links is a later WordPress proposal subject to R1/R2, not a discovery change.

Use [the verified 20-guide inventory](evidence/public-site/playwright-inventory.json) for backlinks: locator, authentication and API-testing pages map directly to their matching published articles; waits/table-specific pages use the closest relevant verified guide until a dedicated article exists. Never invent a guide URL. Challenge/fixture starter code uses TypeScript first, with Python/Java equivalents as specified. Only auth and ecommerce are complete MVP apps; bookings/employees/tickets datasets prepare future applications without promising their full UI now.

## 9. Fixture compatibility and versioning

Every fixture receives a stable `FX-<AREA>-<NNN>` ID, canonical URL, explicit version and machine-readable behavior in `fixtures/manifest.json` before it is released. Challenges use `PW-<AREA>-<NNN>`; cases use `<APP>-<FEATURE>-<NNN>`. Manifest entries include owning group/app, difficulty (Beginner/Intermediate/Advanced/Expert), component reference, intended semantics/locator contract, defaults, accepted controls/ranges, seed version, documented intentional defects, expected outcomes, associated tests and guide/challenge links. Concrete IDs are assigned in their own chunks, not invented here.

Use semantic fixture versions: patch for changes that preserve documented observable behavior, minor for additive opt-in capabilities, major for breaking DOM/accessible-name/URL/API/default-timing/outcome changes. The default stable URL retains its released contract; a breaking major receives an explicitly versioned alternative URL and changelog/migration notes rather than silently replacing old students' tests. Keep prior majors available for the documented support period, with removal requiring an explicit decision. Shared-component updates run compatibility tests against every consuming fixture/app. Seed changes that alter expected IDs/order/outcomes also require versioning. Track/language additions reuse these contracts without changing existing Playwright IDs or URLs.

Tests assert both correct normal behavior and the exact intended fault on marked fixtures. The Lab shell targets WCAG 2.2 AA and never inherits intentionally broken semantics from exercise content. No ads, third-party scripts, consent overlays or DOM-altering analytics appear on fixtures; explanatory-page ads/analytics require later approval. Fixed feature delays are documented, bounded and controllable, not unexplained flakiness.

## 10. Top ten risks and mitigations

| Risk | Mitigation and release evidence |
| --- | --- |
| 1. Lab routing changes or intercepts WordPress | Root `.htaccess` unchanged; physical static paths; Lab-local rules and all-verb/unknown-path tests; fresh before/after R4 hash and 11-URL checks. |
| 2. Same-origin/shared-account compromise crosses into WordPress | No real exploitable fixtures, WP imports/credentials/admin proxy, arbitrary execution or raw uploads; strict CSP/encoding; private data; record shared-process limits and move runtime if stronger isolation is required. |
| 3. CDN/LiteSpeed leaks session data or removes deterministic variants | No-store and Lab-local bypass, no tracking-query assumptions for state, distinct-session cache tests; scoped purge only. |
| 4. SQLite writer contention/disk exhaustion hurts WordPress | Private local storage/locking proof, short transactions, bounded wait, quotas/worker cap, cleanup and load tests outside production. |
| 5. Unproven symlink deployment causes partial release or failed rollback | SSH/link/filesystem/traversal gates; checksummed immutable artifacts, atomic link rename, deploy lock and rehearsed rollback; stop rather than fall back to in-place copies. |
| 6. Old students' tests break after shared-component/seed change | Manifest contracts, versioned seeds/fixtures, changelog, old-major availability and cross-consumer tests. |
| 7. Staging/runtime URLs become indexed | Authentication across all staging paths, server/HTML noindex, INDEX allowlist sitemap, query-state tests and no JS-only SEO tags. |
| 8. Deliberate faults become real vulnerabilities or invisible flakiness | Allowlisted simulations, fixed seeds/counters, max 10,000 ms delays, escaped outputs, safe typed files/redirects, passing tests for intended defects and rejection paths. |
| 9. Build/CI supply chain or credentials reach public output | Separate Lab package, locked dependencies/reviewed initial Git baseline, artifact allowlist/secret scan, no production secrets in PR jobs, no development/private files in release public tree. |
| 10. UI diverges from Testheon or inaccessible/heavy islands undermine exercises | Reuse observed palette/local fonts, served HTML navigation, small reusable islands, accessibility/manual keyboard checks, measured JS/performance budgets and no third-party fixture scripts. |

## 11. Decisions needing Mayur and checkpoint

**No decision or approval is needed to finish this documentation-only chunk.** Architecture choices above are supported by current evidence. This is not a deployment-ready assertion.

Later consequential gates, each resolved in its own authorized chunk:

- **Repository/CI destination:** no remote exists. Recommend a reviewed private GitHub repository with protected deployment environments; obtain the exact destination/access before creating or connecting it.
- **Staging/access setup:** recommend a separate protected staging subdomain and narrowly scoped SSH/SFTP credentials if permitted. SSH is inactive; activation/provisioning is an explicit later account action, not an implied result of reading the dashboard.
- **Atomic deployment feasibility:** first validate permitted symlinks/traversal/rename and private storage on staging. If unsupported, present the specific separate-host/runtime alternative and any cost before changing hosting or WordPress routing.
- **Any WordPress-affecting integration:** future nav/backlinks/robots/plugin/cache changes remain proposal-only until their chunk explicitly authorizes the exact change and Mayur approves it in chat. Root `.htaccess` remains unchanged in this architecture.

All findings/caveats carry into the [Chunk 1 report](reports/CHUNK-01-REPORT.md). Stop here; no scaffold, dependency installation, application, fixture, database, staging host or deployment is created by this decision.

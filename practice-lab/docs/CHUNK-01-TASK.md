# CRE-46 — Discovery and architecture decision

Source: https://linear.app/creaditcardandlounge-website/issue/CRE-46/pl-01-discovery-and-architecture-decision

Recorded 2026-09-27. No comments or attachments existed when read.

# CHUNK 1 — Discovery and architecture decision (read-only)

**Execution protocol:** Read <issue id="54403106-e643-40ef-b43f-cbde3ae75823" href="https://linear.app/creaditcardandlounge-website/issue/CRE-45/pl-00-ground-rules-and-product-context">CRE-45</issue> (PL-00) first. This ticket is read-only discovery. Do not write application code. Preserve the exact scope below, write the required artifacts/report, and STOP.

## Goal

Inspect everything relevant, choose the architecture, and write it down so every later chunk follows it.

## A. INSPECT AND REPORT FACTS

Include evidence: command output, file paths, headers.

1. **Repository:** structure, existing tools and scripts (for example the homepage generator and content engine), Node version, package manager, existing CI, existing AGENTS.md or README conventions.
2. **Hosting (Hostinger):** plan type if detectable, SSH/SFTP/Git deploy availability, document root path, PHP version, whether Node.js apps can run, SQLite/PDO availability, cron availability, whether WebSockets are possible, HTTPS/HTTP2, any CDN or Cloudflare in front.
3. **Web server and caching:** Apache or LiteSpeed; how the root .htaccess routes requests to WordPress; confirm whether a physical /practice/ directory would be served directly (RewriteCond !-f / !-d); LiteSpeed Cache rules and how to exclude a path from caching.
4. **WordPress/SEO:** robots.txt contents and who generates it (Rank Math?), sitemap index URL, canonical behaviour, the existing header/nav/footer structure and colours so the Lab can match it, which analytics is installed (GA4, other) and how, the existing permalink structure, and whether any existing URL starts with /practice (collision check).
5. **Playwright content inventory:** list existing Playwright-related blog posts (title + URL) from the REST API or sitemap. These become blog↔practice link targets later.

> Verification note: any hosting/plugin/theme facts stated in project context are hypotheses until confirmed here. Record evidence rather than assuming them.

## B. EVALUATE ARCHITECTURE OPTIONS

Evaluate at least these and pick one, with reasons tied to the hosting facts:

**Option 1:** Static-first site generator (for example Astro + TypeScript with small interactive islands) built to static HTML and deployed to a physical /practice/ directory, plus a small isolated API runtime.

**Option 2:** A Node server app (for example Express/Fastify or Next.js) on Hostinger Node hosting or another host, surfaced under [testheon.com/practice](<http://testheon.com/practice>) via reverse proxy.

**Option 3:** Static frontend under /practice plus the API on a separate runtime (for example a PHP 8 + SQLite micro-API in /practice/api/ outside WordPress, or a Node/serverless API on a subdomain).

Do NOT assume it should be built inside WordPress PHP.

For the API, requirements are:

* real HTTP API callable through Playwright APIRequestContext;
* GET/POST/PUT/PATCH/DELETE;
* deterministic delays and errors;
* per-session sandboxed data;
* reset endpoint;
* OpenAPI spec;
* simulated rate limiting.

If the chosen host cannot do WebSockets, say so and propose SSE or polling as the MVP fallback, keeping true WebSockets for Phase 2.

Prefer everything under the [testheon.com/practice/](<http://testheon.com/practice/>) path. If technically unsafe, state why and propose the next-best option.

## C. WRITE `practice-lab/docs/ARCHITECTURE.md`

It must contain:

1. Hosting facts discovered — bullet list with evidence.
2. Chosen stack: frontend framework, styling approach, interactivity approach, backend runtime, storage, test tooling, CI, deploy method. Record each as a short ADR (context, decision, consequences).
3. Request routing diagram: how /practice/*, /practice/api/* and WordPress URLs are each served, and how WordPress rewrite rules are left untouched.
4. Repository layout for practice-lab/ as a proposed folder tree.
5. Data and isolation design: fixed-seed generation, per-session sandbox (lab session cookie or X-Lab-Session header), copy-on-write over seed data, TTL expiry, global caps, reset mechanism, cleanup job.
6. Staging plan: location such as /practice-staging/ or staging subdomain, password protection, noindex, and how it is kept out of Google.
7. Deployment and rollback plan: atomic deploy to release folder then switch, keep last 3 releases, one-command rollback, LiteSpeed cache purge/exclusion.
8. URL architecture: full planned MVP URL map. Mark each URL INDEX or NOINDEX with a one-line reason.
   * Index only pages with real standalone learning value.
   * Runtime fixtures, app internals, API docs utility pages and per-state pages are noindex,follow.
   * Never index individual widgets.

Starting proposal to evaluate, not create blindly:

* /practice/ (hub)
* /practice/playwright/ (Playwright track hub)
* /practice/playwright/locators/
* /practice/playwright/waits/
* /practice/playwright/authentication/
* /practice/playwright/api-testing/
* /practice/components/ (+ grouped sub-areas such as forms/tables)
* /practice/api/ (API lab docs)
* /practice/apps/ecommerce/
* /practice/challenges/ and /practice/challenges/<slug>/

 9. Fixture versioning policy.
10. Risks and mitigations — top 10.
11. Decisions that need Mayur — only genuinely consequential ones, each with recommendation.

## D. WRITE BASELINE

Write `practice-lab/docs/BASELINE.md` containing the R4 baseline:

* hashes;
* HTTP status and canonical of homepage + 10 blog URLs;
* robots.txt content;
* sitemap index URL.

Later chunks re-verify against it.

## Completion

Write `CHUNK-01-REPORT.md` using the <issue id="54403106-e643-40ef-b43f-cbde3ae75823" href="https://linear.app/creaditcardandlounge-website/issue/CRE-45/pl-00-ground-rules-and-product-context">CRE-45</issue> report template and STOP. Do not scaffold the project yet.


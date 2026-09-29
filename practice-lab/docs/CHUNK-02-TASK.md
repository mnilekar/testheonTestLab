# CRE-47 — PL-02 Scaffold, design shell, CI, staging and rollback

Source: https://linear.app/creaditcardandlounge-website/issue/CRE-47/pl-02-scaffold-design-shell-ci-staging-and-rollback

Status at checkout: Backlog. Comments: none. Attachments: none. Blocked by CRE-46; blocks CRE-48.

## Execution protocol

Read CRE-45 first, then ARCHITECTURE.md and CHUNK-01-REPORT.md. Follow ARCHITECTURE.md exactly. If deviation is necessary, record why. Build only this chunk, test it, report, and stop.

## Build

1. Project scaffold in practice-lab: TypeScript, lint, format, strict type-check, environment config with .env.example, and no committed secrets.
2. Update practice-lab/AGENTS.md with CRE-45 sections 2–4 and a “Where things live” map.
3. Build a minimal reusable design system:
   - Testheon colour, spacing, radius, shadow, and typography tokens.
   - Poppins headings and Inter body, with no new font requests.
   - Responsive header, blog links, Lab nav, breadcrumbs, footer, skip link, visible focus, and reduced-motion support.
   - Button, card, four accessible difficulty badges, callout, copyable code block, tabs, and collapsible Show solution.
   - Per-page SEO title, description, canonical, robots setting, Open Graph, Breadcrumb JSON-LD, and static HTML.
   - Visible “PRACTICE FIXTURE — intentionally built for automation practice” marker.
4. Add /practice/ hub, /practice/playwright/ track skeleton, and a Lab-scoped /practice/* 404. The hub has the exact Testheon Practice Lab H1 and eleven named category cards. Only built categories are links; all others say Coming soon.
5. Add an empty fixtures/manifest.json, JSON schema, and validation script.
6. Add unit and Playwright E2E tooling. Smoke checks cover hub load, title/H1, canonical, robots, every internal hub link, console errors, and keyboard navigation.
7. Add CI in the selected method: install, lint, type-check, unit, build, E2E smoke against the build, and manifest validation. Any error fails the build.
8. Add staging deploy and rollback commands. Staging is password-protected and noindex in meta and X-Robots-Tag. Releases use releases/<timestamp> and an atomic current pointer/equivalent, retaining three. Production refuses without an explicit approval flag and must not be run.
9. Deploy to staging, run smoke, roll back, and redeploy to prove rollback.

## WordPress protection and acceptance

Refresh BASELINE.md checks after staging. Any staging server change remains inside staging. Save desktop and mobile staging screenshots in docs/reports/assets/chunk-02/. Confirm links exist in source HTML, CI is green, rollback is proven, and WordPress remains untouched. Write CHUNK-02-REPORT.md using the CRE-45 template and stop.

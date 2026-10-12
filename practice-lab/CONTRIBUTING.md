# Contributing to the Practice Lab

Work from a `codex/<issue>` branch and change only the active chunk. Read `AGENTS.md`, `docs/CHUNK-00-GROUND-RULES.md`, and `docs/ARCHITECTURE.md` before editing. Use synthetic data and simulated defects; never connect the Lab to WordPress identities, tables, credentials, posts, or admin routes.

## Local workflow

```powershell
corepack enable
pnpm install --frozen-lockfile
pnpm verify
pnpm audit:lighthouse
pnpm audit --audit-level high
```

`pnpm verify` covers formatting, lint, strict types, unit/integration tests, generated API artifacts, the frozen fixture contract, build, JavaScript and security budgets, normal E2E, and cross-browser critical smoke. Lighthouse is separate because it launches a local browser five times.

## Fixture changes

Every fixture needs a stable manifest ID, semantic version, URL, anchor, observable behavior, test data, exact intended defects, expected outcomes, and executable test references. A fixture-contract or manifest change must:

1. bump `manifestVersion`;
2. add the matching `## [version]` entry to `CHANGELOG.md`;
3. run `pnpm fixtures:lock -- --approve-version <version>` intentionally;
4. run `pnpm fixtures:contract` and all referenced tests.

Only a real, isolated practice region may contain an intentional defect. Add `data-a11y-exclude="true"`, a visible anti-pattern label, exact manifest wording, and a focused test for every defect. Normal Lab chrome must keep zero serious or critical axe findings.

## Review and release

Keep generated evidence under `docs/evidence/chunk-<number>/`. Never commit `.env`, `.deploy.env`, credentials, auth cookies, SQLite files, uploads, or HTML reports. Follow `RUNBOOK.md`; production remains locked until the separately authorized production chunk.

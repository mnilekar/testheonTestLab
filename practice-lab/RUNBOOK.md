# Practice Lab operator runbook

Run commands from `practice-lab/`. Preserve the R4 public-site baseline before and after every hosting write.

## Deploy to staging

```powershell
node scripts/capture-r4-http.mjs --chunk 12 --label pre-deploy
pnpm verify
pnpm audit:lighthouse
pnpm build:staging
pnpm deploy:staging
pnpm status:staging
pnpm api:test:staging
pnpm ui:test:staging
node scripts/capture-r4-http.mjs --chunk 12 --label post-deploy
```

The ignored `.env` holds the staging gate and release-control values. The ignored `.deploy.env` may hold short-lived upload values and must be removed immediately after deployment. Activation is an atomic `.current` pointer rename.

## Deploy to production

Production is locked until the separately authorized Chunk 13. In that chunk only, capture R4, complete the release checklist, and run:

```powershell
pnpm deploy:production -- --i-approve-production
```

Then rerun health, smoke, canonical, robots, cache, rollback-retention, and R4 comparisons. Never use that flag during CRE-57.

## Roll back staging

```powershell
pnpm rollback:staging
pnpm status:staging
pnpm api:test:staging
pnpm ui:test:staging
```

The controller atomically selects the previous retained immutable release. Do not edit an active release in place.

## Purge cache

Staging and the API are `no-store`; purge is normally unnecessary. For production HTML/CDN cache, open Hostinger hPanel → Websites → `testheon.com` → Dashboard → Performance → Cache Manager → Purge All. Leave hashed immutable assets untouched, then verify the release ID and required response headers with the deployment status and smoke commands.

## Reset a Lab sandbox

Create a fresh header-mode session and reset only that sandbox:

```powershell
$origin = $env:PRACTICE_LAB_API_BASE_URL.TrimEnd('/')
$pair = "$($env:PRACTICE_LAB_STAGING_HTTP_USER):$($env:PRACTICE_LAB_STAGING_HTTP_PASSWORD)"
$basic = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes($pair))
$session = Invoke-RestMethod -Method Post -Uri "$origin/practice/api/v1/lab/session?expiresIn=120" -Headers @{ Authorization = "Basic $basic"; 'X-Lab-Mode' = 'header' }
Invoke-RestMethod -Method Post -Uri "$origin/practice/api/v1/lab/reset" -Headers @{ Authorization = "Basic $basic"; 'X-Lab-Session' = $session.data.sessionId } -ContentType 'application/json' -Body '{}'
```

This increments the session generation and removes only that Lab session's overlays, uploads, auth state, cart, orders, and one-shot scenarios.

## Regenerate the seed and contracts

```powershell
pnpm api:generate
pnpm api:validate
pnpm unit
```

Review the generated JSON and OpenAPI diff. If observable fixture behavior changes, follow the fixture version and changelog procedure in `CONTRIBUTING.md`.

## Add a challenge

Edit `content/challenges/challenges.json` with a unique ID and slug, a registered fixture ID, three progressive hints, expected result, solution, guide, and downloads where applicable. Then run:

```powershell
pnpm challenges:generate
pnpm challenges:validate
pnpm downloads:build
pnpm unit
pnpm e2e
```

Keep the catalogue distribution rules green and use only synthetic data.

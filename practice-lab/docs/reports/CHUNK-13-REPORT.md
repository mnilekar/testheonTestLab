# CHUNK 13 — Production go-live and verification

**Issue:** CRE-58
**Status:** PASS — production go-live and verification complete
**Approved WordPress changes:** none

## 1. Authorisation and scope

Mayur explicitly authorised the isolated Practice Lab production release. The only production deployment target was `https://testheon.com/practice/`. No WordPress post, page, theme, plugin, setting, database content, root `.htaccess`, or root `index.php` was changed.

## 2. Release source and CI

- Source branch: `codex/cre-58-production-go-live`
- Release source commit: `0f1c076`
- GitHub Actions run: [38430195020](https://github.com/mnilekar/testheonTestLab/actions/runs/38430195020) — passed
- Production release: `20261013T190710Z-47516d`
- Immutable release SHA-256: `3af8e8251f64c63a2400eef18a5afcb8efcdf4d7565f21a4cbc6dfbb39312505`

## 3. Pre-flight

- The CI gate was green on the release commit.
- Staging had been verified and its final rollback drill moved from `20261013T145340Z-13732b` to `20261013T143700Z-ca26e0`, then restored to `20261013T145340Z-13732b`.
- The fresh post-deployment R4 HTTP capture passed for the homepage plus ten established blog routes with canonical URLs intact. See `docs/evidence/chunk-13/post-deploy/http-baseline.json`.

## 4. Backup

Hostinger showed an automated daily backup with latest timestamp `2026-10-12 21:13`. No existing server configuration was touched, so no separate file backup was needed.

## 5. Deployment

The atomic production deploy completed and the token-protected controller verified that `20261013T190710Z-47516d` is active at `https://testheon.com/practice/`.

The retained release list reported by the controller is `20261013T161557Z-d82014`, `20261013T190154Z-68ff7b`, and `20261013T190710Z-47516d`. The active release is the final one above. The deployment runtime refuses activation of releases missing required static/API artifacts.

## 6. Production functionality and API verification

Passed checks:

- 10/10 indexable Lab routes returned 200 with the expected production canonical, `index,follow` robots meta, one H1, breadcrumbs, SEO attributes, and raw internal HTML links.
- `/practice/sitemap.xml` returned XML with exactly those 10 indexable URLs.
- `/practice/api/v1/health` returned 200 with `Cache-Control: no-store, private`, `X-Robots-Tag: noindex, nofollow`, and `X-LiteSpeed-Cache-Control: no-cache`.
- The versioned OpenAPI endpoint returned 200.
- 18 applicable browser smoke tests passed against production. Staging-only SEO tests were intentionally excluded because production is indexable.
- All 29 production API tests passed, including CRUD, reset, auth/session isolation, upload hardening, ecommerce flows, and sandbox isolation.

Evidence:

- `docs/evidence/chunk-13/post-deploy/production-seo-contract.json`
- `docs/evidence/chunk-13/post-deploy/production-public-verification.json`

## 7. Cache and API isolation

The Lab-local API runtime applies `no-store, private` and LiteSpeed `no-cache` headers under `/practice/api/`. No whole-site cache purge or WordPress cache/plugin configuration was changed.

## 8. WordPress untouched proof

The post-deploy R4 capture passed for the root homepage and ten existing blog routes. The production root hashes exactly match the required baseline:

- `.htaccess`: `c6c357f7b87efa4bc48decfb540fbac84102cf35fe6eaea3b4f9676e1aa8c2f1`
- `index.php`: `f28abf68c57cde4c6f496240ce93a5d113b0a55363cde7b67e55313fef9ce981`

See `docs/evidence/chunk-13/post-deploy/root-routing.json` and `http-baseline.json`.

The existing root `robots.txt` remains served. Its advertised `sitemap_index.xml` currently returns the pre-existing WordPress 404; it was not altered in this chunk because approved WordPress changes were `none`.

## 9. Rollback procedure

Do not run rollback while the release is healthy. If a verified production failure requires it, use a fresh control token and execute:

```powershell
pnpm rollback:production -- --i-approve-production
```

from `practice-lab` with the reviewed production environment values. The controller atomically switches `practice/.current` to the prior retained valid release; it does not modify WordPress.

## 10. Lighthouse hub audit

The user completed the required Chrome DevTools mobile Lighthouse navigation audit against `https://testheon.com/practice/` after restoring the main-domain Hostinger CDN security level to **Medium**. The result passed every required category:

- Performance: **97**
- Accessibility: **100**
- Best Practices: **100**
- SEO: **100**

The supplied DevTools evidence is `docs/evidence/chunk-13/post-deploy/lighthouse-hub-manual-medium.png` (SHA-256 `93c24d876148714fe78ab98f24b55ca398fde9f11183dac2c27f5e73322cc828`).

### CLI diagnostic record

The automated headless Lighthouse client received an edge HTTP 403 before scoring at Medium (`2026-10-14T04:11:56.992Z`) and during a temporary Low-level diagnostic run (`2026-10-14T04:18:43.580Z`). The associated evidence is `lighthouse-hub-mobile.json`, `lighthouse-hub-medium-security.json`, and `lighthouse-hub-low-security.json`. Hostinger independently recorded a 200 origin response for `/practice/`, and the browser/API/SEO contracts above passed.

This is an automation-request discrepancy, not a user-visible production failure: Chrome DevTools Lighthouse passed at the normal Medium security level. The CDN security level remains Medium; no WordPress, root-routing, or cache configuration was weakened or changed.

## 11. Remaining human/admin action

None for CRE-58. A future operational follow-up may ask Hostinger to investigate the headless Lighthouse 403 if repeatable CLI Lighthouse automation is required; it is not needed for this verified production release.

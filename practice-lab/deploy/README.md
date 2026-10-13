# Release contract

The Hostinger-compatible staging wrapper treats every Astro build as immutable.

- `practice/releases/<UTC release id>-<nonce>/` contains a complete verified build.
- `practice/.current` contains one validated release ID.
- `practice/__release-control.php` writes a temporary pointer and replaces `.current` with same-directory PHP `rename`, which is the atomic equivalent available without SSH.
- The controller requires both the staging Basic Auth gate and a separate high-entropy control header; it accepts only status, activate and rollback actions.
- Release files, the gate configuration and the pointer are denied as direct web paths.
- The router serves the selected release at `/practice/`, including assets and the Lab-scoped 404.
- Staging HTML contains `noindex,nofollow`; every response adds `X-Robots-Tag: noindex, nofollow` and `Cache-Control: no-store, private`.
- The newest three valid releases are retained. Cleanup cannot traverse outside the validated release directory.
- `pnpm rollback:staging` selects the previous retained release and uses the same atomic pointer update.
- Deployment never reads or writes WordPress files, configuration, credentials or data.

Hostinger TUS upload credentials are short-lived and live only in ignored `.deploy.env` during deployment. The durable review password and release-control token live in ignored `.env`. Neither file is committed or printed.

## Production isolation

The production transport is available only in the authorized Chunk 13 flow. Its mapping is separate from staging and accepts only destinations below `practice/`, which resolves to `public_html/practice/` on `testheon.com`. It cannot upload a root `.htaccess`, root `index.php`, WordPress file, theme, plugin, database configuration, or content file.

Production uses the same immutable release directory and atomic `.current` pointer model. It has no Basic Auth gate, serves production index/noindex policy from the built artifacts, and protects release control with a high-entropy header token. API responses remain `no-store` and `noindex`; the static page router sends an `X-Robots-Tag` only for HTML artifacts whose built robots policy is noindex.

## Practice API runtime

The stable `/practice/api/index.php` front controller loads the API runtime, fixture seed, and OpenAPI document from the same immutable release selected by `practice/.current`. Rollback therefore switches the static site and API as one unit. Mutable synthetic overlays live in a mode-0700 SQLite directory derived outside the subdomain document root. The runtime uses prepared PDO statements, short transactions, a 250 ms busy timeout, per-session/global caps, no-store headers, and never imports WordPress.

The stable CLI-only cleanup wrapper is:

```text
/home/u652010987/domains/testheon.com/public_html/practice-staging/practice/_api-maintenance/cleanup.php
```

Schedule it every five minutes with the Hostinger PHP CLI. Direct HTTP access to `_api-maintenance`, release sources, the release pointer, and the staging gate is denied. Cleanup output contains aggregate counts only.

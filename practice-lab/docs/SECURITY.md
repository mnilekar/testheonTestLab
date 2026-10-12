# Practice Lab security model

## Boundary

The Practice Lab is a standalone Astro site and a small PHP 8.3/PDO SQLite API. It uses only synthetic, session-isolated data. It never loads WordPress, queries WordPress tables, uses WordPress identities, reads `wp-config.php`, exposes `/wp-admin`, or stores WordPress or Hostinger credentials. Staging stays behind Basic authentication, a signed gate cookie, and `noindex,nofollow`.

## Browser controls

- Static responses set `X-Content-Type-Options: nosniff`, a restrictive `Referrer-Policy`, and a CSP limited to same-origin assets and connections.
- The Practice CSP uses `frame-ancestors 'self'` because same-origin frames are a documented fixture. The API uses `frame-ancestors 'none'`.
- Staging and every API response use `Cache-Control: no-store, private`; a production build gives only hashed assets a one-year immutable cache policy.
- HTML keeps one canonical. Staging adds both robots meta and `X-Robots-Tag` blocks.

## API controls

All mutable data is scoped to opaque short-lived Lab sessions in a private mode-0700 directory outside the public document root. SQL uses prepared statements and bounded page, body, search, delay, file, session, record, and storage limits. Cookie mutations require same-origin and CSRF validation. Real per-origin rate limits remain separate from deterministic simulated rate-limit fixtures.

Uploads use an allowlist, MIME and content validation, random private filenames, byte/session quotas, expiry, non-executable storage, and attachment-only downloads. Traversal, double-extension PHP, HTML, active SVG, oversized files, malformed JSON, and injection strings have executable regression tests.

## Supply chain and release checks

```powershell
pnpm install --frozen-lockfile
pnpm audit --audit-level high
pnpm audit:security
pnpm unit
pnpm api:test:staging
```

`audit:security` rejects secret patterns, private keys, WordPress internals, server files, databases, logs, and configuration artifacts from `dist`. CI repeats the dependency audit and every security contract. Immutable releases are uploaded to a new directory and activated by an atomic same-filesystem pointer rename; rollback selects a retained prior release.

## Reporting

Report a suspected real issue privately to the site owner with the affected Lab route, request ID, reproduction steps, and whether the behavior is outside a visibly marked practice fixture. Do not test WordPress, hosting control panels, production data, other accounts, or third-party systems. Simulated vulnerabilities and expected error routes are documented fixtures, not reportable real vulnerabilities.

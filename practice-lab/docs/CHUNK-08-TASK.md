# Chunk 08 Task — Authentication, sessions, roles and API auth

Source: [CRE-53 — PL-08](https://linear.app/creaditcardandlounge-website/issue/CRE-53/pl-08-authentication-sessions-roles-and-api-auth)  
Checked out: 2026-09-29

## Scope

1. Build the noindex `/practice/apps/auth/` sandbox with login, logout, registration, Practice Inbox reset, password change, remember-me, lockout and deterministic slow-user behavior.
2. Publish eight public synthetic demo accounts using the fake shared password `Practice@123`, completely separate from WordPress identity and credentials.
3. Implement HttpOnly sessions, readable UI preferences, localStorage access tokens, sessionStorage wizard state, configurable idle expiry, server invalidation and storage-state reuse.
4. Publish and enforce the Customer, Employee, Manager, Admin and Read-only permission matrix with correct 401/403, hidden and disabled control exercises.
5. Add bearer/refresh tokens, the public demo API key, cookie-authorized API calls, OpenAPI updates, an indexable Playwright authentication lesson and executable starter tests.
6. Verify protected/noindex staging, R4 production evidence and WordPress isolation, write `CHUNK-08-REPORT.md`, then stop before CRE-54.

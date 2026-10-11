# Chunk 10 URL and indexing map

The catalogue is the only new production-indexable URL in Chunk 10. All challenge detail pages start as `NOINDEX,FOLLOW` until their explanatory content is expanded and individually approved. Protected staging overrides every route to `noindex,nofollow`. Download responses also receive `X-Robots-Tag: noindex, nofollow`.

| URL | Production policy | Purpose |
| --- | --- | --- |
| `/practice/challenges/` | INDEX,FOLLOW | Static challenge catalogue and filters |
| `/practice/challenges/login-standard-user-dashboard/` | NOINDEX,FOLLOW | PW-AUTH-001: Log in as standard_user and verify the dashboard |
| `/practice/challenges/locate-primary-action-by-role/` | NOINDEX,FOLLOW | PW-LOC-001: Locate the primary action by role |
| `/practice/challenges/fill-labelled-profile-fields/` | NOINDEX,FOLLOW | PW-LOC-002: Fill a profile with label locators |
| `/practice/challenges/assert-registration-validation/` | NOINDEX,FOLLOW | PW-FORM-001: Assert registration validation |
| `/practice/challenges/find-employee-table-row/` | NOINDEX,FOLLOW | PW-TBL-001: Find one employee row |
| `/practice/challenges/verify-product-stock/` | NOINDEX,FOLLOW | PW-ECOM-001: Verify product stock |
| `/practice/challenges/accept-native-alert/` | NOINDEX,FOLLOW | PW-DLG-001: Accept a native alert |
| `/practice/challenges/wait-for-delayed-text/` | NOINDEX,FOLLOW | PW-WAIT-001: Wait for delayed text |
| `/practice/challenges/buy-laptop-under-50000/` | NOINDEX,FOLLOW | PW-ECOM-002: Add a laptop under ₹50,000 to the cart |
| `/practice/challenges/sort-filter-employees/` | NOINDEX,FOLLOW | PW-TBL-002: Sort and filter employees |
| `/practice/challenges/synchronise-loading-indicator/` | NOINDEX,FOLLOW | PW-WAIT-002: Synchronise with a loading indicator |
| `/practice/challenges/submit-nested-frame-form/` | NOINDEX,FOLLOW | PW-FRM-001: Submit a nested frame form |
| `/practice/challenges/upload-customer-csv/` | NOINDEX,FOLLOW | PW-FILE-001: Upload a valid CSV |
| `/practice/challenges/reuse-storage-state/` | NOINDEX,FOLLOW | PW-AUTH-002: Reuse authenticated storage state |
| `/practice/challenges/create-and-fetch-user-api/` | NOINDEX,FOLLOW | PW-API-001: Create and fetch a user through the API |
| `/practice/challenges/mock-empty-catalogue/` | NOINDEX,FOLLOW | PW-NET-001: Mock an empty catalogue |
| `/practice/challenges/submit-browser-prompt/` | NOINDEX,FOLLOW | PW-DLG-002: Submit a browser prompt |
| `/practice/challenges/create-customer-api-verify-table/` | NOINDEX,FOLLOW | PW-APIUI-001: Create a customer through API and verify the UI table |
| `/practice/challenges/verify-forbidden-role/` | NOINDEX,FOLLOW | PW-AUTH-003: Verify a role-based 403 |
| `/practice/challenges/checkout-and-verify-order-api/` | NOINDEX,FOLLOW | PW-ECOM-003: Checkout and verify the order API |
| `/practice/challenges/modify-product-response/` | NOINDEX,FOLLOW | PW-NET-002: Modify a product response |
| `/practice/challenges/reject-active-svg-upload/` | NOINDEX,FOLLOW | PW-FILE-002: Reject active SVG content |
| `/practice/challenges/debug-hidden-race/` | NOINDEX,FOLLOW | PW-DBG-001: Debug a hidden race condition |
| `/practice/challenges/debug-wrong-locator/` | NOINDEX,FOLLOW | PW-DBG-002: Debug a wrong locator |
| `/practice/challenges/debug-unhandled-dialog/` | NOINDEX,FOLLOW | PW-DBG-003: Debug an unhandled dialog |
| `/practice/challenges/api-auth-session-and-orders-500/` | NOINDEX,FOLLOW | PW-AUTH-004: Authenticate by API, reuse session, and handle orders 500 |
| `/practice/challenges/prove-sandbox-isolation-reset/` | NOINDEX,FOLLOW | PW-API-002: Prove API sandbox isolation and reset |
| `/practice/challenges/recover-from-malformed-store-response/` | NOINDEX,FOLLOW | PW-ECOM-004: Recover from malformed store data |
| `/practice/downloads/playwright-ts-starter.zip` | X-Robots noindex | Complete TypeScript starter |
| `/practice/downloads/playwright-python-starter.zip` | X-Robots noindex | Python README and 3 examples |
| `/practice/downloads/playwright-java-starter.zip` | X-Robots noindex | Java README and 3 examples |
| `/practice/downloads/test-cases/ecommerce.json` | X-Robots noindex | Ecommerce cases in JSON |
| `/practice/downloads/test-cases/ecommerce.csv` | X-Robots noindex | Ecommerce cases in CSV |
| `/practice/downloads/test-cases/ecommerce.md` | X-Robots noindex | Ecommerce cases in Markdown |

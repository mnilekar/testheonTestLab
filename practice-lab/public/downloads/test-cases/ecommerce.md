# Testheon Store functional test cases

Generated from `content/test-cases/ecommerce.json`. Total: **50**.

| ID | Title | Priority | Automation | Expected result |
| --- | --- | --- | --- | --- |
| ECOM-LOGIN-001 | Sign in during checkout | Critical | yes | Checkout becomes available and the guest cart remains unchanged. |
| ECOM-LOGIN-002 | Reject an incorrect checkout password | High | yes | A generic AUTHENTICATION_FAILED message appears and checkout remains locked. |
| ECOM-LOGIN-003 | Preserve guest cart across login | Critical | yes | The same product, quantity, variant, and totals remain in the summary. |
| ECOM-LOGIN-004 | Require login for order history | High | yes | The page shows an assertion-ready 401 state and a checkout sign-in link. |
| ECOM-LOGIN-005 | Show authenticated profile | Medium | yes | Username, Customer role, synthetic email, and order count are visible. |
| ECOM-CATALOG-001 | Load featured products | High | yes | Six or fewer highest-rated in-stock products render with stable IDs. |
| ECOM-CATALOG-002 | Search catalogue by product name | High | yes | Every rendered card contains the requested search term. |
| ECOM-CATALOG-003 | Search catalogue by SKU | Medium | yes | The matching product appears without unrelated results. |
| ECOM-CATALOG-004 | Filter catalogue by category | High | yes | Only Electronics cards render and the total count updates. |
| ECOM-CATALOG-005 | Filter by price range | High | yes | Every product price is within the inclusive range. |
| ECOM-CATALOG-006 | Filter by minimum rating | Medium | yes | No rendered rating is below four. |
| ECOM-CATALOG-007 | Sort price low to high | High | yes | Rendered prices are in ascending order. |
| ECOM-CATALOG-008 | Sort price high to low | High | yes | Rendered prices are in descending order. |
| ECOM-CATALOG-009 | Navigate catalogue pagination | High | yes | Page labels and products change without duplicate rows. |
| ECOM-CATALOG-010 | Render no-results state | Medium | yes | An explicit empty state replaces product cards without an error. |
| ECOM-PRODUCT-001 | Display product images and alt text | Medium | yes | Three local images render with product-specific accessible alt text. |
| ECOM-PRODUCT-002 | Display variants | Medium | yes | Published colour and pack choices are available. |
| ECOM-PRODUCT-003 | Add selected quantity and variant | Critical | yes | The cart records the exact product, quantity, and variant. |
| ECOM-PRODUCT-004 | Show stock status | Medium | yes | Visible stock text matches the API stock field. |
| ECOM-PRODUCT-005 | Display fictional reviews | Low | yes | Two clearly synthetic reviews show author, rating, and text. |
| ECOM-CART-001 | Add product from listing | Critical | yes | The cart count increments and the item appears in the cart. |
| ECOM-CART-002 | Update cart quantity | Critical | yes | Line total, item count, subtotal, and total update through the API. |
| ECOM-CART-003 | Remove cart item | High | yes | The row disappears and totals are recalculated. |
| ECOM-CART-004 | Apply TESTHEON10 coupon | Critical | yes | A ten-percent discount is persisted and displayed. |
| ECOM-CART-005 | Reject expired EXPIRED20 coupon | High | yes | The UI displays COUPON_EXPIRED with HTTP 409. |
| ECOM-CART-006 | Reject unknown INVALID coupon | High | yes | The UI displays COUPON_UNKNOWN with HTTP 404. |
| ECOM-CART-007 | Render empty cart state | Medium | yes | An explicit empty-cart message appears and count becomes zero. |
| ECOM-CART-008 | Keep cart isolated by session | Critical | yes | The second session has no items from the browser session. |
| ECOM-CART-009 | Reset store data | Critical | yes | Products and orders return to seed while cart, coupon, and pending scenario clear. |
| ECOM-CHECKOUT-001 | Load dependent address options | High | yes | Country, State, and City enable in order using the locations endpoint. |
| ECOM-CHECKOUT-002 | Calculate standard shipping | High | yes | The order includes a ₹99 shipping cost. |
| ECOM-CHECKOUT-003 | Calculate express shipping | High | yes | The order includes a ₹249 shipping cost. |
| ECOM-CHECKOUT-004 | Accept successful fake card | Critical | yes | A confirmed synthetic order is created with charged=false. |
| ECOM-CHECKOUT-005 | Decline fake failure card | Critical | yes | PAYMENT_DECLINED appears and no order is created. |
| ECOM-CHECKOUT-006 | Reject unpublished card number | High | yes | PAYMENT_TEST_DATA_INVALID appears and no external request occurs. |
| ECOM-CHECKOUT-007 | Validate required address | High | yes | Native required validation blocks the checkout request. |
| ECOM-CHECKOUT-008 | Reject empty cart checkout | Critical | yes | CART_EMPTY returns HTTP 409 and no order is created. |
| ECOM-CHECKOUT-009 | Assert checkout request payload | High | yes | Address, shippingMethod, and fake payment fields match the UI values. |
| ECOM-CHECKOUT-010 | Show confirmation order ID | Critical | yes | Confirmation displays the exact API order ID and no-charge message. |
| ECOM-ORDER-001 | List current customer orders | High | yes | The new order row shows ID, status, item count, total, and date. |
| ECOM-ORDER-002 | Verify UI order through API | Critical | yes | API fields match the confirmation and submitted cart items. |
| ECOM-ORDER-003 | Reflect API order deletion | High | yes | The deleted order row is absent. |
| ECOM-ORDER-004 | Keep orders scoped to identity | Critical | yes | The second customer cannot see the first customer order. |
| ECOM-NETWORK-001 | Mock catalogue response | High | yes | The supplied product renders with its mocked values. |
| ECOM-NETWORK-002 | Modify catalogue response | High | yes | The modified name renders without changing server data. |
| ECOM-NETWORK-003 | Abort catalogue request | High | yes | A visible request-failed state appears and controls remain usable. |
| ECOM-NETWORK-004 | Handle one-shot 500 | High | yes | STORE_SIMULATED_500 appears once; the following request succeeds. |
| ECOM-NETWORK-005 | Handle deterministic timeout | High | yes | The frontend shows REQUEST_TIMEOUT after its bounded client wait. |
| ECOM-NETWORK-006 | Handle malformed JSON | High | yes | MALFORMED_JSON appears without an uncaught page error. |
| ECOM-NETWORK-007 | Handle empty array | Medium | yes | The UI renders its explicit EMPTY_ARRAY state. |

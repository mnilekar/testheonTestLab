import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const areas = {
  LOGIN: {
    route: '/practice/apps/ecommerce/checkout/',
    precondition: 'A guest Lab session exists and the checkout page is open.',
  },
  CATALOG: {
    route: '/practice/apps/ecommerce/products/',
    precondition: 'The store sandbox contains its deterministic product seed.',
  },
  PRODUCT: {
    route: '/practice/apps/ecommerce/product/?id=prd-001',
    precondition: 'Product prd-001 exists in the current store sandbox.',
  },
  CART: {
    route: '/practice/apps/ecommerce/cart/',
    precondition: 'The current Lab session has an available guest cart.',
  },
  CHECKOUT: {
    route: '/practice/apps/ecommerce/checkout/',
    precondition: 'The guest cart contains an in-stock product.',
  },
  ORDER: {
    route: '/practice/apps/ecommerce/orders/',
    precondition: 'standard_user is signed in to the current Lab session.',
  },
  NETWORK: {
    route: '/practice/apps/ecommerce/',
    precondition: 'The Store overview is open in an isolated Lab session.',
  },
};

const definitions = [
  [
    'ECOM-LOGIN-001',
    'Sign in during checkout',
    'Submit standard_user and the shared practice password.',
    'Checkout becomes available and the guest cart remains unchanged.',
    'Critical',
    'yes',
  ],
  [
    'ECOM-LOGIN-002',
    'Reject an incorrect checkout password',
    'Submit standard_user with an incorrect password.',
    'A generic AUTHENTICATION_FAILED message appears and checkout remains locked.',
    'High',
    'yes',
  ],
  [
    'ECOM-LOGIN-003',
    'Preserve guest cart across login',
    'Add a product as guest, then sign in from checkout.',
    'The same product, quantity, variant, and totals remain in the summary.',
    'Critical',
    'yes',
  ],
  [
    'ECOM-LOGIN-004',
    'Require login for order history',
    'Open order history without an auth session.',
    'The page shows an assertion-ready 401 state and a checkout sign-in link.',
    'High',
    'yes',
  ],
  [
    'ECOM-LOGIN-005',
    'Show authenticated profile',
    'Sign in as standard_user and open Profile.',
    'Username, Customer role, synthetic email, and order count are visible.',
    'Medium',
    'yes',
  ],

  [
    'ECOM-CATALOG-001',
    'Load featured products',
    'Open the Store overview.',
    'Six or fewer highest-rated in-stock products render with stable IDs.',
    'High',
    'yes',
  ],
  [
    'ECOM-CATALOG-002',
    'Search catalogue by product name',
    'Enter part of a seeded product name and apply filters.',
    'Every rendered card contains the requested search term.',
    'High',
    'yes',
  ],
  [
    'ECOM-CATALOG-003',
    'Search catalogue by SKU',
    'Enter a seeded SKU and apply filters.',
    'The matching product appears without unrelated results.',
    'Medium',
    'yes',
  ],
  [
    'ECOM-CATALOG-004',
    'Filter catalogue by category',
    'Choose Electronics and apply filters.',
    'Only Electronics cards render and the total count updates.',
    'High',
    'yes',
  ],
  [
    'ECOM-CATALOG-005',
    'Filter by price range',
    'Set minimum 1000 and maximum 5000, then apply filters.',
    'Every product price is within the inclusive range.',
    'High',
    'yes',
  ],
  [
    'ECOM-CATALOG-006',
    'Filter by minimum rating',
    'Choose 4+ stars and apply filters.',
    'No rendered rating is below four.',
    'Medium',
    'yes',
  ],
  [
    'ECOM-CATALOG-007',
    'Sort price low to high',
    'Select price low to high.',
    'Rendered prices are in ascending order.',
    'High',
    'yes',
  ],
  [
    'ECOM-CATALOG-008',
    'Sort price high to low',
    'Select price high to low.',
    'Rendered prices are in descending order.',
    'High',
    'yes',
  ],
  [
    'ECOM-CATALOG-009',
    'Navigate catalogue pagination',
    'Load page one, select Next, then Previous.',
    'Page labels and products change without duplicate rows.',
    'High',
    'yes',
  ],
  [
    'ECOM-CATALOG-010',
    'Render no-results state',
    'Search for a string absent from all synthetic products.',
    'An explicit empty state replaces product cards without an error.',
    'Medium',
    'yes',
  ],

  [
    'ECOM-PRODUCT-001',
    'Display product images and alt text',
    'Open a seeded product detail page.',
    'Three local images render with product-specific accessible alt text.',
    'Medium',
    'yes',
  ],
  [
    'ECOM-PRODUCT-002',
    'Display variants',
    'Inspect the Variant control.',
    'Published colour and pack choices are available.',
    'Medium',
    'yes',
  ],
  [
    'ECOM-PRODUCT-003',
    'Add selected quantity and variant',
    'Choose a variant, set quantity two, and add to cart.',
    'The cart records the exact product, quantity, and variant.',
    'Critical',
    'yes',
  ],
  [
    'ECOM-PRODUCT-004',
    'Show stock status',
    'Open an in-stock seeded product.',
    'Visible stock text matches the API stock field.',
    'Medium',
    'yes',
  ],
  [
    'ECOM-PRODUCT-005',
    'Display fictional reviews',
    'Open product details and inspect reviews.',
    'Two clearly synthetic reviews show author, rating, and text.',
    'Low',
    'yes',
  ],

  [
    'ECOM-CART-001',
    'Add product from listing',
    'Select Add to cart on an in-stock listing card.',
    'The cart count increments and the item appears in the cart.',
    'Critical',
    'yes',
  ],
  [
    'ECOM-CART-002',
    'Update cart quantity',
    'Change an item quantity from one to three.',
    'Line total, item count, subtotal, and total update through the API.',
    'Critical',
    'yes',
  ],
  [
    'ECOM-CART-003',
    'Remove cart item',
    'Select Remove for one cart row.',
    'The row disappears and totals are recalculated.',
    'High',
    'yes',
  ],
  [
    'ECOM-CART-004',
    'Apply TESTHEON10 coupon',
    'Enter TESTHEON10 and apply.',
    'A ten-percent discount is persisted and displayed.',
    'Critical',
    'yes',
  ],
  [
    'ECOM-CART-005',
    'Reject expired EXPIRED20 coupon',
    'Enter EXPIRED20 and apply.',
    'The UI displays COUPON_EXPIRED with HTTP 409.',
    'High',
    'yes',
  ],
  [
    'ECOM-CART-006',
    'Reject unknown INVALID coupon',
    'Enter INVALID and apply.',
    'The UI displays COUPON_UNKNOWN with HTTP 404.',
    'High',
    'yes',
  ],
  [
    'ECOM-CART-007',
    'Render empty cart state',
    'Remove every item from the cart.',
    'An explicit empty-cart message appears and count becomes zero.',
    'Medium',
    'yes',
  ],
  [
    'ECOM-CART-008',
    'Keep cart isolated by session',
    'Create a second header-mode Lab session and read its cart.',
    'The second session has no items from the browser session.',
    'Critical',
    'yes',
  ],
  [
    'ECOM-CART-009',
    'Reset store data',
    'Mutate products, add cart items, create an order, then select Reset store data.',
    'Products and orders return to seed while cart, coupon, and pending scenario clear.',
    'Critical',
    'yes',
  ],

  [
    'ECOM-CHECKOUT-001',
    'Load dependent address options',
    'Choose India, Maharashtra, then Pune.',
    'Country, State, and City enable in order using the locations endpoint.',
    'High',
    'yes',
  ],
  [
    'ECOM-CHECKOUT-002',
    'Calculate standard shipping',
    'Choose Standard shipping and submit a valid fake checkout.',
    'The order includes a ₹99 shipping cost.',
    'High',
    'yes',
  ],
  [
    'ECOM-CHECKOUT-003',
    'Calculate express shipping',
    'Choose Express shipping and submit a valid fake checkout.',
    'The order includes a ₹249 shipping cost.',
    'High',
    'yes',
  ],
  [
    'ECOM-CHECKOUT-004',
    'Accept successful fake card',
    'Use 4242 4242 4242 4242, 12/30, and 123.',
    'A confirmed synthetic order is created with charged=false.',
    'Critical',
    'yes',
  ],
  [
    'ECOM-CHECKOUT-005',
    'Decline fake failure card',
    'Use 4000 0000 0000 0002.',
    'PAYMENT_DECLINED appears and no order is created.',
    'Critical',
    'yes',
  ],
  [
    'ECOM-CHECKOUT-006',
    'Reject unpublished card number',
    'Enter a different numeric card value.',
    'PAYMENT_TEST_DATA_INVALID appears and no external request occurs.',
    'High',
    'yes',
  ],
  [
    'ECOM-CHECKOUT-007',
    'Validate required address',
    'Clear Full name and submit.',
    'Native required validation blocks the checkout request.',
    'High',
    'yes',
  ],
  [
    'ECOM-CHECKOUT-008',
    'Reject empty cart checkout',
    'Remove all items, sign in, and submit checkout through the API.',
    'CART_EMPTY returns HTTP 409 and no order is created.',
    'Critical',
    'yes',
  ],
  [
    'ECOM-CHECKOUT-009',
    'Assert checkout request payload',
    'Intercept POST /store/checkout and inspect its JSON body.',
    'Address, shippingMethod, and fake payment fields match the UI values.',
    'High',
    'yes',
  ],
  [
    'ECOM-CHECKOUT-010',
    'Show confirmation order ID',
    'Complete a valid fake checkout.',
    'Confirmation displays the exact API order ID and no-charge message.',
    'Critical',
    'yes',
  ],

  [
    'ECOM-ORDER-001',
    'List current customer orders',
    'Complete checkout and open Order history.',
    'The new order row shows ID, status, item count, total, and date.',
    'High',
    'yes',
  ],
  [
    'ECOM-ORDER-002',
    'Verify UI order through API',
    'Capture the confirmation order ID and GET /orders/{id}.',
    'API fields match the confirmation and submitted cart items.',
    'Critical',
    'yes',
  ],
  [
    'ECOM-ORDER-003',
    'Reflect API order deletion',
    'DELETE the new order through the API and refresh history.',
    'The deleted order row is absent.',
    'High',
    'yes',
  ],
  [
    'ECOM-ORDER-004',
    'Keep orders scoped to identity',
    'Create an order as standard_user and read history as another customer.',
    'The second customer cannot see the first customer order.',
    'Critical',
    'yes',
  ],

  [
    'ECOM-NETWORK-001',
    'Mock catalogue response',
    'Use page.route to fulfil /store/catalog with one known product.',
    'The supplied product renders with its mocked values.',
    'High',
    'yes',
  ],
  [
    'ECOM-NETWORK-002',
    'Modify catalogue response',
    'Fetch the real response, replace one product name, and fulfil it.',
    'The modified name renders without changing server data.',
    'High',
    'yes',
  ],
  [
    'ECOM-NETWORK-003',
    'Abort catalogue request',
    'Abort /store/catalog from page.route.',
    'A visible request-failed state appears and controls remain usable.',
    'High',
    'yes',
  ],
  [
    'ECOM-NETWORK-004',
    'Handle one-shot 500',
    'Arm 500 and run the next catalogue request.',
    'STORE_SIMULATED_500 appears once; the following request succeeds.',
    'High',
    'yes',
  ],
  [
    'ECOM-NETWORK-005',
    'Handle deterministic timeout',
    'Arm timeout and run the next catalogue request.',
    'The frontend shows REQUEST_TIMEOUT after its bounded client wait.',
    'High',
    'yes',
  ],
  [
    'ECOM-NETWORK-006',
    'Handle malformed JSON',
    'Arm malformed and run the next catalogue request.',
    'MALFORMED_JSON appears without an uncaught page error.',
    'High',
    'yes',
  ],
  [
    'ECOM-NETWORK-007',
    'Handle empty array',
    'Arm empty and run the next catalogue request.',
    'The UI renders its explicit EMPTY_ARRAY state.',
    'Medium',
    'yes',
  ],
];

const cases = definitions.map(
  ([id, title, action, expectedResult, priority, goodAutomationCandidate]) => {
    const area = id.split('-')[1];
    const defaults = areas[area];
    return {
      id,
      title,
      preconditions: [defaults.precondition],
      steps: [`Open ${defaults.route}`, action],
      expectedResult,
      priority,
      goodAutomationCandidate,
    };
  },
);

function csv(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

export function renderJson() {
  return `${JSON.stringify(
    {
      suite: 'Testheon Store functional test cases',
      version: '1.0.0',
      generatedAt: '2026-09-29',
      caseCount: cases.length,
      cases,
    },
    null,
    2,
  )}\n`;
}

export function renderMarkdown() {
  const rows = cases.map(
    (testCase) =>
      `| ${testCase.id} | ${testCase.title} | ${testCase.priority} | ${testCase.goodAutomationCandidate} | ${testCase.expectedResult.replaceAll('|', '\\|')} |`,
  );
  return `# Testheon Store functional test cases\n\nGenerated from \`content/test-cases/ecommerce.json\`. Total: **${cases.length}**.\n\n| ID | Title | Priority | Automation | Expected result |\n| --- | --- | --- | --- | --- |\n${rows.join('\n')}\n`;
}

export function renderCsv() {
  const header = [
    'id',
    'title',
    'preconditions',
    'steps',
    'expected_result',
    'priority',
    'good_automation_candidate',
  ];
  const rows = cases.map((testCase) =>
    [
      testCase.id,
      testCase.title,
      testCase.preconditions.join(' | '),
      testCase.steps.join(' | '),
      testCase.expectedResult,
      testCase.priority,
      testCase.goodAutomationCandidate,
    ]
      .map(csv)
      .join(','),
  );
  return `${header.join(',')}\n${rows.join('\n')}\n`;
}

export async function writeEcommerceTestCases(root = process.cwd()) {
  const directory = resolve(root, 'content/test-cases');
  await mkdir(directory, { recursive: true });
  const files = {
    'ecommerce.json': renderJson(),
    'ecommerce.md': renderMarkdown(),
    'ecommerce.csv': renderCsv(),
  };
  for (const [name, content] of Object.entries(files)) {
    await writeFile(resolve(directory, name), content, 'utf8');
  }
  return { count: cases.length, files: Object.keys(files) };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const result = await writeEcommerceTestCases();
  console.log(
    `Generated ${result.count} ecommerce cases in JSON, Markdown, and CSV.`,
  );
}

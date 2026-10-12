export interface PracticeLink {
  readonly href: string;
  readonly label: string;
}

export interface IndexPageDefinition {
  readonly path: string;
  readonly title: string;
  readonly description: string;
  readonly lastmod: string;
  readonly objective: string;
  readonly guide: PracticeLink;
  readonly siblings: readonly PracticeLink[];
}

export const indexPages = [
  {
    path: '/',
    title: 'Testheon Practice Lab',
    description:
      'Testheon Practice Lab is a realistic QA automation playground for learning Playwright through stable components, real workflows, and progressive challenges.',
    lastmod: '2026-10-11',
    objective:
      'Choose a Playwright learning route and move from one observable component contract to a repeatable workflow and challenge.',
    guide: {
      href: 'https://testheon.com/playwright-automation/',
      label: 'Read the Playwright automation guide',
    },
    siblings: [
      { href: '/practice/playwright/', label: 'Playwright track' },
      { href: '/practice/components/', label: 'Component Lab' },
      { href: '/practice/challenges/', label: 'Challenge catalogue' },
    ],
  },
  {
    path: '/playwright/',
    title: 'Playwright Practice Track',
    description:
      'Explore the Testheon Playwright practice track: a TypeScript-first path from reliable locators to realistic end-to-end QA workflows.',
    lastmod: '2026-10-11',
    objective:
      'Follow a progressive Playwright path from semantic locators and deterministic waits to API-assisted, session-safe end-to-end testing.',
    guide: {
      href: 'https://testheon.com/playwright-e2e/',
      label: 'Read the Playwright E2E guide',
    },
    siblings: [
      { href: '/practice/playwright/locators/', label: 'Locator practice' },
      { href: '/practice/playwright/waits/', label: 'Wait practice' },
      {
        href: '/practice/playwright/authentication/',
        label: 'Authentication practice',
      },
      {
        href: '/practice/playwright/api-testing/',
        label: 'API testing practice',
      },
    ],
  },
  {
    path: '/playwright/locators/',
    title: 'Playwright Locator Lab',
    description:
      'Choose resilient Playwright locators from user-visible contracts, then practise semantic scoping, filtering, and intentional position selectors.',
    lastmod: '2026-10-11',
    objective:
      'Select the strongest user-facing locator for each target and explain when scoping, filtering, test IDs, or CSS are justified.',
    guide: {
      href: 'https://testheon.com/playwright-locators/',
      label: 'Read the complete locator guide',
    },
    siblings: [
      { href: '/practice/playwright/waits/', label: 'Wait practice' },
      { href: '/practice/components/', label: 'Component Lab' },
      { href: '/practice/challenges/', label: 'Locator challenges' },
    ],
  },
  {
    path: '/playwright/waits/',
    title: 'Playwright Waits Lab',
    description:
      'Practise Playwright auto-waiting and web-first assertions with bounded delays, loading states, API requests, progress, and lazy content.',
    lastmod: '2026-10-11',
    objective:
      'Replace arbitrary sleeps with an assertion or event tied to the exact visible, network, or progress state that completes the workflow.',
    guide: {
      href: 'https://testheon.com/playwright-e2e/',
      label: 'Read the Playwright E2E guide',
    },
    siblings: [
      { href: '/practice/playwright/locators/', label: 'Locator practice' },
      {
        href: '/practice/playwright/authentication/',
        label: 'Authentication practice',
      },
      { href: '/practice/challenges/', label: 'Wait challenges' },
    ],
  },
  {
    path: '/playwright/authentication/',
    title: 'Playwright Authentication Testing',
    description:
      'Learn global setup, storageState, role projects, API login, logout and deterministic expiry testing with the Testheon Authentication Sandbox.',
    lastmod: '2026-10-11',
    objective:
      'Create, validate, reuse, expire, and isolate synthetic authentication state without sharing mutable identities across tests.',
    guide: {
      href: 'https://testheon.com/playwright-authentication/',
      label: 'Read the Playwright authentication guide',
    },
    siblings: [
      {
        href: '/practice/playwright/api-testing/',
        label: 'API testing practice',
      },
      { href: '/practice/apps/auth/', label: 'Authentication sandbox' },
      { href: '/practice/challenges/', label: 'Authentication challenges' },
    ],
  },
  {
    path: '/playwright/api-testing/',
    title: 'Playwright API Testing Practice',
    description:
      'Learn Playwright APIRequestContext with isolated synthetic resources, contract assertions, API setup, UI verification, and deterministic cleanup.',
    lastmod: '2026-10-11',
    objective:
      'Build one owned API lifecycle that creates synthetic state, checks the response contract, verifies the user-visible outcome, and resets cleanly.',
    guide: {
      href: 'https://testheon.com/playwright-api-testing/',
      label: 'Read the Playwright API testing guide',
    },
    siblings: [
      {
        href: '/practice/playwright/authentication/',
        label: 'Authentication practice',
      },
      { href: '/practice/apps/ecommerce/', label: 'Ecommerce workflow' },
      { href: '/practice/challenges/', label: 'API challenges' },
    ],
  },
  {
    path: '/components/',
    title: 'Component Lab for Playwright',
    description:
      'Choose a focused Testheon component fixture, learn its observable contract, and practise reliable Playwright actions and assertions.',
    lastmod: '2026-10-11',
    objective:
      'Choose one component family, understand its stable and intentionally awkward states, and automate only observable behavior.',
    guide: {
      href: 'https://testheon.com/playwright-locators/',
      label: 'Read the Playwright locator guide',
    },
    siblings: [
      { href: '/practice/playwright/locators/', label: 'Locator lesson' },
      { href: '/practice/components/tables/', label: 'Table Lab' },
      { href: '/practice/challenges/', label: 'Component challenges' },
    ],
  },
  {
    path: '/components/tables/',
    title: 'Playwright Table Lab',
    description:
      'Learn reliable Playwright table testing across sorting, filters, pagination, editing, selection, virtualization, and nested data.',
    lastmod: '2026-10-11',
    objective:
      'Automate table behavior through semantic rows, columns, controls, visible state, and API-backed persistence instead of fragile cell positions.',
    guide: {
      href: 'https://testheon.com/playwright-locators/',
      label: 'Read the Playwright locator guide',
    },
    siblings: [
      { href: '/practice/components/', label: 'Component Lab' },
      {
        href: '/practice/playwright/api-testing/',
        label: 'API testing practice',
      },
      { href: '/practice/challenges/', label: 'Table challenges' },
    ],
  },
  {
    path: '/apps/ecommerce/',
    title: 'Testheon Store',
    description:
      'A deterministic ecommerce application for realistic Playwright UI, API, authentication, network, and visual testing practice.',
    lastmod: '2026-10-11',
    objective:
      'Combine catalogue, cart, authentication, checkout, order, API, and network assertions in one resettable synthetic store workflow.',
    guide: {
      href: 'https://testheon.com/playwright-e2e/',
      label: 'Read the Playwright E2E workflow guide',
    },
    siblings: [
      {
        href: '/practice/playwright/api-testing/',
        label: 'API testing practice',
      },
      {
        href: '/practice/playwright/authentication/',
        label: 'Authentication practice',
      },
      { href: '/practice/challenges/', label: 'Ecommerce challenges' },
    ],
  },
  {
    path: '/challenges/',
    title: 'Playwright Challenges',
    description:
      'Choose from 28 Playwright challenges covering locators, UI workflows, APIs, authentication, network mocking, debugging, and ecommerce.',
    lastmod: '2026-10-11',
    objective:
      'Choose a challenge at the right difficulty, attempt it against a stable fixture, then use progressive hints and the solution only as needed.',
    guide: {
      href: 'https://testheon.com/playwright-interview-questions/',
      label: 'Review the Playwright interview guide',
    },
    siblings: [
      { href: '/practice/playwright/', label: 'Playwright track' },
      { href: '/practice/components/', label: 'Component Lab' },
      { href: '/practice/apps/ecommerce/', label: 'Ecommerce workflow' },
    ],
  },
] as const satisfies readonly IndexPageDefinition[];

export function getIndexPage(path: string): IndexPageDefinition {
  const definition = indexPages.find((page) => page.path === path);
  if (!definition) throw new Error(`Missing INDEX page definition for ${path}`);
  return definition;
}

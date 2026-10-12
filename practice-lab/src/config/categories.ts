export interface Category {
  readonly name: string;
  readonly description: string;
  readonly href?: string;
}

export const categories: readonly Category[] = [
  {
    name: 'UI Elements',
    description: 'Stable controls for locator and interaction practice.',
    href: '/practice/components/',
  },
  {
    name: 'Forms',
    description: 'Validation, field states, and realistic submission flows.',
    href: '/practice/components/forms/',
  },
  {
    name: 'Tables',
    description: 'Sorting, filtering, pagination, and resilient assertions.',
    href: '/practice/components/tables/',
  },
  {
    name: 'Authentication',
    description: 'Safe simulated login, roles, and session exercises.',
    href: '/practice/apps/auth/',
  },
  {
    name: 'Windows & Frames',
    description: 'Context, popup, iframe, and nested-frame practice.',
    href: '/practice/components/frames-and-windows/',
  },
  {
    name: 'Files',
    description: 'Controlled upload and download workflows with safe fixtures.',
    href: '/practice/components/files/',
  },
  {
    name: 'API Testing',
    description: 'Real HTTP contracts backed by isolated synthetic data.',
    href: '/practice/playwright/api-testing/',
  },
  {
    name: 'Network Testing',
    description: 'Deterministic request, response, and failure scenarios.',
    href: '/practice/components/browser-context/',
  },
  {
    name: 'Ecommerce',
    description:
      'A believable store that connects UI, API, and network skills.',
    href: '/practice/apps/ecommerce/',
  },
  {
    name: 'Advanced Playwright',
    description:
      'Start with the Playwright track map and its progressive learning path.',
    href: '/practice/playwright/',
  },
  {
    name: 'Challenges',
    description:
      'Scenario-led tasks with starter tests and advanced extensions.',
    href: '/practice/challenges/',
  },
] as const;

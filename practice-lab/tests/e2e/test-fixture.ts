import { expect, test as base } from '@playwright/test';

const usesProtectedStaging = Boolean(process.env.PRACTICE_LAB_BASE_URL);

export const test = base.extend<{ stagingSandbox: undefined }>({
  stagingSandbox: [
    async ({ context }, use) => {
      if (usesProtectedStaging) {
        const response = await context.request.post(
          '/practice/api/v1/lab/session?expiresIn=120',
        );
        if (![200, 201].includes(response.status())) {
          throw new Error(
            `Could not create a short-lived staging sandbox: ${response.status()}.`,
          );
        }
      }
      await use(undefined);
    },
    { auto: true },
  ],
});

export { expect };

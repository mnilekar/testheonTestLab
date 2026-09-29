import { expect, test } from '@playwright/test';

test('grantPermissions and setGeolocation expose a fictional location', async ({
  context,
  page,
}) => {
  await page.goto('/practice/components/browser-context/');
  const origin = new URL(page.url()).origin;
  await context.grantPermissions(['geolocation'], { origin });
  await context.setGeolocation({ latitude: 18.5204, longitude: 73.8567 });
  await page.getByRole('button', { name: 'Read fictional location' }).click();
  await expect(page.getByTestId('geolocation-result')).toContainText(
    'Pune QA Campus',
  );
});

test('setOffline produces a visible network error', async ({
  context,
  page,
}) => {
  await page.goto('/practice/components/browser-context/');
  await context.setOffline(true);
  try {
    await page.getByRole('button', { name: 'Request health endpoint' }).click();
    await expect(page.getByTestId('network-result')).toContainText(
      'Network request failed',
    );
  } finally {
    await context.setOffline(false);
  }
});

test('storageState contains the fixture localStorage entry', async ({
  context,
  page,
}) => {
  await page.goto('/practice/components/browser-context/');
  await page.getByLabel('Local storage value').fill('desktop-4803');
  await page.getByRole('button', { name: 'Write local storage' }).click();
  const state = await context.storageState();
  expect(state.origins.flatMap((origin) => origin.localStorage)).toContainEqual(
    { name: 'practice-local', value: 'desktop-4803' },
  );
});

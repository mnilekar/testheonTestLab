import { expect, test } from '../../tests/e2e/test-fixture';

test('dropdown examples: native, ARIA and dependent API options', async ({
  page,
}) => {
  await page.route('**/practice/api/v1/customers?limit=100', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ data: [{ city: 'Mumbai' }] }),
    }),
  );
  await page.goto('/practice/components/dropdowns/');
  await page.getByLabel('Test environment').selectOption('staging');
  await expect(page.locator('#native-select-result')).toContainText(
    'staging selected',
  );

  const timezone = page.getByRole('combobox', { name: 'Timezone' });
  await timezone.press('ArrowDown');
  await timezone.press('Enter');
  await expect(timezone).toHaveValue('Asia/Kolkata');

  await page.getByRole('button', { name: 'Load API locations' }).click();
  await page.getByLabel('Country').selectOption('India');
  await page.getByLabel('State').selectOption('Maharashtra');
  await page.getByLabel('City').selectOption('Mumbai');
});

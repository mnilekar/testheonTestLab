import { expect, test } from '../../tests/e2e/test-fixture';

test('choice examples: indeterminate, hierarchy and generated radio', async ({
  page,
}) => {
  await page.goto('/practice/components/checkboxes-radios/');
  const selectAll = page.getByLabel('Select all environments');
  await page.getByLabel('Staging').check();
  await expect(selectAll).toHaveJSProperty('indeterminate', true);

  await page.getByLabel('Electronics').check();
  await expect(page.getByLabel('Laptop')).toBeChecked();
  await expect(page.getByLabel('Mobile')).toBeChecked();

  await page.getByRole('button', { name: 'Generate suite options' }).click();
  await page.getByLabel('Regression').check();
  await expect(page.locator('#generated-radio-result')).toContainText(
    'Regression suite selected',
  );
});

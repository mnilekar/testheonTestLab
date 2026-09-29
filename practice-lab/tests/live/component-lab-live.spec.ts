import { expect, test } from '@playwright/test';

test('registration succeeds through the live API and duplicate email returns 409', async ({
  page,
}) => {
  await page.goto('/practice/components/forms/');
  await page.getByLabel('First name').fill('Chunk');
  await page.getByLabel('Last name').fill('Four Learner');
  await page
    .getByLabel('Registration email')
    .fill('chunk-four-learner@example.test');
  await page.getByLabel('Phone').fill('9876543210');
  await page.getByLabel('Password', { exact: true }).fill('Strong4803');
  await page.getByLabel('Confirm password').fill('Strong4803');
  await page.getByLabel('Date of birth').fill('1995-05-12');
  await page.getByLabel('Prefer not to say').check();
  await page.getByLabel('Country').selectOption('India');
  await page.getByLabel('State').selectOption('Maharashtra');
  await page
    .locator('#registration-form')
    .getByLabel('City')
    .selectOption('Mumbai');
  await page.getByLabel('I accept the practice terms').check();
  await page.getByRole('button', { name: 'Create learner account' }).click();
  await expect(page.getByTestId('registration-result')).toContainText(
    'Created users record',
  );
  await page.getByRole('button', { name: 'Create learner account' }).click();
  await expect(page.getByTestId('registration-result')).toContainText(
    'DUPLICATE_RECORD',
  );
});

test('dependent and infinite dropdowns consume the live Chunk 3 API', async ({
  page,
}) => {
  await page.goto('/practice/components/dropdowns/');
  await page.getByRole('button', { name: 'Load API locations' }).click();
  await expect(page.locator('#dependent-result')).toContainText(
    'API cities loaded',
  );
  await page.getByLabel('Country').selectOption('India');
  const availableStates = await page
    .getByLabel('State')
    .locator('option')
    .count();
  expect(availableStates).toBeGreaterThan(1);
  await page.getByRole('button', { name: 'Open product dropdown' }).click();
  await expect(page.locator('#infinite-products [role="option"]')).toHaveCount(
    15,
  );
});

test('live form exposes deterministic simulated server failure and reset', async ({
  page,
}) => {
  await page.goto('/practice/components/forms/');
  await page.getByLabel('Server response simulation').selectOption('503');
  await page.getByLabel('Ticket subject').fill('Synthetic support issue');
  await page.getByLabel('Priority').selectOption('high');
  await page.getByLabel('Category').selectOption('API');
  await page.getByLabel('Details').fill('Controlled failure for CRE-49.');
  await page.getByRole('button', { name: 'Send support ticket' }).click();
  await expect(page.getByTestId('support-result')).toContainText(
    /503|SIMULATED/,
  );
  await page.getByRole('button', { name: 'Reset form sandbox' }).click();
  await expect(page.locator('#sandbox-result')).toContainText(
    'Sandbox reset to seed data',
  );
});

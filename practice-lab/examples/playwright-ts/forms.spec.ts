import { expect, test } from '../../tests/e2e/test-fixture';

test('form examples: client summary, success and duplicate conflict', async ({
  page,
}) => {
  await page.route('**/practice/api/v1/lab/session', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ data: { csrfToken: 'example-csrf' } }),
    }),
  );
  await page.route('**/practice/api/v1/users*', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ data: [{ email: 'existing@example.test' }] }),
      });
      return;
    }
    const body = route.request().postDataJSON() as { email?: string };
    await route.fulfill({
      status: body.email === 'existing@example.test' ? 409 : 201,
      contentType: 'application/json',
      body: JSON.stringify(
        body.email === 'existing@example.test'
          ? {
              error: {
                code: 'DUPLICATE_RECORD',
                message: 'Email exists.',
                details: [{ field: 'email' }],
              },
            }
          : { data: { id: 'usr-example' } },
      ),
    });
  });
  await page.goto('/practice/components/forms/');
  await page.getByRole('button', { name: 'Create learner account' }).click();
  await expect(
    page.locator('#registration-form').getByRole('alert'),
  ).toContainText('Fix');

  await page.getByLabel('First name').fill('Asha');
  await page.getByLabel('Last name').fill('Tester');
  await page.getByLabel('Registration email').fill('asha@example.test');
  await page.getByLabel('Phone').fill('9876543210');
  await page.getByLabel('Password', { exact: true }).fill('Strong4803');
  await page.getByLabel('Confirm password').fill('Strong4803');
  await page.getByLabel('Date of birth').fill('1995-05-12');
  await page.getByLabel('Woman').check();
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
  await page
    .getByRole('button', { name: 'Use an existing synthetic email' })
    .click();
  await page.getByRole('button', { name: 'Create learner account' }).click();
  await expect(page.getByTestId('registration-result')).toContainText(
    'DUPLICATE_RECORD',
  );
});

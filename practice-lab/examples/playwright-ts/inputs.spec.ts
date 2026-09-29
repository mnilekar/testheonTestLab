import { expect, test } from '../../tests/e2e/test-fixture';

test('input examples: labels, debounce and keyboard autocomplete', async ({
  page,
}) => {
  await page.goto('/practice/components/inputs/');
  await page.getByLabel('Work email').fill('learner@example.test');
  await expect(page.getByLabel('Work email')).toHaveValue(
    'learner@example.test',
  );

  await page.getByLabel('Debounced project name').fill('Apollo');
  await expect(page.getByTestId('debounce-result')).toHaveText(
    'Debounced value: Apollo',
  );

  const skill = page.getByRole('combobox', { name: 'Automation skill' });
  await skill.fill('Play');
  await skill.press('ArrowDown');
  await skill.press('Enter');
  await expect(skill).toHaveValue('Playwright automation');
});

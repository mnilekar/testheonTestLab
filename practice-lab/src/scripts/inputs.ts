import { query, queryAll, result } from './fixture-dom';

const password = query<HTMLInputElement>('#account-password');
query<HTMLButtonElement>('#toggle-password').addEventListener(
  'click',
  (event) => {
    const button = event.currentTarget as HTMLButtonElement;
    const showing = password.type === 'text';
    password.type = showing ? 'password' : 'text';
    button.textContent = showing ? 'Show password' : 'Hide password';
    button.setAttribute('aria-pressed', String(!showing));
    result(
      '#password-result',
      showing ? 'Password is hidden.' : 'Password is visible.',
    );
  },
);

query<HTMLInputElement>('#search-input').addEventListener('input', (event) => {
  const value = (event.currentTarget as HTMLInputElement).value.toLowerCase();
  let visible = 0;
  for (const item of queryAll<HTMLElement>('[data-search-item]')) {
    const matches = item.textContent?.toLowerCase().includes(value) ?? false;
    item.hidden = !matches;
    if (matches) visible += 1;
  }
  result(
    '#search-result',
    `${visible} result${visible === 1 ? '' : 's'} visible.`,
  );
});

query<HTMLInputElement>('#phone-mask').addEventListener('input', (event) => {
  const input = event.currentTarget as HTMLInputElement;
  const digits = input.value.replace(/\D/g, '').slice(0, 10);
  input.value =
    digits.length > 5 ? `${digits.slice(0, 5)} ${digits.slice(5)}` : digits;
  result('#mask-result', `${digits.length}/10 phone digits entered.`);
});

query<HTMLInputElement>('#card-mask').addEventListener('input', (event) => {
  const input = event.currentTarget as HTMLInputElement;
  const digits = input.value.replace(/\D/g, '').slice(0, 16);
  input.value = digits.replace(/(.{4})/g, '$1 ').trim();
  result('#card-result', `${digits.length}/16 fake card digits entered.`);
});

const enabledField = query<HTMLInputElement>('#dynamic-field');
query<HTMLInputElement>('#enable-field').addEventListener('change', (event) => {
  const checked = (event.currentTarget as HTMLInputElement).checked;
  enabledField.disabled = !checked;
  result('#dynamic-result', checked ? 'Field enabled.' : 'Field disabled.');
});

query<HTMLButtonElement>('#populate-field').addEventListener('click', () => {
  const input = query<HTMLInputElement>('#populated-field');
  input.value = 'Deterministic value 4803';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  result(
    '#populate-result',
    'Field populated with deterministic data.',
    'success',
  );
});

const validationField = query<HTMLInputElement>('#validation-field');
function validateField(): void {
  const valid = /^[A-Z]{2}-\d{3}$/.test(validationField.value);
  validationField.setAttribute('aria-invalid', String(!valid));
  result(
    '#validation-result',
    valid ? 'Reference accepted.' : 'Use the format QA-123.',
    valid ? 'success' : 'error',
  );
}
validationField.addEventListener('input', validateField);
validationField.addEventListener('blur', validateField);

let debounceTimer = 0;
query<HTMLInputElement>('#debounce-field').addEventListener(
  'input',
  (event) => {
    const value = (event.currentTarget as HTMLInputElement).value;
    window.clearTimeout(debounceTimer);
    result('#debounce-result', 'Waiting for typing to stop…');
    debounceTimer = window.setTimeout(() => {
      result(
        '#debounce-result',
        `Debounced value: ${value || '(empty)'}`,
        'success',
      );
    }, 300);
  },
);

const cities = [
  'Ahmedabad',
  'Bengaluru',
  'Chennai',
  'Delhi',
  'Hyderabad',
  'Mumbai',
  'Pune',
];
const autosuggest = query<HTMLInputElement>('#autosuggest-field');
const autosuggestList = query<HTMLUListElement>('#autosuggest-list');
autosuggest.addEventListener('input', () => {
  const term = autosuggest.value.trim().toLowerCase();
  autosuggestList.replaceChildren();
  if (!term) return;
  for (const city of cities
    .filter((item) => item.toLowerCase().includes(term))
    .slice(0, 5)) {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = city;
    button.addEventListener('click', () => {
      autosuggest.value = city;
      autosuggestList.replaceChildren();
      result('#autosuggest-result', `${city} selected.`, 'success');
    });
    item.append(button);
    autosuggestList.append(item);
  }
});

const skills = [
  'Accessibility testing',
  'API testing',
  'Performance testing',
  'Playwright automation',
];
const autocomplete = query<HTMLInputElement>('#autocomplete-field');
const autocompleteList = query<HTMLDivElement>('#autocomplete-list');
let activeIndex = -1;
let visibleSkills: string[] = [];

function renderAutocomplete(): void {
  const term = autocomplete.value.trim().toLowerCase();
  visibleSkills = skills.filter((skill) => skill.toLowerCase().includes(term));
  activeIndex = visibleSkills.length ? 0 : -1;
  autocompleteList.replaceChildren();
  for (const [index, skill] of visibleSkills.entries()) {
    const option = document.createElement('button');
    option.type = 'button';
    option.id = `skill-option-${index}`;
    option.setAttribute('role', 'option');
    option.setAttribute('aria-selected', String(index === activeIndex));
    option.textContent = skill;
    option.addEventListener('click', () => selectSkill(index));
    autocompleteList.append(option);
  }
  autocomplete.setAttribute('aria-expanded', String(visibleSkills.length > 0));
  if (activeIndex >= 0)
    autocomplete.setAttribute(
      'aria-activedescendant',
      `skill-option-${activeIndex}`,
    );
}

function selectSkill(index: number): void {
  const skill = visibleSkills[index];
  if (!skill) return;
  autocomplete.value = skill;
  autocompleteList.replaceChildren();
  autocomplete.setAttribute('aria-expanded', 'false');
  autocomplete.removeAttribute('aria-activedescendant');
  result(
    '#autocomplete-result',
    `${skill} selected with the combobox.`,
    'success',
  );
}

autocomplete.addEventListener('input', renderAutocomplete);
autocomplete.addEventListener('keydown', (event) => {
  if (!visibleSkills.length) return;
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    const delta = event.key === 'ArrowDown' ? 1 : -1;
    activeIndex =
      (activeIndex + delta + visibleSkills.length) % visibleSkills.length;
    for (const [index, option] of queryAll<HTMLElement>(
      '[role="option"]',
      autocompleteList,
    ).entries()) {
      option.setAttribute('aria-selected', String(index === activeIndex));
    }
    autocomplete.setAttribute(
      'aria-activedescendant',
      `skill-option-${activeIndex}`,
    );
  }
  if (event.key === 'Enter' && activeIndex >= 0) {
    event.preventDefault();
    selectSkill(activeIndex);
  }
});

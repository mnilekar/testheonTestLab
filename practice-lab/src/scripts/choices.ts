import { query, queryAll, result } from './fixture-dom';

query<HTMLInputElement>('#single-checkbox').addEventListener(
  'change',
  (event) => {
    const checked = (event.currentTarget as HTMLInputElement).checked;
    result(
      '#single-choice-result',
      checked ? 'Notifications selected.' : 'Notifications cleared.',
    );
  },
);

for (const checkbox of queryAll<HTMLInputElement>('[name="channels"]')) {
  checkbox.addEventListener('change', () => {
    const selected = queryAll<HTMLInputElement>(
      '[name="channels"]:checked',
    ).map((item) => item.value);
    result(
      '#group-choice-result',
      selected.length
        ? `Selected: ${selected.join(', ')}.`
        : 'No channels selected.',
    );
  });
}

const selectAll = query<HTMLInputElement>('#select-all');
const items = queryAll<HTMLInputElement>('[data-select-item]');
function syncSelectAll(): void {
  const checked = items.filter((item) => item.checked).length;
  selectAll.checked = checked === items.length;
  selectAll.indeterminate = checked > 0 && checked < items.length;
  result(
    '#select-all-result',
    `${checked} of ${items.length} environments selected.`,
  );
}
selectAll.addEventListener('change', () => {
  for (const item of items) item.checked = selectAll.checked;
  syncSelectAll();
});
for (const item of items) item.addEventListener('change', syncSelectAll);

const dynamicChoice = query<HTMLInputElement>('#dynamic-choice');
query<HTMLInputElement>('#enable-choice').addEventListener(
  'change',
  (event) => {
    dynamicChoice.disabled = !(event.currentTarget as HTMLInputElement).checked;
    result(
      '#dynamic-choice-result',
      dynamicChoice.disabled ? 'Choice disabled.' : 'Choice enabled.',
    );
  },
);
dynamicChoice.addEventListener('change', () =>
  result('#dynamic-choice-result', 'Dynamic choice selected.', 'success'),
);

const branches = queryAll<HTMLInputElement>('[data-tree-branch]');
function branchChildren(branch: HTMLInputElement): HTMLInputElement[] {
  return queryAll<HTMLInputElement>(`[data-tree-parent="${branch.value}"]`);
}
function syncTree(): void {
  for (const branch of branches) {
    const children = branchChildren(branch);
    const count = children.filter((child) => child.checked).length;
    branch.checked = count === children.length;
    branch.indeterminate = count > 0 && count < children.length;
  }
  const checkedLeaves = queryAll<HTMLInputElement>(
    '[data-tree-parent]:checked',
  ).map((item) => item.value);
  result(
    '#tree-result',
    checkedLeaves.length
      ? `Selected: ${checkedLeaves.join(', ')}.`
      : 'No products selected.',
  );
}
for (const branch of branches) {
  branch.addEventListener('change', () => {
    for (const child of branchChildren(branch)) child.checked = branch.checked;
    syncTree();
  });
}
for (const child of queryAll<HTMLInputElement>('[data-tree-parent]'))
  child.addEventListener('change', syncTree);

for (const radio of queryAll<HTMLInputElement>('[name="browser"]')) {
  radio.addEventListener('change', () =>
    result('#radio-result', `${radio.value} selected.`),
  );
}

query<HTMLButtonElement>('#generate-radios').addEventListener('click', () => {
  const group = query<HTMLDivElement>('#generated-radios');
  group.replaceChildren();
  for (const label of ['Smoke', 'Regression', 'Visual']) {
    const wrapper = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'suite';
    input.value = label;
    input.addEventListener('change', () =>
      result('#generated-radio-result', `${label} suite selected.`, 'success'),
    );
    wrapper.append(input, ` ${label}`);
    group.append(wrapper);
  }
  result('#generated-radio-result', 'Three suite options generated.');
});

for (const radio of queryAll<HTMLInputElement>('[name="account-type"]')) {
  radio.addEventListener('change', () => {
    const business = radio.value === 'Business';
    query<HTMLElement>('#business-details').hidden = !business;
    result(
      '#conditional-radio-result',
      business ? 'Business details revealed.' : 'Personal account selected.',
    );
  });
}

for (const radio of queryAll<HTMLInputElement>(
  '[data-duplicate-radio-section]',
)) {
  radio.addEventListener('change', () => {
    result(
      '#duplicate-radio-result',
      `${radio.dataset.duplicateRadioSection}: ${radio.value}.`,
      'success',
    );
  });
}

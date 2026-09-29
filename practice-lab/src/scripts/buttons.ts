import { delay, query, result } from './fixture-dom';

for (const button of document.querySelectorAll<HTMLButtonElement>(
  '[data-result-message]',
)) {
  button.addEventListener('click', () => {
    const target = button.dataset.resultTarget;
    if (target)
      result(
        target,
        button.dataset.resultMessage ?? 'Action completed.',
        'success',
      );
  });
}

const demoForm = query<HTMLFormElement>('#button-form');
demoForm.addEventListener('submit', (event) => {
  event.preventDefault();
  result('#form-button-result', 'Form submitted with QA run name.', 'success');
});
demoForm.addEventListener('reset', () => {
  window.setTimeout(
    () => result('#form-button-result', 'Form reset to its default value.'),
    0,
  );
});

const condition = query<HTMLInputElement>('#button-condition');
const conditionalButton = query<HTMLButtonElement>('#conditional-button');
condition.addEventListener('change', () => {
  conditionalButton.disabled = !condition.checked;
  result(
    '#condition-result',
    condition.checked ? 'Action is enabled.' : 'Action is disabled.',
  );
});
conditionalButton.addEventListener('click', () =>
  result('#condition-result', 'Conditional action completed.', 'success'),
);

query<HTMLButtonElement>('#double-click-button').addEventListener(
  'dblclick',
  () => {
    result('#gesture-result', 'Double-click detected.', 'success');
  },
);
query<HTMLButtonElement>('#context-button').addEventListener(
  'contextmenu',
  (event) => {
    event.preventDefault();
    result('#gesture-result', 'Context menu action detected.', 'success');
  },
);

const longPress = query<HTMLButtonElement>('#long-press-button');
let longPressTimer = 0;
longPress.addEventListener('pointerdown', () => {
  result('#gesture-result', 'Keep holding…');
  longPressTimer = window.setTimeout(
    () => result('#gesture-result', 'Long press completed.', 'success'),
    650,
  );
});
for (const eventName of ['pointerup', 'pointerleave', 'pointercancel']) {
  longPress.addEventListener(eventName, () =>
    window.clearTimeout(longPressTimer),
  );
}

query<HTMLButtonElement>('#delayed-response-button').addEventListener(
  'click',
  async () => {
    const milliseconds = Number(
      query<HTMLSelectElement>('#button-delay').value,
    );
    result('#delay-result', `Waiting ${milliseconds} ms…`);
    await delay(milliseconds);
    result(
      '#delay-result',
      `Response completed after ${milliseconds} ms.`,
      'success',
    );
  },
);

query<HTMLButtonElement>('#replacement-button').addEventListener(
  'click',
  (event) => {
    const original = event.currentTarget as HTMLButtonElement;
    const replacement = original.cloneNode(true) as HTMLButtonElement;
    replacement.id = 'replacement-button-v2';
    replacement.dataset.replaced = 'true';
    replacement.textContent = 'Replacement button';
    replacement.addEventListener('click', () =>
      result('#replacement-result', 'Replacement button clicked.', 'success'),
    );
    original.replaceWith(replacement);
    result(
      '#replacement-result',
      'The original button node was replaced.',
      'success',
    );
  },
);

for (const duplicate of document.querySelectorAll<HTMLButtonElement>(
  '[data-duplicate-section]',
)) {
  duplicate.addEventListener('click', () => {
    result(
      '#duplicate-result',
      `Saved ${duplicate.dataset.duplicateSection} section.`,
      'success',
    );
  });
}

query<HTMLButtonElement>('#nested-button').addEventListener('click', () => {
  result('#nested-result', 'Nested billing action completed.', 'success');
});

query<HTMLButtonElement>('#reveal-delayed-button').addEventListener(
  'click',
  async () => {
    const target = query<HTMLButtonElement>('#delayed-appearance-button');
    result('#appearance-result', 'Waiting for the action to appear…');
    await delay(500);
    target.hidden = false;
    target.focus();
    result('#appearance-result', 'Delayed action is now visible.', 'success');
  },
);
query<HTMLButtonElement>('#delayed-appearance-button').addEventListener(
  'click',
  () => {
    result('#appearance-result', 'Delayed action completed.', 'success');
  },
);

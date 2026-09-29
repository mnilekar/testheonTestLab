import { delay, query, queryAll, result } from './fixture-dom';

query<HTMLButtonElement>('#open-alert').addEventListener('click', () => {
  window.alert('Synthetic alert: build complete');
  result(
    '#browser-dialog-result',
    'Alert accepted: build complete.',
    'success',
  );
});
query<HTMLButtonElement>('#open-confirm').addEventListener('click', () => {
  const accepted = window.confirm('Approve synthetic deployment?');
  result(
    '#browser-dialog-result',
    accepted ? 'Confirm accepted.' : 'Confirm dismissed.',
    accepted ? 'success' : 'neutral',
  );
});
query<HTMLButtonElement>('#open-prompt').addEventListener('click', () => {
  const value = window.prompt('Name this synthetic run', 'Regression 4803');
  result(
    '#browser-dialog-result',
    value === null ? 'Prompt dismissed.' : `Prompt accepted: ${value}.`,
    value === null ? 'neutral' : 'success',
  );
});
query<HTMLButtonElement>('#open-delayed-alert').addEventListener(
  'click',
  async () => {
    const milliseconds = Number(
      query<HTMLSelectElement>('#browser-dialog-delay').value,
    );
    result(
      '#browser-dialog-result',
      `Delayed alert scheduled for ${milliseconds} ms.`,
    );
    await delay(milliseconds);
    window.alert('Delayed synthetic alert');
    result(
      '#browser-dialog-result',
      `Delayed alert accepted after ${milliseconds} ms.`,
      'success',
    );
  },
);
query<HTMLButtonElement>('#open-chained-alerts').addEventListener(
  'click',
  () => {
    window.alert('Chained alert 1 of 2');
    window.alert('Chained alert 2 of 2');
    result(
      '#browser-dialog-result',
      'Chained alerts accepted: 2 of 2.',
      'success',
    );
  },
);

function focusable(dialog: HTMLDialogElement): HTMLElement[] {
  return queryAll<HTMLElement>(
    'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    dialog,
  ).filter((element) => !element.hidden);
}

function openDialog(dialog: HTMLDialogElement): void {
  dialog.showModal();
  focusable(dialog)[0]?.focus();
}

for (const opener of queryAll<HTMLButtonElement>('[data-open-dialog]')) {
  opener.addEventListener('click', () => {
    const id = opener.dataset.openDialog;
    if (id) openDialog(query<HTMLDialogElement>(`#${id}`));
  });
}
for (const dialog of queryAll<HTMLDialogElement>('dialog')) {
  dialog.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const items = focusable(dialog);
    const first = items[0];
    const last = items.at(-1);
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  dialog.addEventListener('cancel', () =>
    result(
      '#modal-result',
      `${dialog.getAttribute('aria-labelledby') ?? dialog.id} closed with Escape.`,
    ),
  );
}
for (const closer of queryAll<HTMLButtonElement>('[data-close-dialog]')) {
  closer.addEventListener('click', () => {
    const dialog = closer.closest('dialog');
    dialog?.close();
    result('#modal-result', `${dialog?.id ?? 'Modal'} closed.`);
  });
}
for (const outcome of queryAll<HTMLButtonElement>('[data-modal-outcome]')) {
  outcome.addEventListener('click', () => {
    outcome.closest('dialog')?.close();
    result('#modal-result', `${outcome.dataset.modalOutcome}.`, 'success');
  });
}
query<HTMLFormElement>('#modal-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const value = query<HTMLInputElement>('#modal-note').value.trim();
  if (!value) return;
  query<HTMLDialogElement>('#form-modal').close();
  result('#modal-result', `Practice note saved: ${value}.`, 'success');
});

query<HTMLButtonElement>('#open-api-modal').addEventListener(
  'click',
  async () => {
    result('#modal-result', 'Waiting for API response…');
    let message = 'Practice API health confirmed.';
    try {
      const response = await fetch('/practice/api/v1/health');
      if (!response.ok) throw new Error(String(response.status));
    } catch {
      message = 'Static preview response confirmed.';
    }
    query('#api-modal-content').textContent = message;
    openDialog(query<HTMLDialogElement>('#api-modal'));
    result('#modal-result', 'API response received; modal opened.', 'success');
  },
);

query<HTMLButtonElement>('#load-delayed-modal-content').addEventListener(
  'click',
  async () => {
    const milliseconds = Number(
      query<HTMLSelectElement>('#modal-content-delay').value,
    );
    result('#delayed-modal-content', 'Loading delayed modal content…');
    await delay(milliseconds);
    result(
      '#delayed-modal-content',
      `Delayed content ready after ${milliseconds} ms.`,
      'success',
    );
  },
);

const toastMessages = {
  success: 'Saved successfully.',
  error: 'Synthetic save failed.',
  warning: 'Review the simulated warning.',
  info: 'Background check started.',
} as const;
type ToastType = keyof typeof toastMessages;
let toastNumber = 0;

function showToast(type: ToastType): void {
  toastNumber += 1;
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.dataset.toastId = String(toastNumber);
  toast.setAttribute(
    'role',
    type === 'error' || type === 'warning' ? 'alert' : 'status',
  );
  toast.textContent = `${toastMessages[type]} Toast ${toastNumber}.`;
  query('#toast-stack').append(toast);
  result('#toast-result', `${type} toast ${toastNumber} shown.`, 'success');
  const dismiss = Number(query<HTMLSelectElement>('#toast-dismiss').value);
  if (dismiss > 0) window.setTimeout(() => toast.remove(), dismiss);
}
for (const trigger of queryAll<HTMLButtonElement>('[data-toast-type]')) {
  trigger.addEventListener('click', () =>
    showToast(trigger.dataset.toastType as ToastType),
  );
}
query<HTMLButtonElement>('#show-stacked-toasts').addEventListener(
  'click',
  () => {
    (['success', 'warning', 'info'] as const).forEach(showToast);
  },
);
query<HTMLButtonElement>('#show-delayed-toast').addEventListener(
  'click',
  async () => {
    const milliseconds = Number(query<HTMLSelectElement>('#toast-delay').value);
    result('#toast-result', `Delayed toast scheduled for ${milliseconds} ms.`);
    await delay(milliseconds);
    showToast('info');
  },
);

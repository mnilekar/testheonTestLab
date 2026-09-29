import { query, queryAll, result } from './fixture-dom';

let dragged: HTMLElement | null = null;
let csrfToken = '';

function zoneName(zone: HTMLElement): string {
  return (
    zone.getAttribute('aria-label')?.replace(' card zone', '') ?? 'destination'
  );
}

function installDraggable(element: HTMLElement): void {
  element.addEventListener('dragstart', (event) => {
    dragged = element;
    event.dataTransfer?.setData(
      'text/plain',
      element.dataset.dragCard ??
        element.dataset.sortItem ??
        element.dataset.taskId ??
        'card',
    );
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  });
  element.addEventListener('pointerdown', (event) => {
    if ((event.target as HTMLElement).closest('button')) return;
    dragged = element;
    element.dataset.pointerDragging = 'true';
    element.setPointerCapture?.(event.pointerId);
  });
  element.addEventListener('pointerup', (event) => {
    delete element.dataset.pointerDragging;
    const target = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest<HTMLElement>(
        '[data-card-zone], [data-kanban-status], [data-sort-item]',
      );
    if (target) void completeDrop(target, element, event.clientY);
    dragged = null;
  });
}

async function ensureSession(): Promise<void> {
  if (csrfToken) return;
  const response = await fetch('/practice/api/v1/lab/session', {
    credentials: 'same-origin',
  });
  if (!response.ok) throw new Error(`Session API returned ${response.status}`);
  const body = (await response.json()) as { data?: { csrfToken?: string } };
  csrfToken = body.data?.csrfToken ?? '';
}

function sortableOrder(): void {
  const labels = queryAll<HTMLElement>(
    '#sortable-list-items [data-sort-item]',
  ).map((item) => item.dataset.sortItem ?? '');
  result('#sort-drag-result', `Order: ${labels.join(', ')}.`);
}

async function completeDrop(
  target: HTMLElement,
  source: HTMLElement,
  clientY = 0,
): Promise<void> {
  const cardZone = target.closest<HTMLElement>('[data-card-zone]');
  if (cardZone && source.dataset.dragCard) {
    query<HTMLUListElement>('ul', cardZone).append(source);
    result(
      '#drag-result',
      `${source.textContent?.trim()} moved to ${zoneName(cardZone)}.`,
    );
    return;
  }
  const sortTarget = target.closest<HTMLElement>('[data-sort-item]');
  if (sortTarget && source.dataset.sortItem && sortTarget !== source) {
    const rectangle = sortTarget.getBoundingClientRect();
    sortTarget.parentElement?.insertBefore(
      source,
      clientY > rectangle.top + rectangle.height / 2
        ? sortTarget.nextSibling
        : sortTarget,
    );
    sortableOrder();
    return;
  }
  const kanban = target.closest<HTMLElement>('[data-kanban-status]');
  if (kanban && source.dataset.taskId) {
    const status = kanban.dataset.kanbanStatus ?? 'todo';
    result('#kanban-result', `Saving ${source.dataset.taskId} as ${status}.`);
    try {
      await ensureSession();
      const response = await fetch(
        `/practice/api/v1/tasks/${source.dataset.taskId}`,
        {
          method: 'PATCH',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
            'X-Lab-CSRF': csrfToken,
          },
          body: JSON.stringify({ status }),
        },
      );
      if (!response.ok) throw new Error(`tasks returned ${response.status}`);
      query<HTMLUListElement>('ul', kanban).append(source);
      result(
        '#kanban-result',
        `${source.dataset.taskId} persisted as ${status}.`,
      );
    } catch (error) {
      result(
        '#kanban-result',
        `Task move failed safely: ${error instanceof Error ? error.message : 'unknown error'}.`,
      );
    }
  }
}

for (const item of queryAll<HTMLElement>('[data-drag-card], [data-sort-item]'))
  installDraggable(item);
for (const zone of queryAll<HTMLElement>(
  '[data-card-zone], [data-kanban-status], [data-sort-item]',
)) {
  zone.addEventListener('dragover', (event) => event.preventDefault());
  zone.addEventListener('drop', (event) => {
    event.preventDefault();
    if (dragged) void completeDrop(zone, dragged, event.clientY);
    dragged = null;
  });
}

query<HTMLOListElement>('#sortable-list-items').addEventListener(
  'click',
  (event) => {
    const control = (event.target as HTMLElement).closest<HTMLButtonElement>(
      '[data-move]',
    );
    const item = control?.closest<HTMLElement>('[data-sort-item]');
    if (!control || !item) return;
    if (control.dataset.move === 'up' && item.previousElementSibling)
      item.parentElement?.insertBefore(item, item.previousElementSibling);
    if (control.dataset.move === 'down' && item.nextElementSibling)
      item.parentElement?.insertBefore(item.nextElementSibling, item);
    item.focus();
    sortableOrder();
  },
);

const fileDropzone = query<HTMLElement>('#drag-page-file-dropzone');
const fileInput = query<HTMLInputElement>('#drag-page-file-input');
function reportFiles(files: File[]): void {
  const allowed = /\.(png|jpe?g|csv|txt|pdf)$/i;
  const rejected = files.find(
    (file) => !allowed.test(file.name) || file.size > 2 * 1024 * 1024,
  );
  result(
    '#drag-file-result',
    rejected
      ? `Rejected ${rejected.name}: shared safety contract failed.`
      : `Accepted ${files.length} file(s): ${files.map((file) => file.name).join(', ')}.`,
  );
}
fileDropzone.addEventListener('click', () => fileInput.click());
fileDropzone.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    fileInput.click();
  }
});
fileDropzone.addEventListener('dragover', (event) => event.preventDefault());
fileDropzone.addEventListener('drop', (event) => {
  event.preventDefault();
  reportFiles([...(event.dataTransfer?.files ?? [])]);
});
fileInput.addEventListener('change', () =>
  reportFiles([...(fileInput.files ?? [])]),
);

interface TaskRecord {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: string;
}

async function loadKanban(): Promise<void> {
  const board = query<HTMLElement>('#kanban-task-board');
  try {
    const response = await fetch('/practice/api/v1/tasks?limit=6&sort=id', {
      credentials: 'same-origin',
    });
    if (!response.ok) throw new Error(`tasks returned ${response.status}`);
    const body = (await response.json()) as { data?: TaskRecord[] };
    for (const task of body.data ?? []) {
      const card = document.createElement('li');
      card.draggable = true;
      card.tabIndex = 0;
      card.dataset.taskId = task.id;
      card.setAttribute(
        'aria-label',
        `${task.title}, ${task.priority} priority`,
      );
      card.textContent = `${task.title} · ${task.priority}`;
      installDraggable(card);
      query<HTMLUListElement>(
        `[data-kanban-status="${task.status}"] ul`,
        board,
      ).append(card);
    }
    board.ariaBusy = 'false';
    result(
      '#kanban-result',
      `Loaded ${(body.data ?? []).length} sandbox tasks.`,
    );
  } catch (error) {
    board.ariaBusy = 'false';
    result(
      '#kanban-result',
      `Kanban unavailable safely: ${error instanceof Error ? error.message : 'unknown error'}.`,
    );
  }
}

void loadKanban();

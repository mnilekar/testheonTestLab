import { query, result } from './fixture-dom';

const maxBytes = 2 * 1024 * 1024;
const allowedExtensions = new Set(['png', 'jpg', 'jpeg', 'csv', 'txt', 'pdf']);
const allowedTypes = new Set([
  'image/png',
  'image/jpeg',
  'text/csv',
  'text/plain',
  'application/pdf',
]);
let csrfToken = '';
let previewUrl = '';

interface UploadRecord {
  id: string;
  name: string;
  mime: string;
  size: number;
  expiresInSeconds: number;
}

async function ensureSession(): Promise<void> {
  if (csrfToken) return;
  const response = await fetch('/practice/api/v1/lab/session', {
    credentials: 'same-origin',
  });
  if (!response.ok) throw new Error(`Session API returned ${response.status}`);
  const body = (await response.json()) as { data?: { csrfToken?: string } };
  csrfToken = body.data?.csrfToken ?? '';
  if (!csrfToken) throw new Error('Session API did not return a CSRF token.');
}

function extension(file: File): string {
  return file.name.includes('.')
    ? (file.name.split('.').pop() ?? '').toLowerCase()
    : '';
}

function clientRejection(file: File): string | null {
  if (
    file.name.includes('/') ||
    file.name.includes('\\') ||
    file.name.includes('..')
  )
    return 'PATH_REJECTED';
  if (!allowedExtensions.has(extension(file))) return 'EXTENSION_REJECTED';
  if (!allowedTypes.has(file.type)) return 'MIME_REJECTED';
  if (file.size > maxBytes) return 'FILE_TOO_LARGE';
  return null;
}

function renderUploaded(records: UploadRecord[]): void {
  const list = query<HTMLUListElement>('#uploaded-files');
  list.replaceChildren(
    ...records.map((record) => {
      const item = document.createElement('li');
      item.textContent = `${record.name} · ${record.mime} · ${record.size} bytes · expires in ${record.expiresInSeconds}s`;
      return item;
    }),
  );
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let value = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index] ?? '';
    if (character === '"' && quoted && line[index + 1] === '"') {
      value += '"';
      index += 1;
    } else if (character === '"') quoted = !quoted;
    else if (character === ',' && !quoted) {
      cells.push(value);
      value = '';
    } else value += character;
  }
  cells.push(value);
  return cells;
}

async function renderPreview(file: File): Promise<void> {
  const image = query<HTMLImageElement>('#image-preview');
  const table = query<HTMLTableElement>('#csv-preview-table');
  image.hidden = true;
  table.hidden = true;
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  if (file.type === 'image/png' || file.type === 'image/jpeg') {
    previewUrl = URL.createObjectURL(file);
    image.src = previewUrl;
    image.hidden = false;
    result('#preview-result', `Safe local image preview: ${file.name}.`);
    return;
  }
  if (extension(file) === 'csv') {
    const rows = (await file.text())
      .split(/\r?\n/)
      .filter(Boolean)
      .slice(0, 20)
      .map(parseCsvLine);
    const [headers = [], ...bodyRows] = rows;
    const headRow = document.createElement('tr');
    for (const header of headers.slice(0, 12)) {
      const cell = document.createElement('th');
      cell.scope = 'col';
      cell.textContent = header;
      headRow.append(cell);
    }
    table.tHead?.replaceChildren(headRow);
    const body = table.tBodies[0];
    body?.replaceChildren(
      ...bodyRows.map((row) => {
        const element = document.createElement('tr');
        for (const value of row.slice(0, 12)) {
          const cell = document.createElement('td');
          cell.textContent = value;
          element.append(cell);
        }
        return element;
      }),
    );
    table.hidden = false;
    result(
      '#preview-result',
      `Sanitized CSV preview: ${bodyRows.length} rows.`,
    );
  }
}

async function upload(files: File[]): Promise<void> {
  if (!files.length) return;
  const rejection = files
    .map((file) => [file, clientRejection(file)] as const)
    .find(([, code]) => code);
  if (rejection) {
    result('#rejection-result', `${rejection[1]}: ${rejection[0].name}.`);
    result('#upload-result', `Upload rejected: ${rejection[1]}.`);
    return;
  }
  await renderPreview(files[0] as File);
  try {
    await ensureSession();
    const form = new FormData();
    files.forEach((file) => form.append('files[]', file, file.name));
    const progress = query<HTMLProgressElement>('#upload-progress');
    const response = await new Promise<{ status: number; text: string }>(
      (resolve) => {
        const request = new XMLHttpRequest();
        request.open('POST', '/practice/api/v1/files/upload');
        request.setRequestHeader('X-Lab-CSRF', csrfToken);
        request.upload.addEventListener('progress', (event) => {
          progress.value = event.lengthComputable
            ? Math.round((event.loaded / event.total) * 100)
            : 50;
        });
        request.addEventListener('load', () =>
          resolve({ status: request.status, text: request.responseText }),
        );
        request.addEventListener('error', () =>
          resolve({ status: 0, text: '' }),
        );
        request.send(form);
      },
    );
    const body = response.text
      ? (JSON.parse(response.text) as {
          data?: UploadRecord[];
          error?: { code?: string };
        })
      : {};
    progress.value = response.status >= 200 && response.status < 300 ? 100 : 0;
    if (response.status < 200 || response.status >= 300) {
      const code = body.error?.code ?? `HTTP_${response.status}`;
      result('#rejection-result', `Server rejected upload: ${code}.`);
      result('#upload-result', `Upload rejected: ${code}.`);
      return;
    }
    const records = body.data ?? [];
    renderUploaded(records);
    result(
      '#upload-result',
      `Uploaded ${records.length} file(s): ${records.map((record) => record.name).join(', ')}.`,
    );
  } catch (error) {
    result(
      '#upload-result',
      `Upload failed safely: ${error instanceof Error ? error.message : 'unknown error'}.`,
    );
  }
}

query<HTMLInputElement>('#single-file').addEventListener(
  'change',
  (event) =>
    void upload([...((event.currentTarget as HTMLInputElement).files ?? [])]),
);
query<HTMLInputElement>('#multiple-files').addEventListener(
  'change',
  (event) =>
    void upload([...((event.currentTarget as HTMLInputElement).files ?? [])]),
);
const dropzone = query<HTMLElement>('#shared-file-dropzone');
const dropInput = query<HTMLInputElement>('#dropzone-file-input');
dropzone.addEventListener('click', () => dropInput.click());
dropzone.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    dropInput.click();
  }
});
dropzone.addEventListener('dragover', (event) => {
  event.preventDefault();
  dropzone.dataset.dragActive = 'true';
});
dropzone.addEventListener(
  'dragleave',
  () => delete dropzone.dataset.dragActive,
);
dropzone.addEventListener('drop', (event) => {
  event.preventDefault();
  delete dropzone.dataset.dragActive;
  void upload([...(event.dataTransfer?.files ?? [])]);
});
dropInput.addEventListener(
  'change',
  () => void upload([...(dropInput.files ?? [])]),
);

const delay = query<HTMLSelectElement>('#download-delay');
const delayed = query<HTMLAnchorElement>('#delayed-download');
delay.addEventListener('change', () => {
  delayed.href = `/practice/api/v1/files/download/static-txt?delay=${delay.value}`;
});
query<HTMLButtonElement>('#api-then-download').addEventListener(
  'click',
  async () => {
    try {
      const response = await fetch('/practice/api/v1/tasks?limit=3&sort=id', {
        credentials: 'same-origin',
      });
      if (!response.ok) throw new Error(`tasks returned ${response.status}`);
      result(
        '#download-result',
        'Tasks API completed; starting session CSV report.',
      );
      const link = document.createElement('a');
      link.href = '/practice/api/v1/files/download/dynamic-csv';
      document.body.append(link);
      link.click();
      link.remove();
    } catch (error) {
      result(
        '#download-result',
        `API request failed safely: ${error instanceof Error ? error.message : 'unknown error'}.`,
      );
    }
  },
);

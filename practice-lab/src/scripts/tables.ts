import { query, queryAll, result } from './fixture-dom';
import {
  enrichEmployee,
  formatSalary,
  seedEmployees,
  virtualEmployee,
  type ApiEmployee,
  type EmployeeRow,
} from '../lib/table-data';

interface ListEnvelope<T> {
  data?: T[];
  meta?: { total?: number; page?: number; limit?: number };
}

interface RecordEnvelope<T> {
  data?: T;
  error?: { code?: string; message?: string };
}

let employees = seedEmployees.map(enrichEmployee);
let csrfToken = '';

function cell(
  row: HTMLTableRowElement,
  text: string,
  options: { header?: boolean; column?: string } = {},
): HTMLTableCellElement {
  const element = document.createElement(options.header ? 'th' : 'td');
  if (options.header) element.scope = 'row';
  if (options.column) element.dataset.column = options.column;
  element.textContent = text;
  row.append(element);
  return element;
}

function button(label: string, secondary = true): HTMLButtonElement {
  const element = document.createElement('button');
  element.type = 'button';
  element.className = `fixture-button${secondary ? ' fixture-button--secondary' : ''}`;
  element.textContent = label;
  return element;
}

function employeeCells(
  row: HTMLTableRowElement,
  employee: EmployeeRow,
  columns: Array<keyof EmployeeRow>,
): void {
  for (const [index, column] of columns.entries()) {
    const raw = employee[column];
    const text =
      column === 'salary'
        ? formatSalary(Number(raw))
        : column === 'active'
          ? raw
            ? 'Active'
            : 'Inactive'
          : String(raw);
    cell(row, text, {
      header: index === 0,
      column: column === 'title' ? 'role' : String(column),
    });
  }
}

function renderRows(
  tableSelector: string,
  rows: EmployeeRow[],
  columns: Array<keyof EmployeeRow>,
  emptyMessage = 'No employees match these controls.',
): void {
  const body = query<HTMLTableSectionElement>(`${tableSelector} tbody`);
  body.replaceChildren();
  if (!rows.length) {
    const row = body.insertRow();
    const empty = cell(row, emptyMessage);
    empty.colSpan = columns.length;
    empty.className = 'table-empty';
    return;
  }
  for (const employee of rows) {
    const row = body.insertRow();
    row.dataset.employeeId = employee.id;
    employeeCells(row, employee, columns);
  }
}

function uniqueValues(key: 'department' | 'location'): string[] {
  return [...new Set(employees.map((employee) => employee[key]))].sort((a, b) =>
    a.localeCompare(b),
  );
}

async function fetchEmployees(
  page = 1,
  limit = 100,
): Promise<{
  rows: EmployeeRow[];
  total: number;
}> {
  const response = await fetch(
    `/practice/api/v1/employees?page=${page}&limit=${limit}&sort=id`,
    { credentials: 'same-origin' },
  );
  if (!response.ok) throw new Error(`Employee API returned ${response.status}`);
  const body = (await response.json()) as ListEnvelope<ApiEmployee>;
  return {
    rows: (body.data ?? []).map(enrichEmployee),
    total:
      body.meta?.total ?? Number(response.headers.get('x-total-count') ?? 0),
  };
}

async function fetchAllEmployees(): Promise<EmployeeRow[]> {
  const first = await fetchEmployees(1, 100);
  if (first.rows.length >= first.total) return first.rows;
  const second = await fetchEmployees(2, 100);
  return [...first.rows, ...second.rows];
}

async function ensureSession(): Promise<void> {
  if (csrfToken) return;
  const response = await fetch('/practice/api/v1/lab/session', {
    credentials: 'same-origin',
  });
  if (!response.ok) throw new Error(`Session API returned ${response.status}`);
  const body = (await response.json()) as {
    data?: { csrfToken?: string };
  };
  csrfToken = body.data?.csrfToken ?? '';
  if (!csrfToken) throw new Error('Session API did not return a CSRF token.');
}

type SortKey = 'name' | 'department' | 'location' | 'salary' | 'joiningDate';
const sorts: Array<{ key: SortKey; direction: 1 | -1 }> = [];

function renderSortable(): void {
  const rows = employees.slice(0, 30).sort((left, right) => {
    for (const sort of sorts) {
      const a = left[sort.key];
      const b = right[sort.key];
      const compared =
        typeof a === 'number' && typeof b === 'number'
          ? a - b
          : String(a).localeCompare(String(b));
      if (compared) return compared * sort.direction;
    }
    return left.id.localeCompare(right.id);
  });
  renderRows('#sortable-employee-table', rows, [
    'name',
    'department',
    'location',
    'salary',
    'joiningDate',
  ]);
  for (const control of queryAll<HTMLButtonElement>('[data-sort-key]')) {
    const key = control.dataset.sortKey as SortKey;
    const index = sorts.findIndex((sort) => sort.key === key);
    const th = control.closest('th');
    const indicator = query<HTMLElement>('[data-sort-indicator]', control);
    if (index < 0) {
      th?.setAttribute('aria-sort', 'none');
      indicator.textContent = '';
      continue;
    }
    const sort = sorts[index];
    const direction = sort?.direction === 1 ? 'ascending' : 'descending';
    th?.setAttribute('aria-sort', direction);
    indicator.textContent = `${sort?.direction === 1 ? '▲' : '▼'} ${index + 1}`;
  }
  result(
    '#sort-result',
    sorts.length
      ? `Sorted by ${sorts
          .map(
            (sort, index) =>
              `${index + 1}. ${sort.key} ${sort.direction === 1 ? 'ascending' : 'descending'}`,
          )
          .join(', ')}.`
      : 'No columns sorted.',
  );
}

for (const control of queryAll<HTMLButtonElement>('[data-sort-key]')) {
  control.addEventListener('click', () => {
    const key = control.dataset.sortKey as SortKey;
    const current = sorts.find((sort) => sort.key === key);
    if (!current) sorts.push({ key, direction: 1 });
    else if (current.direction === 1) current.direction = -1;
    else sorts.splice(sorts.indexOf(current), 1);
    renderSortable();
  });
}

query<HTMLButtonElement>('#clear-table-sorts').addEventListener('click', () => {
  sorts.splice(0);
  renderSortable();
});

let instantQuery = '';
let debouncedQuery = '';
let debounceTimer = 0;

function renderSearch(): void {
  const terms = [instantQuery, debouncedQuery].filter(Boolean);
  const rows = employees.filter((employee) => {
    const haystack = Object.values(employee).join(' ').toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
  renderRows('#search-employee-table', rows.slice(0, 30), [
    'id',
    'name',
    'department',
    'location',
  ]);
  result(
    '#table-search-result',
    `${rows.length} employees match. Instant: ${instantQuery || 'none'}; debounced: ${debouncedQuery || 'none'}.`,
  );
}

query<HTMLInputElement>('#table-instant-search').addEventListener(
  'input',
  (event) => {
    instantQuery = (event.currentTarget as HTMLInputElement).value
      .trim()
      .toLowerCase();
    renderSearch();
  },
);

query<HTMLInputElement>('#table-debounced-search').addEventListener(
  'input',
  (event) => {
    const value = (event.currentTarget as HTMLInputElement).value
      .trim()
      .toLowerCase();
    window.clearTimeout(debounceTimer);
    result(
      '#table-search-result',
      'Waiting 350 ms before applying debounced search…',
    );
    debounceTimer = window.setTimeout(() => {
      debouncedQuery = value;
      renderSearch();
    }, 350);
  },
);

function populateFilter(id: string, values: string[]): void {
  const select = query<HTMLSelectElement>(id);
  while (select.options.length > 1) select.remove(1);
  for (const value of values) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    select.append(option);
  }
}

function renderFiltered(): void {
  const department = query<HTMLSelectElement>('#department-filter').value;
  const location = query<HTMLSelectElement>('#location-filter').value;
  const status = query<HTMLSelectElement>('#status-filter').value;
  const rows = employees.filter(
    (employee) =>
      (!department || employee.department === department) &&
      (!location || employee.location === location) &&
      (!status || String(employee.active) === status),
  );
  renderRows('#filter-table', rows, [
    'name',
    'department',
    'location',
    'active',
    'salary',
  ]);
  result(
    '#filter-result',
    rows.length
      ? `${rows.length} employees match the combined filters.`
      : 'No employees match the combined filters.',
    rows.length ? 'success' : 'error',
  );
}

for (const filter of queryAll<HTMLSelectElement>(
  '#department-filter, #location-filter, #status-filter',
)) {
  filter.addEventListener('change', renderFiltered);
}

let clientPage = 1;
function renderClientPage(): void {
  const size = Number(query<HTMLSelectElement>('#client-page-size').value);
  const pages = Math.max(1, Math.ceil(employees.length / size));
  clientPage = Math.min(clientPage, pages);
  const start = (clientPage - 1) * size;
  renderRows('#client-page-table', employees.slice(start, start + size), [
    'id',
    'name',
    'department',
  ]);
  result(
    '#client-page-status',
    `Showing ${employees.length ? start + 1 : 0}–${Math.min(start + size, employees.length)} of ${employees.length}. Page ${clientPage} of ${pages}.`,
  );
  query<HTMLButtonElement>('#client-previous').disabled = clientPage === 1;
  query<HTMLButtonElement>('#client-next').disabled = clientPage === pages;
}

query<HTMLButtonElement>('#client-previous').addEventListener('click', () => {
  clientPage -= 1;
  renderClientPage();
});
query<HTMLButtonElement>('#client-next').addEventListener('click', () => {
  clientPage += 1;
  renderClientPage();
});
query<HTMLSelectElement>('#client-page-size').addEventListener('change', () => {
  clientPage = 1;
  renderClientPage();
});

let serverPage = 1;
async function renderServerPage(): Promise<void> {
  const size = Number(query<HTMLSelectElement>('#server-page-size').value);
  result('#server-page-status', 'Loading API page…');
  try {
    const response = await fetchEmployees(serverPage, size);
    renderRows('#server-page-table', response.rows, [
      'id',
      'name',
      'department',
    ]);
    const pages = Math.max(1, Math.ceil(response.total / size));
    const start = (serverPage - 1) * size;
    result(
      '#server-page-status',
      `Showing ${response.total ? start + 1 : 0}–${Math.min(start + response.rows.length, response.total)} of ${response.total}. API page ${serverPage} of ${pages}.`,
      'success',
    );
    query<HTMLButtonElement>('#server-previous').disabled = serverPage === 1;
    query<HTMLButtonElement>('#server-next').disabled = serverPage >= pages;
  } catch {
    const start = (serverPage - 1) * size;
    renderRows('#server-page-table', employees.slice(start, start + size), [
      'id',
      'name',
      'department',
    ]);
    const pages = Math.max(1, Math.ceil(employees.length / size));
    result(
      '#server-page-status',
      `Local fallback: showing ${start + 1}–${Math.min(start + size, employees.length)} of ${employees.length}. Page ${serverPage} of ${pages}.`,
    );
    query<HTMLButtonElement>('#server-previous').disabled = serverPage === 1;
    query<HTMLButtonElement>('#server-next').disabled = serverPage >= pages;
  }
}

query<HTMLButtonElement>('#server-previous').addEventListener('click', () => {
  serverPage -= 1;
  void renderServerPage();
});
query<HTMLButtonElement>('#server-next').addEventListener('click', () => {
  serverPage += 1;
  void renderServerPage();
});
query<HTMLSelectElement>('#server-page-size').addEventListener('change', () => {
  serverPage = 1;
  void renderServerPage();
});

function renderEditable(): void {
  const body = query<HTMLTableSectionElement>('#editable-employee-table tbody');
  body.replaceChildren();
  for (const employee of employees.slice(0, 12)) {
    const row = body.insertRow();
    row.dataset.employeeId = employee.id;
    cell(row, employee.id, { header: true });
    cell(row, employee.name);
    cell(row, employee.department);
    cell(row, employee.title, { column: 'role' });
    const action = cell(row, '');
    const edit = button(`Edit ${employee.name}`);
    action.append(edit);
    edit.addEventListener('click', () => openEditor(row, employee));
  }
}

function openEditor(row: HTMLTableRowElement, employee: EmployeeRow): void {
  const roleCell = query<HTMLTableCellElement>('td[data-column="role"]', row);
  const actionCell = row.cells[row.cells.length - 1];
  if (!actionCell) return;
  const input = document.createElement('input');
  input.value = employee.title;
  input.setAttribute('aria-label', `Role for ${employee.name}`);
  input.className = 'inline-editor';
  roleCell.replaceChildren(input);
  const save = button(`Save ${employee.name}`, false);
  const cancel = button(`Cancel ${employee.name}`);
  actionCell.replaceChildren(save, cancel);
  input.focus();
  cancel.addEventListener('click', renderEditable);
  save.addEventListener('click', async () => {
    const title = input.value.trim();
    if (!title) {
      input.setAttribute('aria-invalid', 'true');
      result('#edit-result', 'Role is required before saving.', 'error');
      return;
    }
    save.disabled = true;
    result('#edit-result', `Saving ${employee.id}…`);
    try {
      await ensureSession();
      const response = await fetch(
        `/practice/api/v1/employees/${employee.id}`,
        {
          method: 'PATCH',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
            'X-Lab-CSRF': csrfToken,
          },
          body: JSON.stringify({ title }),
        },
      );
      const body = (await response.json()) as RecordEnvelope<ApiEmployee>;
      if (!response.ok) {
        throw new Error(
          `${body.error?.code ?? response.status}: ${body.error?.message ?? 'Save failed.'}`,
        );
      }
      const saved = body.data
        ? enrichEmployee(body.data)
        : { ...employee, title };
      employees = employees.map((item) =>
        item.id === saved.id ? saved : item,
      );
      result('#edit-result', `Saved ${saved.id} as ${saved.title}.`, 'success');
      renderEditable();
    } catch (error) {
      result(
        '#edit-result',
        error instanceof Error ? error.message : 'Save failed.',
        'error',
      );
      save.disabled = false;
    }
  });
}

let dynamicRows = employees.slice(0, 3).map((employee) => ({ ...employee }));
let dynamicSequence = 0;
function renderDynamic(): void {
  const body = query<HTMLTableSectionElement>('#dynamic-row-table tbody');
  body.replaceChildren();
  for (const employee of dynamicRows) {
    const row = body.insertRow();
    cell(row, employee.id, { header: true });
    cell(row, employee.name);
    const action = cell(row, '');
    const remove = button(`Delete ${employee.name}`);
    action.append(remove);
    remove.addEventListener('click', () => {
      if (!window.confirm(`Delete ${employee.name}?`)) return;
      dynamicRows = dynamicRows.filter(
        (candidate) => candidate.id !== employee.id,
      );
      renderDynamic();
    });
  }
  result('#dynamic-row-count', `${dynamicRows.length} dynamic rows.`);
}

query<HTMLButtonElement>('#add-employee-row').addEventListener('click', () => {
  dynamicSequence += 1;
  dynamicRows.push(
    enrichEmployee({
      id: `emp-local-${String(dynamicSequence).padStart(3, '0')}`,
      name: `Added Tester ${dynamicSequence}`,
      department: 'Quality Assurance',
      location: 'Pune',
      title: 'Automation Engineer',
      active: true,
    }),
  );
  renderDynamic();
});

const selectedIds = new Set<string>();
let selectionPage = 1;
const selectionSize = 5;
let selectionRows = employees.slice(0, 20).map((employee) => ({ ...employee }));

function renderSelectable(): void {
  const body = query<HTMLTableSectionElement>('#selectable-table tbody');
  body.replaceChildren();
  const start = (selectionPage - 1) * selectionSize;
  const pageRows = selectionRows.slice(start, start + selectionSize);
  for (const employee of pageRows) {
    const row = body.insertRow();
    const selectCell = cell(row, '');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = selectedIds.has(employee.id);
    checkbox.setAttribute('aria-label', `Select ${employee.name}`);
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) selectedIds.add(employee.id);
      else selectedIds.delete(employee.id);
      renderSelectable();
    });
    selectCell.append(checkbox);
    cell(row, employee.name, { header: true });
    cell(row, employee.active ? 'Active' : 'Inactive');
  }
  const allCurrent = pageRows.every((employee) => selectedIds.has(employee.id));
  const master = query<HTMLInputElement>('#select-current-page');
  master.checked = pageRows.length > 0 && allCurrent;
  master.indeterminate =
    !allCurrent && pageRows.some((employee) => selectedIds.has(employee.id));
  const pages = Math.ceil(selectionRows.length / selectionSize);
  query<HTMLElement>('#selection-page-label').textContent =
    `Page ${selectionPage} of ${pages}`;
  query<HTMLButtonElement>('#selection-previous').disabled =
    selectionPage === 1;
  query<HTMLButtonElement>('#selection-next').disabled =
    selectionPage === pages;
  result('#selection-result', `${selectedIds.size} employees selected.`);
}

query<HTMLInputElement>('#select-current-page').addEventListener(
  'change',
  (event) => {
    const checked = (event.currentTarget as HTMLInputElement).checked;
    const start = (selectionPage - 1) * selectionSize;
    for (const employee of selectionRows.slice(start, start + selectionSize)) {
      if (checked) selectedIds.add(employee.id);
      else selectedIds.delete(employee.id);
    }
    renderSelectable();
  },
);
query<HTMLButtonElement>('#select-all-pages').addEventListener('click', () => {
  for (const employee of selectionRows) selectedIds.add(employee.id);
  renderSelectable();
});
query<HTMLButtonElement>('#bulk-inactivate').addEventListener('click', () => {
  const changed = selectedIds.size;
  selectionRows = selectionRows.map((employee) =>
    selectedIds.has(employee.id) ? { ...employee, active: false } : employee,
  );
  selectedIds.clear();
  renderSelectable();
  result(
    '#selection-result',
    `Marked ${changed} selected employees inactive.`,
    'success',
  );
});
query<HTMLButtonElement>('#selection-previous').addEventListener(
  'click',
  () => {
    selectionPage -= 1;
    renderSelectable();
  },
);
query<HTMLButtonElement>('#selection-next').addEventListener('click', () => {
  selectionPage += 1;
  renderSelectable();
});

function renderExpandable(): void {
  const body = query<HTMLTableSectionElement>('#expandable-table tbody');
  body.replaceChildren();
  for (const employee of employees.slice(0, 6)) {
    const row = body.insertRow();
    cell(row, employee.name, { header: true });
    cell(row, employee.department);
    const action = cell(row, '');
    const detailId = `details-${employee.id}`;
    const toggle = button(`Show details for ${employee.name}`);
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', detailId);
    action.append(toggle);
    const detailRow = body.insertRow();
    detailRow.id = detailId;
    detailRow.hidden = true;
    const detail = cell(
      detailRow,
      `${employee.name} joined ${employee.joiningDate}, earns ${formatSalary(employee.salary)}, and works from ${employee.location}.`,
    );
    detail.colSpan = 3;
    detail.className = 'row-detail';
    toggle.addEventListener('click', () => {
      detailRow.hidden = !detailRow.hidden;
      toggle.setAttribute('aria-expanded', String(!detailRow.hidden));
      toggle.textContent = `${detailRow.hidden ? 'Show' : 'Hide'} details for ${employee.name}`;
    });
  }
}

function renderSticky(): void {
  renderRows('#sticky-employee-table', employees.slice(0, 24), [
    'id',
    'name',
    'department',
    'location',
    'title',
    'salary',
    'active',
    'joiningDate',
  ]);
}

const virtualViewport = query<HTMLElement>('#virtual-viewport');
const virtualSpacer = query<HTMLElement>('#virtual-spacer');
const virtualBody = query<HTMLElement>('#virtual-body');
const virtualCount = 10_000;
const virtualRowHeight = 47;
const virtualWindow = 18;
virtualSpacer.style.height = `${virtualCount * virtualRowHeight}px`;

function renderVirtual(): void {
  const first = Math.max(
    0,
    Math.min(
      virtualCount - virtualWindow,
      Math.floor(virtualViewport.scrollTop / virtualRowHeight) - 3,
    ),
  );
  const last = Math.min(virtualCount, first + virtualWindow);
  virtualBody.replaceChildren();
  for (let index = first; index < last; index += 1) {
    const employee = virtualEmployee(index);
    const row = document.createElement('div');
    row.className = 'virtual-row';
    row.setAttribute('role', 'row');
    row.setAttribute('aria-rowindex', String(index + 2));
    row.style.transform = `translateY(${index * virtualRowHeight}px)`;
    for (const value of [
      employee.id,
      employee.name,
      employee.department,
      employee.active ? 'Active' : 'Inactive',
    ]) {
      const item = document.createElement('span');
      item.setAttribute('role', 'cell');
      item.textContent = value;
      row.append(item);
    }
    virtualBody.append(row);
  }
  result(
    '#virtual-result',
    `Rows ${first + 1}–${last} of 10,000; ${virtualBody.children.length} data rows in the DOM.`,
    'success',
  );
}
virtualViewport.addEventListener('scroll', renderVirtual, { passive: true });

query<HTMLButtonElement>('#start-async-update').addEventListener(
  'click',
  () => {
    const delay = Number(query<HTMLSelectElement>('#async-delay').value);
    const trigger = query<HTMLButtonElement>('#start-async-update');
    trigger.disabled = true;
    query<HTMLElement>('#async-status').textContent = 'Updating';
    result('#async-result', `Updating emp-009 for ${delay} ms…`);
    window.setTimeout(() => {
      query<HTMLElement>('#async-status').textContent = 'Active';
      result(
        '#async-result',
        `emp-009 changed to Active after ${delay} ms.`,
        'success',
      );
      trigger.disabled = false;
    }, delay);
  },
);

query<HTMLButtonElement>('#reset-table-sandbox').addEventListener(
  'click',
  async () => {
    result('#tables-load-status', 'Resetting employee sandbox…');
    try {
      await ensureSession();
      const response = await fetch('/practice/api/v1/lab/reset', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'X-Lab-CSRF': csrfToken },
      });
      if (!response.ok)
        throw new Error(`Reset API returned ${response.status}`);
      employees = await fetchAllEmployees();
      initializeViews();
      result(
        '#tables-load-status',
        `Sandbox reset; ${employees.length} seed employees restored.`,
        'success',
      );
    } catch (error) {
      result(
        '#tables-load-status',
        error instanceof Error ? error.message : 'Reset failed.',
        'error',
      );
    }
  },
);

function initializeViews(): void {
  populateFilter('#department-filter', uniqueValues('department'));
  populateFilter('#location-filter', uniqueValues('location'));
  renderSortable();
  renderSearch();
  renderFiltered();
  renderClientPage();
  void renderServerPage();
  renderEditable();
  dynamicRows = employees.slice(0, 3).map((employee) => ({ ...employee }));
  renderDynamic();
  selectionRows = employees.slice(0, 20).map((employee) => ({ ...employee }));
  selectedIds.clear();
  selectionPage = 1;
  renderSelectable();
  renderExpandable();
  renderSticky();
  renderVirtual();
}

async function initializeTableLab(): Promise<void> {
  try {
    employees = await fetchAllEmployees();
    initializeViews();
    result(
      '#tables-load-status',
      `${employees.length} synthetic employees loaded from the Practice API.`,
      'success',
    );
  } catch {
    initializeViews();
    result(
      '#tables-load-status',
      `${employees.length} deterministic employees loaded for local preview; hosted staging uses the Practice API.`,
    );
  }
}

await initializeTableLab();

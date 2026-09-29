import { query, queryAll, result } from './fixture-dom';
import {
  seedEmployees,
  seedProducts,
  type ApiEmployee,
  type ApiProduct,
} from '../lib/table-data';

interface ListEnvelope<T> {
  data?: T[];
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    nextCursor?: string | null;
  };
}

let employees = [...seedEmployees];

function employeeText(employee: ApiEmployee): string {
  return `${employee.name} · ${employee.department} · ${employee.location} · ${employee.active ? 'Active' : 'Inactive'}`;
}

function renderEmployees(
  selector: string,
  rows: ApiEmployee[],
  emptyMessage = 'No employees found.',
): void {
  const list = query<HTMLUListElement>(selector);
  list.replaceChildren();
  if (!rows.length) {
    const item = document.createElement('li');
    item.className = 'list-empty';
    item.textContent = emptyMessage;
    list.append(item);
    return;
  }
  for (const employee of rows) {
    const item = document.createElement('li');
    item.dataset.employeeId = employee.id;
    item.textContent = employeeText(employee);
    list.append(item);
  }
}

function matches(employee: ApiEmployee, value: string): boolean {
  return employeeText(employee)
    .toLowerCase()
    .includes(value.trim().toLowerCase());
}

async function fetchEmployeeList(queryString: string): Promise<ApiEmployee[]> {
  const response = await fetch(`/practice/api/v1/employees?${queryString}`, {
    credentials: 'same-origin',
  });
  if (!response.ok) throw new Error(`Employee API returned ${response.status}`);
  const body = (await response.json()) as ListEnvelope<ApiEmployee>;
  return body.data ?? [];
}

const instantInput = query<HTMLInputElement>('#instant-list-search');
instantInput.addEventListener('input', () => {
  const rows = employees.filter((employee) =>
    matches(employee, instantInput.value),
  );
  renderEmployees('#instant-list', rows.slice(0, 20));
  result('#instant-list-status', `${rows.length} instant matches.`);
});

query<HTMLButtonElement>('#run-delayed-search').addEventListener(
  'click',
  async () => {
    const value = query<HTMLInputElement>('#delayed-list-search').value.trim();
    if (!value) {
      result('#delayed-list-status', 'Enter a search term.', 'error');
      return;
    }
    result(
      '#delayed-list-status',
      'Waiting for the controlled 400 ms API delay…',
    );
    const started = performance.now();
    try {
      const rows = await fetchEmployeeList(
        `q=${encodeURIComponent(value)}&delay=400&limit=20&sort=id`,
      );
      renderEmployees('#delayed-list', rows);
      result(
        '#delayed-list-status',
        `${rows.length} API matches returned after at least 400 ms (${Math.round(performance.now() - started)} ms observed).`,
        'success',
      );
    } catch {
      await new Promise((resolve) => window.setTimeout(resolve, 400));
      const rows = employees
        .filter((employee) => matches(employee, value))
        .slice(0, 20);
      renderEmployees('#delayed-list', rows);
      result(
        '#delayed-list-status',
        `${rows.length} local fallback matches returned after the controlled 400 ms delay.`,
      );
    }
  },
);

let debounceTimer = 0;
const debouncedInput = query<HTMLInputElement>('#debounced-list-search');
debouncedInput.addEventListener('input', () => {
  window.clearTimeout(debounceTimer);
  result('#debounced-list-status', 'Waiting for 350 ms of quiet input…');
  debounceTimer = window.setTimeout(() => {
    const rows = employees.filter((employee) =>
      matches(employee, debouncedInput.value),
    );
    renderEmployees('#debounced-list', rows.slice(0, 20));
    result(
      '#debounced-list-status',
      `${rows.length} matches; debounced query applied.`,
      'success',
    );
  }, 350);
});

const autocomplete = query<HTMLInputElement>('#employee-autocomplete');
const suggestions = query<HTMLUListElement>('#employee-suggestions');
let activeSuggestion = -1;

function visibleSuggestions(): ApiEmployee[] {
  const value = autocomplete.value.trim();
  if (value.length < 2) return [];
  return employees.filter((employee) => matches(employee, value)).slice(0, 8);
}

function chooseSuggestion(employee: ApiEmployee): void {
  autocomplete.value = employee.name;
  autocomplete.setAttribute('aria-expanded', 'false');
  autocomplete.removeAttribute('aria-activedescendant');
  suggestions.replaceChildren();
  activeSuggestion = -1;
  result(
    '#autocomplete-result',
    `Selected ${employee.name} from ${employee.department}.`,
    'success',
  );
}

function renderSuggestions(): void {
  const rows = visibleSuggestions();
  suggestions.replaceChildren();
  activeSuggestion = Math.min(activeSuggestion, rows.length - 1);
  for (const [index, employee] of rows.entries()) {
    const item = document.createElement('li');
    item.id = `employee-suggestion-${index}`;
    item.setAttribute('role', 'option');
    item.setAttribute('aria-selected', String(index === activeSuggestion));
    const choose = document.createElement('button');
    choose.type = 'button';
    choose.textContent = `${employee.name} — ${employee.department}`;
    choose.addEventListener('click', () => chooseSuggestion(employee));
    item.append(choose);
    suggestions.append(item);
  }
  autocomplete.setAttribute('aria-expanded', String(rows.length > 0));
  if (activeSuggestion >= 0) {
    autocomplete.setAttribute(
      'aria-activedescendant',
      `employee-suggestion-${activeSuggestion}`,
    );
  } else autocomplete.removeAttribute('aria-activedescendant');
  result(
    '#autocomplete-result',
    rows.length ? `${rows.length} suggestions available.` : 'No suggestions.',
  );
}

autocomplete.addEventListener('input', () => {
  activeSuggestion = -1;
  renderSuggestions();
});
autocomplete.addEventListener('keydown', (event) => {
  const rows = visibleSuggestions();
  if (event.key === 'ArrowDown' && rows.length) {
    event.preventDefault();
    activeSuggestion = (activeSuggestion + 1) % rows.length;
    renderSuggestions();
  } else if (event.key === 'ArrowUp' && rows.length) {
    event.preventDefault();
    activeSuggestion = (activeSuggestion - 1 + rows.length) % rows.length;
    renderSuggestions();
  } else if (event.key === 'Enter' && activeSuggestion >= 0) {
    event.preventDefault();
    const employee = rows[activeSuggestion];
    if (employee) chooseSuggestion(employee);
  } else if (event.key === 'Escape') {
    suggestions.replaceChildren();
    autocomplete.setAttribute('aria-expanded', 'false');
  }
});

function setOptions(id: string, values: string[]): void {
  const select = query<HTMLSelectElement>(id);
  while (select.options.length > 1) select.remove(1);
  for (const value of values) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    select.append(option);
  }
}

function renderCombinedFilters(): void {
  const department = query<HTMLSelectElement>('#list-department-filter').value;
  const location = query<HTMLSelectElement>('#list-location-filter').value;
  const status = query<HTMLSelectElement>('#list-status-filter').value;
  const rows = employees.filter(
    (employee) =>
      (!department || employee.department === department) &&
      (!location || employee.location === location) &&
      (!status || String(employee.active) === status),
  );
  renderEmployees('#combined-filter-list', rows.slice(0, 30));
  result(
    '#combined-filter-status',
    rows.length
      ? `${rows.length} employees match the combined filters.`
      : 'No employees match the combined filters.',
    rows.length ? 'success' : 'error',
  );
}

for (const filter of queryAll<HTMLSelectElement>(
  '#list-department-filter, #list-location-filter, #list-status-filter',
)) {
  filter.addEventListener('change', renderCombinedFilters);
}

function populateEmployeeViews(): void {
  setOptions(
    '#list-department-filter',
    [...new Set(employees.map((employee) => employee.department))].sort(),
  );
  setOptions(
    '#list-location-filter',
    [...new Set(employees.map((employee) => employee.location))].sort(),
  );
  renderEmployees('#instant-list', employees.slice(0, 20));
  renderEmployees('#debounced-list', employees.slice(0, 20));
  renderCombinedFilters();
}

async function fetchProductsByPage(
  page: number,
  limit: number,
): Promise<{
  rows: ApiProduct[];
  total: number;
}> {
  const response = await fetch(
    `/practice/api/v1/products?page=${page}&limit=${limit}&sort=id`,
    { credentials: 'same-origin' },
  );
  if (!response.ok) throw new Error(`Product API returned ${response.status}`);
  const body = (await response.json()) as ListEnvelope<ApiProduct>;
  return {
    rows: body.data ?? [],
    total:
      body.meta?.total ?? Number(response.headers.get('x-total-count') ?? 0),
  };
}

function appendProducts(selector: string, products: ApiProduct[]): void {
  const list = query<HTMLUListElement>(selector);
  for (const product of products) {
    if (list.querySelector(`[data-product-id="${product.id}"]`)) continue;
    const item = document.createElement('li');
    item.dataset.productId = product.id;
    item.textContent = `${product.name} · ${product.category} · ₹${product.price}`;
    list.append(item);
  }
}

let loadMorePage = 0;
const loadMoreSize = 8;
query<HTMLButtonElement>('#load-more-button').addEventListener(
  'click',
  async () => {
    const control = query<HTMLButtonElement>('#load-more-button');
    control.disabled = true;
    result('#load-more-status', 'Loading the next product page…');
    loadMorePage += 1;
    try {
      const response = await fetchProductsByPage(loadMorePage, loadMoreSize);
      appendProducts('#load-more-products', response.rows);
      const visible = query('#load-more-products').children.length;
      control.disabled = visible >= response.total;
      result(
        '#load-more-status',
        visible >= response.total
          ? `All ${response.total} products loaded.`
          : `Showing ${visible} of ${response.total} products.`,
        'success',
      );
    } catch {
      const start = (loadMorePage - 1) * loadMoreSize;
      appendProducts(
        '#load-more-products',
        seedProducts.slice(start, start + loadMoreSize),
      );
      const visible = query('#load-more-products').children.length;
      control.disabled = visible >= seedProducts.length;
      result(
        '#load-more-status',
        visible >= seedProducts.length
          ? `All ${seedProducts.length} local products loaded.`
          : `Showing ${visible} of ${seedProducts.length} local products.`,
      );
    } finally {
      if (!control.disabled) control.disabled = false;
    }
  },
);

const infiniteViewport = query<HTMLElement>('#api-infinite-list');
let nextCursor: string | null | undefined;
let infiniteBusy = false;
let infiniteFallbackOffset = 0;
const infiniteSize = 20;

async function loadInfinitePage(): Promise<void> {
  if (infiniteBusy || nextCursor === null) return;
  infiniteBusy = true;
  result('#infinite-list-status', 'Loading next API cursor page…');
  try {
    const cursorQuery = nextCursor
      ? `&cursor=${encodeURIComponent(nextCursor)}`
      : '';
    const response = await fetch(
      `/practice/api/v1/products?limit=${infiniteSize}&sort=id${cursorQuery}`,
      { credentials: 'same-origin' },
    );
    if (!response.ok)
      throw new Error(`Product API returned ${response.status}`);
    const body = (await response.json()) as ListEnvelope<ApiProduct>;
    appendProducts('#infinite-product-items', body.data ?? []);
    nextCursor = body.meta?.nextCursor ?? null;
    const visible = query('#infinite-product-items').children.length;
    result(
      '#infinite-list-status',
      nextCursor
        ? `${visible} products loaded; scroll for the next API cursor.`
        : 'End of API product list.',
      'success',
    );
  } catch {
    const rows = seedProducts.slice(
      infiniteFallbackOffset,
      infiniteFallbackOffset + infiniteSize,
    );
    infiniteFallbackOffset += rows.length;
    appendProducts('#infinite-product-items', rows);
    nextCursor =
      infiniteFallbackOffset < seedProducts.length
        ? `fallback-${infiniteFallbackOffset}`
        : null;
    result(
      '#infinite-list-status',
      nextCursor
        ? `${infiniteFallbackOffset} local products loaded; scroll for more.`
        : 'End of local product list.',
    );
  } finally {
    infiniteBusy = false;
  }
}

infiniteViewport.addEventListener(
  'scroll',
  () => {
    const nearEnd =
      infiniteViewport.scrollTop + infiniteViewport.clientHeight >=
      infiniteViewport.scrollHeight - 24;
    if (nearEnd) void loadInfinitePage();
  },
  { passive: true },
);

populateEmployeeViews();
void loadInfinitePage();

void (async () => {
  try {
    employees = await fetchEmployeeList('page=1&limit=100&sort=id');
    const second = await fetchEmployeeList('page=2&limit=100&sort=id');
    employees.push(...second);
    populateEmployeeViews();
    result(
      '#list-load-status',
      `${employees.length} synthetic employees loaded from the Practice API.`,
      'success',
    );
  } catch {
    result(
      '#list-load-status',
      `${employees.length} deterministic employees loaded for local preview; hosted staging uses the Practice API.`,
    );
  }
})();

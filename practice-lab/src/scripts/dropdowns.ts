import { delay, query, queryAll, result } from './fixture-dom';

query<HTMLSelectElement>('#native-select').addEventListener(
  'change',
  (event) => {
    result(
      '#native-select-result',
      `${(event.currentTarget as HTMLSelectElement).value} selected.`,
    );
  },
);

query<HTMLSelectElement>('#multi-select').addEventListener(
  'change',
  (event) => {
    const selected = [
      ...(event.currentTarget as HTMLSelectElement).selectedOptions,
    ].map((option) => option.value);
    result(
      '#multi-select-result',
      selected.length
        ? `Selected: ${selected.join(', ')}.`
        : 'Nothing selected.',
    );
  },
);

query<HTMLSelectElement>('#grouped-select').addEventListener(
  'change',
  (event) => {
    result(
      '#grouped-select-result',
      `${(event.currentTarget as HTMLSelectElement).value} selected from a group.`,
    );
  },
);

const searchableInput = query<HTMLInputElement>('#searchable-select');
for (const option of queryAll<HTMLElement>(
  '#searchable-options [role="option"]',
)) {
  option.addEventListener('click', () => {
    searchableInput.value = option.textContent ?? '';
    result(
      '#searchable-result',
      `${searchableInput.value} selected.`,
      'success',
    );
  });
}
searchableInput.addEventListener('input', () => {
  const term = searchableInput.value.toLowerCase();
  for (const option of queryAll<HTMLElement>(
    '#searchable-options [role="option"]',
  )) {
    option.hidden = !(
      option.textContent?.toLowerCase().includes(term) ?? false
    );
  }
});

const combo = query<HTMLInputElement>('#aria-combobox');
const comboOptions = queryAll<HTMLElement>('#aria-listbox [role="option"]');
let comboIndex = -1;
function selectCombo(index: number): void {
  const option = comboOptions[index];
  if (!option) return;
  combo.value = option.textContent ?? '';
  comboIndex = index;
  for (const [position, candidate] of comboOptions.entries())
    candidate.setAttribute('aria-selected', String(position === index));
  combo.setAttribute('aria-activedescendant', option.id);
  combo.setAttribute('aria-expanded', 'false');
  result(
    '#combobox-result',
    `${combo.value} selected with ARIA combobox.`,
    'success',
  );
}
combo.addEventListener('focus', () =>
  combo.setAttribute('aria-expanded', 'true'),
);
combo.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    const delta = event.key === 'ArrowDown' ? 1 : -1;
    comboIndex =
      (comboIndex + delta + comboOptions.length) % comboOptions.length;
    for (const [position, option] of comboOptions.entries())
      option.classList.toggle('is-active', position === comboIndex);
    combo.setAttribute(
      'aria-activedescendant',
      comboOptions[comboIndex]?.id ?? '',
    );
  }
  if (event.key === 'Enter' && comboIndex >= 0) {
    event.preventDefault();
    selectCombo(comboIndex);
  }
});
for (const [index, option] of comboOptions.entries())
  option.addEventListener('click', () => selectCombo(index));

const locationMap: Record<string, { country: string; state: string }> = {
  Ahmedabad: { country: 'India', state: 'Gujarat' },
  Bengaluru: { country: 'India', state: 'Karnataka' },
  Chennai: { country: 'India', state: 'Tamil Nadu' },
  Delhi: { country: 'India', state: 'Delhi' },
  Hyderabad: { country: 'India', state: 'Telangana' },
  Mumbai: { country: 'India', state: 'Maharashtra' },
  Pune: { country: 'India', state: 'Maharashtra' },
  London: { country: 'United Kingdom', state: 'England' },
  Singapore: { country: 'Singapore', state: 'Singapore' },
};
const country = query<HTMLSelectElement>('#country-select');
const state = query<HTMLSelectElement>('#state-select');
const city = query<HTMLSelectElement>('#city-select');
let apiCities: string[] = [];

function fillSelect(
  select: HTMLSelectElement,
  values: string[],
  placeholder: string,
): void {
  select.replaceChildren(new Option(placeholder, ''));
  for (const value of values) select.add(new Option(value, value));
  select.disabled = values.length === 0;
}

query<HTMLButtonElement>('#load-locations').addEventListener(
  'click',
  async () => {
    result(
      '#dependent-result',
      'Loading customer cities from the Practice API…',
    );
    try {
      const response = await fetch('/practice/api/v1/customers?limit=100');
      if (!response.ok) throw new Error(`API returned ${response.status}`);
      const body = (await response.json()) as {
        data?: Array<{ city?: string }>;
      };
      apiCities = [
        ...new Set(
          (body.data ?? [])
            .map((item) => item.city ?? '')
            .filter((value) => locationMap[value]),
        ),
      ];
      const countries = [
        ...new Set(
          apiCities
            .map((value) => locationMap[value]?.country)
            .filter((value): value is string => Boolean(value)),
        ),
      ];
      fillSelect(country, countries, 'Choose country');
      fillSelect(state, [], 'Choose state');
      fillSelect(city, [], 'Choose city');
      result(
        '#dependent-result',
        `${apiCities.length} API cities loaded.`,
        'success',
      );
    } catch (error) {
      result(
        '#dependent-result',
        error instanceof Error ? error.message : 'Location API failed.',
        'error',
      );
    }
  },
);
country.addEventListener('change', () => {
  const states = [
    ...new Set(
      apiCities
        .filter((value) => locationMap[value]?.country === country.value)
        .map((value) => locationMap[value]?.state)
        .filter((value): value is string => Boolean(value)),
    ),
  ];
  fillSelect(state, states, 'Choose state');
  fillSelect(city, [], 'Choose city');
});
state.addEventListener('change', () => {
  const cities = apiCities.filter(
    (value) =>
      locationMap[value]?.country === country.value &&
      locationMap[value]?.state === state.value,
  );
  fillSelect(city, cities, 'Choose city');
});
city.addEventListener('change', () =>
  result(
    '#dependent-result',
    `${city.value}, ${state.value}, ${country.value} selected.`,
    'success',
  ),
);

query<HTMLButtonElement>('#load-dynamic-options').addEventListener(
  'click',
  async () => {
    const select = query<HTMLSelectElement>('#dynamic-select');
    select.disabled = true;
    result('#dynamic-select-result', 'Loading options after 400 ms…');
    await delay(400);
    fillSelect(select, ['Chromium', 'Firefox', 'WebKit'], 'Choose engine');
    result(
      '#dynamic-select-result',
      'Three browser engines loaded.',
      'success',
    );
  },
);
query<HTMLSelectElement>('#dynamic-select').addEventListener(
  'change',
  (event) => {
    result(
      '#dynamic-select-result',
      `${(event.currentTarget as HTMLSelectElement).value} selected.`,
      'success',
    );
  },
);

const infiniteList = query<HTMLDivElement>('#infinite-products');
let page = 0;
let loading = false;
let complete = false;
async function loadProducts(): Promise<void> {
  if (loading || complete) return;
  loading = true;
  result('#infinite-result', `Loading product page ${page + 1}…`);
  try {
    const response = await fetch(
      `/practice/api/v1/products?page=${page + 1}&limit=15`,
    );
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    const body = (await response.json()) as {
      data?: Array<{ id?: string; name?: string }>;
    };
    const products = body.data ?? [];
    for (const product of products) {
      const option = document.createElement('button');
      option.type = 'button';
      option.setAttribute('role', 'option');
      option.dataset.productId = product.id ?? '';
      option.textContent = product.name ?? 'Unnamed product';
      option.addEventListener('click', () =>
        result(
          '#infinite-result',
          `${option.textContent} selected.`,
          'success',
        ),
      );
      infiniteList.append(option);
    }
    page += 1;
    complete = products.length < 15 || page >= 4;
    result(
      '#infinite-result',
      `${infiniteList.childElementCount} products loaded${complete ? '; end reached' : ''}.`,
      'success',
    );
  } catch (error) {
    result(
      '#infinite-result',
      error instanceof Error ? error.message : 'Product API failed.',
      'error',
    );
  } finally {
    loading = false;
  }
}
query<HTMLButtonElement>('#open-infinite-products').addEventListener(
  'click',
  loadProducts,
);
infiniteList.addEventListener('scroll', () => {
  if (
    infiniteList.scrollTop + infiniteList.clientHeight >=
    infiniteList.scrollHeight - 12
  )
    void loadProducts();
});

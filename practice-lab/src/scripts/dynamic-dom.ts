import { query, queryAll, result } from './fixture-dom';

const seedInput = query<HTMLInputElement>('#dynamic-seed');
const urlSeed = new URLSearchParams(window.location.search).get('seed');
if (urlSeed && /^-?\d+$/.test(urlSeed)) seedInput.value = urlSeed;
let renderNumber = 0;
const learners = [
  'Aarav Mehta',
  'Ananya Rao',
  'Fatima Khan',
  'Rahul Sharma',
  'Zoya Iyer',
];

function hash(seed: number, salt: number): number {
  let value = (Math.abs(Math.trunc(seed)) + salt * 2654435761) >>> 0;
  value ^= value << 13;
  value ^= value >>> 17;
  value ^= value << 5;
  return value >>> 0;
}

function renderDynamicDom(): void {
  renderNumber += 1;
  const seed = Number(seedInput.value) || 4803;
  const action = query<HTMLButtonElement>('[data-dynamic-action="approve"]');
  action.id = `approve-${hash(seed, renderNumber).toString(36)}`;
  const card = query<HTMLElement>('[data-generated-card]');
  card.className = `generated-card g-${hash(seed + 17, renderNumber).toString(36)}`;
  const ordered = [...learners]
    .map((name, index) => ({
      name,
      rank: hash(seed + renderNumber, index + 1),
    }))
    .sort((left, right) => left.rank - right.rank);
  const list = query<HTMLUListElement>('#reordered-list');
  list.replaceChildren(
    ...ordered.map(({ name }) => {
      const item = document.createElement('li');
      item.textContent = name;
      return item;
    }),
  );
  result(
    '#dynamic-log',
    `Render ${renderNumber} uses seed ${seed}; generated ID is ${action.id}.`,
  );
}

query<HTMLButtonElement>('#rerender-dynamic').addEventListener(
  'click',
  renderDynamicDom,
);
query<HTMLButtonElement>('[data-dynamic-action="approve"]').addEventListener(
  'click',
  () => {
    result('#dynamic-log', 'Billing request approved.', 'success');
  },
);
for (const button of queryAll<HTMLButtonElement>('[data-context]')) {
  button.addEventListener('click', () =>
    result(
      '#dynamic-log',
      `${button.dataset.context} workflow continued.`,
      'success',
    ),
  );
}
query<HTMLButtonElement>('#replace-dynamic-card').addEventListener(
  'click',
  () => {
    const original = query<HTMLElement>('#replacement-card');
    const replacement = document.createElement('article');
    replacement.setAttribute('aria-label', 'Replacement card');
    replacement.innerHTML =
      '<h3>Replacement card</h3><p>The original node detached successfully.</p>';
    original.replaceWith(replacement);
    result(
      '#dynamic-log',
      'Original card replaced with a new DOM node.',
      'success',
    );
  },
);

query<HTMLButtonElement>('#load-api-dom').addEventListener(
  'click',
  async () => {
    const target = query<HTMLElement>('#api-dom-results');
    target.textContent = 'Waiting for the employee response…';
    let names = ['Aarav Mehta', 'Ananya Rao', 'Fatima Khan'];
    try {
      const response = await fetch(
        '/practice/api/v1/employees?limit=3&sort=id',
      );
      if (!response.ok) throw new Error(String(response.status));
      const body = (await response.json()) as {
        data?: Array<{ name?: string }>;
      };
      names = (body.data ?? []).map(
        (employee) => employee.name ?? 'Synthetic employee',
      );
    } catch {
      // Static preview preserves the same observable fixture contract.
    }
    target.replaceChildren(
      ...names.map((name) => {
        const article = document.createElement('article');
        article.className = 'card';
        article.setAttribute('aria-label', name);
        article.innerHTML = `<h3>${name}</h3><p>API-rendered employee</p>`;
        return article;
      }),
    );
    result(
      '#dynamic-log',
      `${names.length} employees rendered after the API call.`,
      'success',
    );
  },
);

renderDynamicDom();

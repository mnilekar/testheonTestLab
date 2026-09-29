import { delay, query, result } from './fixture-dom';

const delaySelect = query<HTMLSelectElement>('#wait-delay');
const seedInput = query<HTMLInputElement>('#wait-seed');
const pinned = new URLSearchParams(window.location.search).get('delay');

function seededDelay(seed: number): number {
  let value = Math.abs(Math.trunc(seed)) || 1;
  value = (value * 1664525 + 1013904223) >>> 0;
  return 1000 + (value % 9001);
}

function currentDelay(): number {
  if (pinned !== null && /^\d+$/.test(pinned)) {
    return Math.min(10_000, Number(pinned));
  }
  if (delaySelect.value === 'random')
    return seededDelay(Number(seedInput.value));
  return Number(delaySelect.value);
}

function describeDelay(): void {
  const milliseconds = currentDelay();
  result(
    '#wait-control-result',
    `${pinned !== null ? 'URL-pinned' : 'Selected'} delay: ${milliseconds.toLocaleString()} ms${delaySelect.value === 'random' ? ` (seed ${seedInput.value})` : ''}.`,
  );
}

if (pinned !== null && /^\d+$/.test(pinned)) {
  const option = document.createElement('option');
  option.value = String(Math.min(10_000, Number(pinned)));
  option.textContent = `${option.value} ms (URL override)`;
  delaySelect.prepend(option);
  delaySelect.value = option.value;
}
delaySelect.addEventListener('change', describeDelay);
seedInput.addEventListener('input', describeDelay);
describeDelay();

query<HTMLButtonElement>('#start-appearance').addEventListener(
  'click',
  async () => {
    const target = query<HTMLElement>('#appeared-element');
    target.hidden = true;
    await delay(currentDelay());
    target.hidden = false;
  },
);

const enabledTarget = query<HTMLButtonElement>('#enabled-target');
query<HTMLButtonElement>('#start-enable').addEventListener(
  'click',
  async () => {
    enabledTarget.disabled = true;
    result('#enabled-result', 'Waiting for the action to become enabled…');
    await delay(currentDelay());
    enabledTarget.disabled = false;
    result('#enabled-result', 'Target is enabled.', 'success');
  },
);
enabledTarget.addEventListener('click', () =>
  result('#enabled-result', 'Enabled action completed.', 'success'),
);

query<HTMLButtonElement>('#start-text-change').addEventListener(
  'click',
  async () => {
    result('#text-change-result', 'Build running…');
    await delay(currentDelay());
    result(
      '#text-change-result',
      'Build complete: 48 checks passed.',
      'success',
    );
  },
);

query<HTMLButtonElement>('#start-spinner').addEventListener(
  'click',
  async () => {
    const spinner = query<HTMLElement>('#spinner');
    const content = query<HTMLElement>('#spinner-content');
    content.hidden = true;
    spinner.hidden = false;
    await delay(currentDelay());
    spinner.hidden = true;
    content.hidden = false;
  },
);

query<HTMLButtonElement>('#start-skeleton').addEventListener(
  'click',
  async () => {
    const skeleton = query<HTMLElement>('#skeleton');
    const content = query<HTMLElement>('#skeleton-content');
    content.hidden = true;
    skeleton.hidden = false;
    await delay(currentDelay());
    skeleton.hidden = true;
    content.hidden = false;
  },
);

query<HTMLButtonElement>('#start-progress').addEventListener(
  'click',
  async () => {
    const bar = query<HTMLProgressElement>('#wait-progress-bar');
    const milliseconds = currentDelay();
    bar.value = 0;
    for (let step = 1; step <= 10; step += 1) {
      await delay(milliseconds / 10);
      bar.value = step * 10;
      result(
        '#progress-result',
        `Progress: ${bar.value}%.`,
        bar.value === 100 ? 'success' : 'neutral',
      );
    }
  },
);

async function controlledFetch(resource: string): Promise<void> {
  const milliseconds = currentDelay();
  try {
    const response = await fetch(
      `/practice/api/v1/${resource}?limit=1&delay=${milliseconds}`,
    );
    if (!response.ok) throw new Error(String(response.status));
  } catch {
    await delay(milliseconds);
  }
}

let requestCount = 0;
query<HTMLButtonElement>('#run-background-request').addEventListener(
  'click',
  async () => {
    result('#network-result', 'Background request running…');
    await controlledFetch('users');
    requestCount += 1;
    query('#network-counter').textContent = String(requestCount);
    result('#network-result', 'Background request completed.', 'success');
  },
);

query<HTMLButtonElement>('#run-concurrent-requests').addEventListener(
  'click',
  async () => {
    result('#concurrent-result', 'Waiting for users, products, and employees…');
    await Promise.all(['users', 'products', 'employees'].map(controlledFetch));
    result(
      '#concurrent-result',
      'Combined result: 3 of 3 requests completed.',
      'success',
    );
  },
);

query<HTMLButtonElement>('#load-delayed-options').addEventListener(
  'click',
  async () => {
    const select = query<HTMLSelectElement>('#delayed-environment');
    select.disabled = true;
    result('#dropdown-result', 'Loading environment options…');
    await delay(currentDelay());
    select.innerHTML =
      '<option value="">Choose an environment</option><option value="development">Development</option><option value="staging">Staging</option><option value="production-simulated">Production simulation</option>';
    select.disabled = false;
    result('#dropdown-result', '3 environments loaded.', 'success');
  },
);

const lazyTarget = query<HTMLElement>('#lazy-target');
const lazyObserver = new IntersectionObserver(
  (entries, observer) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    query<HTMLImageElement>('#lazy-image').src = '/practice/favicon.svg';
    query<HTMLImageElement>('#lazy-image').alt = 'Testheon Practice Lab mark';
    lazyTarget.dataset.lazyPending = 'false';
    result('#lazy-result', 'Lazy image and module loaded.', 'success');
    observer.disconnect();
  },
  { rootMargin: '0px' },
);
lazyObserver.observe(lazyTarget);

const infiniteItems = query<HTMLUListElement>('#wait-infinite-items');
let infiniteCount = 0;
let infiniteBusy = false;
async function appendInfinite(): Promise<void> {
  if (infiniteBusy || infiniteCount >= 25) return;
  infiniteBusy = true;
  result('#wait-infinite-result', 'Loading the next five items…');
  await delay(Math.min(currentDelay(), 1000));
  for (
    let index = infiniteCount + 1;
    index <= Math.min(infiniteCount + 5, 25);
    index += 1
  ) {
    const item = document.createElement('li');
    item.textContent = `Deterministic activity ${index}`;
    infiniteItems.append(item);
  }
  infiniteCount += 5;
  infiniteBusy = false;
  result(
    '#wait-infinite-result',
    infiniteCount >= 25
      ? 'End of deterministic activity list.'
      : `${infiniteCount} of 25 activities loaded; scroll for more.`,
    infiniteCount >= 25 ? 'success' : 'neutral',
  );
}
const infiniteObserver = new IntersectionObserver(
  (entries) => {
    if (entries.some((entry) => entry.isIntersecting)) void appendInfinite();
  },
  { root: query('#wait-infinite-list') },
);
infiniteObserver.observe(query('#wait-infinite-sentinel'));
query<HTMLElement>('#wait-infinite-list').addEventListener(
  'scroll',
  (event) => {
    const list = event.currentTarget as HTMLElement;
    if (list.scrollTop + list.clientHeight >= list.scrollHeight - 12)
      void appendInfinite();
  },
);
void appendInfinite();

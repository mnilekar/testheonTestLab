import { delay, query, result } from './fixture-dom';

query<HTMLInputElement>('#native-date-input').addEventListener(
  'input',
  (event) => {
    result(
      '#native-date-result',
      `Release date: ${(event.currentTarget as HTMLInputElement).value}.`,
      'success',
    );
  },
);

const calendar = query<HTMLDialogElement>('#custom-calendar-dialog');
const calendarGrid = query<HTMLElement>('#calendar-grid');
let calendarMonth = 9;
let calendarYear = 2026;
function isoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
function renderCalendar(): void {
  const monthLabel = new Intl.DateTimeFormat('en', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(calendarYear, calendarMonth, 1)));
  query('#custom-calendar-title').textContent = monthLabel;
  calendarGrid.setAttribute('aria-label', `${monthLabel} calendar`);
  const firstDay = new Date(
    Date.UTC(calendarYear, calendarMonth, 1),
  ).getUTCDay();
  const days = new Date(
    Date.UTC(calendarYear, calendarMonth + 1, 0),
  ).getUTCDate();
  const cells: HTMLElement[] = [];
  for (let index = 0; index < firstDay; index += 1) {
    const blank = document.createElement('span');
    blank.setAttribute('aria-hidden', 'true');
    cells.push(blank);
  }
  for (let day = 1; day <= days; day += 1) {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('role', 'gridcell');
    const date = new Date(Date.UTC(calendarYear, calendarMonth, day));
    const accessible = new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(date);
    button.setAttribute('aria-label', accessible);
    button.textContent = String(day);
    button.addEventListener('click', () => {
      const value = isoDate(calendarYear, calendarMonth, day);
      calendar.close();
      result('#custom-date-result', `Selected date: ${value}.`, 'success');
    });
    cells.push(button);
  }
  calendarGrid.replaceChildren(...cells);
}
query<HTMLButtonElement>('#open-custom-calendar').addEventListener(
  'click',
  () => {
    calendar.showModal();
    query<HTMLButtonElement>('[role="gridcell"]', calendarGrid).focus();
  },
);
query<HTMLButtonElement>('#close-custom-calendar').addEventListener(
  'click',
  () => calendar.close(),
);
query<HTMLButtonElement>('#previous-calendar-month').addEventListener(
  'click',
  () => {
    calendarMonth -= 1;
    if (calendarMonth < 0) {
      calendarMonth = 11;
      calendarYear -= 1;
    }
    renderCalendar();
  },
);
query<HTMLButtonElement>('#next-calendar-month').addEventListener(
  'click',
  () => {
    calendarMonth += 1;
    if (calendarMonth > 11) {
      calendarMonth = 0;
      calendarYear += 1;
    }
    renderCalendar();
  },
);
renderCalendar();

const start = query<HTMLInputElement>('#range-start');
const end = query<HTMLInputElement>('#range-end');
function updateRange(): void {
  const startDate = new Date(`${start.value}T00:00:00Z`);
  const endDate = new Date(`${end.value}T00:00:00Z`);
  const days = Math.round(
    (endDate.getTime() - startDate.getTime()) / 86_400_000,
  );
  if (!start.value || !end.value || days < 0) {
    result(
      '#date-range-result',
      'End date must be on or after the start date.',
      'error',
    );
    return;
  }
  result(
    '#date-range-result',
    `Range: ${start.value} to ${end.value} (${days} days).`,
    'success',
  );
}
start.addEventListener('input', updateRange);
end.addEventListener('input', updateRange);

function updateSelectors(): void {
  result(
    '#selector-result',
    `Month ${query<HTMLInputElement>('#month-selector').value} · year ${query<HTMLSelectElement>('#year-selector').value} · time ${query<HTMLInputElement>('#time-selector').value}.`,
    'success',
  );
}
for (const selector of ['#month-selector', '#year-selector', '#time-selector'])
  query<HTMLElement>(selector).addEventListener('input', updateSelectors);

const fallbackNow = '2026-10-15T09:30:00+05:30';
const suppliedNow = new URLSearchParams(window.location.search).get('now');
const reference =
  suppliedNow && !Number.isNaN(Date.parse(suppliedNow))
    ? suppliedNow
    : fallbackNow;
const instant = new Date(reference);
query('#reference-instant').textContent = reference;
function formatZone(zone: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'medium',
    hour12: false,
    timeZone: zone,
  }).format(instant);
}
query('#utc-time').textContent = formatZone('UTC');
query('#kolkata-time').textContent = formatZone('Asia/Kolkata');
query('#new-york-time').textContent = formatZone('America/New_York');
result(
  '#timezone-result',
  `Reference clock pinned to ${reference}.`,
  'success',
);

const confidence = query<HTMLInputElement>('#confidence-slider');
confidence.addEventListener('input', () => {
  query<HTMLOutputElement>('#confidence-output').value = confidence.value;
});

const salaryMin = query<HTMLInputElement>('#salary-min');
const salaryMax = query<HTMLInputElement>('#salary-max');
const indianCurrency = new Intl.NumberFormat('en-IN');
function updateSalary(changed: 'min' | 'max'): void {
  if (Number(salaryMin.value) > Number(salaryMax.value)) {
    if (changed === 'min') salaryMax.value = salaryMin.value;
    else salaryMin.value = salaryMax.value;
  }
  result(
    '#dual-range-result',
    `Salary range: ₹${indianCurrency.format(Number(salaryMin.value))}–₹${indianCurrency.format(Number(salaryMax.value))}.`,
    'success',
  );
}
salaryMin.addEventListener('input', () => updateSalary('min'));
salaryMax.addEventListener('input', () => updateSalary('max'));

function updateCost(): void {
  const hours = Number(query<HTMLInputElement>('#estimate-hours').value);
  const rate = Number(query<HTMLInputElement>('#hourly-rate').value);
  result(
    '#linked-result',
    `Estimated cost: ₹${indianCurrency.format(hours * rate)}.`,
    'success',
  );
}
query<HTMLInputElement>('#estimate-hours').addEventListener(
  'input',
  updateCost,
);
query<HTMLInputElement>('#hourly-rate').addEventListener('input', updateCost);

let retryCount = 2;
function updateStepper(): void {
  query<HTMLOutputElement>('#stepper-value').value = String(retryCount);
  result('#stepper-result', `Retry count: ${retryCount}.`, 'success');
}
query<HTMLButtonElement>('#stepper-minus').addEventListener('click', () => {
  retryCount = Math.max(0, retryCount - 1);
  updateStepper();
});
query<HTMLButtonElement>('#stepper-plus').addEventListener('click', () => {
  retryCount = Math.min(5, retryCount + 1);
  updateStepper();
});

query<HTMLButtonElement>('#start-async-job').addEventListener(
  'click',
  async () => {
    const duration = Number(query<HTMLSelectElement>('#job-duration').value);
    const progress = query<HTMLProgressElement>('#async-job-progress');
    progress.value = 0;
    for (let step = 1; step <= 10; step += 1) {
      await delay(duration / 10);
      progress.value = step * 10;
      result(
        '#async-job-result',
        progress.value === 100
          ? 'Async job complete: 100%.'
          : `Async job progress: ${progress.value}%.`,
        progress.value === 100 ? 'success' : 'neutral',
      );
    }
  },
);

import { query, queryAll, result, valueOf } from './fixture-dom';

interface ApiEnvelope {
  data?: Record<string, unknown> | Array<Record<string, unknown>>;
  error?: {
    code?: string;
    message?: string;
    details?: Array<{ field?: string }>;
  };
}

let csrfToken = '';

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

function clearErrors(form: HTMLFormElement): void {
  for (const control of queryAll<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >('[aria-invalid="true"]', form)) {
    control.removeAttribute('aria-invalid');
  }
  for (const error of queryAll<HTMLElement>('[data-field-error]', form))
    error.textContent = '';
  const summary = query<HTMLElement>('[data-error-summary]', form);
  summary.hidden = true;
  summary.replaceChildren();
}

function fieldError(
  form: HTMLFormElement,
  name: string,
  message: string,
): void {
  const control = form.elements.namedItem(name);
  if (control instanceof HTMLElement)
    control.setAttribute('aria-invalid', 'true');
  const error = form.querySelector<HTMLElement>(`[data-field-error="${name}"]`);
  if (error) error.textContent = message;
}

function validate(form: HTMLFormElement): string[] {
  clearErrors(form);
  const messages: string[] = [];
  for (const control of queryAll<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >('[required]', form)) {
    if (control.disabled || control.closest('[hidden]')) continue;
    if (!control.checkValidity()) {
      const label = control.labels?.[0]?.textContent?.trim() ?? control.name;
      const message = `${label} is required or invalid.`;
      messages.push(message);
      fieldError(form, control.name, message);
    }
  }
  if (form.id === 'registration-form') {
    const password = valueOf(form, 'password');
    const confirmation = valueOf(form, 'passwordConfirmation');
    if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
      const message =
        'Password needs 8 characters, one uppercase letter and one number.';
      messages.push(message);
      fieldError(form, 'password', message);
    }
    if (password !== confirmation) {
      const message = 'Password confirmation must match.';
      messages.push(message);
      fieldError(form, 'passwordConfirmation', message);
    }
  }
  const summary = query<HTMLElement>('[data-error-summary]', form);
  if (messages.length) {
    const heading = document.createElement('strong');
    heading.textContent = `Fix ${messages.length} field${messages.length === 1 ? '' : 's'}:`;
    const list = document.createElement('ul');
    for (const message of messages) {
      const item = document.createElement('li');
      item.textContent = message;
      list.append(item);
    }
    summary.append(heading, list);
    summary.hidden = false;
  }
  return messages;
}

function payloadFor(form: HTMLFormElement): {
  resource: string;
  body: Record<string, unknown>;
} {
  switch (form.id) {
    case 'registration-form':
      return {
        resource: 'users',
        body: {
          name: `${valueOf(form, 'firstName')} ${valueOf(form, 'lastName')}`,
          email: valueOf(form, 'email'),
          role: 'learner',
          active: true,
        },
      };
    case 'contact-form':
      return {
        resource: 'customers',
        body: {
          name: valueOf(form, 'name'),
          email: valueOf(form, 'email'),
          city: valueOf(form, 'city'),
          tier: 'standard',
          active: true,
        },
      };
    case 'job-form':
      return {
        resource: 'employees',
        body: {
          name: valueOf(form, 'name'),
          department: valueOf(form, 'department'),
          location: valueOf(form, 'location'),
          title: valueOf(form, 'role'),
          active: true,
        },
      };
    case 'support-form':
      return {
        resource: 'tickets',
        body: {
          subject: valueOf(form, 'subject'),
          status: 'open',
          priority: valueOf(form, 'priority'),
          customerId: 'cus-001',
          assigneeId: 'emp-001',
        },
      };
    case 'feedback-form':
      return {
        resource: 'tasks',
        body: {
          title: `Rating ${valueOf(form, 'rating')}: ${valueOf(form, 'comments')}`,
          status: 'todo',
          priority: 'medium',
          assigneeId: 'emp-001',
          dueDate: '2026-12-31',
        },
      };
    default:
      throw new Error('This form has no API mapping.');
  }
}

async function submitApiForm(form: HTMLFormElement): Promise<void> {
  const output = `#${form.dataset.resultId ?? ''}`;
  if (validate(form).length) {
    result(output, 'Client validation blocked the request.', 'error');
    return;
  }
  result(output, 'Submitting to the Practice API…');
  try {
    await ensureSession();
    const { resource, body } = payloadFor(form);
    const simulate = query<HTMLSelectElement>('#form-server-simulation').value;
    const queryString = simulate ? `?simulate=${simulate}` : '';
    const response = await fetch(`/practice/api/v1/${resource}${queryString}`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'X-Lab-CSRF': csrfToken,
      },
      body: JSON.stringify(body),
    });
    const responseBody =
      response.status === 204 ? {} : ((await response.json()) as ApiEnvelope);
    if (!response.ok) {
      const code = responseBody.error?.code ?? `HTTP_${response.status}`;
      const message =
        responseBody.error?.message ?? 'Server validation failed.';
      result(output, `${code}: ${message}`, 'error');
      for (const detail of responseBody.error?.details ?? []) {
        if (detail.field) fieldError(form, detail.field, message);
      }
      return;
    }
    const record = responseBody.data as Record<string, unknown> | undefined;
    result(
      output,
      `Created ${resource} record ${String(record?.id ?? '')}.`,
      'success',
    );
  } catch (error) {
    result(
      output,
      error instanceof Error ? error.message : 'Submission failed.',
      'error',
    );
  }
}

for (const form of queryAll<HTMLFormElement>('form[data-api-form]')) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    void submitApiForm(form);
  });
}

const loginForm = query<HTMLFormElement>('#login-form');
loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (validate(loginForm).length) {
    result('#login-result', 'Client validation blocked login.', 'error');
    return;
  }
  result(
    '#login-result',
    'Login UI validated. Authentication arrives in Chunk 8.',
    'success',
  );
});

const passwordInput = query<HTMLInputElement>('#registration-password');
passwordInput.addEventListener('input', () => {
  const score = [
    passwordInput.value.length >= 8,
    /[A-Z]/.test(passwordInput.value),
    /\d/.test(passwordInput.value),
  ].filter(Boolean).length;
  const meter = query<HTMLElement>('#password-strength-value');
  meter.style.width = `${(score / 3) * 100}%`;
  meter.style.background =
    score === 3
      ? 'var(--color-success)'
      : score === 2
        ? '#b26800'
        : 'var(--color-danger)';
  result(
    '#password-strength-label',
    ['Weak', 'Weak', 'Medium', 'Strong'][score] ?? 'Weak',
  );
});

const experience = query<HTMLSelectElement>('#job-experience');
experience.addEventListener('change', () => {
  const details = query<HTMLElement>('#experience-details');
  const years = query<HTMLInputElement>('#job-years');
  const required = experience.value === 'experienced';
  details.hidden = !required;
  years.required = required;
});

const registrationLocations: Record<string, Record<string, string[]>> = {
  India: {
    Karnataka: ['Bengaluru', 'Mysuru'],
    Maharashtra: ['Mumbai', 'Pune'],
  },
  'United Kingdom': {
    England: ['London', 'Manchester'],
    Scotland: ['Edinburgh', 'Glasgow'],
  },
};
const registrationCountry = query<HTMLSelectElement>('#registration-country');
const registrationState = query<HTMLSelectElement>('#registration-state');
const registrationCity = query<HTMLSelectElement>('#registration-city');
function options(
  select: HTMLSelectElement,
  values: string[],
  placeholder: string,
): void {
  select.replaceChildren(new Option(placeholder, ''));
  for (const value of values) select.add(new Option(value, value));
  select.disabled = values.length === 0;
}
registrationCountry.addEventListener('change', () => {
  options(
    registrationState,
    Object.keys(registrationLocations[registrationCountry.value] ?? {}),
    'Choose state',
  );
  options(registrationCity, [], 'Choose state first');
});
registrationState.addEventListener('change', () => {
  options(
    registrationCity,
    registrationLocations[registrationCountry.value]?.[
      registrationState.value
    ] ?? [],
    'Choose city',
  );
});

query<HTMLButtonElement>('#use-duplicate-email').addEventListener(
  'click',
  async () => {
    result('#registration-result', 'Loading an existing synthetic email…');
    try {
      const response = await fetch('/practice/api/v1/users?limit=1');
      if (!response.ok) throw new Error(`API returned ${response.status}`);
      const body = (await response.json()) as {
        data?: Array<{ email?: string }>;
      };
      const email = body.data?.[0]?.email;
      if (!email) throw new Error('No synthetic email returned.');
      query<HTMLInputElement>('#registration-email').value = email;
      result(
        '#registration-result',
        'Existing synthetic email loaded; submit to assert 409.',
      );
    } catch (error) {
      result(
        '#registration-result',
        error instanceof Error ? error.message : 'Could not load duplicate.',
        'error',
      );
    }
  },
);

query<HTMLButtonElement>('#reset-form-sandbox').addEventListener(
  'click',
  async () => {
    result('#sandbox-result', 'Resetting form sandbox…');
    try {
      await ensureSession();
      const response = await fetch('/practice/api/v1/lab/reset', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'X-Lab-CSRF': csrfToken,
        },
        body: '{}',
      });
      if (!response.ok) throw new Error(`Reset returned ${response.status}`);
      result('#sandbox-result', 'Sandbox reset to seed data.', 'success');
    } catch (error) {
      result(
        '#sandbox-result',
        error instanceof Error ? error.message : 'Reset failed.',
        'error',
      );
    }
  },
);

type JsonRecord = Record<string, unknown>;

class ApiFailure extends Error {
  status: number;
  payload: JsonRecord;

  constructor(status: number, payload: JsonRecord) {
    const error = payload.error as JsonRecord | undefined;
    super(String(error?.message ?? `Request returned ${status}`));
    this.status = status;
    this.payload = payload;
  }
}

function query<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing auth fixture element: ${selector}`);
  return element;
}

function setResult(selector: string, message: string): void {
  query<HTMLElement>(selector).textContent = message;
}

let csrfToken = '';
let refreshToken = '';

async function request(
  path: string,
  options: RequestInit & { mutation?: boolean } = {},
): Promise<JsonRecord> {
  const headers = new Headers(options.headers);
  if (options.body) headers.set('Content-Type', 'application/json');
  if (options.mutation) headers.set('X-Lab-CSRF', csrfToken);
  const response = await fetch(`/practice/api/v1/${path}`, {
    ...options,
    headers,
    credentials: 'same-origin',
  });
  const payload = (await response.json().catch(() => ({}))) as JsonRecord;
  if (!response.ok) throw new ApiFailure(response.status, payload);
  return payload;
}

function errorText(error: unknown): string {
  if (error instanceof ApiFailure) {
    const detail = error.payload.error as JsonRecord | undefined;
    return `${detail?.code ?? error.status}: ${detail?.message ?? error.message}`;
  }
  return error instanceof Error ? error.message : 'Unknown safe failure';
}

async function ensureLabSession(): Promise<void> {
  const payload = await request('lab/session');
  const data = payload.data as JsonRecord;
  csrfToken = String(data.csrfToken ?? '');
}

function renderIdentity(user: JsonRecord, source: string): void {
  const username = String(user.username ?? 'unknown');
  const role = String(user.role ?? 'unknown');
  setResult('#signed-in-user', `Signed in as ${username} (${role}).`);
  query<HTMLElement>('#account-dashboard-heading').hidden = false;
  query<HTMLElement>('#auth-cookie-state').textContent =
    source === 'cookie' ? 'Present and unreadable to JavaScript' : 'Not used';
  query<HTMLElement>('#auth-source').textContent = source;
  const preference = document.cookie
    .split('; ')
    .find((item) => item.startsWith('practice_ui='));
  query<HTMLElement>('#ui-cookie-state').textContent =
    preference?.split('=')[1] ?? 'Not set';
  const admin = role === 'Admin';
  query<HTMLElement>('#admin-action-card').hidden = !admin;
  const disabled = query<HTMLButtonElement>('#readonly-disabled-action');
  disabled.disabled = !admin;
}

function renderSignedOut(): void {
  setResult('#signed-in-user', 'Signed out.');
  query<HTMLElement>('#account-dashboard-heading').hidden = true;
  query<HTMLElement>('#auth-cookie-state').textContent = 'Absent or expired';
  query<HTMLElement>('#auth-source').textContent = 'None';
  query<HTMLElement>('#admin-action-card').hidden = true;
  query<HTMLButtonElement>('#readonly-disabled-action').disabled = true;
}

async function inspectSession(): Promise<void> {
  try {
    const payload = await request('auth/me');
    const data = payload.data as JsonRecord;
    renderIdentity(data.user as JsonRecord, String(data.authentication));
    setResult('#session-result', 'Authenticated server session is active.');
  } catch (error) {
    renderSignedOut();
    setResult('#session-result', errorText(error));
  }
}

function formJson(form: HTMLFormElement): JsonRecord {
  return Object.fromEntries(new FormData(form).entries());
}

query<HTMLFormElement>('#login-form').addEventListener(
  'submit',
  async (event) => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const body = formJson(form);
    body.rememberMe = query<HTMLInputElement>('#remember-me').checked;
    body.idleSeconds = Number(body.idleSeconds);
    const fast = new URLSearchParams(location.search).get('delay') === '0';
    const suffix = body.username === 'slow_user' && fast ? '?delay=0' : '';
    setResult('#login-result', 'Signing in…');
    try {
      const payload = await request(`auth/login${suffix}`, {
        method: 'POST',
        body: JSON.stringify(body),
        mutation: true,
      });
      const data = payload.data as JsonRecord;
      renderIdentity(data.user as JsonRecord, 'cookie');
      setResult(
        '#login-result',
        `${String((data.user as JsonRecord).username)} signed in with ${body.rememberMe ? 'persistent' : 'session'} cookie.`,
      );
    } catch (error) {
      if (error instanceof ApiFailure) {
        const apiError = error.payload.error as JsonRecord | undefined;
        const data = error.payload.data as JsonRecord | undefined;
        if (
          apiError?.code === 'PASSWORD_CHANGE_REQUIRED' &&
          data?.changeToken
        ) {
          query<HTMLInputElement>('#reset-token').value = String(
            data.changeToken,
          );
          setResult(
            '#login-result',
            'PASSWORD_CHANGE_REQUIRED: the forced-change token is ready in the reset form.',
          );
          await refreshInbox();
          return;
        }
      }
      setResult('#login-result', errorText(error));
    }
  },
);

query<HTMLFormElement>('#register-form').addEventListener(
  'submit',
  async (event) => {
    event.preventDefault();
    try {
      const payload = await request('auth/register', {
        method: 'POST',
        body: JSON.stringify(formJson(event.currentTarget as HTMLFormElement)),
        mutation: true,
      });
      const user = (payload.data as JsonRecord).user as JsonRecord;
      setResult(
        '#register-result',
        `Created ${String(user.username)} with Customer role in this sandbox.`,
      );
    } catch (error) {
      setResult('#register-result', errorText(error));
    }
  },
);

query<HTMLFormElement>('#forgot-form').addEventListener(
  'submit',
  async (event) => {
    event.preventDefault();
    try {
      const payload = await request('auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify(formJson(event.currentTarget as HTMLFormElement)),
        mutation: true,
      });
      setResult('#forgot-result', String((payload.data as JsonRecord).message));
      await refreshInbox();
    } catch (error) {
      setResult('#forgot-result', errorText(error));
    }
  },
);

async function refreshInbox(): Promise<void> {
  const list = query<HTMLUListElement>('#practice-inbox');
  try {
    const payload = await request('auth/inbox');
    const messages = payload.data as JsonRecord[];
    list.replaceChildren();
    if (messages.length === 0) {
      const item = document.createElement('li');
      item.textContent = 'Inbox is empty.';
      list.append(item);
      return;
    }
    for (const message of messages) {
      const item = document.createElement('li');
      const heading = document.createElement('strong');
      heading.textContent = `${String(message.subject)} · ${String(message.to)}`;
      const link = document.createElement('a');
      link.href = String(message.resetUrl);
      link.textContent = 'Open reset link';
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const url = new URL(link.href);
        query<HTMLInputElement>('#reset-token').value =
          url.searchParams.get('reset') ?? '';
        query<HTMLInputElement>('#reset-token').focus();
      });
      const expiry = document.createElement('span');
      expiry.textContent = `Expires ${String(message.expiresAt)}`;
      item.append(heading, link, expiry);
      list.append(item);
    }
  } catch (error) {
    list.replaceChildren(document.createTextNode(errorText(error)));
  }
}

query<HTMLButtonElement>('#refresh-inbox').addEventListener(
  'click',
  () => void refreshInbox(),
);

query<HTMLFormElement>('#reset-form').addEventListener(
  'submit',
  async (event) => {
    event.preventDefault();
    try {
      await request('auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(formJson(event.currentTarget as HTMLFormElement)),
        mutation: true,
      });
      setResult(
        '#reset-result',
        'Practice password reset; prior sessions were revoked.',
      );
      renderSignedOut();
      await refreshInbox();
    } catch (error) {
      setResult('#reset-result', errorText(error));
    }
  },
);

query<HTMLButtonElement>('#reset-lockout').addEventListener(
  'click',
  async () => {
    try {
      const username = query<HTMLInputElement>('#forgot-username').value;
      const payload = await request('auth/lockout/reset', {
        method: 'POST',
        body: JSON.stringify({ username }),
        mutation: true,
      });
      setResult('#reset-result', String((payload.data as JsonRecord).message));
    } catch (error) {
      setResult('#reset-result', errorText(error));
    }
  },
);

query<HTMLButtonElement>('#inspect-session').addEventListener(
  'click',
  () => void inspectSession(),
);

query<HTMLButtonElement>('#logout').addEventListener('click', async () => {
  try {
    await request('auth/logout', { method: 'POST', mutation: true });
    renderSignedOut();
    setResult('#session-result', 'Server session invalidated; signed out.');
  } catch (error) {
    setResult('#session-result', errorText(error));
  }
});

query<HTMLButtonElement>('#expire-session').addEventListener(
  'click',
  async () => {
    try {
      await request('auth/session/expire', {
        method: 'POST',
        mutation: true,
      });
      setResult(
        '#session-result',
        'Idle clock moved past expiry; inspect the session for a 401.',
      );
    } catch (error) {
      setResult('#session-result', errorText(error));
    }
  },
);

async function loadRoles(): Promise<void> {
  try {
    const payload = await request('auth/roles');
    const matrix = query<HTMLTableSectionElement>('#permission-matrix');
    matrix.replaceChildren();
    const permissions = [
      'profile.read',
      'orders.create',
      'tickets.update',
      'reports.read',
      'users.manage',
    ];
    for (const entry of payload.data as JsonRecord[]) {
      const row = document.createElement('tr');
      const role = document.createElement('th');
      role.scope = 'row';
      role.textContent = String(entry.role);
      row.append(role);
      const granted = entry.permissions as string[];
      for (const permission of permissions) {
        const cell = document.createElement('td');
        cell.textContent = granted.includes(permission) ? 'Allowed' : 'Denied';
        row.append(cell);
      }
      matrix.append(row);
    }
  } catch (error) {
    setResult('#permission-result', errorText(error));
  }
}

async function runPermission(button: HTMLButtonElement): Promise<void> {
  const permission = String(button.dataset.permission);
  const mutation = button.dataset.mutation === 'true';
  try {
    const payload = await request(
      `auth/protected${mutation ? '' : `?permission=${encodeURIComponent(permission)}`}`,
      mutation
        ? {
            method: 'POST',
            body: JSON.stringify({ permission }),
            mutation: true,
          }
        : {},
    );
    const data = payload.data as JsonRecord;
    setResult(
      '#permission-result',
      `${String(data.role)} allowed: ${String(data.permission)}.`,
    );
  } catch (error) {
    setResult('#permission-result', errorText(error));
  }
}

for (const button of document.querySelectorAll<HTMLButtonElement>(
  '[data-permission]',
)) {
  button.addEventListener('click', () => void runPermission(button));
}

async function issueToken(scenario?: 'expired'): Promise<void> {
  if (!csrfToken) await ensureLabSession();
  const fast = new URLSearchParams(location.search).get('delay') === '0';
  const username = query<HTMLInputElement>('#token-username').value;
  const suffix = username === 'slow_user' && fast ? '?delay=0' : '';
  const payload = await request(`auth/token${suffix}`, {
    method: 'POST',
    body: JSON.stringify({
      username,
      password: query<HTMLInputElement>('#token-password').value,
      ...(scenario ? { scenario } : {}),
    }),
    mutation: true,
  });
  const data = payload.data as JsonRecord;
  localStorage.setItem('practice_access_token', String(data.accessToken));
  refreshToken = String(data.refreshToken);
  setResult(
    '#token-result',
    `${scenario === 'expired' ? 'Expired' : 'Access'} token stored in localStorage; expiresIn=${String(data.expiresIn)}.`,
  );
}

query<HTMLButtonElement>('#issue-token').addEventListener('click', async () => {
  try {
    await issueToken();
  } catch (error) {
    setResult('#token-result', errorText(error));
  }
});

query<HTMLButtonElement>('#expired-token').addEventListener(
  'click',
  async () => {
    try {
      await issueToken('expired');
    } catch (error) {
      setResult('#token-result', errorText(error));
    }
  },
);

query<HTMLButtonElement>('#inspect-token').addEventListener(
  'click',
  async () => {
    const token = localStorage.getItem('practice_access_token') ?? '';
    try {
      const payload = await request('auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = payload.data as JsonRecord;
      setResult(
        '#token-result',
        `Bearer API identity: ${String((data.user as JsonRecord).username)}.`,
      );
    } catch (error) {
      setResult('#token-result', errorText(error));
    }
  },
);

query<HTMLButtonElement>('#invalid-token').addEventListener(
  'click',
  async () => {
    try {
      await request('auth/me', {
        headers: { Authorization: 'Bearer invalid-public-practice-token' },
      });
    } catch (error) {
      setResult('#token-result', errorText(error));
    }
  },
);

query<HTMLButtonElement>('#refresh-token').addEventListener(
  'click',
  async () => {
    try {
      const payload = await request('auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
        mutation: true,
      });
      const data = payload.data as JsonRecord;
      localStorage.setItem('practice_access_token', String(data.accessToken));
      refreshToken = String(data.refreshToken);
      setResult(
        '#token-result',
        'Refresh token rotated once; new access token stored.',
      );
    } catch (error) {
      setResult('#token-result', errorText(error));
    }
  },
);

async function checkApiKey(value: string): Promise<void> {
  try {
    const payload = await request('auth/api-key/profile', {
      headers: { 'X-Practice-Api-Key': value },
    });
    const data = payload.data as JsonRecord;
    setResult(
      '#api-key-result',
      `API key accepted for ${String(data.principal)}.`,
    );
  } catch (error) {
    setResult('#api-key-result', errorText(error));
  }
}

query<HTMLButtonElement>('#check-api-key').addEventListener(
  'click',
  () => void checkApiKey(query<HTMLInputElement>('#api-key').value),
);
query<HTMLButtonElement>('#invalid-api-key').addEventListener(
  'click',
  () => void checkApiKey('invalid-demo-key'),
);

const wizard = query<HTMLSelectElement>('#wizard-step');
function renderWizard(): void {
  const value = sessionStorage.getItem('practice_auth_wizard');
  setResult(
    '#wizard-result',
    value ? `Wizard step: ${value}.` : 'No wizard state.',
  );
}
query<HTMLButtonElement>('#save-wizard').addEventListener('click', () => {
  sessionStorage.setItem('practice_auth_wizard', wizard.value);
  renderWizard();
});
query<HTMLButtonElement>('#clear-wizard').addEventListener('click', () => {
  sessionStorage.removeItem('practice_auth_wizard');
  renderWizard();
});

async function bootstrap(): Promise<void> {
  try {
    await ensureLabSession();
    const reset = new URLSearchParams(location.search).get('reset');
    if (reset) query<HTMLInputElement>('#reset-token').value = reset;
    await Promise.all([loadRoles(), refreshInbox()]);
    await inspectSession();
    renderWizard();
  } catch (error) {
    setResult('#login-result', `Auth fixture unavailable: ${errorText(error)}`);
  }
}

void bootstrap();

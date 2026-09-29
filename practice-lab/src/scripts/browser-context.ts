import { query, queryAll, result } from './fixture-dom';

function cookieValue(name: string): string | null {
  const prefix = `${encodeURIComponent(name)}=`;
  const match = document.cookie
    .split('; ')
    .find((part) => part.startsWith(prefix));
  return match ? decodeURIComponent(match.slice(prefix.length)) : null;
}

query<HTMLButtonElement>('#set-cookie').addEventListener('click', () => {
  const name = query<HTMLInputElement>('#cookie-name').value.trim();
  const value = query<HTMLInputElement>('#cookie-value').value;
  if (!/^[a-z][a-z0-9_-]{2,40}$/i.test(name)) {
    result('#cookie-result', 'Cookie name rejected: use 3–41 safe characters.');
    return;
  }
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Path=/practice/; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
  result('#cookie-result', `Set ${name}=${value}.`);
});
query<HTMLButtonElement>('#read-cookie').addEventListener('click', () => {
  const name = query<HTMLInputElement>('#cookie-name').value.trim();
  result('#cookie-result', `${name}=${cookieValue(name) ?? 'missing'}.`);
});
query<HTMLButtonElement>('#delete-cookie').addEventListener('click', () => {
  const name = query<HTMLInputElement>('#cookie-name').value.trim();
  document.cookie = `${encodeURIComponent(name)}=; Max-Age=0; Path=/practice/; SameSite=Lax`;
  result('#cookie-result', `Deleted ${name}.`);
});
query<HTMLButtonElement>('#inspect-auth-cookie').addEventListener(
  'click',
  async () => {
    try {
      const response = await fetch('/practice/api/v1/lab/session', {
        credentials: 'same-origin',
      });
      if (!response.ok) throw new Error(`session returned ${response.status}`);
      result(
        '#cookie-result',
        `Sandbox session is present; lab_sid remains HttpOnly and is ${cookieValue('lab_sid') === null ? 'not readable by JavaScript' : 'unexpectedly readable'}. Chunk 8 will add synthetic auth exercises.`,
      );
    } catch (error) {
      result(
        '#cookie-result',
        `Sandbox inspection failed safely: ${error instanceof Error ? error.message : 'unknown error'}.`,
      );
    }
  },
);

for (const control of queryAll<HTMLButtonElement>('[data-consent]')) {
  control.addEventListener('click', () => {
    const value = control.dataset.consent ?? 'unset';
    document.cookie = `practice_consent=${value}; Path=/practice/; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
    result('#consent-result', `Practice preference: ${value}.`);
  });
}

for (const control of queryAll<HTMLButtonElement>('[data-storage]')) {
  control.addEventListener('click', () => {
    const local = control.dataset.storage === 'local';
    const store = local ? localStorage : sessionStorage;
    const kind = local ? 'local' : 'session';
    const key = `practice-${kind}`;
    const input = query<HTMLInputElement>(`#${kind}-storage-value`);
    const action = control.dataset.action;
    if (action === 'write') store.setItem(key, input.value);
    if (action === 'clear') store.removeItem(key);
    result(
      `#${kind}-storage-result`,
      `${kind}Storage ${action}: ${store.getItem(key) ?? 'missing'}.`,
    );
  });
}

result(
  '#secure-context-state',
  window.isSecureContext
    ? 'Secure context: yes; permission APIs may be exercised.'
    : 'Secure context: no; permission APIs will report unavailable or denied.',
);

const fictionalLocations = [
  { name: 'Pune QA Campus', latitude: 18.5204, longitude: 73.8567 },
  { name: 'Bengaluru Test Centre', latitude: 12.9716, longitude: 77.5946 },
];
query<HTMLButtonElement>('#read-geolocation').addEventListener('click', () => {
  if (!navigator.geolocation) {
    result('#geolocation-result', 'Geolocation unavailable.');
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const nearest = fictionalLocations.reduce((best, candidate) => {
        const distance =
          Math.abs(position.coords.latitude - candidate.latitude) +
          Math.abs(position.coords.longitude - candidate.longitude);
        const bestDistance =
          Math.abs(position.coords.latitude - best.latitude) +
          Math.abs(position.coords.longitude - best.longitude);
        return distance < bestDistance ? candidate : best;
      });
      result(
        '#geolocation-result',
        `Fictional location: ${nearest.name} (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}).`,
      );
    },
    (error) =>
      result(
        '#geolocation-result',
        `Geolocation denied or failed: ${error.code}.`,
      ),
    { timeout: 3000 },
  );
});

query<HTMLButtonElement>('#request-notifications').addEventListener(
  'click',
  async () => {
    if (!('Notification' in window)) {
      result('#notification-result', 'Notifications unavailable.');
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      result('#notification-result', `Notification permission: ${permission}.`);
    } catch {
      result(
        '#notification-result',
        'Notification permission request failed safely.',
      );
    }
  },
);

query<HTMLButtonElement>('#write-clipboard').addEventListener(
  'click',
  async () => {
    try {
      await navigator.clipboard.writeText('Testheon clipboard 4803');
      result('#clipboard-result', 'Clipboard write completed.');
    } catch {
      result('#clipboard-result', 'Clipboard write denied or unavailable.');
    }
  },
);
query<HTMLButtonElement>('#read-clipboard').addEventListener(
  'click',
  async () => {
    try {
      const value = await navigator.clipboard.readText();
      result('#clipboard-result', `Clipboard read: ${value || 'empty'}.`);
    } catch {
      result('#clipboard-result', 'Clipboard read denied or unavailable.');
    }
  },
);

function reportOnline(): void {
  result(
    '#online-state',
    navigator.onLine ? 'Navigator state: online.' : 'Navigator state: offline.',
  );
}
window.addEventListener('online', reportOnline);
window.addEventListener('offline', reportOnline);
reportOnline();
query<HTMLButtonElement>('#request-health').addEventListener(
  'click',
  async () => {
    try {
      const response = await fetch('/practice/api/v1/health', {
        cache: 'no-store',
      });
      if (!response.ok) throw new Error(`health returned ${response.status}`);
      result('#network-result', 'Health request succeeded while online.');
    } catch {
      result(
        '#network-result',
        'Network request failed as expected for offline or aborted routing.',
      );
    }
  },
);

function responsiveMode(): void {
  const width = window.innerWidth;
  const mode = width >= 1024 ? 'desktop' : width >= 700 ? 'tablet' : 'mobile';
  document.documentElement.dataset.viewportMode = mode;
  result(
    '#responsive-result',
    `Responsive mode: ${mode}; viewport ${width}px.`,
  );
}
window.addEventListener('resize', responsiveMode);
responsiveMode();

export const LAB_BASE = '/practice';

export function normalizeOrigin(origin: string): string {
  const parsed = new URL(origin);
  if (
    parsed.protocol !== 'https:' &&
    parsed.hostname !== '127.0.0.1' &&
    parsed.hostname !== 'localhost'
  ) {
    throw new Error(
      'The site origin must use HTTPS outside local development.',
    );
  }
  return parsed.origin;
}

export function labPath(path = '/'): string {
  const clean = path.trim();
  if (clean === '' || clean === '/') return `${LAB_BASE}/`;
  const withoutBase = clean.startsWith(`${LAB_BASE}/`)
    ? clean.slice(LAB_BASE.length + 1)
    : clean.replace(/^\/+/, '');
  return `${LAB_BASE}/${withoutBase.replace(/\/+$/, '')}/`;
}

export function canonicalUrl(origin: string, path = '/'): string {
  return new URL(labPath(path), `${normalizeOrigin(origin)}/`).toString();
}

export function isLabInternalUrl(href: string, origin: string): boolean {
  const parsed = new URL(href, origin);
  return (
    parsed.origin === new URL(origin).origin &&
    parsed.pathname.startsWith(`${LAB_BASE}/`)
  );
}

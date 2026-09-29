import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

const args = process.argv.slice(2);
const portIndex = args.indexOf('--port');
const port = Number(
  portIndex >= 0 ? args[portIndex + 1] : (process.env.PORT ?? 4321),
);
const idleIndex = args.indexOf('--idle-timeout');
const idleTimeout = Number(idleIndex >= 0 ? args[idleIndex + 1] : 0);
let idleTimer;
const root = resolve('dist');
const base = '/practice/';
const mime = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.woff2', 'font/woff2'],
]);

function safeFilePath(pathname) {
  if (!pathname.startsWith(base)) return null;
  let relative;
  try {
    relative = decodeURIComponent(pathname.slice(base.length));
  } catch {
    return null;
  }
  if (relative.includes('\0')) return null;
  const candidate = resolve(root, relative);
  if (candidate !== root && !candidate.startsWith(`${root}${sep}`)) return null;
  return pathname.endsWith('/') ? resolve(candidate, 'index.html') : candidate;
}

async function fileExists(path) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

function resetIdleTimer(server) {
  if (!idleTimeout) return;
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    server.close();
    server.closeAllConnections();
  }, idleTimeout);
  idleTimer.unref();
}

const server = createServer(async (request, response) => {
  resetIdleTimer(server);
  const url = new URL(request.url ?? '/', 'http://127.0.0.1');
  const candidate = safeFilePath(url.pathname);
  const file =
    candidate && (await fileExists(candidate))
      ? candidate
      : resolve(root, '404.html');
  const status = candidate && (await fileExists(candidate)) ? 200 : 404;
  const body = await readFile(file);
  response.statusCode = status;
  response.setHeader(
    'Content-Type',
    mime.get(extname(file)) ?? 'application/octet-stream',
  );
  response.setHeader('X-Content-Type-Options', 'nosniff');
  if ((process.env.PUBLIC_ROBOTS_POLICY ?? '').startsWith('noindex')) {
    response.setHeader('X-Robots-Tag', process.env.PUBLIC_ROBOTS_POLICY);
  }
  if (request.method === 'HEAD') return response.end();
  response.end(body);
});

server.listen(port, '127.0.0.1', () => {
  resetIdleTimer(server);
  console.log(
    `Practice Lab built-site server ready at http://127.0.0.1:${port}/practice/`,
  );
});

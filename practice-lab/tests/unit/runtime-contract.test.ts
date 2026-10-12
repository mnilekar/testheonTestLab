import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

async function runtimeFile(name: string): Promise<string> {
  return readFile(`deploy/runtime/${name}`, 'utf8');
}

describe('staging runtime contract', () => {
  it('authenticates before serving an immutable release', async () => {
    const router = await runtimeFile('practice-index.php');
    expect(router.indexOf('lab_authenticate();')).toBeLessThan(
      router.indexOf('lab_current_release();'),
    );
    expect(router).toContain('str_contains($uriPath, "\\0")');
    expect(router).toContain("preg_match('#(^|/)\\.\\.(/|$)#'");
  });

  it('updates the current pointer with a same-directory atomic rename', async () => {
    const controller = await runtimeFile('release-control.php');
    expect(controller).toContain('file_put_contents($temporary');
    expect(controller).toContain("rename($temporary, __DIR__ . '/.current')");
    expect(controller).toContain('array_slice(array_reverse($releases), 0, 3)');
  });

  it('denies direct release and credential paths and forces noindex', async () => {
    const access = await runtimeFile('practice.htaccess');
    expect(access).toContain('X-Robots-Tag "noindex, nofollow"');
    expect(access).toContain('\\.gate\\.php');
    expect(access).toContain('releases');
    expect(access).toContain('[F,L,NC]');
  });

  it('keeps the API private, bounded and independent from WordPress', async () => {
    const runtime = await readFile('deploy/runtime/api-runtime.php', 'utf8');
    const index = await readFile('deploy/runtime/api-index.php', 'utf8');
    expect(runtime).toContain("new PDO('sqlite:'");
    expect(runtime).toContain('PDO::ATTR_EMULATE_PREPARES => false');
    expect(runtime).toContain('LAB_API_MAX_BODY = 65536');
    expect(runtime).toContain('LAB_API_MAX_STORAGE = 268435456');
    expect(runtime).toContain('LAB_API_MAX_DELAY = 10000');
    expect(runtime).toContain('LAB_API_UPLOAD_MAX_FILE = 2097152');
    expect(runtime).toContain("bin2hex(random_bytes(16)) . '.upload'");
    expect(runtime).toContain('move_uploaded_file');
    expect(runtime).toContain("'ACTIVE_CONTENT_REJECTED'");
    expect(runtime).not.toContain('readfile(');
    expect(runtime).toContain('X-LiteSpeed-Cache-Control');
    expect(runtime).toContain("'event' => 'api_error'");
    expect(runtime).toContain("'simulated' => $simulated");
    expect(runtime).toContain('lab_api_metrics');
    expect(runtime).toContain('simulatedErrorsExcluded');
    expect(runtime).toContain("'[practice-lab]");
    expect(runtime).not.toMatch(/wp-config|wpdb|wp-load|wp-admin/i);
    expect(index).toContain("'/releases/' . $release . '/_api'");
  });

  it('resolves an expired token before background cleanup can erase its state', async () => {
    const runtime = await readFile('deploy/runtime/api-runtime.php', 'utf8');
    const dispatch = runtime.slice(
      runtime.indexOf('function lab_api_dispatch'),
    );
    expect(dispatch).not.toContain('lab_api_cleanup($pdo, 5)');
    expect(runtime).toContain("'SESSION_EXPIRED'");
    expect(runtime).toContain('lab_api_cleanup($pdo, 100)');
  });

  it('keeps practice authentication hashed, revocable, CSRF-guarded, and WordPress-independent', async () => {
    const auth = await runtimeFile('api-auth.php');
    const runtime = await runtimeFile('api-runtime.php');
    const gate = await runtimeFile('runtime.php');
    expect(auth).toContain('password_hash(');
    expect(auth).toContain('password_verify(');
    expect(auth).toContain("'secure' => true");
    expect(auth).toContain("'httponly' => true");
    expect(auth).toContain('lab_api_require_mutation_guard');
    expect(auth).toContain('AUTHENTICATION_FAILED');
    expect(auth).toContain('PERMISSION_DENIED');
    expect(auth).toContain('UPDATE lab_auth_sessions SET revoked = 1');
    expect(auth).not.toMatch(/wp-config|wpdb|wp-load|wp-admin/i);
    expect(runtime).toContain("str_starts_with($relative, 'v1/auth/')");
    expect(gate).toContain('practice_staging_gate');
    expect(gate).toContain("'httponly' => true");
  });

  it('keeps ecommerce state session-scoped, fake, bounded, and independent from WordPress', async () => {
    const store = await runtimeFile('api-store.php');
    const runtime = await runtimeFile('api-runtime.php');
    expect(store).toContain('lab_store_cart');
    expect(store).toContain('session_hash');
    expect(store).toContain("'TESTHEON10'");
    expect(store).toContain("'4242424242424242'");
    expect(store).toContain("'processor' => null");
    expect(store).toContain('lab_api_require_mutation_guard');
    expect(store).toContain('lab_auth_require_permission');
    expect(store).toContain('LAB_API_MAX_DELAY * 1000');
    expect(store).not.toMatch(/wp-config|wpdb|wp-load|wp-admin|stripe|paypal/i);
    expect(runtime).toContain("str_starts_with($relative, 'v1/store/')");
  });
});

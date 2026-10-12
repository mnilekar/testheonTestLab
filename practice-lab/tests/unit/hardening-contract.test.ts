import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('pre-launch hardening contracts', () => {
  it('keeps browser, API, cache, and frame policies explicit', async () => {
    const [postbuild, practice, api] = await Promise.all([
      readFile('scripts/postbuild.mjs', 'utf8'),
      readFile('deploy/runtime/practice.htaccess', 'utf8'),
      readFile('deploy/runtime/api.htaccess', 'utf8'),
    ]);
    for (const source of [postbuild, practice, api]) {
      expect(source).toContain('X-Content-Type-Options');
      expect(source).toContain('Referrer-Policy');
      expect(source).toContain('Content-Security-Policy');
    }
    expect(practice).toContain("frame-ancestors 'self'");
    expect(api).toContain("frame-ancestors 'none'");
    expect(api).toContain('no-store, private');
    expect(postbuild).toContain('max-age=31536000, immutable');
  });

  it('keeps source independent from WordPress runtime and secrets', async () => {
    const sources = await Promise.all(
      ['api-runtime.php', 'api-auth.php', 'api-store.php'].map((name) =>
        readFile(`deploy/runtime/${name}`, 'utf8'),
      ),
    );
    const runtime = sources.join('\n');
    expect(runtime).not.toMatch(/wp-load|wp-config|\$wpdb|wp-admin/i);
    expect(runtime).not.toMatch(/DB_PASSWORD|TESTHEON_WP_APP_PASSWORD/);
    expect(runtime).toContain('PDO::ATTR_EMULATE_PREPARES => false');
  });
});

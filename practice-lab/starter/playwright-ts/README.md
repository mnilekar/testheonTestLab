# Testheon Playwright Lab starter

This is a cloneable TypeScript starter for the Testheon Practice Lab. The default `baseURL` points to protected staging. Set `TESTHEON_LAB_URL` to another authorised Lab origin when required.

```bash
pnpm install
pnpm exec playwright install chromium
pnpm test
```

The `tests/` directory contains one passing example. `examples/debugging/` contains three deliberately failing diagnostic exercises. Copy one into `tests/`, run it with `--trace on`, then open the report with `pnpm report`.

All accounts and data are synthetic. Tests must remain inside `/practice/`.

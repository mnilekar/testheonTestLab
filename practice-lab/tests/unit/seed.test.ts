import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { buildSeed, serializeSeed } from '../../api/seed/generate-seed.mjs';

describe('deterministic API fixture seed', () => {
  it('regenerates byte-identically', async () => {
    const first = serializeSeed(buildSeed());
    const second = serializeSeed(buildSeed());
    const stored = await readFile('api/seed/fixtures-v1.json', 'utf8');
    expect(first).toBe(second);
    expect(stored).toBe(first);
  });

  it('contains every required dataset and marked edge cases', () => {
    const seed = buildSeed();
    expect(
      Object.fromEntries(
        Object.entries(seed.data).map(([name, rows]) => [name, rows.length]),
      ),
    ).toEqual({
      users: 40,
      customers: 60,
      employees: 120,
      products: 80,
      orders: 150,
      tasks: 50,
      tickets: 60,
      bookings: 40,
    });
    expect(
      seed.data.employees.filter((row) => row.name.startsWith('Rahul ')).length,
    ).toBeGreaterThanOrEqual(8);
    expect(
      new Set(
        seed.data.employees
          .filter((row) => row.name.startsWith('Rahul '))
          .map((row) => row.department),
      ).size,
    ).toBe(8);
    expect(seed.data.products.some((row) => row.stock === 0)).toBe(true);
    expect(seed.data.orders.some((row) => row.status === 'cancelled')).toBe(
      true,
    );
    expect(
      seed.data.users.some((row) => row.fixture?.intentionallyInvalid === true),
    ).toBe(true);
    expect(serializeSeed(seed)).toContain('Zoë');
    expect(serializeSeed(seed)).toContain('李');
  });
});

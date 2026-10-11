import { describe, expect, it } from 'vitest';
import catalogue from '../../content/challenges/challenges.json';
import manifest from '../../fixtures/manifest.json';

describe('CRE-55 challenge catalogue', () => {
  it('contains the required 28-challenge distribution', () => {
    expect(catalogue.challenges).toHaveLength(28);
    expect(
      Object.fromEntries(
        ['Beginner', 'Intermediate', 'Advanced', 'Expert'].map((difficulty) => [
          difficulty,
          catalogue.challenges.filter((item) => item.difficulty === difficulty)
            .length,
        ]),
      ),
    ).toEqual({ Beginner: 8, Intermediate: 9, Advanced: 7, Expert: 4 });
  });

  it('keeps IDs, slugs, fixtures, and three-level hints valid', () => {
    expect(new Set(catalogue.challenges.map(({ id }) => id)).size).toBe(28);
    expect(new Set(catalogue.challenges.map(({ slug }) => slug)).size).toBe(28);
    const fixtures = new Set(manifest.fixtures.map(({ id }) => id));
    for (const challenge of catalogue.challenges) {
      expect(challenge.hints).toHaveLength(3);
      expect(challenge.technology).toBe('Playwright');
      expect(challenge.relatedFixtures.every((id) => fixtures.has(id))).toBe(
        true,
      );
    }
  });

  it('includes the named acceptance challenges and debugging diagnostics', () => {
    for (const id of [
      'PW-AUTH-001',
      'PW-ECOM-002',
      'PW-APIUI-001',
      'PW-AUTH-004',
    ]) {
      expect(
        catalogue.challenges.some((challenge) => challenge.id === id),
      ).toBe(true);
    }
    expect(
      catalogue.challenges.filter(({ id }) => id.startsWith('PW-DBG-')),
    ).toHaveLength(3);
  });
});

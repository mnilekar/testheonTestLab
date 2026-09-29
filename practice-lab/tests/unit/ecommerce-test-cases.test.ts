import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import {
  renderCsv,
  renderJson,
  renderMarkdown,
} from '../../scripts/generate-ecommerce-test-cases.mjs';

describe('ecommerce functional test-case pack', () => {
  it('contains 40+ unique, complete, conventionally named cases', async () => {
    const document = JSON.parse(
      await readFile('content/test-cases/ecommerce.json', 'utf8'),
    ) as {
      caseCount: number;
      cases: Array<Record<string, unknown>>;
    };
    expect(document.caseCount).toBe(50);
    expect(document.cases).toHaveLength(50);
    expect(new Set(document.cases.map((testCase) => testCase.id)).size).toBe(
      50,
    );
    for (const testCase of document.cases) {
      expect(testCase.id).toMatch(/^ECOM-[A-Z]+-\d{3}$/);
      expect(String(testCase.title)).not.toBe('');
      expect(testCase.preconditions).toEqual(expect.any(Array));
      expect(testCase.steps).toEqual(expect.any(Array));
      expect(String(testCase.expectedResult)).not.toBe('');
      expect(['Critical', 'High', 'Medium', 'Low']).toContain(
        testCase.priority,
      );
      expect(['yes', 'no']).toContain(testCase.goodAutomationCandidate);
    }
  });

  it('keeps committed JSON, Markdown, and CSV byte-identical to the generator', async () => {
    const [json, markdown, csv] = await Promise.all([
      readFile('content/test-cases/ecommerce.json', 'utf8'),
      readFile('content/test-cases/ecommerce.md', 'utf8'),
      readFile('content/test-cases/ecommerce.csv', 'utf8'),
    ]);
    expect(json).toBe(renderJson());
    expect(markdown).toBe(renderMarkdown());
    expect(csv).toBe(renderCsv());
  });
});

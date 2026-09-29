import { describe, expect, it } from 'vitest';
import {
  canonicalUrl,
  isLabInternalUrl,
  labPath,
  normalizeOrigin,
} from '../../src/lib/urls';

describe('Lab URLs', () => {
  it('normalizes the base and trailing slash', () => {
    expect(labPath('/')).toBe('/practice/');
    expect(labPath('playwright')).toBe('/practice/playwright/');
    expect(labPath('/practice/playwright/')).toBe('/practice/playwright/');
  });

  it('builds canonical HTTPS URLs', () => {
    expect(canonicalUrl('https://testheon.com/', '/playwright/')).toBe(
      'https://testheon.com/practice/playwright/',
    );
    expect(() => normalizeOrigin('http://example.com')).toThrow(/HTTPS/);
  });

  it('identifies only same-origin Lab links', () => {
    expect(
      isLabInternalUrl('/practice/playwright/', 'https://testheon.com'),
    ).toBe(true);
    expect(isLabInternalUrl('/blog/', 'https://testheon.com')).toBe(false);
    expect(
      isLabInternalUrl('https://example.com/practice/', 'https://testheon.com'),
    ).toBe(false);
  });
});

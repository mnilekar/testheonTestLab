import { describe, expect, it } from 'vitest';
import {
  resolveDeployTarget,
  resolveRobotsPolicy,
} from '../../src/config/site';

describe('page indexing policy', () => {
  it('forces every staging page to noindex', () => {
    expect(resolveRobotsPolicy('index,follow', 'staging')).toBe(
      'noindex,nofollow',
    );
  });

  it('keeps page policy for local and production builds', () => {
    expect(resolveRobotsPolicy('index,follow', 'production')).toBe(
      'index,follow',
    );
    expect(resolveRobotsPolicy('noindex,follow', 'local')).toBe(
      'noindex,follow',
    );
  });

  it('defaults unknown deploy targets to local', () => {
    expect(resolveDeployTarget('preview')).toBe('local');
  });
});

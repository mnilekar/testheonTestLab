export type RobotsPolicy =
  'index,follow' | 'noindex,follow' | 'noindex,nofollow';
export type DeployTarget = 'local' | 'staging' | 'production';

export const siteName = 'Testheon Practice Lab';
export const tagline = 'Real-world QA automation playground';

export function resolveRobotsPolicy(
  pagePolicy: RobotsPolicy,
  target: DeployTarget,
  globalPolicy?: string,
): RobotsPolicy {
  if (target === 'staging') return 'noindex,nofollow';
  if (globalPolicy === 'noindex,nofollow' || globalPolicy === 'noindex,follow')
    return globalPolicy;
  return pagePolicy;
}

export function resolveDeployTarget(value?: string): DeployTarget {
  if (value === 'staging' || value === 'production') return value;
  return 'local';
}

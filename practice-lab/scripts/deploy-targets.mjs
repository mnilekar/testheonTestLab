const stagingMappings = [
  ['root.htaccess', '.htaccess'],
  ['root-index.php', 'index.php'],
  ['practice.htaccess', 'practice/.htaccess'],
  ['runtime.php', 'practice/_runtime.php'],
  ['practice-index.php', 'practice/index.php'],
  ['release-control.php', 'practice/__release-control.php'],
  ['api-index.php', 'practice/api/index.php'],
  ['api.htaccess', 'practice/api/.htaccess'],
  ['api-cleanup.php', 'practice/_api-maintenance/cleanup.php'],
];

const productionMappings = [
  ['production-practice.htaccess', 'practice/.htaccess'],
  ['production-runtime.php', 'practice/_runtime.php'],
  ['production-practice-index.php', 'practice/index.php'],
  ['production-release-control.php', 'practice/__release-control.php'],
  ['production-api-index.php', 'practice/api/index.php'],
  ['api.htaccess', 'practice/api/.htaccess'],
  ['api-cleanup.php', 'practice/_api-maintenance/cleanup.php'],
];

export function runtimeMappings(target) {
  if (target === 'staging') return stagingMappings;
  if (target === 'production') return productionMappings;
  throw new Error(`Unknown deployment target: ${target}`);
}

export function assertDeploymentDestination(target, destination) {
  if (target === 'production' && !destination.startsWith('practice/')) {
    throw new Error(
      `Production deployment may only write inside public_html/practice: ${destination}`,
    );
  }
}

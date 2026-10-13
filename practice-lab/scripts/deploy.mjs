import { createHash, randomBytes } from 'node:crypto';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, relative, resolve, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  assertReleaseId,
  createReleaseId,
  hashDirectory,
} from './deploy-lib.mjs';
import {
  assertDeploymentDestination,
  runtimeMappings,
} from './deploy-targets.mjs';

function option(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function hasFlag(name) {
  return process.argv.includes(name);
}

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}.`);
  return value;
}

function stagingConfig({ upload = false } = {}) {
  if (process.env.PRACTICE_LAB_STAGING_AUTH_CONFIRMED !== 'true') {
    throw new Error(
      'Staging deployment refused: the password gate must be configured and confirmed first.',
    );
  }
  const config = {
    origin: required('PRACTICE_LAB_STAGING_ORIGIN'),
    user: required('PRACTICE_LAB_STAGING_HTTP_USER'),
    password: required('PRACTICE_LAB_STAGING_HTTP_PASSWORD'),
    controlToken: required('PRACTICE_LAB_RELEASE_CONTROL_TOKEN'),
  };
  if (upload) {
    Object.assign(config, {
      uploadUrl: required('PRACTICE_LAB_STAGING_UPLOAD_URL'),
      uploadAuthKey: required('PRACTICE_LAB_STAGING_UPLOAD_AUTH_KEY'),
      uploadRestAuthKey: required('PRACTICE_LAB_STAGING_UPLOAD_REST_AUTH_KEY'),
    });
  }
  return config;
}

function productionConfig({ upload = false } = {}) {
  const config = {
    origin: required('PRACTICE_LAB_PRODUCTION_ORIGIN'),
    controlToken: required('PRACTICE_LAB_PRODUCTION_RELEASE_CONTROL_TOKEN'),
  };
  if (upload) {
    Object.assign(config, {
      uploadUrl: required('PRACTICE_LAB_PRODUCTION_UPLOAD_URL'),
      uploadAuthKey: required('PRACTICE_LAB_PRODUCTION_UPLOAD_AUTH_KEY'),
      uploadRestAuthKey: required(
        'PRACTICE_LAB_PRODUCTION_UPLOAD_REST_AUTH_KEY',
      ),
    });
  }
  return config;
}

function phpString(value) {
  return `'${value.replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`;
}

function gateConfig(config) {
  const controlSalt = randomBytes(24).toString('hex');
  const apiSecret = randomBytes(32).toString('hex');
  const controlHash = createHash('sha256')
    .update(controlSalt + config.controlToken)
    .digest('hex');
  const hasBasicGate = Boolean(config.user && config.password);
  const passwordSalt = hasBasicGate ? randomBytes(24).toString('hex') : null;
  const passwordHash = hasBasicGate
    ? createHash('sha256')
        .update(passwordSalt + config.password)
        .digest('hex')
    : null;
  return Buffer.from(
    [
      '<?php',
      'declare(strict_types=1);',
      '',
      'return [',
      ...(hasBasicGate
        ? [
            `    'username' => ${phpString(config.user)},`,
            `    'password_salt' => ${phpString(passwordSalt)},`,
            `    'password_hash' => ${phpString(passwordHash)},`,
          ]
        : []),
      `    'control_salt' => ${phpString(controlSalt)},`,
      `    'control_hash' => ${phpString(controlHash)},`,
      `    'api_secret' => ${phpString(apiSecret)},`,
      '];',
      '',
    ].join('\n'),
    'utf8',
  );
}

async function walkFiles(directory) {
  const root = resolve(directory);
  const files = [];
  async function walk(current) {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const absolute = join(current, entry.name);
      if (entry.isDirectory()) await walk(absolute);
      else if (entry.isFile()) files.push(absolute);
    }
  }
  await walk(root);
  return files.sort((a, b) => a.localeCompare(b));
}

function uploadEndpoint(base, destination) {
  const url = new URL(base.endsWith('/') ? base : `${base}/`);
  const encoded = destination
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  url.pathname = `${url.pathname.replace(/\/$/, '')}/${encoded}`;
  url.searchParams.set('override', 'true');
  return url;
}

async function uploadBytes(config, destination, bytes) {
  const url = uploadEndpoint(config.uploadUrl, destination);
  const common = {
    'X-Auth': config.uploadAuthKey,
    'X-Auth-Rest': config.uploadRestAuthKey,
    'Tus-Resumable': '1.0.0',
  };
  const created = await fetch(url, {
    method: 'POST',
    headers: {
      ...common,
      'Upload-Length': String(bytes.length),
      'Upload-Offset': '0',
    },
  });
  if (created.status !== 201) {
    throw new Error(
      `Upload create failed for ${destination}: ${created.status} ${await created.text()}`,
    );
  }
  const uploaded = await fetch(url, {
    method: 'PATCH',
    headers: {
      ...common,
      'Content-Type': 'application/offset+octet-stream',
      'Upload-Offset': '0',
    },
    body: bytes,
  });
  if (uploaded.status !== 204) {
    throw new Error(
      `Upload failed for ${destination}: ${uploaded.status} ${await uploaded.text()}`,
    );
  }
  if (uploaded.headers.get('upload-offset') !== String(bytes.length)) {
    throw new Error(`Upload offset mismatch for ${destination}.`);
  }
}

async function uploadFile(config, source, destination) {
  const bytes = await readFile(source);
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await uploadBytes(config, destination, bytes);
      return;
    } catch (error) {
      const transientNetworkFailure =
        error instanceof TypeError && error.message === 'fetch failed';
      if (!transientNetworkFailure || attempt === 3) throw error;
      await new Promise((resolveDelay) =>
        setTimeout(resolveDelay, attempt * 750),
      );
    }
  }
}

function basicAuthorization(config) {
  if (!config.user || !config.password) {
    throw new Error(
      'This deployment target does not use Basic authentication.',
    );
  }
  return `Basic ${Buffer.from(`${config.user}:${config.password}`).toString('base64')}`;
}

async function releaseControl(config, action, release) {
  const body = new URLSearchParams({ action });
  if (release) body.set('release', release);
  const url = new URL('/practice/__release-control.php', config.origin);
  const headers = {
    'X-Practice-Release-Control': config.controlToken,
    'Content-Type': 'application/x-www-form-urlencoded',
  };
  if (config.user && config.password) {
    headers.Authorization = basicAuthorization(config);
  }
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body,
    redirect: 'manual',
  });
  const text = await response.text();
  if (response.status !== 200) {
    throw new Error(
      `Release control ${action} failed: ${response.status} ${text}`,
    );
  }
  const payload = JSON.parse(text);
  if (!payload.ok)
    throw new Error(`Release control ${action} was not accepted.`);
  return payload;
}

async function verifyStaging(config, expectedRelease) {
  const url = new URL('/practice/', config.origin);
  const anonymous = await fetch(url, { redirect: 'manual' });
  if (anonymous.status !== 401) {
    throw new Error(
      `Staging gate failed: anonymous request returned ${anonymous.status}.`,
    );
  }
  const response = await fetch(url, {
    headers: { Authorization: basicAuthorization(config) },
    redirect: 'follow',
  });
  const html = await response.text();
  if (response.status !== 200)
    throw new Error(`Authenticated staging returned ${response.status}.`);
  if (!html.includes('Testheon Practice Lab'))
    throw new Error('Staging content marker is missing.');
  if (!/name=["']robots["'][^>]+noindex/i.test(html))
    throw new Error('Staging HTML noindex is missing.');
  if (!(response.headers.get('x-robots-tag') ?? '').includes('noindex'))
    throw new Error('Staging X-Robots-Tag noindex is missing.');
  if (!html.includes(`${new URL(config.origin).origin}/practice/`)) {
    throw new Error('Staging canonical origin is incorrect.');
  }
  const authenticated = { Authorization: basicAuthorization(config) };
  const docsResponse = await fetch(new URL('/practice/api/', config.origin), {
    headers: authenticated,
    redirect: 'follow',
  });
  const docs = await docsResponse.text();
  if (
    docsResponse.status !== 200 ||
    !docs.includes('Testheon Practice API') ||
    !(docsResponse.headers.get('x-robots-tag') ?? '').includes('noindex')
  ) {
    throw new Error('Staging API documentation verification failed.');
  }
  const healthResponse = await fetch(
    new URL('/practice/api/v1/health', config.origin),
    { headers: authenticated, redirect: 'follow' },
  );
  const health = await healthResponse.json().catch(() => null);
  if (
    healthResponse.status !== 200 ||
    health?.status !== 'ok' ||
    health?.fixtureVersion !== '1.0.0' ||
    health?.storage?.status !== 'ok' ||
    !(healthResponse.headers.get('cache-control') ?? '').includes('no-store')
  ) {
    throw new Error('Staging API health verification failed.');
  }
  const status = await releaseControl(config, 'status');
  if (expectedRelease && status.current !== expectedRelease) {
    throw new Error(
      `Staging release mismatch: expected ${expectedRelease}, received ${status.current}.`,
    );
  }
  return status;
}

async function verifyProduction(config, expectedRelease) {
  const url = new URL('/practice/', config.origin);
  const response = await fetch(url, { redirect: 'follow' });
  const html = await response.text();
  if (response.status !== 200)
    throw new Error(`Production Practice Lab returned ${response.status}.`);
  if (!html.includes('Testheon Practice Lab'))
    throw new Error('Production content marker is missing.');
  if (!/name=["']robots["'][^>]+index,follow/i.test(html))
    throw new Error('Production HTML index,follow policy is missing.');
  if ((response.headers.get('x-robots-tag') ?? '').includes('noindex'))
    throw new Error('Production landing page was incorrectly marked noindex.');
  if (!html.includes(`${new URL(config.origin).origin}/practice/`)) {
    throw new Error('Production canonical origin is incorrect.');
  }
  const docsResponse = await fetch(new URL('/practice/api/', config.origin), {
    redirect: 'follow',
  });
  const docs = await docsResponse.text();
  if (
    docsResponse.status !== 200 ||
    !docs.includes('Testheon Practice API') ||
    !(docsResponse.headers.get('x-robots-tag') ?? '').includes('noindex')
  ) {
    throw new Error('Production API documentation verification failed.');
  }
  const healthResponse = await fetch(
    new URL('/practice/api/v1/health', config.origin),
    { redirect: 'follow' },
  );
  const health = await healthResponse.json().catch(() => null);
  if (
    healthResponse.status !== 200 ||
    health?.status !== 'ok' ||
    health?.fixtureVersion !== '1.0.0' ||
    health?.storage?.status !== 'ok' ||
    !(healthResponse.headers.get('cache-control') ?? '').includes('no-store')
  ) {
    throw new Error('Production API health verification failed.');
  }
  const status = await releaseControl(config, 'status');
  if (expectedRelease && status.current !== expectedRelease) {
    throw new Error(
      `Production release mismatch: expected ${expectedRelease}, received ${status.current}.`,
    );
  }
  return status;
}

async function deploy(config, target) {
  const releaseId = `${createReleaseId()}-${randomBytes(3).toString('hex')}`;
  assertReleaseId(releaseId);
  const built = spawnSync(
    process.execPath,
    ['scripts/build-target.mjs', target],
    {
      cwd: process.cwd(),
      env: { ...process.env, PRACTICE_LAB_RELEASE_ID: releaseId },
      stdio: 'inherit',
    },
  );
  if (built.error) throw built.error;
  if (built.status !== 0)
    throw new Error(`Staging build failed (${built.status}).`);

  const dist = resolve('dist');
  if (!(await stat(join(dist, 'index.html'))).isFile())
    throw new Error('Build output is missing index.html.');
  for (const source of await walkFiles(dist)) {
    const name = relative(dist, source).split(sep).join('/');
    await uploadFile(config, source, `practice/releases/${releaseId}/${name}`);
  }

  const apiReleaseMappings = [
    ['deploy/runtime/api-runtime.php', 'api-runtime.php'],
    ['deploy/runtime/api-auth.php', 'api-auth.php'],
    ['deploy/runtime/api-store.php', 'api-store.php'],
    ['api/seed/fixtures-v1.json', 'fixtures-v1.json'],
    ['api/openapi/openapi.json', 'openapi.json'],
  ];
  for (const [source, destination] of apiReleaseMappings) {
    await uploadFile(
      config,
      resolve(source),
      `practice/releases/${releaseId}/_api/${destination}`,
    );
  }

  const runtime = resolve('deploy/runtime');
  const mappings = runtimeMappings(target);
  for (const [, destination] of mappings) {
    assertDeploymentDestination(target, destination);
  }
  await uploadBytes(config, 'practice/.gate.php', gateConfig(config));
  for (const [source, destination] of mappings) {
    await uploadFile(config, join(runtime, source), destination);
  }

  const activated = await releaseControl(config, 'activate', releaseId);
  const verified =
    target === 'staging'
      ? await verifyStaging(config, releaseId)
      : await verifyProduction(config, releaseId);
  return {
    releaseId,
    artifactSha256: await hashDirectory(dist),
    releases: activated.releases,
    verifiedCurrent: verified.current,
  };
}

const action = process.argv[2];
const target = option('--target');
if (!['deploy', 'rollback', 'activate', 'status'].includes(action)) {
  throw new Error(
    'Usage: node scripts/deploy.mjs <deploy|rollback|activate|status> --target staging',
  );
}
if (target !== 'staging' && target !== 'production')
  throw new Error('Target must be staging or production.');
if (target === 'production' && action !== 'status') {
  if (!hasFlag('--i-approve-production')) {
    throw new Error(
      'Production deployment refused: pass --i-approve-production in the authorized production chunk.',
    );
  }
}

const config =
  target === 'production'
    ? productionConfig({ upload: action === 'deploy' })
    : stagingConfig({ upload: action === 'deploy' });
if (action === 'deploy') {
  const result = await deploy(config, target);
  console.log(
    `Release ${result.releaseId} verified (SHA-256 ${result.artifactSha256}); retained: ${result.releases.join(', ')}.`,
  );
} else if (action === 'rollback') {
  const result = await releaseControl(config, 'rollback');
  if (target === 'staging') await verifyStaging(config, result.current);
  else await verifyProduction(config, result.current);
  console.log(
    `Rollback verified at ${config.origin}/practice/ (${result.current}).`,
  );
} else if (action === 'activate') {
  const release = option('--release');
  if (!release) throw new Error('--release is required for activate.');
  assertReleaseId(release);
  const result = await releaseControl(config, 'activate', release);
  if (target === 'staging') await verifyStaging(config, result.current);
  else await verifyProduction(config, result.current);
  console.log(`Release ${result.current} reactivated and verified.`);
} else {
  const result =
    target === 'staging'
      ? await verifyStaging(config)
      : await verifyProduction(config);
  const label = target === 'staging' ? 'Staging' : 'Production';
  console.log(
    `${label} verified at ${config.origin}/practice/ (${result.current}); retained: ${result.releases.join(', ')}.`,
  );
}

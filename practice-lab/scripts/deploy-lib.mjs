import { createHash } from 'node:crypto';
import {
  cp,
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import { basename, join, relative, resolve, sep } from 'node:path';

const RELEASE_PATTERN = /^[0-9]{8}T[0-9]{6}Z(?:-[a-z0-9]{4,12})?$/;

export function createReleaseId(date = new Date()) {
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');
}

export function assertReleaseId(releaseId) {
  if (!RELEASE_PATTERN.test(releaseId))
    throw new Error(`Invalid release id: ${releaseId}`);
}

export function assertRemotePath(path, label) {
  if (
    !/^\/[A-Za-z0-9._/-]+$/.test(path) ||
    path.includes('..') ||
    path.includes('//')
  ) {
    throw new Error(`Unsafe ${label} path.`);
  }
}

export function assertSshIdentity(host, user, port) {
  if (!/^[A-Za-z0-9.-]+$/.test(host)) throw new Error('Unsafe SSH host.');
  if (!/^[A-Za-z0-9._-]+$/.test(user)) throw new Error('Unsafe SSH user.');
  if (
    !/^[0-9]{1,5}$/.test(String(port)) ||
    Number(port) < 1 ||
    Number(port) > 65535
  ) {
    throw new Error('Unsafe SSH port.');
  }
}

export async function hashDirectory(directory) {
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
  files.sort((a, b) => relative(root, a).localeCompare(relative(root, b)));
  const hash = createHash('sha256');
  for (const file of files) {
    hash.update(relative(root, file).split(sep).join('/'));
    hash.update('\0');
    hash.update(await readFile(file));
    hash.update('\0');
  }
  return hash.digest('hex');
}

async function ensureBuild(buildDir) {
  const index = join(resolve(buildDir), 'index.html');
  if (!(await stat(index)).isFile())
    throw new Error('Build output is missing index.html.');
}

async function writePointer(root, releaseId) {
  const pointer = join(root, 'current.json');
  const temporary = join(root, `.current-${process.pid}-${Date.now()}.tmp`);
  await writeFile(temporary, `${JSON.stringify({ releaseId })}\n`, {
    encoding: 'utf8',
    flag: 'wx',
  });
  await rename(temporary, pointer);
}

export async function readCurrentRelease(rootDirectory) {
  const pointer = JSON.parse(
    await readFile(join(resolve(rootDirectory), 'current.json'), 'utf8'),
  );
  assertReleaseId(pointer.releaseId);
  return pointer.releaseId;
}

export async function activateLocalRelease(rootDirectory, releaseId) {
  assertReleaseId(releaseId);
  const root = resolve(rootDirectory);
  const releasePath = join(root, 'releases', releaseId);
  if (!(await stat(join(releasePath, 'index.html'))).isFile()) {
    throw new Error(`Release ${releaseId} is incomplete.`);
  }
  await writePointer(root, releaseId);
  return releaseId;
}

export async function retainLocalReleases(rootDirectory, keep = 3) {
  const root = resolve(rootDirectory);
  const releasesPath = join(root, 'releases');
  const current = await readCurrentRelease(root);
  const releases = (await readdir(releasesPath, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && RELEASE_PATTERN.test(entry.name))
    .map((entry) => entry.name)
    .sort()
    .reverse();
  const keepSet = new Set([current, ...releases.slice(0, keep)]);
  for (const release of releases) {
    if (!keepSet.has(release))
      await rm(join(releasesPath, release), { recursive: true, force: true });
  }
}

export async function deployLocalRelease({
  buildDir,
  rootDirectory,
  releaseId,
  keep = 3,
}) {
  assertReleaseId(releaseId);
  await ensureBuild(buildDir);
  const root = resolve(rootDirectory);
  const releases = join(root, 'releases');
  const incoming = join(root, 'incoming');
  const temporary = join(incoming, releaseId);
  const target = join(releases, releaseId);
  await mkdir(releases, { recursive: true });
  await mkdir(incoming, { recursive: true });
  await rm(temporary, { recursive: true, force: true });
  await cp(resolve(buildDir), temporary, {
    recursive: true,
    errorOnExist: true,
  });
  await ensureBuild(temporary);
  await rename(temporary, target);
  await writePointer(root, releaseId);
  await retainLocalReleases(root, keep);
  return {
    releaseId,
    artifactSha256: await hashDirectory(target),
    releasePath: target,
  };
}

export async function rollbackLocalRelease(rootDirectory, requestedRelease) {
  const root = resolve(rootDirectory);
  const current = await readCurrentRelease(root);
  const releases = (
    await readdir(join(root, 'releases'), { withFileTypes: true })
  )
    .filter((entry) => entry.isDirectory() && RELEASE_PATTERN.test(entry.name))
    .map((entry) => entry.name)
    .sort();
  const target =
    requestedRelease ?? releases.filter((release) => release < current).at(-1);
  if (!target) throw new Error('No previous compatible release is available.');
  return activateLocalRelease(root, target);
}

export function remoteActivationCommand({
  root,
  liveLink,
  releaseId,
  incoming = true,
}) {
  assertRemotePath(root, 'release root');
  assertRemotePath(liveLink, 'live link');
  assertReleaseId(releaseId);
  const incomingPath = `${root}/incoming/${releaseId}`;
  const releasePath = `${root}/releases/${releaseId}`;
  const promote = incoming
    ? `test -f ${incomingPath}/index.html && mv ${incomingPath} ${releasePath} && `
    : `test -f ${releasePath}/index.html && `;
  return [
    'set -eu',
    `mkdir -p ${root}/incoming ${root}/releases`,
    `test ! -e ${releasePath}`,
    `${promote}ln -s releases/${releaseId} ${root}/.current-${releaseId}`,
    `mv -Tf ${root}/.current-${releaseId} ${root}/current`,
    `if test -L ${liveLink}; then :; elif test -e ${liveLink}; then echo 'Live path collision' >&2; exit 22; else ln -s ${root}/current ${liveLink}; fi`,
    `test "$(basename "$(readlink ${root}/current)")" = "${releaseId}"`,
    `cd ${root}/releases && ls -1dt */ 2>/dev/null | tail -n +4 | xargs -r rm -rf --`,
  ].join(' && ');
}

export function remoteRollbackCommand({ root, releaseId }) {
  assertRemotePath(root, 'release root');
  const target = releaseId
    ? (assertReleaseId(releaseId), releaseId)
    : `$(current=$(basename "$(readlink ${root}/current)"); find ${root}/releases -mindepth 1 -maxdepth 1 -type d -printf '%f\\n' | sort | awk -v current="$current" '$0 < current { previous=$0 } END { print previous }')`;
  return [
    'set -eu',
    `target=${target}`,
    'test -n "$target"',
    `test -f ${root}/releases/"$target"/index.html`,
    `ln -s releases/"$target" ${root}/.rollback-"$target"`,
    `mv -Tf ${root}/.rollback-"$target" ${root}/current`,
    `test "$(basename "$(readlink ${root}/current)")" = "$target"`,
    'printf "%s\\n" "$target"',
  ].join(' && ');
}

export function releaseBasename(path) {
  return basename(path);
}

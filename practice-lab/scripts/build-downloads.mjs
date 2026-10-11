import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { basename, relative, resolve } from 'node:path';

const root = process.cwd();
const output = resolve(root, 'public/downloads');

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let index = 0; index < 8; index += 1)
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function u16(value) {
  const valueBuffer = Buffer.alloc(2);
  valueBuffer.writeUInt16LE(value);
  return valueBuffer;
}
function u32(value) {
  const valueBuffer = Buffer.alloc(4);
  valueBuffer.writeUInt32LE(value);
  return valueBuffer;
}

async function filesUnder(directory) {
  const found = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) found.push(...(await filesUnder(path)));
    else found.push(path);
  }
  return found.sort();
}

async function zipDirectory(directory, target) {
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const path of await filesUnder(directory)) {
    const data = await readFile(path);
    const name = Buffer.from(
      `${basename(directory)}/${relative(directory, path).replaceAll('\\\\', '/')}`,
    );
    const crc = crc32(data);
    const local = Buffer.concat([
      u32(0x04034b50),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(data.length),
      u32(data.length),
      u16(name.length),
      u16(0),
      name,
      data,
    ]);
    const central = Buffer.concat([
      u32(0x02014b50),
      u16(20),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(data.length),
      u32(data.length),
      u16(name.length),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(offset),
      name,
    ]);
    locals.push(local);
    centrals.push(central);
    offset += local.length;
  }
  const centralSize = centrals.reduce((sum, chunk) => sum + chunk.length, 0);
  const end = Buffer.concat([
    u32(0x06054b50),
    u16(0),
    u16(0),
    u16(centrals.length),
    u16(centrals.length),
    u32(centralSize),
    u32(offset),
    u16(0),
  ]);
  await writeFile(target, Buffer.concat([...locals, ...centrals, end]));
}

await rm(output, { recursive: true, force: true });
await mkdir(resolve(output, 'test-cases'), { recursive: true });
for (const name of ['ecommerce.json', 'ecommerce.csv', 'ecommerce.md']) {
  await cp(
    resolve(root, 'content/test-cases', name),
    resolve(output, 'test-cases', name),
  );
}
for (const starter of [
  'playwright-ts',
  'playwright-python',
  'playwright-java',
]) {
  await zipDirectory(
    resolve(root, 'starter', starter),
    resolve(output, `${starter}-starter.zip`),
  );
}
console.log(
  'Built deterministic starter ZIPs and ecommerce test-case downloads.',
);

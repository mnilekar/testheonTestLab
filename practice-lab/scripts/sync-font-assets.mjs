import { access, copyFile, mkdir, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';

const output = resolve('public/fonts');
await mkdir(output, { recursive: true });

const assets = [
  {
    source: resolve(
      'node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2',
    ),
    target: resolve(output, 'inter-latin-variable.woff2'),
  },
  {
    source: resolve(
      'node_modules/@fontsource/poppins/files/poppins-latin-600-normal.woff2',
    ),
    target: resolve(output, 'poppins-latin-600.woff2'),
  },
  {
    source: resolve(
      'node_modules/@fontsource/poppins/files/poppins-latin-700-normal.woff2',
    ),
    target: resolve(output, 'poppins-latin-700.woff2'),
  },
];

for (const asset of assets) {
  await access(asset.source, constants.R_OK);
  await copyFile(asset.source, asset.target);
}

const licenses = [
  {
    candidates: [
      resolve('node_modules/@fontsource-variable/inter/LICENSE'),
      resolve('node_modules/@fontsource-variable/inter/LICENSE.md'),
    ],
    target: resolve(output, 'LICENSE-inter.txt'),
  },
  {
    candidates: [
      resolve('node_modules/@fontsource/poppins/LICENSE'),
      resolve('node_modules/@fontsource/poppins/LICENSE.md'),
    ],
    target: resolve(output, 'LICENSE-poppins.txt'),
  },
];

for (const license of licenses) {
  let copied = false;
  for (const candidate of license.candidates) {
    try {
      await access(candidate, constants.R_OK);
      await copyFile(candidate, license.target);
      copied = true;
      break;
    } catch {
      // Try the next package license filename.
    }
  }
  if (!copied) throw new Error(`Font license missing for ${license.target}`);
}

await writeFile(
  resolve(output, 'README.txt'),
  [
    'Testheon Practice Lab self-hosted fonts',
    '',
    'Inter Variable 5.3.0 and Poppins 5.3.0 are copied from the pinned Fontsource packages.',
    'The font files are served locally under /practice/fonts/. No Google Fonts request is used.',
    'License texts are retained beside the font files.',
    '',
  ].join('\n'),
  'utf8',
);

console.log('Local Inter and Poppins assets synchronized.');

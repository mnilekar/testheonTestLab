import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { initWorkspace, slugify, WORKSPACE_DIRECTORIES } from '../src/workspace.mjs';

test('slugify is deterministic', () => {
  assert.equal(slugify(' Playwright & Python: Fixtures! '), 'playwright-and-python-fixtures');
});

test('workspace initialization is deterministic and resumable', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'testheon-workspace-'));
  const first = initWorkspace({ topic: 'Playwright Python Fixtures', root });
  const second = initWorkspace({ topic: 'Playwright Python Fixtures', root });
  assert.equal(first.workspace, second.workspace);
  assert.equal(first.resumed, false);
  assert.equal(second.resumed, true);
  assert.ok(fs.existsSync(path.join(first.workspace, 'state.json')));
  for (const directory of WORKSPACE_DIRECTORIES) assert.ok(fs.existsSync(path.join(first.workspace, directory)));
});

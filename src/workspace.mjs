import fs from 'node:fs';
import path from 'node:path';
import { loadConfig, repoPath } from './config.mjs';
import { createState, transitionState } from './state.mjs';

export const WORKSPACE_DIRECTORIES = Object.freeze([
  'research',
  'seo',
  'article',
  'qa/head-controller',
  'qa/content-reviewer',
  'qa/rendered-draft',
  'images/generated',
  'wordpress/backups',
  'logs'
]);

export function slugify(value) {
  const slug = String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
  if (!slug) throw new Error('Topic must contain at least one letter or number.');
  return slug.slice(0, 80).replace(/-+$/g, '');
}

function assertInside(parent, candidate) {
  const relative = path.relative(path.resolve(parent), path.resolve(candidate));
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Workspace must remain inside ${path.resolve(parent)}`);
  }
}

export function artifactsRoot(config = loadConfig()) {
  return path.isAbsolute(config.artifacts.root) ? path.resolve(config.artifacts.root) : repoPath(config.artifacts.root);
}

export function resolveWorkspace(input, config = loadConfig()) {
  if (!input) throw new Error('A workspace path or slug is required.');
  const root = artifactsRoot(config);
  const candidate = path.isAbsolute(input) ? input : path.join(root, input);
  assertInside(root, candidate);
  return path.resolve(candidate);
}

export function atomicWriteJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const temporary = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  fs.renameSync(temporary, filePath);
}

export function appendEvent(workspace, event) {
  const logPath = path.join(workspace, 'logs', 'events.ndjson');
  fs.mkdirSync(path.dirname(logPath), { recursive: true });
  fs.appendFileSync(logPath, `${JSON.stringify({ at: new Date().toISOString(), ...event })}\n`, 'utf8');
}

export function readState(workspace) {
  return JSON.parse(fs.readFileSync(path.join(workspace, 'state.json'), 'utf8'));
}

export function writeState(workspace, state) {
  atomicWriteJson(path.join(workspace, 'state.json'), state);
  return state;
}

export function initWorkspace({ topic, linearIssue = null, root = artifactsRoot() }) {
  const cleanTopic = String(topic || '').trim();
  const slug = slugify(cleanTopic);
  const workspace = path.resolve(root, slug);
  assertInside(root, workspace);
  fs.mkdirSync(workspace, { recursive: true });
  for (const directory of WORKSPACE_DIRECTORIES) {
    fs.mkdirSync(path.join(workspace, directory), { recursive: true });
  }

  const statePath = path.join(workspace, 'state.json');
  if (fs.existsSync(statePath)) {
    const state = readState(workspace);
    if (state.topic.trim().toLowerCase() !== cleanTopic.toLowerCase()) {
      throw new Error(`Workspace slug collision: ${slug} already belongs to "${state.topic}".`);
    }
    appendEvent(workspace, { type: 'workspace_resumed', stage: state.stage });
    return { workspace, state, resumed: true };
  }

  const state = createState({ topic: cleanTopic, slug, linearIssue });
  writeState(workspace, state);
  appendEvent(workspace, { type: 'workspace_initialized', topic: state.topic, slug, linearIssue });
  return { workspace, state, resumed: false };
}

export function advanceWorkspace({ workspace: workspaceInput, stage, note = '' }) {
  const workspace = resolveWorkspace(workspaceInput);
  const state = readState(workspace);
  const from = state.stage;
  transitionState(state, stage, note);
  writeState(workspace, state);
  appendEvent(workspace, { type: 'stage_transition', from, to: stage, note });
  return { workspace, state };
}

export function updateWorkspaceState(workspaceInput, mutator, event = null) {
  const workspace = resolveWorkspace(workspaceInput);
  const state = readState(workspace);
  mutator(state);
  state.updatedAt = new Date().toISOString();
  writeState(workspace, state);
  if (event) appendEvent(workspace, event);
  return state;
}

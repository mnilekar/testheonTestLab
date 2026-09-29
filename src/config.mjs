import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const CONFIG_PATH = path.join(REPO_ROOT, 'config', 'testheon.config.json');

export function loadConfig(configPath = CONFIG_PATH) {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  if (config.schemaVersion !== 1) {
    throw new Error(`Unsupported config schemaVersion: ${config.schemaVersion}`);
  }
  if (config.publishing?.requiredStatus !== 'draft' || config.publishing?.manualPublishOnly !== true) {
    throw new Error('Unsafe publishing configuration: draft/manual-publish protections are required.');
  }
  return config;
}

export function repoPath(...parts) {
  return path.join(REPO_ROOT, ...parts);
}


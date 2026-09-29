import path from 'node:path';
import { advanceWorkspace, initWorkspace, readState, resolveWorkspace, updateWorkspaceState } from './workspace.mjs';
import { validatePackageFile, validateSetup } from './validate.mjs';
import { upsertWordpressDraft } from './wordpress.mjs';

function parseArgs(argv) {
  const [command, ...tokens] = argv;
  const options = {};
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (!token.startsWith('--')) throw new Error(`Unexpected argument: ${token}`);
    const key = token.slice(2);
    const next = tokens[index + 1];
    if (!next || next.startsWith('--')) options[key] = true;
    else {
      options[key] = next;
      index += 1;
    }
  }
  return { command, options };
}

function requireOption(options, key) {
  if (!options[key] || options[key] === true) throw new Error(`--${key} is required.`);
  return options[key];
}

function print(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function help() {
  return `Testheon automation helper

Commands:
  init --topic <topic> [--linear <issue>]
  status --workspace <slug-or-path>
  advance --workspace <slug-or-path> --stage <stage> [--note <text>]
  validate-setup
  validate-package --file <package.json>
  upsert-draft --file <package.json> --workspace <slug-or-path> --execute

upsert-draft performs no network write unless --execute is present.`;
}

export async function runCli(argv = process.argv.slice(2)) {
  const { command, options } = parseArgs(argv);
  if (!command || command === 'help' || options.help) {
    process.stdout.write(`${help()}\n`);
    return 0;
  }

  if (command === 'init') {
    const result = initWorkspace({ topic: requireOption(options, 'topic'), linearIssue: options.linear || null });
    print({ ok: true, workspace: result.workspace, resumed: result.resumed, state: result.state });
    return 0;
  }

  if (command === 'status') {
    const workspace = resolveWorkspace(requireOption(options, 'workspace'));
    print({ ok: true, workspace, state: readState(workspace) });
    return 0;
  }

  if (command === 'advance') {
    const result = advanceWorkspace({
      workspace: requireOption(options, 'workspace'),
      stage: requireOption(options, 'stage'),
      note: options.note || ''
    });
    print({ ok: true, workspace: result.workspace, state: result.state });
    return 0;
  }

  if (command === 'validate-setup') {
    const result = validateSetup();
    print(result);
    return result.ok ? 0 : 1;
  }

  if (command === 'validate-package') {
    const result = validatePackageFile(requireOption(options, 'file'));
    print({ ok: result.ok, errors: result.errors, warnings: result.warnings, filePath: result.filePath });
    return result.ok ? 0 : 1;
  }

  if (command === 'upsert-draft') {
    const file = path.resolve(requireOption(options, 'file'));
    const workspace = requireOption(options, 'workspace');
    const validation = validatePackageFile(file);
    if (!validation.ok) {
      print({ ok: false, dryRun: !options.execute, errors: validation.errors, warnings: validation.warnings });
      return 1;
    }
    if (!options.execute) {
      print({ ok: true, dryRun: true, message: 'Package is valid. No WordPress write was performed.', warnings: validation.warnings });
      return 0;
    }

    const result = await upsertWordpressDraft({ packagePath: file, workspace });
    const currentState = updateWorkspaceState(workspace, (state) => {
      state.wordpress = { ...state.wordpress, ...result };
    }, { type: 'wordpress_draft_verified', postId: result.postId, status: result.status });
    if (currentState.stage === 'wordpress_package') {
      advanceWorkspace({ workspace, stage: 'wordpress_draft', note: `Verified WordPress draft ${result.postId}.` });
    }
    print({ ok: true, dryRun: false, result });
    return 0;
  }

  throw new Error(`Unknown command: ${command}`);
}

export async function main(argv = process.argv.slice(2)) {
  try {
    process.exitCode = await runCli(argv);
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}

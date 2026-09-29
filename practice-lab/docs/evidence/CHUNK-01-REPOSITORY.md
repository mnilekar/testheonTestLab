# Chunk 01 repository discovery evidence

Recorded 2026-09-27 for [CRE-46](https://linear.app/creaditcardandlounge-website/issue/CRE-46/pl-01-discovery-and-architecture-decision). Repository root: `C:\Users\MayurN\OneDrive\Documents\ChatGPT\Testheon-Content_project`.

## Scope and method

Read the complete preserved CRE-46 ticket, `practice-lab/AGENTS.md`, `practice-lab/docs/CHUNK-00-GROUND-RULES.md`, and the Chunk 00 report. This evidence covers repository/toolchain discovery and the existing test suite only. No application was scaffolded, package installed, deploy run, credential read, or WordPress request sent by this discovery work. Hosting and public-site evidence are collected separately by the parent task.

Commands ran in PowerShell from the repository root. Used `rg --files`, targeted `rg -n`, `Get-Content`, `Get-ChildItem`, and `Test-Path`; excluded `.env*`, cached tool data, and unrelated generated article assets from searches. No secret-bearing environment variable, remote URL, `.git/config`, or `.env` contents were printed.

## Existing structure

```text
Testheon-Content_project/
├── AGENTS.md                       # article pipeline plus Practice Lab routing
├── README.md                       # article automation usage and safeguards
├── package.json                    # private Node ESM orchestration package
├── .gitignore                      # credentials/local/generated artifact exclusions
├── config/testheon.config.json     # content automation configuration
├── docs/
│   ├── 00_TESTHEON_FULLY_AUTOMATED_ARTICLE_PIPELINE.md
│   ├── ROLE_INDEX.md
│   ├── roles/                      # seven content production roles
│   ├── SECURITY_AND_CAPABILITIES.md
│   └── SETUP_VALIDATION.md
├── scripts/
│   ├── testheon.mjs                # content CLI entry point
│   └── generate-homepage-v2.mjs     # WordPress homepage draft generator
├── src/
│   ├── cli.mjs
│   ├── config.mjs
│   ├── state.mjs
│   ├── validate.mjs
│   ├── wordpress.mjs
│   └── workspace.mjs
├── tests/                          # four node:test files, 14 tests
├── templates/article-package.json
├── artifacts/articles/             # generated article workspaces, ignored
└── practice-lab/
    ├── AGENTS.md
    └── docs/                       # ground rules, task, reports, discovery evidence
```

Existing top-level report artifacts include `TESTHEON_HOMEPAGE_V2.md`, `TESTHEON_CHANGES_ROUND_1.md`, and `TESTHEON_WORDPRESS_CONTENT_AUDIT.md`. These are historical reports, not evidence of present server configuration. There is no existing Practice Lab application, package manifest, fixture manifest, frontend framework, API runtime, or build/deployment configuration in the discovered project source.

## Runtime and package-manager evidence

| Command or file | Observed result | Meaning |
| --- | --- | --- |
| `node --version` | `v24.13.1`, exit 0 | Working local Node runtime. |
| `pnpm --version` | `11.19.0`, exit 0 | Available local package manager; not pinned by this repository. |
| `corepack --version` | `0.34.6`, exit 0 | Corepack executable available. |
| `npm --version` | Exit 1; `MODULE_NOT_FOUND` for `C:\Users\MayurN\AppData\Roaming\npm\node_modules\npm\bin\npm-cli.js` | Default npm launcher remains broken; no repair attempted. |
| `Get-Command node,npm,pnpm,corepack` | Paths below | Actual locally resolved executables. |
| `package.json` | `testheon-content-automation` 1.0.0, private, `type: module`, Node `>=20` | Article orchestration package, not the Lab stack. |
| `package.json` scripts | `test: node --test`; `validate:setup: node scripts/testheon.mjs validate-setup`; `testheon: node scripts/testheon.mjs` | Direct Node test command avoids the broken npm launcher. |
| Root manifest inspection | No `dependencies`, `devDependencies`, or `packageManager` field | Existing source uses Node built-ins; future Lab dependency choices are not yet established. |

Resolved executable paths:

```text
node.exe: C:\Program Files\nodejs\node.exe
npm.ps1: C:\Program Files\nodejs\npm.ps1
pnpm.cmd: C:\Users\MayurN\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd
corepack.cmd: C:\Program Files\nodejs\corepack.cmd
```

`Get-Command yarn -ErrorAction SilentlyContinue` returned no command. `Test-Path` returned **False** for all of `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, `bun.lock`, `bun.lockb`, and `pnpm-workspace.yaml` at the repository root, and for `practice-lab/package.json`.

A pre-existing ignored `node_modules/` contains `sharp`, `@img`, `detect-libc`, `semver`, `.bin`, and `.package-lock.json`. A pre-existing `.pnpm-store/` also exists. These local artifacts are not declared or locked by the root manifest and do not establish a reproducible project dependency set. No package installation, store migration, or cleanup was performed.

## Existing scripts and integration boundary

| Exact source | Observed responsibility | Consequence for the Lab |
| --- | --- | --- |
| `scripts/testheon.mjs:2` and `src/cli.mjs:46` | Dispatches article workspace initialization/status/transition, setup/package validation, and draft upsert. | Leave the content pipeline intact; this ticket does not trigger it. |
| `src/workspace.mjs:6`, `:50`, `:57`, `:72` | Deterministic slug workspace directories, atomic JSON writes, NDJSON events, resumable initialization. | Useful existing engineering conventions; no Lab code is created from them here. |
| `src/state.mjs` | Editorial pipeline stages, review loops, blocker fingerprints. | Article-specific state machine; not a Lab session/storage service. |
| `src/wordpress.mjs:23`, `:74`, `:171`, `:205` | Environment-authenticated REST client, exact-post ownership guards, draft-forcing payload, staged draft upsert/re-fetch. | Must remain outside the Lab runtime and credentials. |
| `src/config.mjs:8` | Loads repository content config and requires draft/manual-publish protection. | Not the Lab's configuration or storage. |
| `scripts/generate-homepage-v2.mjs:7` | `TRACKS` source defines Playwright and other learning tracks; resolves post membership/featured links into static HTML. | Historical brand/content inspiration; not a frontend framework. |
| `scripts/generate-homepage-v2.mjs:102` | Fetches authenticated published-post content and existing homepage page 70, plus live public homepage HTML. | Even running without the write flag uses WordPress credentials and reads production; not run for this bounded repository discovery. |
| `scripts/generate-homepage-v2.mjs:311` | `--write-draft` permits creation/update of the intended WordPress homepage draft. | Not authorized by this read-only chunk; do not reuse it as a Lab deploy command. |
| `scripts/generate-homepage-v2.mjs:405` | Writes `TESTHEON_HOMEPAGE_V2.md`. | Running the script would also overwrite a root report. Source inspection was sufficient. |

The homepage generator's inspected CSS uses body `Inter` and headings `Poppins` (`:133`, `:136`), ink `#0B1F33`, soft ink `#17324A`, slate `#5A7186`, paper `#F1F4F6`, white `#FFFFFF`, line `#D8E0E6`, and amber `#D28100`. These are source-code observations, not proof of today's live theme/header/footer styling. The generator renders ordinary HTML links and contains no generated client JavaScript. Its content markers are `TH2-START` and `TH2-END`.

No repository font assets were returned by the targeted `rg --files --hidden` search for `.woff`, `.woff2`, `.ttf`, or `.otf`, excluding `.git`, dependencies, and tool caches. Self-hosted font asset discovery remains a public/server evidence task; CSS font-family declarations alone do not prove the font files exist.

## CI, Git, and repository conventions

`Test-Path` returned **False** for `.github`, `.gitlab-ci.yml`, `Jenkinsfile`, `.circleci`, and `azure-pipelines.yml`. The source/config inventory found no CI, container, or Lab deployment configuration. No claim is made about an externally configured CI service that is not represented locally.

Git commands and exact outcome summaries:

```text
git rev-parse --show-toplevel
C:/Users/MayurN/OneDrive/Documents/ChatGPT/Testheon-Content_project

git branch --show-current
master

git ls-files
(no output; no tracked files)

git remote
(no output; no configured remote names)

git log -1 --format='%h %ad %s' --date=iso-strict
fatal: your current branch 'master' does not have any commits yet
```

`git status --short` initially reported the existing root files/directories, including the content engine, reports, and `practice-lab/`, as untracked. There is no existing commit against which a normal `git diff` or commit-based rollback can prove unchanged files. No branch, commit, remote, or staging/index mutation was performed. Future CI/deployment setup must establish a reviewed repository baseline and must not accidentally commit local caches, credentials, generated article data, or unrelated artifacts.

`AGENTS.md` routes Practice Lab engineering away from the article pipeline. `practice-lab/AGENTS.md` and the full CRE-45 ground rules govern chunk scope and the exact eleven-section report template. `README.md` documents the article CLI, generated workspaces, and draft-only/manual-publish safeguards; it currently contains no Lab setup/run instructions. Root `.gitignore` excludes `node_modules/`, `.mcp-inspect/`, `.env`, `.env.*` with an `.env.example` exception, article artifacts except `.gitkeep`, logs, and `coverage/`. A root `.env.example` does not currently exist. No ignore file was changed in discovery.

## Tests inspected and executed

Before running, read all four existing files: `tests/state.test.mjs`, `tests/validate.test.mjs`, `tests/wordpress.test.mjs`, and `tests/workspace.test.mjs`.

- The WordPress integration test injects its own `fetchImpl` and fake credential strings; it never uses the production transport or actual credentials.
- Tests create temporary workspaces under the OS temporary directory. The WordPress test removes its own generated temp directory in its existing `finally` block. The existing workspace initialization test does not clean up its generated temp directory; no unrelated cleanup or test alteration was performed.
- No test starts a server, deploys, or accesses the production WordPress database.

Executed the full command configured by `package.json`:

```powershell
Set-Location -LiteralPath 'C:\Users\MayurN\OneDrive\Documents\ChatGPT\Testheon-Content_project'
node --test
```

Observed output summary, exit code **0**:

```text
tests 14
suites 0
pass 14
fail 0
cancelled 0
skipped 0
todo 0
duration_ms 3397.2118
```

Coverage represented by the passing tests: pipeline completion/review transitions; stable blocker fingerprints; package validation including draft-only status, prohibited H1/placeholders/local paths; media replacement; forced-draft payload; existing slug ownership; mocked gate-checked upsert/re-fetch and Rank Math allowlist; deterministic slugging and workspace resumption.

**Limit:** these are the existing content-engine tests. Practice Lab unit/integration/API/E2E suites do not exist yet because no Lab has been scaffolded. No existing test was skipped. The npm version failure is a tooling limitation, not a failing test suite. No tests were invented for this documentation-only chunk.

## Carry-forward evidence for architecture

- Create a separately configured `practice-lab/` package and lockfile only in the authorized scaffold chunk; keep the root article engine and its credentials out of Lab imports, build steps, and runtime.
- pnpm is available, while the default npm launcher currently fails. Choose and pin the future Lab package-manager/version explicitly instead of treating local cached artifacts as project configuration.
- Establish a reviewed initial Git baseline and remote/CI destination before expecting commit-based CI/deployment traceability. Local Git currently cannot provide it.
- Independently verify live theme/font/hosting/routing facts. The homepage generator's source is useful evidence of conventions but does not establish the live server state.
- No deployment was made. This repository evidence is not a substitute for the required remote `.htaccess` hashes and before/after HTTP canonical baselines.

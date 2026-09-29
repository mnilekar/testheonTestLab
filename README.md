# Testheon content automation

This repository is configured so a future request such as `Create Testheon post: Playwright Python fixtures` runs the complete Testheon research-to-verified-WordPress-draft workflow. The root `AGENTS.md` is the durable Codex contract; the master pipeline and all seven role specifications are preserved under `docs/`.

## Future use

Give Codex only a topic name while working in this repository. The explicit forms are also accepted:

```text
<topic>
Create Testheon post: <topic>
Create Testheon post from Linear: <issue>
```

Codex creates or resumes `artifacts/articles/<slug>/`, records every transition in `state.json` and `logs/events.ndjson`, performs the required research and review loops, generates justified images, and creates or updates only the intended WordPress draft. Final publication remains manual.

## Repository helper

```powershell
node scripts/testheon.mjs init --topic "<topic>"
node scripts/testheon.mjs status --workspace "<slug>"
node scripts/testheon.mjs validate-setup
node scripts/testheon.mjs validate-package --file "<workspace>\wordpress\article-package.json"
node scripts/testheon.mjs upsert-draft --file "<workspace>\wordpress\article-package.json" --workspace "<workspace>" --execute
```

Without `--execute`, `upsert-draft` validates the package and performs no network write. Even with `--execute`, the client forces `status: draft`, checks the exact slug first, backs up an owned existing post before updating it, allowlists four Rank Math fields, and re-fetches the saved post for verification.

## Article workspace

```text
artifacts/articles/<slug>/
├── state.json
├── research/
├── seo/
├── article/
├── qa/{head-controller,content-reviewer,rendered-draft}/
├── images/generated/
├── wordpress/backups/
└── logs/events.ndjson
```

Credentials are read at runtime from `TESTHEON_WP_USER` and `TESTHEON_WP_APP_PASSWORD`. They must never be copied into this repository.

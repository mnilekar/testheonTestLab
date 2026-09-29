# Testheon specification index

## Authority and precedence

For repository behavior, use this order:

1. Current system, developer, and user instructions.
2. Root `AGENTS.md`.
3. `00_TESTHEON_FULLY_AUTOMATED_ARTICLE_PIPELINE.md`.
4. The role specifications below.
5. `config/testheon.config.json` and the current article workspace state.

The 2026-08-30 master pipeline is the authoritative orchestration contract. It intentionally automates handoffs that older role documents describe as separate manual steps. It does not weaken draft-only publishing, current-source verification, SEO ownership, no-fabrication, credential safety, or human final-publish rules.

## Current role specifications

| Order | Role | File |
|---:|---|---|
| 1 | SEO Manager | `roles/01_SEO_MANAGER.md` |
| 2 | Head Controller | `roles/02_HEAD_CONTROLLER.md` |
| 3 | Deep Research / Writer | `roles/03_DEEP_RESEARCH_WRITER.md` |
| 4 | Image Manager | `roles/04_IMAGE_MANAGER.md` |
| 5 | Content Roadmap / Linear | `roles/05_CONTENT_ROADMAP_LINEAR.md` |
| 6 | WordPress Publisher | `roles/06_WORDPRESS_PUBLISHER.md` |
| 7 | Content Reviewer / QA Gate | `roles/07_CONTENT_REVIEWER.md` |

These are the newest complete role specifications discovered during setup (all dated 2026-08-11 or 2026-08-12). Earlier article-specific prompts and the 2026-08-05 project-context file are historical evidence, not global authority.

## Conflict decisions made during integration

- Older role language says to discuss every outdated or unavailable instruction. The master pipeline narrows user interruption to genuine strategic ownership conflicts, security challenges, or missing capabilities. Routine, safely resolvable mismatches are fixed automatically and documented.
- Older documents describe manual artifact transfer and image/SEO steps. The master pipeline replaces those transfers with a single deterministic workspace and automatic stage chaining.
- The Content Reviewer says no historical per-finding taxonomy existed. The orchestrator uses the master pipeline's `BLOCKER`, `MAJOR`, `MINOR`, and `SUGGESTION` impact labels for automation; the role's PASS/PASS WITH CHANGES/FAIL outcome remains intact.
- Linear `Done` remains publication/initial-validation oriented. A WordPress draft alone does not mark an issue Done.
- Rank Math metadata must not be silently omitted. If the verified REST route stops working, use the authenticated editor fallback; otherwise the run remains blocked at WordPress readiness.


# Setup validation record

Validated on 2026-08-30 during the one-time repository setup. These checks made no WordPress post and did not publish or modify content.

| Capability | Result | Setup behavior |
|---|---|---|
| Google Trends | Connected MCP call passed | MCP first; public Google Trends browser fallback |
| Google Search Console | MCP returned an expired OAuth grant | Signed-in browser fallback is the active read-only path until OAuth is refreshed |
| Linear | Connected workspace lookup passed | Read/reconcile issues and roadmap; draft creation alone never marks Done |
| Image generation | Available | Run after editorial QA; store generated assets in the article workspace |
| WordPress REST | Authenticated read-only probe passed | Repository REST client is the deterministic fallback; it forces draft status |
| WordPress core routes | Posts, media, categories, and tags present | Search/reuse before create; exact-slug identity |
| Rank Math | Installed update route and request schema present | Only four verified SEO keys are allowlisted |

The local test suite covers state transitions, deterministic workspace creation, article-package validation, exact-slug update authorization, media placeholder replacement, and forced-draft payload construction.

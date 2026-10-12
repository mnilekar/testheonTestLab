# CRE-56 — Chunk 11 task record

Source: [PL-11 — SEO, blog integration and analytics](https://linear.app/creaditcardandlounge-website/issue/CRE-56/pl-11-seo-blog-integration-and-analytics)

## Scope restatement

- Audit every Practice Lab URL against the approved INDEX/NOINDEX architecture and make every INDEX page complete, distinct, canonical, linked, and represented accurately in the Practice sitemap.
- Keep thin fixtures, challenge details, downloads, APIs, and protected staging out of search while documenting the later Rank Math and Google Search Console discovery steps.
- Produce a relevance-scored blog-to-practice mapping, scoped reusable CTA, exact per-post placement proposal, and exact navigation proposal without changing WordPress.
- Add first-party, non-personal analytics to explanatory and landing surfaces while preserving fixture DOM contracts, and document all eight required events.
- Test locally and on protected staging, prove WordPress remained untouched through R4 evidence, write the Chunk 11 report, and stop before CRE-57.

## Acceptance interpretation

The production build has a single ten-URL INDEX allowlist. Challenge detail pages remain selectively `NOINDEX,FOLLOW` under the Chunk 10 quality threshold, all other thin/runtime HTML is `NOINDEX,FOLLOW`, and non-HTML downloads/APIs use response headers where appropriate. Protected staging globally overrides every route to `noindex,nofollow` and publishes an empty sitemap. Blog and WordPress navigation work is proposal-only in this chunk.

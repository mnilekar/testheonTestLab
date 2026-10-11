# CRE-55 — Chunk 10 task record

Source: [PL-10 — Challenge system, starter code and test-case downloads](https://linear.app/creaditcardandlounge-website/issue/CRE-55/pl-10-challenge-system-starter-code-and-test-case-downloads)

## Scope restatement

- Define and validate 25–30 structured Playwright challenges with the required difficulty mix and topic coverage.
- Build a static, filterable challenge catalogue and noindex challenge detail pages with progressive hints and hidden solutions.
- Ship a cloneable TypeScript starter, three Python and Java examples each, and downloadable ecommerce test packs.
- Run solution contracts in CI, document URLs/index policy, preserve protected staging, and leave WordPress untouched.
- Write the Chunk 10 report and stop before CRE-56.

## Acceptance interpretation

The catalogue ships 28 challenges: 8 Beginner, 9 Intermediate, 7 Advanced, and 4 Expert. All initial detail pages remain `NOINDEX,FOLLOW`; the catalogue alone is indexable on production. Staging globally overrides pages to `noindex,nofollow`. The three debugging exercises include deliberately failing TypeScript starter files and keep their diagnoses inside collapsed solution sections.

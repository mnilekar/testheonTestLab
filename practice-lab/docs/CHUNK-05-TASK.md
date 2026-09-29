# CRE-50 — PL-05 Tables, search, pagination and infinite scroll

Source: https://linear.app/creaditcardandlounge-website/issue/CRE-50/pl-05-tables-search-pagination-and-infinite-scroll

Status at checkout: Backlog. Comments: none. Attachments: none. Blocked by completed CRE-49; blocks CRE-51.

## Execution protocol

Read CRE-45, `docs/ARCHITECTURE.md`, and the latest chunk report. Build only Chunk 5, test it, deploy it to protected staging, write `CHUNK-05-REPORT.md`, and stop.

## Required work

1. Build `/practice/components/tables/` with all 13 requested table patterns using the synthetic employee API data.
2. Include client and API pagination, session-persistent inline editing/reset, dynamic/selectable/expandable rows, sticky axes, 10,000-row virtualization, async state and both nested business hierarchies.
3. Include the Rahul/Engineering, Pune salary, and Ananya Rao/Wireless Mouse exercises.
4. Build `/practice/components/search-and-lists/` with all requested search timing, autocomplete, filtering, load-more, API infinite-scroll and explicit empty/end states.
5. Add and execute the four required Playwright TypeScript table examples.
6. Register every fixture, cover every behavior, prove live API persistence/reset, deploy only to protected/noindex staging, repeat R4 evidence, and stop before CRE-51.

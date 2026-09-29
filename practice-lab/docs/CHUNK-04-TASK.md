# CRE-49 — PL-04 Component Lab A

Source: https://linear.app/creaditcardandlounge-website/issue/CRE-49/pl-04-component-lab-a-inputs-buttons-choices-dropdowns-forms-and

Status at checkout: Backlog. Comments: none. Attachments: none. Blocked by completed CRE-48; blocks CRE-50.

## Execution protocol

Read CRE-45, `docs/ARCHITECTURE.md`, and the latest chunk report. Build only Chunk 4, test it, deploy it to protected staging, write `CHUNK-04-REPORT.md`, and stop.

## Required work

1. Build grouped pages for inputs, buttons, checkboxes/radios, dropdowns, realistic forms and Playwright locators.
2. Give every page a live marked fixture, automation tasks, a collapsed locator hint, relevant guide link and two to four TypeScript examples.
3. Register stable fixture IDs, routes, anchors, behavior, versions and intentional defects in the fixture manifest.
4. Use reusable components and deterministic behavior; forms must exercise client and Chunk 3 server validation, success, simulated failure and duplicate conflict.
5. Provide 400–800 words of genuine locator guidance with Good DOM and intentionally Awkward DOM for every required locator topic.
6. Run behavior, intentional-defect, executable-example and accessibility-equivalent coverage.
7. Deploy only to protected/noindex staging, re-run R4 evidence, report WordPress untouched PASS/FAIL, and stop before CRE-50.

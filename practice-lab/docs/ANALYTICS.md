# Practice Lab analytics contract

Status: implemented for the Lab in CRE-56. No WordPress analytics, post, theme, plugin, or menu change is authorised by this document.

## Placement and isolation

The Lab ships a small first-party event layer on explanatory and landing pages. It creates no cookies, writes no storage, sends no network request, loads no third-party script, and does not change the DOM. Events are appended to `window.dataLayer` and dispatched as `testheon:analytics` browser events so an approved analytics provider can consume the same contract later.

Pages whose production policy is `INDEX,FOLLOW` enable the layer automatically. Challenge detail pages enable it explicitly because their scenario, objective, hints, and solution are explanatory content. Fixture-only component pages, the Authentication Sandbox, internal Store screens, frame children, API documentation, and API responses do not load it.

The Table Lab and Store overview combine teaching content with fixtures. Their static markup contains explicit event attributes, while the event layer observes clicks and open `details` events without adding, removing, rewriting, or reordering any fixture node. Fixture scripts do not import analytics. No third-party script runs on any fixture page.

## Event definitions

| Event | Trigger | Parameters |
| --- | --- | --- |
| `practice_started` | A learner follows an explicitly marked start/open-practice action. | `page_path`, `content_id` |
| `challenge_opened` | A learner opens a challenge from the static catalogue. | `page_path`, challenge ID as `content_id` |
| `hint_used` | A closed progressive hint is opened. Re-closing does not emit. | `page_path`, challenge ID as `content_id`, `hint_number` |
| `solution_opened` | The collapsed solution is opened. | `page_path`, challenge ID as `content_id` |
| `starter_downloaded` | A marked starter ZIP or test-case pack link is clicked. | `page_path`, safe filename as `content_id` |
| `blog_to_practice_click` | An allowlisted CTA fragment arrives with `ref=blog` and a safe `source_post` slug. | `page_path`, `source_post` |
| `practice_to_blog_click` | A marked related Testheon guide link is clicked. | `page_path`, post slug as `content_id` |
| `reset_lab_data` | A marked reset action is clicked on an eligible explanatory page. | `page_path`, fixture area as `content_id` |

The event names and parameter names are stable. `content_id` and `source_post` accept only 1–100 characters from `A–Z`, `a–z`, `0–9`, period, underscore, and hyphen. The event layer never reads form values, text inputs, cookies, local storage, session storage, authentication state, demo usernames, email addresses, file contents, or API response bodies.

## Inspect events

1. Open an eligible page and browser DevTools.
2. In the console, run `window.dataLayer ?? []`.
3. Interact with an instrumented link, hint, solution, download, or reset control.
4. Re-run `window.dataLayer` and inspect the newest object.

For a live stream during manual testing, run:

```js
window.addEventListener('testheon:analytics', (event) => {
  console.table(event.detail);
});
```

Append `?analytics_debug=1` to an eligible Lab URL to log emitted payloads. The debug flag changes logging only; it does not change an event or fixture.

To exercise blog attribution before any WordPress CTA is approved, open:

```text
/practice/playwright/locators/?analytics_debug=1#ref=blog&source_post=playwright-locators
```

The fragment is never sent to the server, so it cannot create a duplicate crawlable URL. The canonical remains the clean teaching URL. The proposal in `docs/proposals/BLOG-PRACTICE-CTA.md` supplies these values. WordPress remains unchanged.

## Provider handoff

An analytics provider may be connected in a later explicitly authorised change by consuming the documented data-layer events. That change must preserve the event names, consent requirements, no-PII rule, fixture-page exclusion, Content Security Policy, and R4 WordPress proof. The current release intentionally makes the event contract testable without adding a third party.

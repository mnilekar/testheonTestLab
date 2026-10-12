# Blog → Practice CTA proposal

Status: **proposal only**. No published WordPress post, pattern, stylesheet, theme file, plugin, database row, or cache setting was changed in CRE-56.

## Reusable CTA

Visible label: **Practice this with Testheon Lab →**

Replace the example link, title, description, and `source_post` slug with the placement table values. The prefix `thpl-cta` is unique to this proposal and does not target Astra, WordPress, Easy Table of Contents, Rank Math, or article classes.

```html
<aside class="thpl-cta" aria-labelledby="thpl-cta-title">
  <p class="thpl-cta__eyebrow">Hands-on practice</p>
  <h2 class="thpl-cta__title" id="thpl-cta-title">
    Put this Playwright concept into a stable test
  </h2>
  <p class="thpl-cta__description">
    Use synthetic data and deterministic fixtures in Testheon Practice Lab.
  </p>
  <a
    class="thpl-cta__link"
    href="https://testheon.com/practice/playwright/locators/#ref=blog&amp;source_post=playwright-locators"
  >Practice this with Testheon Lab →</a>
</aside>
```

```css
.thpl-cta {
  margin: 2rem 0;
  padding: 1.25rem;
  border: 1px solid #d9cffd;
  border-left: 4px solid #6528f7;
  border-radius: 12px;
  background: #f8f6ff;
  color: #171321;
}

.thpl-cta__eyebrow {
  margin: 0 0 0.35rem;
  color: #5b21b6;
  font: 700 0.78rem/1.4 Inter, sans-serif;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.thpl-cta__title {
  margin: 0;
  color: #171321;
  font: 700 clamp(1.15rem, 2vw, 1.4rem)/1.3 Poppins, sans-serif;
}

.thpl-cta__description {
  margin: 0.65rem 0 1rem;
}

.thpl-cta__link {
  display: inline-block;
  border-radius: 8px;
  background: #6528f7;
  color: #fff;
  font-weight: 700;
  padding: 0.7rem 1rem;
  text-decoration: none;
}

.thpl-cta__link:hover,
.thpl-cta__link:focus-visible {
  background: #4c1d95;
  color: #fff;
  text-decoration: underline;
}

.thpl-cta__link:focus-visible {
  outline: 3px solid #f59e0b;
  outline-offset: 3px;
}
```

## WordPress reusable-block proposal

After separate approval, create one **Synced pattern** named `Testheon Lab CTA` in the WordPress editor using a Custom HTML block containing the HTML above. Add the scoped CSS through the approved WordPress CSS mechanism only after review. Keep the destination and copy editable per placement; never add inline JavaScript. The target query is read by the Lab’s first-party event layer and contains only a public post slug.

The fragment carries only the public source-post slug and is not sent to the server, so the CTA does not create a query URL for indexing. The reusable Custom HTML block representation is:

```html
<!-- wp:html -->
<aside class="thpl-cta" aria-labelledby="thpl-cta-title">
  <p class="thpl-cta__eyebrow">Hands-on practice</p>
  <h2 class="thpl-cta__title" id="thpl-cta-title">Put this Playwright concept into a stable test</h2>
  <p class="thpl-cta__description">Use synthetic data and deterministic fixtures in Testheon Practice Lab.</p>
  <a class="thpl-cta__link" href="TARGET_URL">Practice this with Testheon Lab →</a>
</aside>
<!-- /wp:html -->
```

## Placement proposal

Headings were re-read from the public WordPress REST representation on 2026-10-11. Insert after the complete section named below, never inside its heading or code block.

| Published post | Insert after exact H2 | CTA text | Target |
| --- | --- | --- | --- |
| [Playwright Tutorial for Beginners](https://testheon.com/playwright-tutorial/) | `Write Your First Playwright Test` | Practice your first resilient Playwright action in Testheon Lab | `https://testheon.com/practice/challenges/locate-primary-action-by-role/#ref=blog&source_post=playwright-tutorial` |
| [Playwright Locators](https://testheon.com/playwright-locators/) | `Use getByRole for Interactive Elements` | Compare resilient and brittle locators in Testheon Lab | `https://testheon.com/practice/playwright/locators/#ref=blog&source_post=playwright-locators` |
| [Playwright E2E Testing](https://testheon.com/playwright-e2e/) | `Write the complete UI-plus-API E2E test` | Automate a complete synthetic ecommerce flow in Testheon Lab | `https://testheon.com/practice/apps/ecommerce/#ref=blog&source_post=playwright-e2e` |
| [Playwright Authentication](https://testheon.com/playwright-authentication/) | `Reuse UI login with a setup project` | Build and verify reusable auth state in Testheon Lab | `https://testheon.com/practice/playwright/authentication/#ref=blog&source_post=playwright-authentication` |
| [Playwright API Testing](https://testheon.com/playwright-api-testing/) | `Combine UI and API without hiding the user journey` | Run an isolated API-to-UI workflow in Testheon Lab | `https://testheon.com/practice/playwright/api-testing/#ref=blog&source_post=playwright-api-testing` |
| [Playwright Framework](https://testheon.com/playwright-framework/) | `Step 4: Expose One Typed Fixture API` | Apply your framework to versioned Testheon Lab challenges | `https://testheon.com/practice/challenges/#ref=blog&source_post=playwright-framework` |
| [Playwright Fixtures](https://testheon.com/playwright-fixtures/) | `Create a type-safe custom fixture with test.extend()` | Build a fixture against stable Testheon Lab contracts | `https://testheon.com/practice/components/#ref=blog&source_post=playwright-fixtures` |
| [Playwright Visual Testing](https://testheon.com/playwright-visual-testing/) | `Make screenshot assertions deterministic` | Open the Testheon Store visual testing workflow | `https://testheon.com/practice/apps/ecommerce/#ref=blog&source_post=playwright-visual-testing` |
| [Playwright Trace Viewer](https://testheon.com/playwright-trace-viewer/) | `A trace-based CI failure investigation workflow` | Debug a deliberate Playwright failure in Testheon Lab | `https://testheon.com/practice/challenges/debug-hidden-race/#ref=blog&source_post=playwright-trace-viewer` |
| [Playwright Interview Questions](https://testheon.com/playwright-interview-questions/) | `Scenario-based Playwright interview questions` | Practise interview-ready Playwright scenarios in Testheon Lab | `https://testheon.com/practice/challenges/#ref=blog&source_post=playwright-interview-questions` |

The structured source, alternate matches, scores, and reasons are in `content/blog-practice-map.json`. Posts without a strongly relevant current Lab target are intentionally omitted.

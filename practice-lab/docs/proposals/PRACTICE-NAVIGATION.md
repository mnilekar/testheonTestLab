# WordPress navigation proposal — Practice Lab

Status: **proposal only**. CRE-56 did not change a WordPress menu, header, footer, theme, Customizer setting, database row, or cache.

## Exact proposed change

In the current primary/header menu, add one Custom Link:

- URL: `https://testheon.com/practice/`
- Navigation label: `Practice Lab`
- Position: immediately after `Blog` and before `Home`
- Link behavior: same tab
- Title attribute: leave empty
- CSS classes: leave empty
- Relationship/XFN: leave empty

The resulting observed menu order would be `Blog`, `Practice Lab`, `Home`, `Privacy Policy`. Apply the same menu assignment to desktop and mobile only if both displays use the same current primary menu; do not create duplicate menu items.

## Later authorised execution and QA

1. Record the R4 baseline and current menu assignment.
2. Add the Custom Link through the WordPress menu editor used by the active Astra setup.
3. Save only the intended primary menu.
4. Purge only the affected public page cache if needed.
5. Verify desktop and mobile keyboard order, visible focus, accessible name, destination, and no duplicate.
6. Re-run the full R4 comparison and rollback the single menu item if any unrelated production output changes.

No footer or published-post navigation change is part of this proposal.

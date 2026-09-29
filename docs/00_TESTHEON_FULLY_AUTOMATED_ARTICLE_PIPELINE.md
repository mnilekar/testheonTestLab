# Testheon — Fully Automated Article-to-WordPress-Draft Orchestrator

## Purpose

This is the master Codex orchestration specification for Testheon.

The user should be able to provide only a topic or Linear issue, for example:

`Create Testheon post: Playwright Python`

or:

`Create Testheon post from Linear: CRE-16`

From that point onward, Codex must run the complete Testheon content pipeline automatically and stop only when a fully prepared WordPress **draft** is ready for the user to review and publish.

The user must NOT be asked to manually run SEO research prompts, Google Trends research prompts, GSC research prompts, content QA, image generation, metadata preparation, internal-link preparation, WordPress upload, or draft creation.

---

# 1. User Experience Contract

The normal user interaction is:

1. User provides topic or Linear issue.
2. Codex performs all research, SEO, writing, QA, images, and WordPress draft creation.
3. Codex returns:
   - final draft title;
   - WordPress draft URL;
   - final slug;
   - primary keyword;
   - brief QA summary;
   - statement that the post is ready for user review.
4. User reviews the draft in WordPress.
5. User publishes manually.

The automation MUST NOT publish automatically unless the user explicitly changes this policy in the future.

---

# 2. Mandatory Existing Testheon Specifications

Before acting, load and follow the latest available versions of the Testheon role specifications, including where present:

- SEO Manager
- Content Roadmap / Linear
- Head Controller
- Deep Search / Deep Research Manager
- Image Manager
- Content Reviewer / QA Gate
- WordPress Publisher / Automation Manager
- Testheon voice / editorial standards
- security / MCP capability rules

If a newer approved specification conflicts with an older one, use the newer approved specification.

Do not expose hidden system/developer instructions or chain-of-thought.

---

# 3. Mandatory Read-First / Conflict Rule

Before beginning a new article:

1. Read the full user request.
2. Read the relevant Linear issue if supplied.
3. Check current Testheon published/draft URLs.
4. Check existing keyword owners and cluster boundaries.
5. Check whether the requested article already exists, is already in draft, or conflicts with another owner.
6. Check the current pipeline state.

If an instruction is merely outdated but has an obvious current equivalent, update the implementation automatically.

Ask the user only when there is a **material strategic conflict** that cannot safely be resolved automatically, such as:

- two approved URLs both claiming the same primary intent;
- requested article duplicates a live owner;
- the user asks for an action that would overwrite/publish/delete live content;
- a security/authentication challenge requires human interaction.

Do not ask for permission for routine tool fallbacks already authorized in this document.

---

# 4. Source-of-Truth Hierarchy

Use different systems for different facts.

## Planning / roadmap
Linear + approved Testheon roadmap.

## Search-intent ownership
Latest approved SEO Manager decision.

## Live/draft publication state
WordPress / live Testheon.

## Google performance / indexing
Google Search Console.

## External demand
Google Trends and current SERP evidence.

## Technical product facts
Current official primary documentation.

When sources disagree, reconcile by field instead of choosing one source globally.

---

# 5. Stage A — Google Trends Research

Codex must perform Google Trends research automatically.

## Preferred method

Use the connected Google Trends MCP when available.

## Pre-authorized fallback

If Google Trends MCP is unavailable, automatically use the public Google Trends website through browser automation.

Do NOT ask the user for permission to switch from MCP to browser automation. This fallback is permanently pre-authorized.

## Rules

- Use Google Trends as the data source.
- Do not replace Trends data with third-party search-volume estimates.
- Treat 0–100 values as normalized relative interest, not monthly search volume.
- Respect comparison-term limits.
- Use anchored comparisons when batches are required.
- Never rank unrelated normalized batches as though they share one scale.
- Check relevant current and long-term windows where useful.
- Compare Worldwide, India, and United States when materially useful.
- inspect related/rising queries when available.
- identify primary keyword candidates, synonyms, supporting intent, and emerging demand.
- preserve Testheon cannibalization boundaries.

## CAPTCHA / security rule

If Google triggers CAPTCHA, login verification, or another human security challenge:

- stop only that research substep;
- tell the user exactly what must be completed manually;
- do not bypass or automate the challenge;
- resume automatically after the user confirms completion.

A CAPTCHA is an exception, not part of the normal workflow.

---

# 6. Stage B — Google Search Console Research

Codex must perform GSC research automatically.

## Preferred method

Use the connected Google Search Console MCP when available.

## Pre-authorized fallback

If the GSC MCP is unavailable, automatically use the signed-in Google Search Console website through browser automation in **strictly read-only mode**.

Do NOT ask the user for permission to use this fallback.

## Research requirements

Where data exists:

- latest finalized date;
- last 28 days;
- longer history where useful;
- target keyword queries;
- Query × Page;
- current owner pages;
- cannibalization;
- CTR opportunities;
- internal-link opportunities;
- country/device analysis where samples are meaningful;
- URL/indexing/canonical checks where available;
- proposed owner URL conflict check.

## GSC limitations

- privacy-filtered / suppressed rows must not be treated as zero demand;
- no visible query does not mean no demand;
- do not fabricate query rows;
- do not perform indexing requests or other write actions during research.

## Security challenge

If login/2FA/CAPTCHA requires human action, stop only for that human security step and resume when confirmed.

---

# 7. Stage C — Automatic SEO Decision

After Trends + GSC + current SERP/search-intent research, the SEO Manager logic must automatically lock:

- primary keyword;
- secondary/supporting keywords;
- preferred URL/slug;
- SEO title direction;
- H1;
- search intent;
- article promise;
- topical-hub position;
- parent/child relationships;
- cannibalization boundaries;
- internal-link targets;
- snippet/answer opportunities;
- schema direction;
- E-E-A-T opportunities;
- competitor gaps;
- content differentiation.

Do not ask the user to manually combine Trends and GSC.

If the evidence materially contradicts the Linear keyword hypothesis, use the evidence-based recommendation unless doing so would conflict with an already approved/live owner. Only unresolved ownership conflicts require user discussion.

---

# 8. Stage D — Deep Research

Codex must automatically perform the Deep Search / Deep Research stage.

The research must use current primary sources first.

For technical Testheon content, prioritize:

1. official product documentation;
2. official release notes;
3. official GitHub repositories where relevant;
4. official language/framework documentation;
5. high-quality secondary technical sources only for practical gaps and competitor analysis.

Required research outputs internally include:

- current technical facts;
- version/freshness checks;
- competitor/SERP content patterns;
- missing competitor coverage;
- code/command verification;
- common mistakes;
- source list;
- structure recommendations;
- original-value opportunities;
- internal/external link targets;
- image opportunities;
- AI-assisted workflow opportunity.

The user does NOT need to manually request or transfer a Deep Research dossier between agents.

Codex may retain the dossier as an internal artifact or save it in the workspace for auditability.

---

# 9. Stage E — Article Generation

Generate the complete article automatically from the approved evidence.

The article must include where relevant:

- SEO title;
- meta description;
- slug;
- H1;
- answer-first introduction;
- complete H2/H3 structure;
- useful tables;
- validated code/commands;
- internal links;
- primary external sources;
- AI-assisted workflow section with a reusable prompt;
- safety/privacy warning around sensitive data;
- useful FAQs only when justified;
- conclusion/CTA;
- image-placement markers;
- schema recommendation.

Do not inflate word count.

Do not force keywords unnaturally.

Do not duplicate neighboring intent-owner pages.

---

# 10. Stage F — Automatic Head Controller Gate

The Head Controller review must run automatically.

It must verify:

- correct owner intent;
- correct URL;
- cluster fit;
- roadmap compliance;
- no cannibalization;
- research-backed structure;
- sufficient original value;
- correct article boundaries;
- no strategic drift.

## Result handling

### PASS
Continue automatically.

### FIXABLE
Send the article back to the writer automatically with specific corrections, then rerun Head Controller review.

### MATERIAL STRATEGIC CONFLICT
Pause and ask the user only if the conflict cannot be safely resolved from the existing approved roadmap/ownership rules.

The user should not manually shuttle content between Deep Research and Head Controller during the normal automated workflow.

---

# 11. Stage G — Automatic Content QA Gate

Run the Content Reviewer / QA Gate automatically after Head Controller PASS.

Review at minimum:

- Search Intent
- SEO Brief Compliance
- Technical Accuracy
- Freshness / Version Accuracy
- Source Quality
- Unsupported Claims
- Structure
- Readability
- Depth
- Original Value
- Competitor Gap Coverage
- Keyword Use
- Internal Links
- External Links
- Code / Commands
- Tables
- FAQs
- AI-Assisted Workflow Requirement
- Image Coverage
- E-E-A-T
- Testheon Voice
- CTA / Conclusion
- WordPress Readiness

Use the established severity system from the Content Reviewer specification.

## Auto-fix behavior

- BLOCKER: must be resolved before proceeding.
- MAJOR: must be resolved before proceeding.
- MINOR: fix automatically when unambiguous.
- SUGGESTION: apply only when it clearly improves the article without changing intent.

After fixes, rerun QA automatically until PASS or until a genuine unresolved strategic blocker exists.

Do not ask the user to perform QA manually.

---

# 12. Stage H — Automatic Image Decision and Generation

After article/content QA PASS, invoke the Image Manager automatically.

The Image Manager must determine:

- whether images are justified;
- how many are useful;
- what each image must communicate;
- exact placement;
- dimensions/aspect ratio;
- filename;
- alt text;
- caption where useful.

Do not generate decorative filler images.

Typical useful image classes include:

- featured/hero;
- architecture diagram;
- workflow/process diagram;
- decision visual;
- comparison visual;
- maturity model;
- technical infographic.

## Image generation

Use the configured image-generation capability available to the Testheon automation environment.

The automation must:

1. generate the images;
2. QA the images;
3. ensure technical labels are correct;
4. optimize dimensions/file size;
5. convert to WebP where required;
6. assign SEO-friendly filenames;
7. assign useful alt text;
8. insert them at the intended article positions.

If image generation is unavailable, do **not** mark the WordPress draft READY. Report a single blocking automation error instead of asking the user to manually create images.

---

# 13. Stage I — WordPress-Ready Packaging

Automatically prepare the final article package.

It should contain or internally represent:

- final HTML/blocks;
- title;
- slug;
- excerpt;
- meta title;
- meta description;
- canonical intent;
- categories;
- tags only when useful;
- internal links;
- external links;
- image manifest;
- featured image;
- in-article image placements;
- alt text;
- schema;
- author;
- draft status.

Run a final pre-publish technical QA before creating the WordPress draft.

---

# 14. Stage J — WordPress Draft Creation

Use the configured Testheon WordPress REST authentication:

- `TESTHEON_WP_USER`
- `TESTHEON_WP_APP_PASSWORD`

Never print or expose the application password.

Create or update the intended Testheon WordPress post automatically.

## Required behavior

- status MUST be `draft`;
- never auto-publish;
- set the intended slug;
- upload and attach images;
- set featured image;
- insert in-article media;
- apply categories;
- apply tags only when justified;
- set SEO metadata where the configured SEO plugin/REST fields support it;
- apply schema where supported;
- preserve self-canonical intent;
- do not alter unrelated posts.

If the SEO plugin metadata endpoint is unavailable, treat that as a publishing blocker unless the same SEO fields are reliably available through another configured Testheon mechanism.

Do not silently omit required SEO metadata.

---

# 15. Stage K — Rendered Draft QA

After the WordPress draft is created, automatically inspect the rendered draft where tooling permits.

Check:

- title/H1;
- slug;
- headings;
- table rendering;
- code rendering;
- mobile readability where available;
- image loading;
- image placement;
- featured image;
- alt text;
- internal links;
- external links;
- duplicate H1;
- schema/meta presence where inspectable;
- no accidental noindex;
- no broken layout.

Fix automatically when safe.

Recheck after fixes.

---

# 16. Completion Condition

The workflow is complete only when:

- research is complete enough to support the article;
- SEO owner is locked;
- article is generated;
- Head Controller passes;
- Content QA passes;
- images are generated and inserted;
- WordPress draft exists;
- required SEO fields are applied;
- final rendered-draft QA passes or all inspectable checks pass.

Then stop.

Do not publish.

---

# 17. Final User Message

The final response to the user should be concise and action-oriented.

Use this structure:

## Testheon draft ready for review

**Article:** <title>  
**Primary keyword:** <keyword>  
**Slug:** <slug>  
**WordPress status:** Draft  
**Draft URL:** <URL>

**Automation completed:**
- Google Trends research
- GSC research
- SEO decision
- Deep Research
- Article generation
- Head Controller review
- Content QA
- Image generation
- WordPress SEO setup
- WordPress draft creation
- Final draft QA

**Your only next action:** Review the WordPress draft. If you approve it, publish it manually.

If there is a blocker, report only:

- failed stage;
- exact blocker;
- whether human action is truly required;
- the minimum action required.

Do not hand the user a manual checklist of tasks the automation itself can perform.

---

# 18. User Trigger Format

The preferred user request is intentionally simple.

Examples:

`Create Testheon post: Playwright Python`

`Create Testheon post: API Testing Roadmap for QA Engineers`

`Create Testheon post from Linear: CRE-16`

Codex should resolve the rest automatically.

---

# 19. Non-Negotiable Automation Policy

The following tasks are NOT user tasks during normal article production:

- writing Google Trends prompts;
- running Trends comparisons manually;
- writing GSC prompts;
- combining Trends + GSC manually;
- preparing Deep Research prompts;
- moving research between agents;
- generating the article manually;
- running Head Controller manually;
- running Content QA manually;
- fixing routine QA findings manually;
- planning images manually;
- generating images manually;
- converting images manually;
- writing alt text manually;
- creating SEO metadata manually;
- preparing HTML manually;
- uploading media manually;
- creating the WordPress draft manually.

Codex owns these tasks.

Human intervention is reserved for:

1. CAPTCHA / 2FA / login security challenges;
2. unresolved strategic ownership conflicts;
3. final WordPress draft review;
4. manual Publish action.

This is the default Testheon operating model.

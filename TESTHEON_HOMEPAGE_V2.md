# Testheon Homepage v2

## 1. What was built

- Draft page ID: 256
- Preview URL: https://testheon.com/?page_id=256&preview=true
- Edit URL: https://testheon.com/wp-admin/post.php?post=256&action=edit
- Draft status: draft
- Draft changed on this run: No; stored source was already byte-identical
- Page 70 status after generation: publish
- Page 70 content hash before: `495724ec7b67ec961719b677ffed86092fa8569d7843e89b848a943655e497d0`
- Page 70 content hash after: `495724ec7b67ec961719b677ffed86092fa8569d7843e89b848a943655e497d0`
- Page 70 untouched: **Yes**
- Page 255 untouched: **Yes**
- Settings → Reading homepage assignment untouched: **Yes**
- Published posts modified: **None**

## 2. How tracks are defined

Option 2 was used because all 24 published posts share one broad category and 18 currently have no tags. The source of truth is the `TRACKS` JSON block at the top of `scripts/generate-homepage-v2.mjs`. The generator fetches published posts once, resolves membership and counts, then writes complete static HTML into the draft.

A fifth track is added by appending one object to `TRACKS`. For example:

```json
{
  "key": "performance-testing",
  "name": "Performance Testing",
  "state": "live",
  "description": "Load, stress, and reliability testing for delivery teams.",
  "match": { "slugPrefixes": ["performance-testing-", "k6-"] },
  "featuredSlugs": ["performance-testing-guide", "k6-tutorial"],
  "hubSlug": "performance-testing-guide",
  "footerLabel": "All performance testing guides"
}
```

Publish the relevant posts first, add the object, then run the generator command in section 9. No page markup or CSS changes are needed.

## 3. Full source

```html
[no-ez-toc]
<style>
.th2{--th2-ink:#0B1F33;--th2-ink-soft:#17324A;--th2-slate:#5A7186;--th2-paper:#F1F4F6;--th2-white:#FFFFFF;--th2-line:#D8E0E6;--th2-amber:#D28100;--th2-amber-dark:#7A4B00;--th2-pass:#65C497;--th2-pending:#A8B5C1;--th2-radius:4px;width:100%;background:var(--th2-paper);color:var(--th2-ink);font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.6;-webkit-font-smoothing:antialiased}
.th2,.th2 *{box-sizing:border-box}
.th2 a{color:inherit}
.th2 h1,.th2 h2,.th2 h3{font-family:Poppins,Inter,system-ui,sans-serif;line-height:1.15;letter-spacing:-.035em;color:inherit}
.th2 .th2-wrap{max-width:1120px;margin:0 auto;padding:0 24px}
.th2 .th2-hero{background:var(--th2-ink);color:var(--th2-white);padding:80px 0 88px}
.th2 .th2-hero-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:56px;align-items:center}
.th2 .th2-hero h1{font-size:52px;font-weight:700;margin:0 0 20px}
.th2 .th2-hero-copy{font-size:18px;color:#B7C7D4;max-width:52ch;margin:0 0 28px}
.th2 .th2-actions{display:flex;gap:12px;flex-wrap:wrap}
.th2 .th2-btn{display:inline-block;padding:13px 22px;border-radius:var(--th2-radius);font-weight:700;font-size:15px;text-decoration:none}
.th2 .th2-btn-primary{background:var(--th2-amber);color:#1A1200}
.th2 .th2-btn-primary:hover{background:#E89100;color:#1A1200}
.th2 .th2-btn-ghost{border:1px solid #6E8AA4;color:#F3F7FA}
.th2 .th2-btn-ghost:hover{background:rgba(255,255,255,.06);color:#FFF}
.th2 a:focus-visible{outline:3px solid var(--th2-amber);outline-offset:3px}
.th2 .th2-btn:focus-visible{outline-color:#FFF}
.th2 .th2-runner{background:#071624;border:1px solid #355777;border-radius:6px;font-family:ui-monospace,SFMono-Regular,Consolas,"Liberation Mono",monospace;font-size:13.5px;line-height:1.9;padding:20px 22px;box-shadow:0 24px 60px -20px rgba(0,0,0,.6)}
.th2 .th2-runner-bar{display:flex;align-items:center;gap:7px;padding-bottom:14px;margin-bottom:14px;border-bottom:1px solid #29465F}
.th2 .th2-dot{width:10px;height:10px;border-radius:50%;background:#496783}
.th2 .th2-runner-file{color:#A8B5C1;margin-left:8px;font-size:12.5px}
.th2 .th2-row{display:flex;align-items:baseline;gap:10px;white-space:nowrap}
.th2 .th2-tick{color:var(--th2-pass);font-weight:700}
.th2 .th2-circ{color:var(--th2-pending)}
.th2 .th2-suite{color:#E4EDF4}
.th2 .th2-count{color:#A8B5C1;margin-left:auto;font-size:12.5px}
.th2 .th2-runner-sum{margin-top:14px;padding-top:14px;border-top:1px solid #29465F;color:#A8B5C1;font-size:12.5px}
.th2 .th2-runner-sum b{color:var(--th2-pass);font-weight:700}
.th2 .th2-sec{padding:76px 0}
.th2 .th2-sec-alt{background:var(--th2-white);border-top:1px solid var(--th2-line);border-bottom:1px solid var(--th2-line)}
.th2 .th2-sec-head{margin:0 0 36px;max-width:60ch}
.th2 .th2-sec-head h2{font-size:34px;font-weight:600;margin:0 0 10px}
.th2 .th2-sec-head p{color:var(--th2-slate);font-size:16.5px;margin:0}
.th2 .th2-pillars{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px}
.th2 .th2-pillar{background:var(--th2-white);border:1px solid var(--th2-line);border-top:3px solid var(--th2-ink);border-radius:6px;padding:28px 26px 24px;display:flex;flex-direction:column}
.th2 .th2-sec-alt .th2-pillar{background:var(--th2-paper)}
.th2 .th2-pillar[data-state="planned"]{border-top-color:#AAB8C3}
.th2 .th2-pillar-top{display:flex;align-items:baseline;justify-content:space-between;gap:14px;margin:0 0 8px}
.th2 .th2-pillar h3{font-size:21px;font-weight:600;margin:0}
.th2 .th2-badge{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:12px;color:var(--th2-slate);border:1px solid #AAB8C3;border-radius:99px;padding:3px 10px;white-space:nowrap}
.th2 .th2-badge-live{color:var(--th2-amber-dark);border-color:#C99A44;background:#FFF8E8}
.th2 .th2-pillar>p{color:var(--th2-slate);font-size:15px;margin:0 0 18px}
.th2 .th2-pillar ul{list-style:none;margin:0 0 18px;padding:0;display:flex;flex-direction:column;gap:1px}
.th2 .th2-pillar li{margin:0;padding:0}
.th2 .th2-pillar li a{display:block;text-decoration:none;font-size:15px;font-weight:600;padding:7px 0;border-bottom:1px solid var(--th2-line);color:var(--th2-ink-soft)}
.th2 .th2-pillar li:last-child a{border-bottom:0}
.th2 .th2-pillar li a:hover{color:var(--th2-amber-dark)}
.th2 .th2-pillar-foot{margin-top:auto}
.th2 .th2-pillar-foot a{font-weight:700;font-size:14.5px;color:var(--th2-ink);text-decoration:none;border-bottom:2px solid var(--th2-amber);padding-bottom:2px}
.th2 .th2-pillar-foot span{font-size:14.5px;color:var(--th2-slate)}
.th2 .th2-path{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border:1px solid var(--th2-line);border-radius:6px;overflow:hidden;background:var(--th2-white)}
.th2 .th2-step{padding:26px 24px;border-right:1px solid var(--th2-line)}
.th2 .th2-step:last-child{border-right:0}
.th2 .th2-step-n{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:13px;color:var(--th2-amber-dark);display:block;margin:0 0 10px}
.th2 .th2-step h3{font-size:18px;font-weight:600;margin:0 0 6px}
.th2 .th2-step p{font-size:14.5px;color:var(--th2-slate);margin:0 0 12px}
.th2 .th2-step a{font-size:14.5px;font-weight:700;text-decoration:none;border-bottom:2px solid var(--th2-amber);padding-bottom:1px}
.th2 .th2-latest{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}
.th2 .th2-post{background:var(--th2-white);border:1px solid var(--th2-line);border-radius:6px;padding:22px 22px 20px;text-decoration:none;display:block}
.th2 .th2-sec-alt .th2-post{background:var(--th2-paper)}
.th2 .th2-post:hover{border-color:#8298A9}
.th2 .th2-post-meta{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:12px;color:var(--th2-slate);margin:0 0 10px;display:block}
.th2 .th2-post h3{font-size:17.5px;font-weight:600;margin:0 0 8px}
.th2 .th2-post p{font-size:14.5px;color:var(--th2-slate);margin:0}
.th2 .th2-tools{background:var(--th2-ink);color:var(--th2-white);border-radius:6px;padding:44px 40px;display:grid;grid-template-columns:1.1fr 1fr;gap:44px;align-items:center}
.th2 .th2-tools h2{font-size:30px;font-weight:600;margin:0 0 12px}
.th2 .th2-tools p{color:#B7C7D4;font-size:16px;max-width:46ch;margin:0}
.th2 .th2-tool-list{display:flex;flex-direction:column;gap:10px}
.th2 .th2-tool{border:1px solid #486783;border-radius:var(--th2-radius);padding:14px 16px;display:flex;justify-content:space-between;align-items:center;gap:14px}
.th2 .th2-tool b{font-weight:700;font-size:15px}
.th2 .th2-tool small{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:11.5px;color:#B7C7D4}
.th2 .th2-about{display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:start}
.th2 .th2-about h2{font-size:30px;font-weight:600;margin:0 0 12px}
.th2 .th2-about-copy{color:var(--th2-slate);font-size:16px;margin:0}
.th2 .th2-author{display:flex;gap:16px;align-items:center;margin:20px 0 0}
.th2 .th2-avatar{width:56px;height:56px;border-radius:50%;object-fit:cover;flex:none}
.th2 .th2-author b{display:block;font-size:15px}
.th2 .th2-author span{display:block;font-size:14px;color:var(--th2-slate)}
.th2 .th2-sub{background:var(--th2-white);border:1px solid var(--th2-line);border-radius:6px;padding:30px 28px}
.th2 .th2-sub h3{font-size:20px;font-weight:600;margin:0 0 8px}
.th2 .th2-sub p{font-size:15px;color:var(--th2-slate);margin:0 0 18px}
.th2 .th2-sub a{display:inline-block;font-weight:700;text-decoration:none;border-bottom:2px solid var(--th2-amber);padding-bottom:2px}
@media(max-width:900px){.th2 .th2-hero-grid,.th2 .th2-pillars,.th2 .th2-latest,.th2 .th2-path,.th2 .th2-tools,.th2 .th2-about{grid-template-columns:1fr}.th2 .th2-hero h1{font-size:38px}.th2 .th2-step{border-right:0;border-bottom:1px solid var(--th2-line)}.th2 .th2-step:last-child{border-bottom:0}.th2 .th2-tools{padding:32px 26px}.th2 .th2-sec{padding:56px 0}.th2 .th2-row{white-space:normal}}
@media(prefers-reduced-motion:reduce){.th2,.th2 *{scroll-behavior:auto!important;transition:none!important;animation:none!important}}
</style>
<!-- TH2-START -->
<div class="th2">
<section class="th2-hero">
<div class="th2-wrap th2-hero-grid">
<div>
<h1>Depth for QA engineers who refuse to stay downstream.</h1>
<p class="th2-hero-copy">Long-form, production-grade guides on test automation, AI-assisted testing, and quality engineering strategy. Written by someone who does the work.</p>
<div class="th2-actions"><a class="th2-btn th2-btn-primary" href="#tracks">Browse all guides</a><a class="th2-btn th2-btn-ghost" href="/playwright-automation/">Start with Playwright</a></div>
</div>
<div class="th2-runner" role="img" aria-label="Testheon content summary: Playwright 18 guides, QA career and strategy 5 guides, AI testing 4 guides, 24 published posts and 84,798 words in total.">
<div aria-hidden="true">
<div class="th2-runner-bar"><span class="th2-dot"></span><span class="th2-dot"></span><span class="th2-dot"></span><span class="th2-runner-file">testheon.spec.ts</span></div>
<div class="th2-row"><span class="th2-tick">✓</span><span class="th2-suite">playwright</span><span class="th2-count">18 guides</span></div>
<div class="th2-row"><span class="th2-tick">✓</span><span class="th2-suite">qa-career-strategy</span><span class="th2-count">5 guides</span></div>
<div class="th2-row"><span class="th2-tick">✓</span><span class="th2-suite">ai-testing</span><span class="th2-count">4 guides</span></div>
<div class="th2-row"><span class="th2-circ">○</span><span class="th2-suite">tools</span><span class="th2-count">planned</span></div>
<div class="th2-runner-sum"><b>24 published</b>, 1 track in progress — 84,798 words shipped</div>
</div>
</div>
</div>
</section>
<section class="th2-sec th2-sec-alt" id="tracks">
<div class="th2-wrap"><div class="th2-sec-head"><h2>Learning tracks</h2><p>Each track is a complete path, not a scattering of posts. Start at the hub and work down, or jump straight to what you need.</p></div>
<div class="th2-pillars">
<article class="th2-pillar" data-state="live">
<div class="th2-pillar-top"><h3>Playwright</h3><span class="th2-badge th2-badge-live">18 guides</span></div>
<p>Setup through production framework design, in TypeScript, Python, and Java.</p>
<ul>
<li><a href="/install-playwright/">Install Playwright: Complete Setup Guide for QA Engineers</a></li>
<li><a href="/playwright-tutorial/">Playwright Tutorial for Beginners: Write Your First Test</a></li>
<li><a href="/playwright-locators/">Playwright Locators: Complete Guide &amp; Best Practices</a></li>
<li><a href="/playwright-framework/">Playwright Automation Framework From Scratch</a></li>
<li><a href="/playwright-interview-questions/">Playwright Interview Questions and Answers</a></li>
</ul>
<div class="th2-pillar-foot"><a href="/playwright-automation/">All Playwright guides (18)</a></div>
</article>
<article class="th2-pillar" data-state="live">
<div class="th2-pillar-top"><h3>QA Career &amp; Strategy</h3><span class="th2-badge th2-badge-live">5 guides</span></div>
<p>Roadmaps, skill maps, and strategy documents that help QA lead quality work.</p>
<ul>
<li><a href="/qa-roadmap/">QA Roadmap 2026: Complete QA Engineer Learning Path</a></li>
<li><a href="/qa-skill-map-2026/">QA Skills 2026: The Complete Skill Map for Engineers Who Do the Work of Ten</a></li>
<li><a href="/test-strategy-2026/">Test Strategy 2026: The Template That Finally Gets QA a Seat at the Table</a></li>
<li><a href="/test-data-management/">Test Data Management 2026: A Complete Guide for QA Engineers</a></li>
<li><a href="/qa-engineers-2026/">QA Engineers 2026: Stop Playing Catch-Up and Start Leading</a></li>
</ul>
<div class="th2-pillar-foot"><a href="/qa-roadmap/">All career and strategy guides (5)</a></div>
</article>
<article class="th2-pillar" data-state="live">
<div class="th2-pillar-top"><h3>AI Testing</h3><span class="th2-badge th2-badge-live">4 guides</span></div>
<p>What AI changes in a test workflow, and the governance reliable teams still need.</p>
<ul>
<li><a href="/ai-testing-tools-2026/">10 Best AI Testing Tools in 2026 for QA Engineers</a></li>
<li><a href="/playwright-ai/">Playwright AI: AI-Assisted Testing for QA Engineers</a></li>
<li><a href="/playwright-mcp/">What Is Playwright MCP? Complete Guide for QA Engineers</a></li>
<li><a href="/playwright-test-agents/">Playwright Test Agents: How AI Agents Test Applications</a></li>
</ul>
<div class="th2-pillar-foot"><a href="/ai-testing-tools-2026/">All AI testing guides (4)</a></div>
</article>
<article class="th2-pillar" data-state="planned">
<div class="th2-pillar-top"><h3>Selenium &amp; Robot Framework</h3><span class="th2-badge">In progress</span></div>
<p>The next track in the queue: fundamentals, framework design, migration decisions, and interview preparation.</p>
<ul>
<li><a href="/playwright-vs-selenium/">Playwright vs Selenium: QA Decision Guide</a></li>
</ul>
<div class="th2-pillar-foot"><span>First guides publishing soon</span></div>
</article>
</div></div>
</section>
<section class="th2-sec">
<div class="th2-wrap"><div class="th2-sec-head"><h2>New to test automation? Start here.</h2><p>Three guides, in order, take you from nothing installed to a first passing test you understand.</p></div>
<div class="th2-path">
<div class="th2-step"><span class="th2-step-n">Step 1</span><h3>Install Playwright</h3><p>Get the package and browsers running, and fix the setup errors that stop most people on day one.</p><a href="/install-playwright/">Read the setup guide</a></div>
<div class="th2-step"><span class="th2-step-n">Step 2</span><h3>Write your first test</h3><p>Write it, run it, break it, and read the failure properly instead of guessing.</p><a href="/playwright-tutorial/">Start the tutorial</a></div>
<div class="th2-step"><span class="th2-step-n">Step 3</span><h3>Learn locators</h3><p>Stable locator strategy prevents fragile suites and makes every later framework decision easier.</p><a href="/playwright-locators/">Learn locator strategy</a></div>
</div></div>
</section>
<section class="th2-sec th2-sec-alt">
<div class="th2-wrap"><div class="th2-sec-head"><h2>Latest guides</h2><p>Recent long-form additions to the Testheon library.</p></div>
<div class="th2-latest">
<a class="th2-post" href="/playwright-trace-viewer/"><span class="th2-post-meta">5 Sept 2026 — 3,070 words</span><h3>Playwright Trace Viewer: Debug Failed Tests Faster</h3><p>Learn how to record and open Playwright traces, inspect DOM, network, console, source and attachments, and investigate CI failures systematically.</p></a>
<a class="th2-post" href="/playwright-fixtures/"><span class="th2-post-meta">4 Sept 2026 — 3,046 words</span><h3>Playwright Fixtures: Complete Guide</h3><p>Learn Playwright fixtures with reusable setup and teardown, custom fixtures, test and worker scopes, dependencies, options, and framework patterns.</p></a>
<a class="th2-post" href="/playwright-test-agents/"><span class="th2-post-meta">4 Sept 2026 — 2,638 words</span><h3>Playwright Test Agents: How AI Agents Test Applications</h3><p>Learn how Playwright Test Agents use planner, generator, and healer workflows—and how QA teams validate AI-generated plans, tests, and fixes.</p></a>
</div></div>
</section>
<section class="th2-sec" id="tools">
<div class="th2-wrap"><div class="th2-tools"><div><h2>Free QA tools</h2><p>Small, focused browser tools planned for repetitive QA tasks. These entries are roadmap placeholders, not available products.</p></div>
<div class="th2-tool-list"><div class="th2-tool"><b>Locator Generator</b><small>planned</small></div><div class="th2-tool"><b>Test Data Generator</b><small>planned</small></div><div class="th2-tool"><b>Cron &amp; CI Schedule Builder</b><small>planned</small></div></div>
</div></div>
</section>
<section class="th2-sec th2-sec-alt" id="about">
<div class="th2-wrap th2-about"><div><h2>About Testheon</h2><p class="th2-about-copy">Testheon publishes deep, practical guides for QA engineers across test strategy, AI-assisted automation, and career growth. Every guide is built around real engineering decisions and evidence.</p><div class="th2-author"><img class="th2-avatar" src="https://testheon.com/wp-content/uploads/2026/08/mayur-nilekar.jpeg" width="56" height="56" alt="Mayur Nilekar"><div><b>Mayur Nilekar</b><span>QA Engineer &amp; Writer, Pune, India</span></div></div></div>
<div class="th2-sub" id="subscribe"><h3>Get new guides by email</h3><p>Newsletter signup is being prepared. Until it opens, the blog is the source of truth for every new guide.</p><a href="/blog/">Browse the blog</a></div>
</div>
</section>
</div>
<!-- TH2-END -->
```

## 4. Astra integration notes

- Existing fonts: **Poppins for headings** and **Inter for body copy**. No new font request was added. The runner uses the operating system’s monospace stack.
- Poppins tuning: hero and section headings use `letter-spacing: -0.035em`; the tighter tracking offsets Poppins’ rounder, softer display shape at 52px.
- Draft-only Astra metadata: `site-content-layout = page-builder` (Full Width / Stretched), `site-sidebar-layout = no-sidebar`, and `site-post-title = disabled`.
- CSS location: one `<style>` block at the top of page content. This keeps the draft self-contained and avoids modifying Astra, Additional CSS, or a plugin.
- Specificity adjustments: every heading, link, list, and spacing rule includes the `.th2` root; direct selectors such as `.th2 .th2-hero h1`, `.th2 .th2-pillar li a`, and `.th2 .th2-post h3` override Astra heading margins, link colours/underlines, and list spacing. No `!important` was used except inside the reduced-motion safety override.
- Fragility on Astra updates: low. The layout depends only on Astra continuing to honor its documented `page-builder` full-width meta value; all visual selectors target v2-owned classes.
- Theme footer: retained. A second footer was omitted because Astra already renders the site footer, avoiding duplicate navigation and landmark elements.
- Official Astra reference: https://developers.wpastra.com/astra-theme/reference/classes/astra_site_container_layout_configs/

## 5. Accessibility and performance

### Contrast

| Use | Foreground | Background | Ratio | Result |
|---|---|---|---:|---|
| Primary text | `#0B1F33` | `#FFFFFF` | 16.69:1 | AA normal text |
| Primary text on paper | `#0B1F33` | `#F1F4F6` | 15.11:1 | AA normal text |
| Slate body text | `#5A7186` | `#FFFFFF` | 5.07:1 | AA normal text |
| Slate body text on paper | `#5A7186` | `#F1F4F6` | 4.59:1 | AA normal text |
| Hero text | `#FFFFFF` | `#0B1F33` | 16.69:1 | AA normal text |
| Hero supporting text | `#B7C7D4` | `#0B1F33` | 9.64:1 | AA normal text |
| Button text | `#1A1200` | `#D28100` | 6.09:1 | AA normal text |
| Dark amber labels | `#7A4B00` | `#FFFFFF` | 7.41:1 | AA normal text |
| Runner success text | `#65C497` | `#071624` | 8.61:1 | AA normal text |
| Runner secondary text | `#A8B5C1` | `#071624` | 8.74:1 | AA normal text |

- Amber `#D28100` is used for button backgrounds, borders, and focus rings—not small text on white. Small amber-toned labels use the darker `#7A4B00`.
- Keyboard tab order follows source order: Browse all guides → Start with Playwright → track post links and hub links → three Start Here links → three Latest Guide cards → Browse the blog. Every link has a visible 3px focus outline.
- The test-runner panel has one descriptive `aria-label`; its decorative dots, glyphs, and rows are wrapped in `aria-hidden="true"`.
- `prefers-reduced-motion: reduce` disables transitions and animations. The design adds no autonomous motion.
- The author image has explicit 56×56 dimensions and matching reserved CSS dimensions, preventing layout shift.
- Generated page source: 16.15 KB; inline CSS: 7.79 KB.
- New font requests: 0. New JavaScript: 0. New third-party requests: 0. The author image is an existing Testheon asset already used by the current homepage.

## 6. Link count

- Current page 70 internal link elements in page content: 6.
- Homepage v2 internal link elements in generated page content: 27.
- Current page 70 published posts reachable in one click: 3 of 24.
- Homepage v2 published posts reachable in one click: 18 of 24.
- Homepage v2 published posts reachable within two clicks: 24 of 24.
- Fragment navigation is excluded from published-post reachability but included as an on-page interaction. Duplicate links to the same post count once for reachability.

## 7. Judgement calls and blockers

- Build-time static generation was chosen over taxonomy queries because the live taxonomy cannot express the four requested tracks. Track definitions therefore use exact slugs and, where safe, slug prefixes.
- The Selenium & Robot Framework card uses the same component and JSON schema as live cards, with `state: planned`. It shows the existing Playwright-vs-Selenium post but deliberately has no hub link.
- “New long-form guide most weeks” was replaced with “Recent long-form additions” because the publishing history supports frequent recent publishing but not a durable weekly promise.
- The runner summary reports unique site totals (published posts and derived total words), while track badges may overlap because Playwright AI/MCP/Agents belong to both Playwright and AI Testing.
- The mockup’s newsletter form was not copied because no verified subscription endpoint was supplied. The Subscribe panel honestly marks signup as being prepared and links to the blog.
- The Tools entries are non-interactive roadmap placeholders. Copy explicitly says they are planned and unavailable.
- The hero starts the custom content; Astra retains responsibility for the site header, mobile menu, and footer.
- No schema was added. This remains a post-launch SEO follow-up.

## 8. Go-live runbook

1. Open the draft edit URL and compare the desktop and mobile previews. Confirm the single H1, track counts, latest guides, runner word count, and author image.
2. Run `node scripts/generate-homepage-v2.mjs --write-draft` immediately before approval so counts and Latest Guides reflect the current published site.
3. Confirm the generator reports `changed: false` on a second unchanged run and that static preview link counts match.
4. In WordPress Settings → Reading, note that page 70 is the current homepage. Do not change or delete page 70.
5. Publish `Homepage v2 DRAFT` only after editorial approval, then assign that published page as the homepage in Settings → Reading.
6. In Rank Math, verify the homepage meta title and description remain exactly as recorded below; do not replace them with the draft page title.
7. Purge LiteSpeed Cache, then open an Incognito window and verify the homepage at desktop and mobile widths.
8. In Incognito, verify navigation, all track and Latest Guide links, focus outlines, one H1, author image dimensions, no console errors, and View Source links.
9. Re-run the internal-link audit and confirm 18 posts at one click and all 24 within two clicks.
10. Rollback: in Settings → Reading, reassign page 70 as the homepage, save, purge LiteSpeed Cache, and verify page 70 in Incognito. The unchanged hash in section 1 identifies the preserved source.

Meta title to preserve: `Testheon \| QA Engineering, AI Testing & Automation`
Meta description to preserve: `Practical guides for QA engineers covering AI testing, test automation, Playwright, test strategy, test data, performance testing and career growth.`

## 9. Generator

- Script path: `scripts/generate-homepage-v2.mjs`
- Run command: `node scripts/generate-homepage-v2.mjs --write-draft`
- Sample output: `{"draftPageId":256,"changed":false,"sourceHash":"fcf0f59e7281a98a8c88b1a4fe4cee6caca1b3c4b1d6269919d9dbb6b55f36f3","posts":24,"words":84798,"links":27}`
- Idempotence: generation is deterministic; the script compares stored source and Astra metadata before writing. An unchanged site produces the same source hash and skips the WordPress update.
- After publishing a new post: update `TRACKS` only if its slug does not match an existing rule or it should appear in a card’s five featured links, then run the command above and review the refreshed draft/source before updating the live homepage.

## 10. Static-render proof

- Generated page-content internal links: 27.
- Authenticated WordPress REST-rendered draft links: 27. The counts match.
- Raw front-end preview: **blocked**. WordPress returned HTTP 404 at https://testheon.com/?page_id=256&preview=true because application-password authentication is REST-only and no signed-in browser session was available.
- Manual completion step: while signed into wp-admin, open the preview URL and use View Source to count the 27 internal links between the `TH2-START` and `TH2-END` markers.
- **No link on the page depends on JavaScript.** The stored source contains no JavaScript; all track and Latest Guide links are present in static HTML.
- The `[no-ez-toc]` shortcode disables automatic Easy Table of Contents injection on this directory-style homepage so plugin-generated heading links do not alter the source proof.


# 05_CONTENT_ROADMAP_LINEAR.md

## Testheon Content Roadmap + Linear Planning Operating Specification

---

# 0. Purpose

This document defines the reusable **Testheon content-roadmap and Linear-planning system** for the permanent automated Testheon Content Engine.

It reconstructs the content strategy, article sequencing, topical clusters, Linear conventions, dependencies, current known publication state, and roadmap-selection logic established for Testheon.

This is not a conversation summary.

The purpose is to enable an automated agent to answer:

* What should Testheon publish?
* In what sequence?
* Which article owns each search intent?
* Which pillar does an article belong to?
* What dependencies must be completed first?
* Which articles already exist?
* Which planned articles must not be duplicated?
* How should Linear represent this roadmap?
* How should actual WordPress/GSC state be reconciled with Linear?
* What should happen after an article is published?
* When can a new SEO opportunity interrupt the planned sequence?

---

# 1. Mandatory Read-First Rule

Every roadmap-planning or Linear-execution task must begin with this rule.

Before making any change:

1. Read the complete instruction.
2. Read the relevant current Linear project and issue.
3. Check the latest approved SEO ownership/brief where applicable.
4. Check the current WordPress/site state if publication status matters.
5. Check GSC if indexing or search-performance status matters.
6. Compare those sources before acting.

If an instruction is:

* irrelevant;
* outdated;
* already completed;
* contradicted by the current site;
* contradicted by a newer approved SEO decision;
* technically unavailable;
* likely to create duplicate content;
* likely to create keyword cannibalization;
* or otherwise risky,

**discuss it with the user before acting.**

Do not silently:

* skip a roadmap item;
* create a replacement article;
* change sequence;
* change keyword ownership;
* create a duplicate Linear issue;
* mark work completed without evidence;
* treat Linear status as proof that an article is or is not live;
* treat GSC indexing lag as proof that an article was not published.

---

# 2. Strategic Content Goals

Testheon is being developed as a specialized authority site around:

* QA engineering;
* software testing;
* test automation;
* modern browser automation;
* Playwright;
* AI-assisted testing;
* AI-system testing;
* test strategy;
* test data management;
* QA career development;
* API testing;
* performance-testing skills;
* modern QA engineering practices.

The strategic objective is not simply to publish independent blog posts.

The content model is:

```text
TOPICAL PILLAR
      ↓
FOUNDATIONAL SPOKES
      ↓
SPECIALIST SPOKES
      ↓
COMPARISONS
      ↓
CAREER / DECISION CONTENT
      ↓
TROUBLESHOOTING LONG-TAILS
      ↓
TOOLS / TEMPLATES / REPOS / LINKABLE ASSETS
```

Each major cluster should eventually form a navigable topic hub.

---

# 3. Core Roadmap Principles

## 3.1 One Intent, One Preferred Owner

Every meaningful search intent should have one preferred Testheon URL.

Examples:

```text
Playwright automation
→ /playwright-automation/

Playwright installation
→ /install-playwright/

Playwright beginner tutorial
→ /playwright-tutorial/

QA roadmap
→ /qa-roadmap/

QA engineer skills
→ /qa-skill-map-2026/
```

Do not create a new roadmap entry merely because a keyword variation exists.

---

## 3.2 Pillars Before Deep Expansion

When entering a new large topic, establish the parent/hub before publishing numerous child pages.

Example:

```text
Playwright Automation pillar
       ↓
Install Playwright
       ↓
Tutorial
       ↓
Languages
       ↓
Locators / Framework / API / Auth
       ↓
Advanced production topics
```

---

## 3.3 Respect Dependencies

Article sequence is not arbitrary.

Examples:

* installation should precede a tutorial that assumes installation;
* the generic beginner tutorial should precede deep framework architecture;
* the broad QA Roadmap should exist before numerous career-path spokes;
* an existing skills page should be repositioned before creating a second skills page;
* emerging Playwright AI/MCP/agent content belongs within the Playwright hub and should not replace the foundational pages.

---

## 3.4 Use Existing Content Before Creating Duplicates

Before creating an article:

```text
Search roadmap
→ Search Linear
→ Search WordPress/site
→ Check SEO owner map
→ Check GSC Query × Page
→ Decide whether NEW page is really needed
```

Possible outcomes:

* create new article;
* refresh existing article;
* reposition existing article;
* expand existing pillar;
* create a narrower spoke;
* do nothing.

---

# 4. Confirmed Topical Pillars and Clusters

## 4.1 QA Roadmap & Career Cluster

This is a formally established Linear content project.

**Linear project:**

`Testheon — QA Roadmap & Career SEO Cluster`

Purpose:

Build a non-cannibalizing content cluster around the broad QA learning/career journey.

Primary architecture:

```text
QA ROADMAP
    │
    ├── QA Engineer Skills
    ├── QA Career Path
    ├── Manual Testing → Automation
    ├── SDET Roadmap
    ├── QA Interview Questions
    ├── API Testing Roadmap
    └── AI Testing Guide
```

---

## 4.2 Playwright Cluster

This is the most explicitly planned multi-article Testheon cluster.

**Linear project:**

`Testheon — Playwright SEO Series`

Architecture:

```text
PLAYWRIGHT AUTOMATION
        │
        ├── Installation
        ├── Beginner Tutorial
        ├── Python
        ├── TypeScript
        ├── Java
        ├── Locators
        ├── Framework
        ├── Selenium Comparison
        ├── API Testing
        ├── Authentication
        ├── E2E Testing
        ├── Interview Questions
        ├── Fixtures
        ├── Trace Viewer
        ├── Visual Testing
        ├── CI/CD
        │
        └── Emerging Cluster
             ├── MCP
             ├── AI
             └── Test Agents
```

---

## 4.3 AI Testing Cluster

AI testing is an explicitly established Testheon topic.

Current/planned components include:

```text
AI TESTING
    │
    ├── AI Testing Guide
    │      ├── AI-assisted QA
    │      ├── Testing AI systems
    │      ├── LLM evaluation
    │      └── Agent testing
    │
    └── AI Testing Tools
           → tools/comparison intent
```

Existing:

`/ai-testing-tools-2026/`

Planned:

`CRE-12 — AI Testing Guide: Skills, Tools & Test Strategy`

The future broad AI Testing Guide should own broad educational/strategy intent.

The existing AI Testing Tools article should retain tools/comparison intent.

Do not make these two pages compete for the same primary intent.

---

# 5. Established Core Topics Without a Full Linear Cluster Yet

The following are established Testheon subject areas but do not yet have a complete dedicated Linear article series.

## 5.1 Test Strategy

Published core content:

`/test-strategy-2026/`

This is an important internal-link and authority page.

A complete Test Strategy spoke roadmap has **not** yet been formally established in this conversation.

Do not invent one automatically.

---

## 5.2 Test Data Management

Published core content:

`/test-data-management/`

This article has been treated as a potential pillar-level resource.

Related concepts already associated with it include:

* test data lifecycle;
* privacy vs fidelity;
* data masking;
* synthetic data;
* parallel test isolation;
* test-data maturity.

A formal multi-article TDM roadmap has not yet been created.

---

## 5.3 API Testing

API testing exists in two explicitly different contexts.

### Broad QA learning intent

`CRE-11 — API Testing Roadmap for QA Engineers`

### Playwright-specific implementation intent

`CRE-22 / PW-10 — Playwright API Testing: Complete Guide`

These pages must not duplicate one another.

Conceptual ownership:

```text
API Testing Roadmap
→ what to learn and in what order

Playwright API Testing
→ how to implement API testing using Playwright
```

---

# 6. Emerging / Opportunity Areas Not Yet Formalized as Full Clusters

The following were identified as content opportunities but are **not currently committed full Linear clusters unless a corresponding issue exists elsewhere**.

They must not be treated as automatically approved article backlog entries.

## Performance Testing Opportunities

Established opportunities include:

* Performance Testing Roadmap
* k6
* JMeter
* load testing

Performance testing is also an advanced stage in the QA Roadmap.

No dedicated Performance Testing Linear project has yet been established in this conversation.

---

## Security Testing Opportunities

Potential future topics include:

* Security Testing Basics
* OWASP testing

Security testing is currently an advanced skill area in the QA Roadmap, not a committed standalone cluster.

---

## Broader AI / Agent Testing Opportunities

Potential future articles identified include:

* LLM Testing
* AI Agent Testing
* testing AI agents
* modern software testing strategies

These must be distinguished from:

```text
Playwright AI
Playwright MCP
Playwright Test Agents
```

The latter are already committed Playwright-specific articles.

---

## Other Identified Future Opportunities

Research identified possible topics such as:

* Best Automation Testing Tools
* Postman API Testing
* QA Engineer Salary
* Remote QA roles

These are opportunities, not automatically approved roadmap entries.

They require:

```text
SEO evaluation
+
cannibalization check
+
roadmap fit
+
user approval
```

before creation.

---

# 7. QA Roadmap & Career Cluster — Detailed Roadmap

## Linear Project

**Name:** `Testheon — QA Roadmap & Career SEO Cluster`

**Priority:** High

**Current Linear project state:** Backlog

---

# 8. QA Roadmap Milestones

## Phase 1 — QA Roadmap Foundation

Purpose:

Create/align the main pillar and existing QA-skills content before expanding the cluster.

Includes:

* CRE-5
* CRE-6

---

## Phase 2 — Career & Transition Cluster

Purpose:

Build career-progression and transition content.

Includes:

* CRE-7
* CRE-8
* CRE-9
* CRE-10

---

## Phase 3 — Specialist QA Paths

Purpose:

Expand into specialist skill areas only where the search intent is distinct.

Includes:

* CRE-11
* CRE-12

Performance/security and other specialist paths may be added later only after SEO validation.

---

# 9. QA Roadmap Article Inventory

| Issue  | Article                                                       | Primary Purpose / Intent                                     | Priority | Phase   | Current Linear Status |
| ------ | ------------------------------------------------------------- | ------------------------------------------------------------ | -------- | ------- | --------------------- |
| CRE-5  | QA Roadmap 2026: Complete QA Engineer Learning Path           | `qa roadmap`; ordered learning path                          | High     | Phase 1 | Todo                  |
| CRE-6  | Reposition QA Skill Map for QA Engineer Skills intent         | `qa engineer skills`; refresh existing `/qa-skill-map-2026/` | High     | Phase 1 | Todo                  |
| CRE-7  | QA Career Path: Junior to QA Architect                        | `qa career path`; role progression                           | Medium   | Phase 2 | Backlog               |
| CRE-8  | Manual Testing to Automation Testing: Step-by-Step Transition | `manual testing to automation testing`                       | High     | Phase 2 | Backlog               |
| CRE-9  | SDET Roadmap: Skills, Automation & Career Path                | distinct SDET career/engineering intent                      | High     | Phase 2 | Backlog               |
| CRE-10 | QA Engineer Interview Questions 2026                          | interview preparation                                        | Medium   | Phase 2 | Backlog               |
| CRE-11 | API Testing Roadmap for QA Engineers                          | API learning sequence                                        | Medium   | Phase 3 | Backlog               |
| CRE-12 | AI Testing Guide: Skills, Tools & Test Strategy               | broad `ai testing` learning/strategy intent                  | High     | Phase 3 | Backlog               |

---

# 10. CRE-5 — QA Roadmap Pillar

**Issue:** CRE-5

**Working title:**

`QA Roadmap 2026: Complete QA Engineer Learning Path`

**Primary owner:**

`qa roadmap`

Recommended URL established:

`/qa-roadmap/`

Purpose:

Provide the ordered learning path for becoming/growing as a QA engineer.

Roadmap structure includes:

```text
Testing fundamentals
→ web/application fundamentals
→ SQL/database
→ API testing
→ one programming language
→ test automation
→ Playwright/Selenium choice
→ framework engineering
→ Git
→ CI/CD
→ performance
→ security
→ Docker/environments
→ AI-assisted testing
→ testing AI systems
→ senior/lead/architect skills
```

It should link out rather than deeply absorb every child topic.

---

# 11. CRE-6 — QA Skill Map Reposition

Existing URL:

`/qa-skill-map-2026/`

Important rule:

> Do not create a second QA-skills page.

The existing URL should be repositioned to own:

* QA engineer skills;
* QA competencies;
* QA skill map.

The Roadmap and Skill Map should have deliberately different jobs:

```text
QA Roadmap
→ WHAT TO LEARN + ORDER

QA Skill Map
→ WHAT COMPETENCIES A QA ENGINEER NEEDS
```

The two pages should link to each other.

---

# 12. QA Cluster Dependencies

Default sequence:

```text
CRE-5 — QA Roadmap pillar
       ↓
CRE-6 — Skill Map alignment
       ↓
Career / transition spokes
       ↓
Specialist path spokes
```

Phase 1 intent ownership should be stable before expanding aggressively.

---

# 13. Playwright Project

**Linear project:**

`Testheon — Playwright SEO Series`

**Priority:** High

**Current Linear project state:** Backlog

The series is designed as a hub-and-spoke authority cluster.

---

# 14. Playwright Milestones

## Phase 1 — Playwright Foundations

* CRE-13 / PW-01
* CRE-14 / PW-02
* CRE-15 / PW-03
* CRE-16 / PW-04
* CRE-17 / PW-05
* CRE-18 / PW-06

Purpose:

```text
Understand
→ Install
→ Learn
→ Choose / deepen language path
```

---

## Phase 2 — Core Automation Engineering

Includes:

* CRE-19 / PW-07
* CRE-20 / PW-08
* CRE-22 / PW-10
* CRE-23 / PW-11
* CRE-24 / PW-12
* CRE-29 / PW-17
* CRE-30 / PW-18
* CRE-31 / PW-19

Purpose:

Develop real automation-engineering depth.

---

## Phase 3 — Decision, Career & Production

Includes:

* CRE-21 / PW-09
* CRE-25 / PW-13
* CRE-32 / PW-20

Purpose:

Capture:

* tool-selection;
* interview;
* production/CI usage.

---

## Phase 4 — MCP, AI & Test Agents

Includes:

* CRE-26 / PW-14
* CRE-27 / PW-15
* CRE-28 / PW-16

Purpose:

Capture emerging modern Playwright search demand.

These topics should benefit from the authority created by the foundational Playwright cluster.

---

# 15. Playwright Complete Planned Sequence

The default editorial sequence established is:

```text
PW-01  Playwright Automation
PW-02  Install Playwright
PW-03  Playwright Tutorial
PW-04  Playwright Python
PW-05  Playwright TypeScript
PW-06  Playwright Java
PW-07  Playwright Locators
PW-08  Playwright Automation Framework
PW-09  Playwright vs Selenium
PW-10  Playwright API Testing
PW-11  Playwright Authentication
PW-12  Playwright E2E Testing
PW-13  Playwright Interview Questions
PW-14  Playwright MCP
PW-15  Playwright AI
PW-16  Playwright Test Agents
PW-17  Playwright Fixtures
PW-18  Playwright Trace Viewer
PW-19  Playwright Visual Testing
PW-20  Playwright CI/CD
```

Article numbering represents the planned series sequence.

Linear milestones group content operationally and are not necessarily a replacement for the numbered sequence.

---

# 16. Playwright Detailed Roadmap

| Issue  | ID    | Article                                                        | Primary Intent                   | Priority | Linear Status |
| ------ | ----- | -------------------------------------------------------------- | -------------------------------- | -------- | ------------- |
| CRE-13 | PW-01 | Playwright Automation pillar                                   | `playwright automation`          | High     | Todo          |
| CRE-14 | PW-02 | Install Playwright: Complete Setup Guide                       | `playwright install`             | High     | Backlog       |
| CRE-15 | PW-03 | Playwright Tutorial for Beginners                              | `playwright tutorial`            | High     | Backlog       |
| CRE-16 | PW-04 | Playwright Python: Complete Automation Guide                   | `playwright python`              | High     | Backlog       |
| CRE-17 | PW-05 | Playwright TypeScript: Complete Automation Guide               | `playwright typescript`          | High     | Backlog       |
| CRE-18 | PW-06 | Playwright Java: Complete Guide for Automation Engineers       | `playwright java`                | Medium   | Backlog       |
| CRE-19 | PW-07 | Playwright Locators: Complete Guide & Best Practices           | `playwright locators`            | High     | Backlog       |
| CRE-20 | PW-08 | Playwright Automation Framework From Scratch                   | `playwright framework`           | High     | Backlog       |
| CRE-21 | PW-09 | Playwright vs Selenium: QA Decision Guide                      | `playwright vs selenium`         | High     | Backlog       |
| CRE-22 | PW-10 | Playwright API Testing: Complete Guide                         | `playwright api testing`         | High     | Backlog       |
| CRE-23 | PW-11 | Playwright Authentication: Login, Storage State & Sessions     | `playwright authentication`      | High     | Backlog       |
| CRE-24 | PW-12 | Playwright E2E Testing: Real-World Workflow Guide              | `playwright e2e`                 | Medium   | Backlog       |
| CRE-25 | PW-13 | Playwright Interview Questions and Answers                     | `playwright interview questions` | Medium   | Backlog       |
| CRE-26 | PW-14 | What Is Playwright MCP? Complete Guide for QA Engineers        | `playwright mcp`                 | High     | Backlog       |
| CRE-27 | PW-15 | Playwright AI: AI-Assisted Testing for QA Engineers            | `playwright ai`                  | High     | Backlog       |
| CRE-28 | PW-16 | Playwright Test Agents: How AI Agents Test Applications        | `playwright test agents`         | High     | Backlog       |
| CRE-29 | PW-17 | Playwright Fixtures: Complete Guide                            | `playwright fixtures`            | Medium   | Backlog       |
| CRE-30 | PW-18 | Playwright Trace Viewer: Debug Failed Tests Faster             | `playwright trace viewer`        | Medium   | Backlog       |
| CRE-31 | PW-19 | Playwright Visual Testing: Screenshot & Regression Guide       | `playwright visual testing`      | Medium   | Backlog       |
| CRE-32 | PW-20 | Playwright CI/CD: GitHub Actions, Jenkins & Parallel Execution | `playwright ci cd`               | Medium   | Backlog       |

---

# 17. Playwright Article Dependencies

## PW-01

Parent hub.

All important Playwright spokes should eventually link back to it.

---

## PW-02

Depends conceptually on PW-01 existing.

PW-02 owns environment setup.

---

## PW-03

Assumes installation is completed.

Relationship:

```text
PW-01
Understand Playwright
    ↓
PW-02
Install Playwright
    ↓
PW-03
Use Playwright for the first time
```

---

## PW-04 / PW-05 / PW-06

Language-specific depth.

PW-03 should not reproduce all three tutorials.

---

## PW-07

Owns deep locator strategy.

PW-03 may introduce basic locator usage only.

---

## PW-08

Owns framework design.

Should build on basic testing knowledge.

---

## PW-10 / PW-11 / PW-12

Advanced functional automation capabilities.

They should link back into the pillar and relevant foundational pages.

---

## PW-14 / PW-15 / PW-16

Emerging opportunity cluster:

```text
Playwright
   ↓
MCP
   ↓
AI
   ↓
Test Agents
```

Exact cross-link structure may evolve after research, but these pages must remain distinct intents.

---

# 18. Published / Live Content Known From This Conversation

The following pages are known to exist on Testheon.

## Core Existing Content

* `/qa-engineers-2026/`
* `/qa-skill-map-2026/`
* `/test-strategy-2026/`
* `/test-data-management/`
* `/ai-testing-tools-2026/`
* `/best-ai-tools-for-freelancers/`
* `/qa-roadmap/`
* `/playwright-automation/`
* `/install-playwright/`

---

# 19. Known Current Publication State

## `/playwright-automation/`

Latest available GSC research confirmed:

* published;
* submitted;
* indexed;
* self-canonical;
* last crawled in the recent research window.

This is the live PW-01 pillar.

However:

**Linear CRE-13 currently remains `Todo`.**

This is a status-sync inconsistency.

---

## `/install-playwright/`

Latest research confirmed:

* WordPress post is published;
* `/install-playwright/` exists;
* it was still reported as “unknown to Google” by URL Inspection at the time of research.

This is the live PW-02 article.

However:

**Linear CRE-14 currently remains `Backlog`.**

This is another status-sync inconsistency.

---

## `/playwright-tutorial/`

Latest CRE-15 research confirmed:

* no published GSC owner was detected;
* URL was unknown to Google;
* GSC research has been completed;
* SEO Manager Head Controller handoff has been prepared.

Current state:

```text
Research / SEO preparation underway
Not confirmed published
```

Linear currently remains:

`Backlog`

---

## `/qa-roadmap/`

Recent GSC research confirmed the page was:

* published;
* submitted/indexed;
* self-canonical;
* crawled.

However:

Linear `CRE-5` remains:

`Todo`

This is another example of planning-state drift.

---

# 20. Important Linear Status Lesson

Linear issue state must **not** be assumed to be identical to actual WordPress or GSC state.

Examples already observed:

```text
CRE-13 = Todo
but PW-01 is published/indexed.

CRE-14 = Backlog
but PW-02 is published.

CRE-5 = Todo
but /qa-roadmap/ is published/indexed.
```

Therefore the automated system must reconcile state rather than assume Linear is always synchronized.

---

# 21. Other Published Historical Content

## AI Testing Tools

`/ai-testing-tools-2026/`

Status:

Published.

It is currently one of Testheon’s stronger early GSC pages by impressions.

Its intended long-term role:

```text
AI testing tools / comparison intent
```

It should eventually link with the broader AI Testing Guide.

---

## QA Skill Map

`/qa-skill-map-2026/`

Status:

Published.

Future task:

CRE-6 should reposition/strengthen it around:

`qa engineer skills`

rather than broad QA Roadmap ownership.

---

## QA Engineers 2026

`/qa-engineers-2026/`

Status:

Published.

This page is currently a useful feeder/internal-link source.

Its exact long-term relationship with the QA career cluster should continue to be monitored for overlap.

---

## Test Strategy

`/test-strategy-2026/`

Status:

Published.

Core Testheon authority content.

---

## Test Data Management

`/test-data-management/`

Status:

Published.

Potential TDM pillar.

---

## Best AI Tools for Freelancers

`/best-ai-tools-for-freelancers/`

Status:

Published.

This page has been identified as potential topical dilution because it is less aligned with Testheon’s QA/testing specialization.

Future action discussed:

* rewrite toward QA relevance;
* or otherwise reposition/redirect if evidence justifies it.

No final disposition has been locked.

---

# 22. Published / In Preparation / Planned Summary

## Published / Live

Known:

```text
QA Engineers 2026
QA Skill Map 2026
QA Roadmap
Test Strategy 2026
Test Data Management
AI Testing Tools 2026
Best AI Tools for Freelancers
PW-01 Playwright Automation
PW-02 Install Playwright
```

Some Linear statuses are not synchronized with this reality.

---

## In Preparation

### PW-03 Playwright Tutorial

Known progress includes:

* GSC keyword research completed;
* SEO analysis completed;
* Head Controller handoff prepared.

Publication not confirmed.

---

## Planned

### QA Cluster

* CRE-6
* CRE-7
* CRE-8
* CRE-9
* CRE-10
* CRE-11
* CRE-12

CRE-5 is technically still Todo in Linear but live-site evidence indicates its article exists.

---

### Playwright Cluster

PW-04 through PW-20 remain planned/backlog based on the current Linear states.

PW-03 is in preparation despite its Linear Backlog state.

---

# 23. Current SEO Operations Linear Project

A separate operational project has been created.

**Project:**

`Testheon — SEO Authority & Publishing Operating System`

This is not an editorial content cluster.

It governs how content is planned, researched, published, linked and measured.

---

# 24. SEO Operations Milestones

## P0 — Publishing Standards & Site Architecture

Core operating rules and architecture.

---

## P1 — Content Quality, Snippets & E-E-A-T

Quality/trust/technical standards.

---

## P2 — Authority Growth, Assets & Measurement

Growth, linkable assets and post-publication measurement.

---

# 25. SEO Operations Issues

| Issue  | Task                                                      | Priority | Current State |
| ------ | --------------------------------------------------------- | -------- | ------------- |
| CRE-33 | SEO Manager mandatory operating standard                  | Urgent   | Todo          |
| CRE-34 | Head Controller SEO-preservation standard                 | Urgent   | Todo          |
| CRE-35 | Deep Search Manager evidence & SERP-gap standard          | Urgent   | Todo          |
| CRE-36 | Build and audit Testheon topical hub architecture         | Urgent   | Todo          |
| CRE-37 | Internal linking, anchor text and orphan-page system      | Urgent   | Todo          |
| CRE-38 | Snippet, schema and answer-first content standard         | Urgent   | Todo          |
| CRE-39 | Author E-E-A-T and trust upgrade                          | Urgent   | Todo          |
| CRE-40 | Technical SEO, CWV, sitemap and index hygiene             | Urgent   | Todo          |
| CRE-41 | Long-tail/troubleshooting/programmatic content pipeline   | High     | Backlog       |
| CRE-42 | Linkable QA assets/tools/templates/GitHub resources       | High     | Backlog       |
| CRE-43 | Earned backlink and guest-publishing strategy             | Medium   | Backlog       |
| CRE-44 | Post-publish GSC measurement/cannibalization/refresh loop | Urgent   | Todo          |

These are operating-system tasks, not normal blog articles.

---

# 26. Strategic Relationship Between Editorial Roadmap and SEO Operations

Every editorial project must operate under the SEO Operating System.

Conceptually:

```text
SEO OPERATING SYSTEM
       │
       ├── QA ROADMAP PROJECT
       │
       ├── PLAYWRIGHT PROJECT
       │
       ├── FUTURE AI PROJECTS
       │
       ├── FUTURE PERFORMANCE PROJECTS
       │
       └── FUTURE TESTING CLUSTERS
```

The SEO operating project defines standards.

Editorial projects define what to publish.

---

# 27. Linear Team

Current Linear team used for Testheon projects:

`CreaditCard&Lounge Website`

Team key:

`CRE`

This is a workspace/tooling constraint, not the desired semantic Testheon organization.

A dedicated Testheon team has not yet been created through the available workflow.

If a dedicated Testheon Linear team becomes available, migration can be considered.

Do not assume the current team name means Testheon content belongs to the credit-card project.

---

# 28. Linear Statuses Available

Current available statuses:

```text
Backlog
Todo
In Progress
Done
Canceled
Duplicate
```

---

# 29. Linear Status Convention

## Backlog

Use when:

* article is planned;
* not currently being executed;
* dependent work may still need completion.

---

## Todo

Use when:

* work is selected/ready;
* should be worked soon;
* prerequisite planning is sufficiently clear.

---

## In Progress

Use when active work has begun.

Examples:

* GSC research;
* SEO briefing;
* Deep Research;
* writing;
* WordPress drafting;
* content QA.

---

## Done

Use after the article task satisfies the configured completion definition.

The exact automated “Done” threshold still needs to be standardized.

Recommended future interpretation:

```text
Published
+
initial technical/indexability validation completed
```

Longer-term GSC monitoring can then remain a follow-up SEO task rather than blocking the article forever.

This recommended status-transition policy has not yet been consistently applied to the existing Linear backlog.

---

## Canceled

Use when an article/project is intentionally abandoned.

Do not silently delete history.

---

## Duplicate

Use when an issue duplicates another existing owner.

Prefer preserving the issue as Duplicate rather than deleting planning history.

---

# 30. Linear Priority Convention

Linear priority values currently used include:

* Urgent
* High
* Medium

Operational rule:

> Do not mark every issue Urgent.

Use priority to reflect actual execution importance.

Examples:

### High

* important cluster foundation;
* strong opportunity;
* key dependency;
* high-value specialist page.

### Medium

* important but later-stage;
* less urgent supporting content.

### Urgent

Primarily reserved for:

* critical SEO operating standards;
* indexing/technical problems;
* high-impact immediate work.

---

# 31. Labels

Current team labels available include:

* Improvement
* Bug
* Feature

However:

> No reusable Testheon-specific article-label convention has been established.

Current Testheon content issues generally have no labels assigned.

The future system must not invent a complex label taxonomy unless explicitly configured.

Possible future labels may be introduced, but that remains unresolved.

---

# 32. Linear Issue Naming Convention

Confirmed patterns include:

## QA Roadmap

```text
0B.1 — ...
0B.2 — ...
0B.3 — ...
```

Issue IDs remain:

```text
CRE-5
CRE-6
...
```

---

## Playwright

Use:

```text
PW-01 — ...
PW-02 — ...
PW-03 — ...
```

Examples:

```text
CRE-13 / PW-01
CRE-14 / PW-02
CRE-15 / PW-03
```

---

## SEO Operations

Use:

```text
SEO-OPS-01 — ...
SEO-OPS-02 — ...
```

The human-readable series ID is part of the issue title.

The Linear `CRE-xx` identifier remains the workspace issue identifier.

---

# 33. Linear Issue Granularity

Default content-planning rule:

> One Linear issue per article.

Do not pre-create dozens of microtasks for every future article.

When an article becomes active, detailed subtasks/checklists may be introduced if useful.

---

# 34. Standard Article Workflow

The established Testheon article pipeline is:

```text
TOPIC / LINEAR ISSUE
        ↓
SEO / GSC RESEARCH
        ↓
SEO MANAGER DECISION
        ↓
HEAD CONTROLLER INPUT
        ↓
DEEP RESEARCH DOSSIER
        ↓
DOSSIER REVIEW
        ↓
FINAL ARTICLE CONTENT
        ↓
IMAGE SPECIFICATIONS
        ↓
IMAGE GENERATION
        ↓
WORDPRESS DRAFT
        ↓
CONTENT / SEO REVIEW
        ↓
USER APPROVAL
        ↓
PUBLISH
        ↓
GSC INDEX / VALIDATION
        ↓
POST-PUBLISH MONITORING
```

---

# 35. Article Issue Description Standard

Every future Linear task should contain:

1. Clear description.
2. Primary purpose.
3. Search-intent owner where known.
4. Cluster/pillar relationship.
5. Dependencies.
6. Important cannibalization boundaries.
7. Detailed execution prompt where the task will be executed by an agent.
8. Mandatory read-first rule.

Permanent task instruction:

> Read the complete prompt before acting. If any instruction is irrelevant, outdated, already satisfied, unavailable, contradictory or risky in the current state, discuss it with the user before acting.

---

# 36. Article Lifecycle in Linear

A future automated engine should aim for:

```text
Backlog
    ↓
Todo
    ↓
In Progress
    ↓
Published / Initial Validation
    ↓
Done
```

Recommended operational events:

## Backlog → Todo

When:

* article becomes the next approved topic;
* dependencies are satisfied;
* user/SEO Manager has selected it.

---

## Todo → In Progress

When active research begins.

Examples:

* GSC MCP research starts;
* SEO brief begins.

---

## Remain In Progress

Through:

* SEO analysis;
* Head Controller;
* Deep Search;
* writing;
* image creation;
* WordPress draft;
* QA/review.

---

## In Progress → Done

Recommended after:

* article is published;
* correct WordPress URL recorded;
* initial technical/indexability check completed.

Longer 14/28-day performance monitoring should not necessarily keep the content-production task open.

The engine may create or use a separate SEO-monitoring mechanism.

This exact closing rule should be confirmed during automation implementation because current issues are not consistently synchronized.

---

# 37. Linear Descriptions vs Article Status

Issue descriptions should preserve content strategy even after publication.

Do not replace the description with only:

```text
Published
```

Keep:

* search-intent ownership;
* article purpose;
* dependencies;
* boundaries;
* workflow history.

Record publication separately.

---

# 38. Completion History

The future engine must preserve completion history.

Do not:

* delete completed issues;
* recreate a completed article as a new issue;
* silently reset Done issues to Backlog;
* lose publication date/URL information.

A completed article should remain discoverable as historical planning context.

---

# 39. Next-Topic Selection Logic

The engine must not choose the next topic simply by looking for the highest search-interest phrase.

Use the following decision process.

---

## Step 1 — Check Active Work

If an article is already actively being produced:

> Finish or explicitly pause it before starting unnecessary parallel work.

---

## Step 2 — Check Dependencies

Ask:

* Is the pillar published?
* Is the prerequisite article available?
* Does the next page rely on an unpublished parent?
* Is an existing page supposed to be repositioned first?

Example:

```text
PW-02 before PW-03
```

because PW-03 links readers back to installation.

---

## Step 3 — Follow the Approved Cluster Sequence

Default to the planned sequence unless evidence justifies reprioritization.

For Playwright:

```text
PW-01
→ PW-02
→ PW-03
→ PW-04
→ PW-05
...
```

---

## Step 4 — Consider Current Priority

High-priority tasks can outrank Medium tasks when dependencies allow.

---

## Step 5 — Check SEO Evidence

Use:

* GSC;
* Google Trends;
* current SERPs;
* emerging search behavior.

---

## Step 6 — Check Cannibalization

Before selecting:

```text
Does this topic already have a Testheon owner?
```

If yes, update/refresh instead of creating a duplicate.

---

## Step 7 — Check Topical Fit

Do not leave the agreed cluster because an unrelated keyword happens to be interesting.

---

## Step 8 — Consider Emerging Opportunities

Emerging opportunities such as:

* Playwright MCP;
* Playwright AI;
* Playwright Test Agents

may justify accelerated publication.

However:

* foundational authority should still exist;
* the move should be intentional;
* the user/SEO Manager should approve major sequence changes.

---

## Step 9 — Present the Next Article

The engine should be able to report:

```text
Recommended next article
Why now
Dependency status
Current keyword owner
Cluster
Priority
What would be delayed if selected
```

---

# 40. SEO Opportunity vs Roadmap

New GSC opportunities should improve the roadmap, not destroy it.

When GSC reveals a new query:

```text
NEW QUERY
   ↓
Does an existing page own it?
   │
   ├── YES → Improve that page if needed
   │
   └── NO
         ↓
Is it a distinct intent?
         │
         ├── NO → Add/support existing page
         │
         └── YES
               ↓
Does it fit an existing cluster?
               │
               ├── YES → Candidate new spoke
               └── NO → Evaluate strategically
```

Do not automatically create a new page for every GSC query.

---

# 41. When GSC Can Reprioritize the Roadmap

Possible reasons:

* rapidly rising relevant demand;
* strong impressions without a proper owner;
* wrong page ranking;
* emerging trend with first-mover potential;
* major search-intent shift;
* competitor gap;
* significant traffic opportunity.

A proposed reprioritization must state:

* new opportunity;
* evidence;
* intended owner;
* impact on current sequence;
* cannibalization risk;
* recommendation.

Major roadmap changes require user approval.

---

# 42. When GSC Must NOT Reprioritize the Roadmap

Do not interrupt the planned sequence because of:

* one impression;
* one unusual operator query;
* anonymized/ambiguous query data;
* unrelated high-volume search;
* a keyword outside Testheon’s niche;
* a variation already covered by an existing owner.

---

# 43. Daily Publishing Cadence

The user has expressed a target of frequent/daily publishing.

The automated engine may use a daily content pipeline.

However:

> Cadence must not override article dependencies, technical accuracy, research quality, or cannibalization controls.

The engine should maintain enough prepared backlog to support frequent publishing without skipping required research.

---

# 44. Internal Linking as a Roadmap Dependency

Content clusters are not complete when articles merely exist.

Each article must become connected.

Preferred model:

```text
PILLAR
  ↕
SPOKE A ↔ SPOKE B
  ↕
RELATED SUPPORT ARTICLE
```

A new article should trigger:

1. links from the new article to its parent;
2. links to relevant existing siblings;
3. reverse-link review of older relevant content.

---

# 45. Playwright Internal-Link Model

Minimum conceptual structure:

```text
/playwright-automation/
     ↓
/install-playwright/
     ↓
/playwright-tutorial/
     ↓
language / locator / framework pages
```

Every Playwright child should eventually link back to:

`/playwright-automation/`

where contextually appropriate.

---

# 46. QA Roadmap Internal-Link Model

```text
/qa-roadmap/
    ↕
/qa-skill-map-2026/
```

Future child pages should link back to the roadmap:

* career path;
* manual → automation;
* SDET;
* interviews;
* API roadmap;
* AI testing.

---

# 47. WordPress URL Recording

Once an article is published, the automation engine should record the canonical WordPress URL in Linear or associated structured roadmap data.

The engine must distinguish:

```text
Planned slug
vs
Actual published canonical URL
```

The published canonical URL becomes authoritative.

Do not continue constructing links from an outdated planned slug after publication.

---

# 48. Publication State Recording

Future automation should record at least:

```text
Article planned
Research started
SEO approved
Research completed
Draft created
User approved
Published
Canonical URL
Publication date
Indexing state
```

Linear currently does not have custom fields for all of these in the established workflow.

Until such fields exist, use:

* issue description checklist;
* comments;
* linked documents;
* or an accompanying roadmap state file.

---

# 49. GSC Indexing State

Publication and indexing are different states.

Example already observed:

```text
PW-02
Published in WordPress
but
unknown to Google at the time of GSC inspection
```

Therefore do not use:

```text
Not indexed = not published
```

Record separately:

```text
WordPress state: Published
GSC state: Unknown / Discovered / Crawled / Indexed
```

---

# 50. Source-of-Truth Hierarchy

Different systems are authoritative for different questions.

There is no single universal source of truth for every state.

---

## 50.1 Editorial Roadmap / Planned Work

Primary source:

**Linear project + approved roadmap specification**

Use for:

* planned article inventory;
* sequence;
* priority;
* issue identity;
* milestone;
* dependencies.

---

## 50.2 Search Intent / Keyword Ownership

Primary source:

**Latest approved SEO Manager brief / Head Controller SEO input**

Linear should retain a summary of this ownership.

If an older Linear description conflicts with a newer approved SEO brief:

> newer approved SEO strategy wins, then Linear should be updated.

---

## 50.3 Published/Draft State

Primary source:

**Current WordPress/live Testheon state**

WordPress determines whether the content was actually created or published.

Linear status does not override live WordPress reality.

---

## 50.4 Canonical URL

Primary source:

**Live canonical WordPress page**

Once published, this takes precedence over a planned slug.

---

## 50.5 Google Indexing State

Primary source:

**GSC URL Inspection / current GSC evidence**

Recognize that GSC reporting may lag.

---

## 50.6 Search Performance

Primary source:

**GSC**

Use for:

* clicks;
* impressions;
* CTR;
* average position;
* Query × Page.

---

## 50.7 Research Completion

Primary source:

The actual approved research artifact/dossier.

Do not mark research complete merely because an issue description says it should exist.

---

# 51. Conflict Resolution Between Sources

When sources disagree:

```text
STOP
↓
Identify what each source actually represents
↓
Determine authoritative source for that field
↓
Report mismatch
↓
Update the stale source
```

Example:

```text
Linear:
CRE-13 = Todo

WordPress/GSC:
PW-01 exists and is indexed

Conclusion:
Publication state = Published
Linear workflow state = stale
Action = update Linear
```

Do not choose one source globally and ignore all others.

---

# 52. Linear Should Be the Planning Control Plane

Even though live publication/index state comes from external systems, Linear should remain the **planning and orchestration control plane**.

Linear should answer:

* what are we doing?
* why are we doing it?
* what is next?
* who owns it?
* what cluster does it belong to?
* what dependency blocks it?
* what phase is it in?
* what has been completed?

External systems answer actual execution state.

The automation engine should sync relevant state back into Linear.

---

# 53. Automation Requirements

The future automated Testheon Content Engine must:

## Before Selecting Work

1. Read active Testheon Linear projects.
2. Read issue statuses.
3. Read the latest roadmap specification.
4. Detect unfinished active article work.
5. Check dependencies.
6. Check existing WordPress content.
7. Check keyword-owner map.
8. Prevent duplicate article creation.

---

## When Selecting an Article

Record:

* issue ID;
* series ID;
* article title;
* cluster;
* pillar;
* primary intent;
* priority;
* dependency status.

Move issue into the configured active state.

---

## During Research

Attach or reference:

* GSC research;
* Trends research;
* SEO brief;
* Head Controller brief;
* Deep Research dossier.

Do not lose previous versions/history.

---

## During Writing

Record:

* content draft state;
* image requirements;
* links required;
* unresolved questions.

---

## During WordPress Drafting

Record:

* WordPress post ID if available;
* draft URL;
* actual slug;
* canonical expectation.

---

## At Publication

Record:

* actual URL;
* publication date;
* WordPress status;
* article version/review state.

---

## After Publication

Check:

* HTTP 200;
* canonical;
* sitemap;
* index directive;
* internal links;
* GSC indexing.

Update Linear.

---

## During SEO Monitoring

Record:

* indexing outcome;
* early queries;
* significant GSC changes;
* cannibalization;
* new spoke opportunities.

---

# 54. Duplicate Prevention Requirements

Before creating a new Linear article issue, search by:

* title;
* keyword;
* intent;
* slug;
* synonyms;
* existing WordPress URLs;
* existing Linear issues.

Potential duplicates should be surfaced before creation.

If duplicate:

* reuse existing issue;
* update existing article;
* or mark duplicate.

Do not create a second article solely because wording differs.

---

# 55. Preserving Completion History

The automation engine must maintain a durable record of:

```text
Issue
Article
Original target
Final target
URL
Publication date
Research artifacts
Status changes
SEO revisions
Post-publish findings
```

Never erase prior state simply because the article was updated.

---

# 56. Handling Article Refreshes

A refresh is not necessarily a new article.

Example:

`/qa-skill-map-2026/`

The plan is to reposition the existing page.

Do not create:

```text
/qa-engineer-skills-2026/
```

unless a later SEO decision explicitly establishes a new distinct intent.

Use the existing issue/article where possible.

---

# 57. Linkable Assets in the Roadmap

Testheon’s long-term roadmap is not limited to articles.

The SEO operating project established future asset categories such as:

* QA Automation ROI Calculator;
* Test Data Generator;
* JSON/XML Diff Tool;
* API Response Comparator;
* Playwright Locator Helper;
* Playwright demo repo;
* performance TPS calculator;
* JMeter thread calculator;
* Test Strategy template;
* Test Coverage Risk Matrix;
* QA skill self-assessment.

These are **ideas to evaluate**, not automatically approved projects.

`CRE-42` owns the evaluation/roadmapping step.

After user approval, individual implementation issues may be created.

---

# 58. GitHub / Repository Assets

A recurring strategic opportunity is to pair technical content with useful public repositories.

Example:

`testheon-playwright-lab`

Potential purpose:

* starter tests;
* tutorial examples;
* framework samples;
* reusable code;
* linkable engineering asset.

This repo idea is not yet confirmed as built.

Do not assume it exists.

---

# 59. Reconstructed Current Roadmap — Editorial

## A. QA Roadmap & Career

### Foundation

1. **CRE-5 — QA Roadmap 2026 pillar**

   * Intent: `qa roadmap`
   * Live page evidence: `/qa-roadmap/`
   * Linear: Todo
   * Reality: appears published/indexed
   * Sync required.

2. **CRE-6 — QA Skill Map reposition**

   * Intent: `qa engineer skills`
   * Existing URL: `/qa-skill-map-2026/`
   * Linear: Todo
   * Work: refresh/reposition existing article.

### Career & Transition

3. **CRE-7 — QA Career Path: Junior to QA Architect**

   * Medium
   * Backlog.

4. **CRE-8 — Manual Testing to Automation Testing**

   * High
   * Backlog.

5. **CRE-9 — SDET Roadmap**

   * High
   * Backlog.

6. **CRE-10 — QA Engineer Interview Questions 2026**

   * Medium
   * Backlog.

### Specialist Paths

7. **CRE-11 — API Testing Roadmap**

   * Medium
   * Backlog.

8. **CRE-12 — AI Testing Guide**

   * High
   * Backlog.

---

# 60. Reconstructed Current Roadmap — Playwright

### Foundation

1. **CRE-13 / PW-01 — Playwright Automation pillar**

   * Owner: `playwright automation`
   * URL: `/playwright-automation/`
   * Published/indexed according to recent GSC evidence.
   * Linear: Todo.
   * Sync required.

2. **CRE-14 / PW-02 — Install Playwright**

   * Owner: `playwright install`
   * URL: `/install-playwright/`
   * Published according to current workflow evidence.
   * At last inspection GSC did not yet know the URL.
   * Linear: Backlog.
   * Sync required.

3. **CRE-15 / PW-03 — Playwright Tutorial**

   * Owner hypothesis: `playwright tutorial`
   * Planned URL: `/playwright-tutorial/`
   * GSC research complete.
   * Head Controller input prepared.
   * Not confirmed published.
   * Linear: Backlog.
   * Workflow state is ahead of Linear state.

4. **CRE-16 / PW-04 — Playwright Python**

   * High
   * Backlog.

5. **CRE-17 / PW-05 — Playwright TypeScript**

   * High
   * Backlog.

6. **CRE-18 / PW-06 — Playwright Java**

   * Medium
   * Backlog.

### Core Automation Engineering

7. **CRE-19 / PW-07 — Playwright Locators**

   * High
   * Backlog.

8. **CRE-20 / PW-08 — Playwright Automation Framework**

   * High
   * Backlog.

9. **CRE-21 / PW-09 — Playwright vs Selenium**

   * High
   * Backlog.

10. **CRE-22 / PW-10 — Playwright API Testing**

    * High
    * Backlog.

11. **CRE-23 / PW-11 — Playwright Authentication**

    * High
    * Backlog.

12. **CRE-24 / PW-12 — Playwright E2E Testing**

    * Medium
    * Backlog.

### Career / Emerging / Advanced

13. **CRE-25 / PW-13 — Playwright Interview Questions**

    * Medium
    * Backlog.

14. **CRE-26 / PW-14 — Playwright MCP**

    * High
    * Backlog.

15. **CRE-27 / PW-15 — Playwright AI**

    * High
    * Backlog.

16. **CRE-28 / PW-16 — Playwright Test Agents**

    * High
    * Backlog.

17. **CRE-29 / PW-17 — Playwright Fixtures**

    * Medium
    * Backlog.

18. **CRE-30 / PW-18 — Playwright Trace Viewer**

    * Medium
    * Backlog.

19. **CRE-31 / PW-19 — Playwright Visual Testing**

    * Medium
    * Backlog.

20. **CRE-32 / PW-20 — Playwright CI/CD**

    * Medium
    * Backlog.

---

# 61. Reconstructed Existing Supporting Content

Published supporting Testheon content known from the workflow:

| Content                           | Role                                           |
| --------------------------------- | ---------------------------------------------- |
| `/qa-engineers-2026/`             | QA/career feeder content                       |
| `/qa-skill-map-2026/`             | QA skills owner after planned reposition       |
| `/qa-roadmap/`                    | QA roadmap pillar                              |
| `/test-strategy-2026/`            | Test strategy authority page                   |
| `/test-data-management/`          | Test Data Management core/potential pillar     |
| `/ai-testing-tools-2026/`         | AI testing tools/comparison                    |
| `/playwright-automation/`         | Playwright pillar                              |
| `/install-playwright/`            | Playwright installation                        |
| `/best-ai-tools-for-freelancers/` | Published but potentially off-topic / dilution |

---

# 62. Reconstructed Future Opportunities — Not Yet Committed

These should remain in an **Opportunity / Requires Validation** pool until formally approved.

* Performance Testing Roadmap
* k6
* Security Testing Basics
* Postman API Testing
* LLM Testing
* AI Agent Testing
* Modern Software Testing Strategies
* Best Automation Testing Tools
* QA Engineer Salary
* Remote QA roles
* additional Playwright troubleshooting topics
* Playwright vs Cypress
* Playwright accessibility content
* additional debugging content

Do not silently convert these into committed article issues.

---

# 63. Incomplete / Uncertain Roadmap Areas

The following remain intentionally unresolved.

## Test Strategy Cluster

Core article exists.

Supporting spoke roadmap not yet established.

---

## Test Data Management Cluster

Core article exists.

Supporting article series not yet established.

---

## Performance Testing Cluster

Strong opportunity exists.

No dedicated Linear project yet.

---

## Security Testing Cluster

Potential future specialist area.

Not formally roadmaped.

---

## DevOps for QA

Git, CI/CD, Docker and environments are part of the QA Roadmap.

Playwright CI/CD is formally planned.

A standalone “DevOps for QA” cluster has **not** been formally established.

Do not invent one yet.

---

## Broad Software Testing Pillar

“Software testing roadmap” is a semantic/supporting search concept for the QA Roadmap.

No separate broad “Software Testing” content cluster has been formally created in this conversation.

---

## Broad Automation Testing Pillar

Automation is central to Testheon, but no separate broad “Automation Testing” pillar project has been locked independent of Playwright/QA Roadmap content.

Do not assume one exists.

---

# 64. Current Known Roadmap Gaps

The roadmap system itself currently has several operational gaps.

1. Linear article statuses are not synchronized with WordPress publication state.
2. Some live articles have no dedicated Linear article issue.
3. Publication URL is not consistently recorded in structured Linear fields.
4. Indexing state is not consistently written back into Linear.
5. Dedicated Testheon labels are not configured.
6. Dedicated Testheon Linear team does not currently exist.
7. Exact automated definition of `Done` needs to be finalized.
8. Some existing topic areas have pillars but no formal supporting roadmap.
9. Opportunity backlog is partly stored in research rather than Linear.

The future automation engine should address these gradually rather than inventing missing history.

---

# 65. Required Automated Reconciliation

Before an automated engine resumes work from this roadmap, it should perform a reconciliation pass.

For each active/planned issue:

```text
Read Linear
↓
Check WordPress
↓
Check canonical URL
↓
Check latest artifact stage
↓
Check GSC
↓
Update Linear state
```

Priority reconciliation candidates include:

```text
CRE-5
CRE-13
CRE-14
CRE-15
```

because their actual workflow/publication state is known to be ahead of the current Linear status.

---

# 66. Permanent Roadmap Rules

1. Linear is the main planning control plane.

2. WordPress/live Testheon is authoritative for actual publication state.

3. GSC is authoritative for Google's reported indexing/search-performance state.

4. Latest approved SEO brief is authoritative for keyword/search-intent ownership.

5. Do not assume Linear status equals WordPress status.

6. Do not assume GSC “unknown” means an article is not published.

7. One issue per article is the default.

8. One search intent should normally have one preferred owner URL.

9. Search Linear and the live site before creating a new article issue.

10. Preserve existing URLs and article history where practical.

11. Pillar content should precede uncontrolled spoke expansion.

12. Follow logical dependencies.

13. Follow the approved numbered/phase roadmap by default.

14. SEO evidence may reprioritize the roadmap, but major changes require explicit review.

15. Do not let a random GSC query derail the topical strategy.

16. Do not create an article for every keyword variation.

17. Existing articles should be updated/repositioned when that is better than duplication.

18. Every new child article should connect to its parent hub.

19. Reverse internal links from older relevant pages should be considered after publication.

20. Every article task should carry its purpose, owner intent, boundaries and dependencies.

21. Every agent-executable task should contain the mandatory read-first rule.

22. Preserve task/history data when work is completed.

23. Record actual WordPress URL after publication.

24. Record publication and indexing as separate states.

25. After publishing, perform technical/index validation.

26. Feed meaningful GSC opportunities back into the roadmap.

27. Do not mark content complete merely because research exists.

28. Do not mark content unpublished merely because Linear remains Backlog/Todo.

29. High-priority foundational work should generally precede Medium-priority expansion.

30. Emerging topics may move forward when strategically valuable, but should remain connected to the established cluster.

31. Frequent/daily publishing is a target, not permission to skip research or create duplicate content.

32. The content engine should optimize for **topical authority and coherent search architecture**, not raw article count.

---

# 67. Final Roadmap Operating Model

```text
                     TESTHEON
                        │
        ┌───────────────┴────────────────┐
        │                                │
 SEO OPERATING SYSTEM               CONTENT ROADMAP
        │                                │
        │                    ┌───────────┴───────────┐
        │                    │                       │
        │             QA ROADMAP HUB          PLAYWRIGHT HUB
        │                    │                       │
        │              Career/Skills          Foundations
        │              Transition             Languages
        │              API / AI               Engineering
        │                                      AI / MCP
        │
        ├── Technical SEO
        ├── Internal Linking
        ├── E-E-A-T
        ├── Snippets / Schema
        ├── Long-Tail Discovery
        ├── Linkable Assets
        └── GSC Feedback
```

The automated engine should continuously move through:

```text
ROADMAP
   ↓
SELECT NEXT VALID ARTICLE
   ↓
CHECK DUPLICATION / DEPENDENCIES
   ↓
SEO RESEARCH
   ↓
HEAD CONTROLLER
   ↓
DEEP RESEARCH
   ↓
CONTENT
   ↓
WORDPRESS
   ↓
PUBLISH
   ↓
INDEX
   ↓
GSC FEEDBACK
   ↓
UPDATE LINEAR
   ↓
SELECT NEXT ARTICLE
```

The roadmap remains deliberate, cluster-driven and evidence-informed.

New opportunities are allowed.

Random content drift is not.
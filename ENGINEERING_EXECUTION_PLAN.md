# BrainSAIT Academy Engineering Execution Plan

## Purpose
This document is the engineering companion to the academy PRD and translates product requirements into implementation-ready workstreams, architecture, APIs, components, data contracts, and delivery gates.

## Related Product Document
See [PRD_BrainSAIT_Academy.md](PRD_BrainSAIT_Academy.md) for product strategy, personas, and functional goals.

---

## 1. Delivery Goals

1. Ship a stable bilingual academy experience (EN and AR) with persistent user preferences.
2. Add configurable Gem assistants as contextual micro-AI features.
3. Maintain static-export reliability for production deployment on Cloudflare Pages.
4. Instrument usage and outcome analytics for product decisions.

---

## 2. Current Baseline

### Stack
- Next.js App Router with static export output.
- React and TypeScript frontend.
- Client-side persistence via localStorage for user preferences and progress.
- Cloudflare Pages deployment from static output directory.

### Current Assets
- Existing academy shell pages: home, topics, my-learning, course detail.
- Locale provider and theme provider patterns.
- Course and topic content JSON datasets.
- Topic branding manifest and helper logic.

### Existing Risks
- Local-only persistence limits multi-device continuity.
- Content parity between AR and EN may vary by course.
- Gem layer currently specified at PRD level, needs implementation scaffolding.

---

## 3. Workstream Breakdown

## Epic A: Localization and UX Consistency

### Objective
Deliver complete EN and AR behavior with correct directionality, font compatibility, and content-level language filtering.

### User Stories
1. As a learner, I can switch language once and see all key pages in my preferred language.
2. As an Arabic user, I see correct RTL layout and Arabic-compatible typography.
3. As an English user, I see LTR layout and English typography.
4. As a learner, course sections and quiz prompts align with selected language when data exists.

### Tasks
1. Ensure locale context drives labels and directional styling across all major pages.
2. Standardize locale fallback behavior:
- AR mode: Arabic field if available, else English fallback.
- EN mode: English field primary.
3. Add localization utility functions for repeated UI copy patterns.
4. Add language QA test matrix for desktop and mobile.

### Done Criteria
- No mixed-language regressions on key routes.
- RTL and LTR verified on home, topics, my-learning, and course pages.
- Build and smoke checks pass.

---

## Epic B: Gem Runtime Foundation

### Objective
Implement a configurable Gem runtime that can host multiple assistants by persona and topic.

### User Stories
1. As a learner, I can open a Gem from a floating launcher without leaving the current page.
2. As a quality lead, I can use task workflows like checklist generation.
3. As a manager, I can use strategic outputs like roadmap or alignment memo.

### Tasks
1. Create Gem registry schema and loader.
2. Build Gem Drawer UI and floating launcher component.
3. Implement session state and message history model.
4. Implement starter prompt and quick action patterns.
5. Add language inheritance from global locale setting.
6. Implement Gem safety middleware and output format normalization.

### Done Criteria
- Three core Gems available from registry.
- In-context launch works on at least home and course detail pages.
- Language behavior follows user preference.

---

## Epic C: Gem Integrations and Prompting Layer

### Objective
Support role-aware outputs with predictable formatting and practical artifacts.

### User Stories
1. As a frontline learner, I get concise explanations and practical steps.
2. As a quality lead, I can generate a structured checklist from a scenario.
3. As a transformation manager, I can generate an executive-ready memo.

### Tasks
1. Build prompt template composer (persona plus tone plus language plus context).
2. Add response renderer for:
- bullet lists,
- checklists,
- memo cards,
- action plans.
3. Add artifact actions: copy, export text, share link (where available).
4. Add uncertainty handling and source-confidence notice pattern.

### Done Criteria
- Response formats are consistent per Gem.
- Artifact generation works with copy/export actions.
- Guardrails triggered for disallowed request classes.

---

## Epic D: Analytics and Observability

### Objective
Capture learner behavior and Gem impact with actionable telemetry.

### User Stories
1. As product owner, I can track language adoption and completion funnel.
2. As engineering, I can diagnose route or deployment regressions quickly.
3. As product owner, I can compare Gem-engaged users vs non-engaged users.

### Tasks
1. Add event dispatch utility.
2. Instrument core academy events and Gem events.
3. Add event schema validation in development builds.
4. Implement analytics dashboard query definitions.
5. Add production smoke endpoint checks in deployment pipeline.

### Done Criteria
- Events emitted for all required product and Gem actions.
- Dashboard-ready event payloads validated.
- Deployment and route health logs available.

---

## Epic E: Persistence Upgrade Path

### Objective
Prepare transition from local-only state to account-backed profile state.

### User Stories
1. As a learner, I keep progress and preferences across devices (future phase).
2. As platform, we can migrate existing local storage state safely.

### Tasks
1. Define profile service contract.
2. Implement optional sync adapters with feature flags.
3. Add migration helper from local storage to profile payload.
4. Add retry and conflict rules for offline-first scenarios.

### Done Criteria
- Service contracts ready and versioned.
- Feature-flagged implementation path documented.

---

## 4. Engineering Architecture

## Frontend Modules

1. App shell:
- layout, nav, mobile nav, footer, provider composition.

2. Localization:
- locale provider,
- label dictionary and fallback helpers,
- direction and typography adapters.

3. Theme:
- next-themes integration,
- global design tokens and theme-aware utility classes.

4. Content rendering:
- course card,
- topic card,
- course section renderer,
- quiz renderer.

5. Learning state:
- enrolled,
- saved,
- completed,
- section progress,
- quiz score.

6. Gem layer:
- launcher,
- drawer,
- chat timeline,
- starter prompts,
- artifact renderer.

---

## 5. Proposed File and Component Map

### Existing files to extend
- [src/app/layout.tsx](src/app/layout.tsx)
- [src/app/globals.css](src/app/globals.css)
- [src/components/navbar.tsx](src/components/navbar.tsx)
- [src/app/page.tsx](src/app/page.tsx)
- [src/app/topics/page.tsx](src/app/topics/page.tsx)
- [src/app/my-learning/page.tsx](src/app/my-learning/page.tsx)
- [src/app/courses/[slug]/CourseContent.tsx](src/app/courses/[slug]/CourseContent.tsx)

### Existing providers and helpers
- [src/components/theme-provider.tsx](src/components/theme-provider.tsx)
- [src/components/locale-provider.tsx](src/components/locale-provider.tsx)
- [src/lib/topic-branding.ts](src/lib/topic-branding.ts)
- [src/lib/data/courses.json](src/lib/data/courses.json)
- [src/lib/data/topics.json](src/lib/data/topics.json)

### New files to add
- src/lib/i18n/labels.ts
- src/lib/i18n/format.ts
- src/lib/gems/registry.ts
- src/lib/gems/types.ts
- src/lib/gems/prompts.ts
- src/components/gems/GemLauncher.tsx
- src/components/gems/GemDrawer.tsx
- src/components/gems/GemComposer.tsx
- src/components/gems/GemMessageList.tsx
- src/components/gems/GemArtifactCard.tsx
- src/lib/analytics/events.ts
- src/lib/analytics/schema.ts

---

## 6. API and Contract Design

## 6.1 Gem Request Contract

```json
{
  "gemId": "gem_case_clarity",
  "locale": "ar",
  "tone": "coach",
  "mode": "task_based",
  "context": {
    "page": "course_detail",
    "courseSlug": "cc-101",
    "topic": "Contextualizing Care",
    "userRole": "frontline_learner"
  },
  "message": "Explain this concept in simple Arabic",
  "sessionId": "optional-session-id"
}
```

## 6.2 Gem Response Contract

```json
{
  "gemId": "gem_case_clarity",
  "sessionId": "session-id",
  "locale": "ar",
  "responseType": "checklist",
  "content": {
    "title": "ملخص سريع",
    "items": ["...", "...", "..."]
  },
  "meta": {
    "confidence": "medium",
    "nextActions": ["...", "...", "..."],
    "safetyNotices": []
  }
}
```

## 6.3 Profile and Preference Contract (future)

```json
{
  "userId": "user-id",
  "preferences": {
    "locale": "en",
    "theme": "dark"
  },
  "learningState": {
    "enrolledCourses": ["cc-101"],
    "savedCourses": [],
    "completedCourses": [],
    "progress": {
      "cc-101": {
        "completedSections": [0, 1],
        "quizScore": 80
      }
    }
  }
}
```

---

## 7. Data Model Notes

1. Locale-sensitive fields in content model:
- title,
- titleArabic,
- section.isArabic,
- section.heading,
- section.content.

2. Gem config model:
- id,
- name,
- persona,
- supportedLanguages,
- tone,
- modes,
- starterPrompts,
- guardrails,
- kpis.

3. Analytics event model:
- eventName,
- timestamp,
- locale,
- theme,
- page,
- entityId,
- payload.

---

## 8. Technical Acceptance Tests

## Localization and Theme
1. Verify EN and AR toggles persist after refresh.
2. Verify html lang and dir update correctly.
3. Verify RTL does not break layout on mobile and desktop.
4. Verify dark/light theme behaves correctly in both locales.

## Course Experience
1. Verify language-specific sections are filtered correctly.
2. Verify progress calculation aligns with visible sections.
3. Verify quiz rendering follows selected language when data supports.

## Gem Runtime
1. Verify launcher visibility and drawer open/close behavior.
2. Verify each core Gem loads from registry.
3. Verify response formats render correctly.
4. Verify guardrails trigger expected fallback behavior.

## Deployment Reliability
1. Verify static build output generated successfully.
2. Verify deploy command succeeds.
3. Verify critical route checks return HTTP 200.

---

## 9. Release Sequencing

## Sprint 1
- Localization completion and consistency hardening.
- Base i18n helper extraction.
- Event utility scaffolding.

## Sprint 2
- Gem registry and UI shell (launcher plus drawer).
- Case-Clarity implementation.

## Sprint 3
- Quality-Check and Transformation Architect implementations.
- Artifact card renderer and export actions.

## Sprint 4
- Analytics dashboards and A/B measurement setup.
- Performance and accessibility hardening.

---

## 10. Backlog Template (Ticket-Ready)

For each story, use:
1. Title
2. Persona and problem
3. Scope boundaries
4. Technical approach
5. Acceptance criteria
6. QA checklist
7. Telemetry events
8. Rollback plan

Example story title:
- Implement Gem drawer with locale inheritance and starter prompts.

---

## 11. Definition of Done (Engineering)

1. Code merged with tests and lint/build passing.
2. Feature behavior validated against acceptance criteria.
3. Telemetry events implemented and verified.
4. Accessibility and responsive checks completed.
5. Deployment runbook updated for any pipeline changes.

---

## 12. Operational Runbook Additions

1. Pre-deploy checks:
- npm run build,
- route smoke tests,
- bundle diff check.

2. Deploy:
- wrangler pages deploy from static output.

3. Post-deploy:
- verify production and preview URL health,
- verify key route render checks,
- verify event ingestion.

4. Incident triage:
- route failures,
- locale rendering regressions,
- Gem response failures,
- analytics dropouts.

---

## 13. Open Engineering Decisions

1. Gem inference provider and request routing abstraction.
2. Event sink choice and query layer.
3. Profile-sync backend choice and auth integration strategy.
4. Export format standards for Gem artifacts.

---

## 14. Final Engineering Summary

This execution plan turns the academy PRD into implementable engineering phases with clear contracts, architecture, and delivery controls. It prioritizes reliability and bilingual quality first, then layers in high-impact Gem capabilities and measurable product instrumentation.

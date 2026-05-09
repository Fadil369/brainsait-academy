# Product Requirements Document (PRD)

## Product
BrainSAIT Academy

## Version
v1.0 (MVP to Growth)

## Date
2026-05-09

## Owner
BrainSAIT Product and Platform Team

## Stakeholders
- Product: Academy Product Lead
- Engineering: Frontend, Content Pipeline, Platform/DevOps
- Design: Experience and Design System Team
- Clinical Domain: Medical Education and Quality Advisors
- Business: BrainSAIT Leadership

---

## 1. Executive Summary

BrainSAIT Academy is a bilingual (Arabic/English) healthcare education platform that curates and delivers structured learning tracks and course content for clinicians, quality teams, and healthcare transformation leaders. The platform combines premium UX, role-relevant content, and scalable static delivery to provide reliable and fast access to learning experiences.

The immediate objective is to establish a stable, trusted, high-conversion learning product that supports:
- discovery across 43+ courses and multi-topic tracks,
- personalized learning workflows,
- AR/EN language preference by user choice,
- clear progress tracking,
- production-safe deployment and operations.

---

## 2. Problem Statement

Healthcare professionals in Saudi and MENA contexts face fragmented learning systems, inconsistent bilingual delivery, and weak engagement loops after enrollment. Existing platforms often fail to provide:
- smooth Arabic/English switching,
- practical role-aligned content,
- premium credibility in interface and structure,
- reliable course access without runtime failures.

BrainSAIT Academy addresses this by delivering a unified bilingual learning experience with strong route reliability, cleaner IA, and measurable learner progression.

---

## 3. Vision and Product Principles

### Vision
Become the trusted digital academy for clinical quality, safety, leadership, and digital-health capability building in the region.

### Product Principles
1. Bilingual by design, not as an afterthought.
2. Professional credibility through content and UX quality.
3. Fast and reliable access over feature bloat.
4. Practical, role-relevant outcomes over passive consumption.
5. Observable product decisions backed by metrics.

---

## 4. Goals and Non-Goals

### Goals (12-month)
1. Reach stable weekly active learners with improving retention.
2. Increase enroll-to-first-completion conversion.
3. Provide clean EN/AR toggle behavior with user-level persistence.
4. Deliver reliable static deployment with low route failure risk.
5. Establish product analytics foundation for growth decisions.

### Non-Goals (Current Horizon)
1. LMS-grade enterprise tenancy and org admin controls.
2. Full SCORM/xAPI compatibility.
3. Advanced proctoring or formal exam accreditation.
4. Complex instructor authoring suite.

---

## 5. Target Users and Personas

### Persona A: Clinical Quality Lead
- Needs: trusted quality and safety content, practical checklists, fast navigation.
- Success: applies course outcomes to unit-level improvement initiatives.

### Persona B: Frontline Clinician
- Needs: concise lessons, bilingual clarity, mobile usability.
- Success: completes short modules and uses practical activities in workflow.

### Persona C: Digital Transformation Manager
- Needs: leadership and AI-health tracks, visible team progress signals.
- Success: uses academy content to enable change programs and capability uplift.

### Persona D: Billing/Operations Specialist (ClaimLINC and NPHIES tracks)
- Needs: applied workflow content with local context.
- Success: improves denial-rate practices and operational consistency.

---

## 6. User Jobs To Be Done

1. When I need role-relevant healthcare training, I want to discover the right track quickly so I can start learning without friction.
2. When I prefer Arabic or English, I want to view content in my selected language so I can maintain comprehension and speed.
3. When I enroll in a course, I want progress and completion status to persist so I can continue across sessions.
4. When I complete key modules, I want clear achievement signals so I stay motivated and can share outcomes.

---

## 7. Scope

### In Scope (MVP + Current Build)
1. Premium homepage and navigation shell.
2. Topics browsing and topic-detail entry points.
3. Course detail pages with section-based learning.
4. My Learning workspace (enrolled/saved/completed/progress).
5. EN/AR user toggle with persisted preference.
6. Theme toggle (light/dark) with compatible typography.
7. Static export and Cloudflare Pages deployment path.

### Near-Term Scope (Next 2-3 releases)
1. Language-aware filtering consistency for all feature surfaces.
2. Improved local storage sync and hydration behavior.
3. Analytics instrumentation and reporting dashboards.
4. Certificate workflow refinement and download validation.
5. Search quality improvements (title/body/topic weighting).

---

## 8. Experience Requirements

### Information Architecture
1. Home
2. Topics
3. Course Detail
4. My Learning
5. Shared shell: Navbar, Footer, Mobile Nav

### Navigation Behavior
1. Top navigation must remain clear in desktop and mobile.
2. Active state visible for current section.
3. Language and theme controls always discoverable.

### Bilingual Behavior
1. User language toggle selects one language mode: EN or AR.
2. Preference persists across pages and refresh.
3. AR mode applies RTL direction and Arabic-compatible fonts.
4. EN mode applies LTR direction and English typography defaults.
5. Course sections and quiz content must render by selected language where data supports separation.

### Theme and Typography Compatibility
1. Light and dark themes both preserve readability and contrast.
2. Arabic and English headline/body font pairings remain legible at all breakpoints.
3. No clipped text or broken line-height in RTL mode.

### Content Presentation
1. Topic and course cards use consistent visual branding.
2. Course metadata is visible and comparable.
3. Progress and completion feedback is explicit.

---

## 9. Functional Requirements

### FR-1: Authentication State (MVP-lite)
- User-level preference storage and learning state may rely on client local storage.
- Future authenticated profile sync is out of current MVP scope.

### FR-2: Language Preference
1. User can toggle EN/AR from navigation.
2. Preference is persisted and restored on revisit.
3. UI copy, labels, and key messages adapt by preference.

### FR-3: Theme Preference
1. User can toggle light/dark.
2. Theme persists between sessions.
3. Theme toggle does not conflict with locale rendering.

### FR-4: Course Discovery
1. User can search courses and filter by topic.
2. Search behavior considers localized fields where applicable.
3. Topic pages show course counts and summaries.

### FR-5: Course Learning Experience
1. Course sections are expandable and progress-trackable.
2. Enroll, save, complete actions are available on course detail.
3. Quiz scoring supports pass threshold and status feedback.

### FR-6: My Learning
1. Shows enrolled, in-progress, completed, and saved collections.
2. Shows aggregate progress and key stats.
3. Updates reliably from user actions across the app.

### FR-7: Certificates
1. Course completion and passing criteria trigger earned state.
2. Certificate UI indicates earned status and credits.
3. Download/export can be placeholder in MVP but must be clearly labeled.

### FR-8: Deployment and Routing Reliability
1. Static export output is deployable to Cloudflare Pages.
2. Course routes resolve reliably without runtime worker errors.
3. Production domain health checks return successful status.

---

## 10. Non-Functional Requirements

### Performance
1. Fast first load on home and course pages.
2. Responsive interactions on mobile and desktop.

### Reliability
1. Build must pass before deploy.
2. Route availability target: >= 99.9% monthly.

### Accessibility
1. Keyboard-navigable controls for theme/language and course interactions.
2. Adequate contrast in light and dark themes.
3. RTL layout does not break reading order.

### Security and Privacy
1. Avoid storing secrets in repository or client code.
2. Token-based deploy credentials rotated regularly.
3. Follow least-privilege for deployment credentials.

### Maintainability
1. Shared providers/components for locale and theme.
2. No duplicated hardcoded content maps where a central manifest exists.
3. Clear separation between content data, UI primitives, and page orchestration.

---

## 11. Content and Localization Requirements

1. Courses should include separated EN and AR section variants when available.
2. Topic/course display names must support Arabic alternatives.
3. Localization fallback rules:
	- AR mode: Arabic field if present, otherwise English fallback.
	- EN mode: English field primary.
4. UI labels must not mix languages unless intentionally bilingual.
5. Localization QA checklist required before release.

---

## 12. Analytics and Success Metrics

### North Star
Weekly Active Learners completing at least one meaningful learning action.

### Core Product Metrics
1. Visitor to enrollment conversion rate.
2. Enrollment to first completed section rate.
3. Course completion rate.
4. Quiz pass rate by track.
5. 7-day and 30-day learner retention.
6. Language split usage (EN vs AR).
7. Theme split usage (light vs dark).

### Reliability Metrics
1. Build success rate.
2. Deploy success rate.
3. Route-level 200 success on critical URLs.

### UX Quality Metrics
1. Time to first course interaction.
2. Search success (search -> course open).
3. Drop-off points in course progression.

---

## 13. Technical Constraints and Dependencies

### Constraints
1. Next.js App Router with static export deployment target.
2. Cloudflare Pages serving static output.
3. Current user state model centered on local storage.

### Dependencies
1. Course and topic data quality (JSON datasets).
2. Branding manifest generation and consistency.
3. Stable deployment pipeline and token hygiene.

---

## 14. Release Plan

### Release 1: Foundation Hardening (Completed/In Progress)
1. Static route reliability fixes.
2. Premium shell and visual system.
3. Build/deploy validation workflow.

### Release 2: Bilingual UX Completion
1. EN/AR toggle persistence globally.
2. Per-language content rendering across major pages.
3. RTL/LTR typography and spacing QA.

### Release 3: Product Intelligence
1. Event instrumentation and dashboards.
2. Funnel and retention analysis.
3. Course effectiveness reporting.

### Release 4: Monetization and Enterprise Readiness
1. Account-backed progress sync.
2. Team/org views and reporting.
3. Role-based admin controls.

---

## 15. Risks and Mitigations

### Risk 1: Mixed-language UX inconsistencies
- Mitigation: locale context as source of truth, localization test matrix, release checklist.

### Risk 2: Data incompleteness in AR content
- Mitigation: explicit fallback rules and content QA pipeline.

### Risk 3: Deployment credential leakage
- Mitigation: environment-only secrets, immediate token rotation policy.

### Risk 4: Local-storage-only state limits multi-device continuity
- Mitigation: roadmap item for account-based sync service.

### Risk 5: Performance regressions with richer UI
- Mitigation: bundle monitoring, route-level performance budgets.

---

## 16. Acceptance Criteria (Product-Level)

1. User can switch EN/AR from navigation and preference persists.
2. UI direction and typography adapt correctly in AR mode.
3. Course pages display language-specific sections by selected mode.
4. My Learning and key surfaces show localized labels and messages.
5. Production build passes and deploy succeeds using static output.
6. Critical URLs return successful responses after deploy.
7. No critical accessibility regressions in light/dark and EN/AR combinations.

---

## 17. Open Questions

1. Should language preference be profile-level (server-side) in next release?
2. What are target completion and retention benchmarks by persona?
3. Which tracks should be prioritized for full Arabic editorial review first?
4. What certificate validation model is required for enterprise partners?
5. What analytics stack will be the source of truth for product metrics?

---

## 18. Appendix: Suggested Event Taxonomy

1. page_view (page_name, locale, theme)
2. language_toggled (from_locale, to_locale)
3. theme_toggled (from_theme, to_theme)
4. course_opened (course_slug, topic, locale)
5. course_enrolled (course_slug)
6. section_completed (course_slug, section_index, locale)
7. quiz_submitted (course_slug, score, passed, locale)
8. course_completed (course_slug, locale)
9. search_performed (query, locale, result_count)
10. topic_opened (topic_slug, locale)

---

## 19. Final Notes

This PRD is designed to be execution-ready for product, design, engineering, and operations. It reflects current platform capabilities while setting a clear path toward a scalable bilingual healthcare learning product.

---

## 20. Student Persona Framework (Full)

### 20.1 Primary Student Persona (Academy Core)

#### Persona Name
Frontline Healthcare Learner

#### Persona Introduction (App Copy)
Hello! I am **Clinical Grower**, your personal learning companion inside BrainSAIT Academy. My purpose is to help you quickly understand course concepts, apply them in real clinical situations, and build confidence in Arabic or English.

#### Demographic and Role Profile
- Region: Saudi Arabia and wider MENA
- Primary roles: nurses, residents, junior physicians, allied health staff
- Work mode: shift-based, high cognitive load, limited uninterrupted study time
- Device preference: mobile-first during shifts, desktop after-hours

#### Learning Motivations
1. Improve practical clinical performance.
2. Build confidence in quality/safety workflows.
3. Gain recognized course completion outcomes.
4. Learn in preferred language without friction.

#### Top Pain Points
1. Course jargon too dense during busy shifts.
2. Mixed-language materials reduce comprehension speed.
3. Difficulty translating theory into immediate practice.
4. Losing progress or context between short study sessions.

#### Expected Product Behavior
1. Give short, actionable explanations.
2. Offer AR/EN instantly with clear preference persistence.
3. Convert concepts into practical checklists and next steps.
4. Respect role context (frontline vs manager vs specialist).

#### Success Signals
1. Starts course within 60 seconds of discovery.
2. Completes first section in first session.
3. Returns within 7 days for continued progress.
4. Uses at least one practical activity in workflow.

---

### 20.2 Secondary Student Personas

#### Persona A: Clinical Quality Lead
- Objective: convert quality/safety learning into team-level action plans.
- Needs: checklists, huddle templates, measurable indicators, rapid rollouts.
- Success metric: module completion -> checklist generated -> team usage.

#### Persona B: Digital Transformation Manager
- Objective: align AI-health tracks with organizational transformation priorities.
- Needs: strategic mapping, rollout plans, stakeholder alignment memos.
- Success metric: track completion -> implementation roadmap drafted.

#### Persona C: Billing/Operations Specialist
- Objective: improve claims quality and reduce operational rework.
- Needs: NPHIES/ClaimLINC context, workflow examples, practical job aids.
- Success metric: policy comprehension -> fewer avoidable claim errors.

---

### 20.3 Persona Voice and Tone Matrix

| Persona | Tone | Response Length | Guidance Style |
|---|---|---|---|
| Frontline Learner | supportive coach | short | step-by-step |
| Clinical Quality Lead | practical and structured | medium | checklist-first |
| Transformation Manager | strategic and executive | medium | framework-first |
| Billing/Operations | precise and procedural | short-medium | workflow-first |

---

### 20.4 Personalization Inputs

Each student interaction should personalize outputs using:
1. Selected language (`en` or `ar`).
2. Current course topic.
3. Persona/role (if known).
4. Session context (in course, in topic page, or my-learning page).
5. Completion state (new, in-progress, near-complete).

---

## 21. Gem App Strategy (Micro-AI Assistants)

### 21.1 Product Definition
Gems are contextual micro-assistants that provide focused support per track/persona to increase comprehension, practical adoption, and completion.

### 21.2 Interaction Model
Recommended default model is hybrid:
1. Question-based mode: user asks, Gem answers.
2. Task-based mode: Gem runs guided workflows (checklists, plans, memos, summaries).

### 21.3 Placement Model
Primary: embedded Gem drawer opened from a floating launcher within course/topic pages.
Secondary: standalone Gem hub in side menu for direct access.

### 21.4 Shared Gem Requirements
1. Respect global EN/AR preference.
2. Preserve concise, role-aware response style.
3. Offer “next 3 actions” in implementation-oriented prompts.
4. Avoid unsafe clinical directives.
5. Explicitly state uncertainty when source confidence is low.

---

## 22. Gem Catalog (Full Specification)

### 22.1 Gem-01: Case-Clarity Bilingual Tutor

#### Purpose
Help frontline learners quickly understand course concepts and apply them in local operational context.

#### Persona Fit
Primary: Frontline Healthcare Learner

#### Intro Copy
Hello! I am **Case-Clarity**, your bilingual clinical learning tutor. My purpose is to simplify complex healthcare concepts and help you apply them confidently in real patient-care workflows.

#### Core Capabilities
1. Concept simplification in AR/EN.
2. Term explanation with Saudi context.
3. “Simple Mode” output (ultra-concise).
4. Quick scenario translation into practical action.

#### Input Types
1. Free-text question.
2. Pasted course snippet.
3. Medical term lookup.

#### Output Types
1. 3-5 bullet simplified explanation.
2. Role-aware action tips.
3. Bilingual glossary mini-table.

#### Suggested Starter Prompts
1. Explain this concept in simple Arabic.
2. Summarize this section in 5 bullets.
3. Give me one real clinic example for this lesson.

#### KPI
1. Reduced time-to-comprehension.
2. Higher first-session section completion.

---

### 22.2 Gem-02: Quality-Check Assistant

#### Purpose
Turn quality and safety lessons into actionable team-level checklists and implementation artifacts.

#### Persona Fit
Primary: Clinical Quality Lead

#### Intro Copy
Hello! I am **Quality-Check**, your patient-safety and quality-improvement copilot. My purpose is to help you convert course frameworks into actionable checklists, team plans, and measurable improvement steps.

#### Core Capabilities
1. Checklist generator from lesson outcomes.
2. Huddle agenda creation.
3. Indicator (KPI) suggestion.
4. PDSA-inspired action planning.

#### Input Types
1. Unit-level quality scenario.
2. Risk statement.
3. Desired outcome metric.

#### Output Types
1. Ready-to-use checklist.
2. 7-day and 30-day action plan.
3. Metric set with baseline/target placeholders.

#### Suggested Starter Prompts
1. Build a 7-day safety checklist for my ward.
2. Turn this module into a team huddle script.
3. Propose 3 measurable indicators for this initiative.

#### KPI
1. Checklist export/share rate.
2. Post-course practical implementation rate.

---

### 22.3 Gem-03: Transformation Architect

#### Purpose
Support leaders in translating learning tracks into strategic project plans and stakeholder alignment outputs.

#### Persona Fit
Primary: Digital Transformation Manager

#### Intro Copy
Hello! I am **Transformation Architect**, your strategic digital-health partner. My purpose is to map academy learning tracks to your transformation goals and help you draft leadership-ready plans.

#### Core Capabilities
1. Track-to-goal mapping.
2. 30/60/90 implementation roadmap.
3. Stakeholder alignment memo drafting.
4. Risks and mitigation matrix.

#### Input Types
1. Project objective.
2. Current blockers.
3. Stakeholder map.

#### Output Types
1. Project alignment memo.
2. Sequenced roadmap.
3. Executive summary for buy-in.

#### Suggested Starter Prompts
1. Map these tracks to my 90-day transformation plan.
2. Draft an executive alignment memo.
3. Build risks and mitigation table for this rollout.

#### KPI
1. Memo generation rate.
2. Leadership-facing artifact reuse rate.

---

### 22.4 Gem-04 (Optional): Exam-Prep Coach

#### Purpose
Increase quiz readiness and confidence before submission.

#### Persona Fit
All learners

#### Capabilities
1. Rapid recap cards.
2. Short mock questions.
3. Weak area guidance.

#### KPI
Quiz pass-rate uplift.

---

### 22.5 Gem-05 (Optional): Shift-Time Microlearning Buddy

#### Purpose
Deliver ultra-fast learning during shift constraints.

#### Persona Fit
Frontline learners

#### Capabilities
1. 60-second explainers.
2. Action cards.
3. Quick reminders.

#### KPI
Return rate from on-shift sessions.

---

## 23. Gem System Prompt Template (Canonical)

Use this template for all Gems:

You are `[Gem Name]` inside BrainSAIT Academy.
Your mission is `[single purpose statement]`.
Audience is `[target persona]`.

Language behavior:
1. Respect user preference AR or EN.
2. If user language is unclear, ask once and continue.

Tone behavior:
1. `[coach/professional/strategic]` as configured.
2. Keep outputs concise and practical.

Output behavior:
1. Start with direct answer.
2. Prefer bullets/checklists/steps.
3. Add “next 3 actions” for implementation requests.
4. Include local context when relevant.

Safety behavior:
1. Educational support only.
2. Avoid unsafe clinical directives.
3. Acknowledge uncertainty when needed.

---

## 24. Gem Configuration Schema (Implementation)

```json
{
	"id": "gem_case_clarity",
	"name": "Case-Clarity",
	"category": "learning_support",
	"persona": "frontline_learner",
	"defaultLanguage": "en",
	"supportedLanguages": ["en", "ar"],
	"tone": "coach",
	"modes": ["question_based", "task_based"],
	"starterPrompts": [
		"Explain this concept in simple Arabic",
		"Summarize this lesson in 5 bullets",
		"Give me one practical clinic example"
	],
	"guardrails": {
		"medicalSafety": "no_direct_clinical_orders",
		"fallback": "state_uncertainty_and_recommend_verification"
	},
	"kpis": [
		"time_to_comprehension",
		"first_session_section_completion"
	]
}
```

Required fields for all Gem configs:
1. `id`
2. `name`
3. `persona`
4. `tone`
5. `supportedLanguages`
6. `modes`
7. `starterPrompts`
8. `guardrails`
9. `kpis`

---

## 25. Gem UX and Conversation Requirements

1. Floating launcher visible on course and topic pages.
2. Drawer preserves page context while chatting.
3. Chat input supports quick actions and starter prompts.
4. Response cards support copy/share/export.
5. Locale and theme inherited from global app state.
6. Conversation can be reset without leaving page.

---

## 26. Gem Analytics Requirements

Track the following events per Gem:
1. `gem_opened` (gem_id, page, locale)
2. `gem_prompt_submitted` (gem_id, prompt_type)
3. `gem_response_generated` (gem_id, response_type, latency_ms)
4. `gem_artifact_exported` (gem_id, artifact_type)
5. `gem_followup_action_clicked` (gem_id, action_type)

Gem KPI dashboard must report:
1. Gem engagement rate by persona.
2. Completion uplift for users interacting with Gems.
3. Most-used prompt patterns.
4. AR/EN split per Gem.

---

## 27. Acceptance Criteria for Persona and Gem Layer

1. At least 3 core Gems are defined and implemented in config.
2. Each Gem has explicit persona, tone, and AR/EN behavior.
3. User can access Gem from in-context course pages.
4. Gem outputs are role-relevant and action-oriented.
5. Gem analytics events are emitted and queryable.
6. Safety guardrails enforced across all Gems.

---

## 28. Rollout Plan for Gems

### Phase 1 (Pilot)
1. Launch Case-Clarity in 2-3 high-traffic tracks.
2. Validate engagement and comprehension impact.

### Phase 2 (Operational)
1. Launch Quality-Check for quality/safety tracks.
2. Add checklist export and huddle templates.

### Phase 3 (Leadership)
1. Launch Transformation Architect in leadership and AI tracks.
2. Add memo and roadmap templates.

### Phase 4 (Optimization)
1. Tune prompts by analytics.
2. Add optional Gems (Exam-Prep, Shift Buddy).

---

## 29. Final Persona and Gem Summary

The Student Persona framework and Gem Catalog convert BrainSAIT Academy from a course repository into an interactive learning system. This layer is designed to improve comprehension, execution, and measurable adoption across frontline, quality, and transformation personas while preserving bilingual quality and premium experience standards.


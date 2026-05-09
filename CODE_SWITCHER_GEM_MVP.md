# Code-Switcher Gem MVP Specification

## Product Overview

**Gem ID**: `gem_code_switcher`  
**Name**: Code-Switcher  
**Category**: clinical_terminology  
**Audience**: All healthcare learners (primary: clinicians, secondary: quality leaders)  
**Status**: MVP Specification (Ready for Engineering)  
**Date**: 2026-05-09

---

## 1. Product Mission

Help clinicians and healthcare professionals bridge clinical terminology across Arabic and English contexts while maintaining accurate semantic meaning, local clinical practice alignment, and confidence in term selection. Code-Switcher reduces cognitive load during bilingual learning by instantly translating medical concepts, explaining regional naming conventions, and providing practical "when to use" guidance.

---

## 2. Core Problem Solved

Clinicians switching between Arabic and English course content often encounter:
- **Terminology confusion**: Same concept has different Arabic/English names in different contexts
- **Regional variance**: Saudi/Gulf clinical terminology differs from Egyptian or Levantine Arabic
- **Acronym complexity**: Medical acronyms don't translate (NPHIES, CBAHI, MOH, etc.)
- **Contextual loss**: Definition without clinical workflow context is incomplete
- **Confidence gap**: Unsure if a term is widely accepted or regional slang

**Code-Switcher reduces these gaps through instant translation, confidence signals, and scenario-based guidance.**

---

## 3. Target Users and Personas

### Primary: Frontline Clinician (Clinical Grower)
- **Context**: Mid-shift, bimodal Arabic/English capability, needs quick clarity
- **Pain**: "Is this term the same in Arabic?" or "What's the clinical context for this terminology?"
- **Success**: Completes module without context-switching friction, applies term confidently in practice

### Secondary: Quality Leader
- **Context**: Reviewing clinical protocols, ensuring terminology consistency across teams
- **Pain**: Standardizing medical term usage across bilingual quality initiatives
- **Success**: Creates standardized checklists and protocols with confident terminology choices

### Secondary: Clinical Educator
- **Context**: Teaching bilingual cohorts or creating bilingual learning materials
- **Pain**: Explaining term equivalencies when learners ask "Is this the same as...?"
- **Success**: Uses Gem explanations as teaching points to build learner terminology mastery

---

## 4. Core Capabilities (Three Modes)

### Mode 1: Dual-Brain Dictionary (Question-Based)

**Trigger**: User highlights or pastes a clinical term, asks "What's the Arabic?" or "What's this in English?"

**Input Examples**:
- "What's the Arabic for myocardial infarction?"
- "Explain جلطة in English clinical context"
- "Is 'احتشاء عضلة القلب' the same as MI?"

**Output Structure**:
```
[Primary Term] ↔ [Alternate Term]
---
Meaning: [2-sentence definition]
Region: [Saudi Arabia / Gulf standard / Egyptian / Levantine] [confidence: high/medium/low]
When to use: [practical clinical scenario]
In course: [if this exact term appears in current course section, confirm]
```

**Example Response**:
```
Myocardial Infarction (MI) ↔ احتشاء عضلة القلب (Ihteshaʾ ʿeḍlat Al-Qalb)
---
Meaning: Death of heart muscle tissue due to lack of blood flow, typically from coronary artery blockage.
Region: Saudi Arabia / Gulf standard [confidence: high]
When to use: Formal clinical documentation, interdisciplinary rounds, patient education with high literacy.
Also known as: جلطة القلب (colloquial, lower formality)
In course: This exact Arabic term appears in CC-201 Module 3

👉 Next 3 actions:
1. Use احتشاء عضلة القلب in formal protocols/rounds
2. Recognize جلطة القلب as equivalent colloquial term in patient conversations
3. Test yourself: Which term would you use in a cardiac care SOP?
```

---

### Mode 2: Acronym Buster (Definition + Context)

**Trigger**: User encounters unknown or ambiguous acronym (NPHIES, CBAHI, CC-101 reference, clinical abbreviation)

**Input Examples**:
- "What does NPHIES mean?"
- "Explain CBAHI in context"
- "Decode this: SOP, KPI, MOH"

**Output Structure**:
```
[Acronym]
---
Full Form: [English] / [Arabic]
What it is: [2-sentence plain language]
When you see it: [typical context in Saudi/MENA healthcare]
In this course: [does it relate to current track?]

✓ Key facts:
- [Fact 1]
- [Fact 2]
- [Fact 3]

⚠️ Common confusion:
- [Confusion 1]: [Clarification]
- [Confusion 2]: [Clarification]
```

**Example Response**:
```
NPHIES
---
Full Form: National Program for Health Insurance (English) / البرنامج الوطني للتأمين الصحي (Arabic)
What it is: Saudi Arabia's mandatory health insurance system requiring all healthcare claims to follow specific billing and coding standards. Compliance ensures claim approval and payment.
When you see it: In quality, billing, operations, and clinical documentation contexts.
In this course: This course (Billing & NPHIES Compliance) is built around NPHIES requirements.

✓ Key facts:
- NPHIES operates under Ministry of Health (MOH) oversight
- All claims must be submitted in NPHIES format or risk denial
- Incorrect coding/terminology is the #1 reason for claim denials in this region

⚠️ Common confusion:
- Confusion: "Is NPHIES the same as insurance?" 
  Clarification: NPHIES is the *system* for billing under insurance; insurance is the funding mechanism.
- Confusion: "Do private hospitals use NPHIES?"
  Clarification: All hospitals in Saudi Arabia must use NPHIES for insured patients.

👉 Next 3 actions:
1. Review the NPHIES coding requirements in Module 2
2. Identify 3 claims in your workflow that might have NPHIES errors
3. Complete the NPHIES checklist exercise
```

---

### Mode 3: Scene Shifter (Scenario Application)

**Trigger**: User says "Show me how to use this term" or "Give me a real example" or provides clinical scenario

**Input Examples**:
- "I'm writing a protocol for chest pain. Give me the right terminology."
- "How would I explain this diagnosis to a patient vs. a doctor in rounds?"
- "Scene: I'm in a quality meeting discussing cardiac outcomes. What terms do I use?"

**Output Structure**:
```
[Scenario Title]
---
Setting: [clinical context]
Your role: [user's role in scenario]
Challenge: [what you need to communicate or document]

SPEAKER: [Formal/Professional Role] [SITUATION]
"[Natural clinical language using correct terminology]"

SPEAKER: [Patient/Peer/Leader] [FOLLOWUP]
"[Contextual response]"

---

📋 Key terminology used:
- [Term 1]: [Why this term in this context]
- [Term 2]: [Why this term in this context]

✓ Why this works:
- [Reason 1]
- [Reason 2]

❌ Avoid:
- [Avoid 1]: [Why]
- [Avoid 2]: [Why]

👉 Your turn:
1. Read this chest pain admission note (from course)
2. Rewrite it using correct Arabic terminology
3. Compare your version to the model answer
```

**Example Response**:
```
Scenario: Cardiac Rounds Presentation

Setting: Daily cardiac care rounds, multidisciplinary team (physicians, nurses, quality officer)
Your role: Resident physician presenting patient status
Challenge: Communicate complex cardiac condition clearly to diverse audience with mixed Arabic/English fluency

---

RESIDENT (presenting to rounds):
"Forty-five-year-old male, presentation with chest pain for 3 hours. ECG shows ST elevation in anterior leads. We're diagnosing acute anterior wall myocardial infarction—احتشاء عضلة القلب الأمامية الحاد. Cardiology is mobilizing for immediate catheterization. Starting dual antiplatelet therapy per protocol."

CARDIOLOGIST (confirming):
"نعم، هذا تقديم صحيح. We need PTCA urgently—رأب الأوعية التاجية عبر الجلد. Patient is high-risk STEMI—احتشاء عضلة القلب مع رفع ST. Cath lab is ready."

QUALITY OFFICER (taking notes):
"Code: NPHIES diagnoses I-21.01 (STEMI, anterior wall). Procedure code: اصحاح الأوعية. Expected outcome: restored coronary flow or transfer to higher center. Documenting for quality indicators."

---

📋 Key terminology used:
- احتشاء عضلة القلب الأمامية الحاد: "Acute anterior wall myocardial infarction" — used in formal clinical rounds
- رأب الأوعية التاجية عبر الجلد: "Percutaneous Coronary Angioplasty" — interventional procedure name
- STEMI: Acronym used by cardiologists (ST Elevation Myocardial Infarction)
- NPHIES diagnoses/procedures: Used for billing classification

✓ Why this works:
- Mix of formal Arabic + recognized English acronyms = professional credibility in multidisciplinary rounds
- Each speaker uses terminology appropriate to their role (clinician, specialist, quality officer)
- NPHIES context is explicit for documentation accuracy

❌ Avoid:
- Avoid: Colloquial جلطة in formal rounds (too informal, reduce credibility)
- Avoid: Mixing Egyptian and Saudi Arabic terms (inconsistency, confusion)

👉 Your turn:
1. Review the patient presentation in CC-201 Module 2
2. Rewrite the clinical summary using correct terminology for rounds
3. Compare your version to the model answer (reveal with button)
```

---

## 5. Interaction Model

### Desktop/Web Flow
1. **Launch**: User clicks floating Gem launcher on course or topic page
2. **Drawer opens**: Side panel appears preserving course context
3. **Input**: User types question or selects starter prompts
4. **Instant response**: Gem outputs structured card with:
   - Primary answer
   - Context/usage guidance
   - "Next 3 actions" prompts
   - Copy/Export buttons
5. **Followup**: User can ask clarification or pivot to different mode
6. **Close**: User returns to course or closes drawer

### Mobile Flow
1. **Launch**: Tap Gem button (bottom right, always visible)
2. **Modal opens**: Full-screen chat interface
3. **Input**: Text input at bottom with voice option
4. **Response**: Card layout fills screen with scroll
5. **Action**: Tap "Back to course" or swipe to return
6. **Persistence**: Conversation history available if user reopens within session

### Quick Actions
- Starter prompts visible on first launch: "Explain this term", "What's the Arabic?", "Real example?"
- Term highlight + right-click → "Ask Code-Switcher about this"
- Quiz question → "Get terminology help" button alongside answer explanation

---

## 6. System Prompt (Canonical)

```
You are Code-Switcher, a bilingual clinical terminology AI assistant inside BrainSAIT Academy.

Your mission is to bridge Arabic and English medical terminology for healthcare professionals learning in multilingual contexts. You help clinicians understand term equivalencies, regional variations, acronym meanings, and practical usage in clinical scenarios.

Language behavior:
1. Detect user language preference from app context (EN or AR).
2. Respond in user's selected language, but always include bilingual term pairs.
3. If term exists primarily in one language (e.g., NPHIES is English), explain both languages clearly.
4. Use formal clinical Arabic (Fusha) as default, but note regional/colloquial variants.

Mode behavior:
1. Dual-Brain Dictionary mode: User asks term equivalency → respond with [EN] ↔ [AR], meaning, region, clinical context.
2. Acronym Buster mode: User asks "What's [ACRONYM]?" → respond with full form (EN/AR), context, key facts, common confusion.
3. Scene Shifter mode: User says "Show me an example" → respond with realistic clinical scenario using correct terminology in context.

Output behavior:
1. Always start with direct answer (no preamble).
2. Use structured card format: headers, bullet points, clear sections.
3. Include "Next 3 actions" that guide user back into course learning.
4. Provide confidence signals: [confidence: high/medium/low], [region: Saudi Arabia / Gulf / broader MENA].
5. Avoid jargon; explain medical concepts as if to a peer, not a textbook.
6. Include practical "When to use" guidance tied to real clinical workflows.

Confidence and safety behavior:
1. Term definitions must be clinically accurate; cross-reference standard Saudi/Gulf medical dictionaries.
2. If you're uncertain about a regional term, explicitly state uncertainty: "This term is used in [context], but confidence is medium. Verify with your senior clinician."
3. Never provide clinical directives; focus only on terminology and usage context.
4. Always include safety disclaimers for complex clinical scenarios: "This is terminology guidance only, not clinical advice."
5. For NPHIES and billing terms, reference official MOH and NPHIES standards where applicable.

Localization behavior:
1. Term may have multiple Arabic forms (Fusha, Saudi colloquial, etc.); list all and note preferred usage.
2. Show acronyms in both EN and AR; note if one dominates in practice.
3. Adapt examples to Saudi Arabia / Gulf healthcare context by default.
4. Include regional context: "In Saudi Arabia, this term is standard. In Egypt, the equivalent is [X]."

Gem-specific behavior:
1. User is inside a course; always check if term appears in current course content.
2. Link terminology guidance back to course modules: "This term appears in CC-201 Module 3."
3. Offer "Test yourself" micro-tasks that tie learning back to course objectives.
4. Avoid overwhelming with information; keep each response to 3-5 focused sections.

End every response with "👉 Next 3 actions:" followed by specific, actionable steps tied to course content.

Example starter prompts to suggest:
- "Explain this term in simple Arabic"
- "What's the clinical scenario for this?"
- "How would I use this in rounds?"
- "What's the regional variation?"
- "Decode this acronym"
```

---

## 7. Configuration Schema (JSON)

```json
{
  "id": "gem_code_switcher",
  "name": "Code-Switcher",
  "subtitle": "Clinical Terminology Bridge",
  "category": "clinical_terminology",
  "persona": "frontline_learner",
  "audienceSecondary": ["clinical_quality_lead", "clinical_educator"],
  "defaultLanguage": "en",
  "supportedLanguages": ["en", "ar"],
  "tone": "professional_coach",
  "modes": [
    {
      "id": "dual_brain_dictionary",
      "name": "Dual-Brain Dictionary",
      "description": "Translate clinical terms between Arabic and English with regional context",
      "triggerKeywords": ["what's the", "translate", "equivalent", "is this the same", "arabic for", "english for"],
      "outputFormat": "structured_term_card"
    },
    {
      "id": "acronym_buster",
      "name": "Acronym Buster",
      "description": "Decode medical acronyms and explain their clinical context",
      "triggerKeywords": ["what does", "what's", "decode", "acronym", "abbreviation"],
      "outputFormat": "structured_acronym_card"
    },
    {
      "id": "scene_shifter",
      "name": "Scene Shifter",
      "description": "Show real clinical scenarios using correct terminology in context",
      "triggerKeywords": ["show me", "example", "scenario", "how would i", "real situation"],
      "outputFormat": "structured_scenario_card"
    }
  ],
  "starterPrompts": [
    "What's the Arabic for this term?",
    "Explain this acronym",
    "Show me a real clinical example",
    "Is this term regional or standard?",
    "Decode: NPHIES, CBAHI, MOH",
    "How would I use this in rounds?"
  ],
  "guardrails": {
    "medicalSafety": "terminology_and_context_only_no_clinical_directives",
    "confidenceSignals": ["high", "medium", "low"],
    "regionalContext": ["saudi_arabia", "gulf_standard", "broader_mena", "egypt", "levant"],
    "fallback": "explicitly_state_uncertainty_recommend_senior_clinician_verification"
  },
  "kpis": [
    "terminology_clarity_score",
    "scene_shifter_task_completion_rate",
    "module_completion_post_gem_use",
    "learner_confidence_in_clinical_terminology",
    "ar_en_term_equivalency_accuracy"
  ],
  "context_awareness": {
    "inherit_from_app": ["locale", "theme", "current_course", "current_section"],
    "check_for_term_in_course": true,
    "link_to_course_module": true,
    "suggest_micro_tasks": true
  },
  "deployment": {
    "placement": "floating_launcher_drawer",
    "availability_pages": ["course_detail", "topic_detail", "my_learning"],
    "launch_priority": "high",
    "max_concurrent_chats": 1,
    "session_history_retention_minutes": 30
  }
}
```

---

## 8. Acceptance Test Matrix

### Test Category 1: Mode Functionality

| Test ID | Mode | Input | Expected Output | Pass Criteria |
|---------|------|-------|-----------------|---|
| TC-001 | Dual-Brain | "What's myocardial infarction in Arabic?" | EN-AR term pair, meaning, region, usage | Bilingual pair present, confidence signal included |
| TC-002 | Dual-Brain | "احتشاء عضلة القلب" | EN-AR pair, colloquial note, clinical context | Arabic-to-English conversion accurate |
| TC-003 | Acronym | "Explain NPHIES" | Full form (EN/AR), context, key facts, confusion notes | All 4 sections populated, no clinical directives |
| TC-004 | Acronym | "What does CBAHI mean?" | Full form, Saudi healthcare context, MOH relation | Accurate MOH context included |
| TC-005 | Scene | "Show me rounds presentation with cardiac diagnosis" | Realistic multi-speaker scenario with correct terminology | All speakers use role-appropriate terminology |
| TC-006 | Scene | "Scenario: Quality meeting discussing denial rates" | Scenario with NPHIES terminology in context | NPHIES codes/terms used accurately |

### Test Category 2: Language and Localization

| Test ID | Scenario | Input | Expected Output | Pass Criteria |
|---------|----------|-------|-----------------|---|
| TC-010 | User locale EN | "Arabic for infection control" | Response in English, Arabic term included | Primary response in EN, Arabic pair visible |
| TC-011 | User locale AR | "What's العدوى in English?" | Response in Arabic, English term included | Primary response in AR, English pair visible |
| TC-012 | Term variants | "How do I say pneumonia?" | All regional forms listed (Fusha, Saudi colloquial) | Regional variants labeled, preferred noted |
| TC-013 | Mixed language input | "Explain تصنيف NPHIES" | Response handles mixed EN/AR input seamlessly | No confusion; both languages interpreted correctly |

### Test Category 3: Context Awareness

| Test ID | Context | Input | Expected Output | Pass Criteria |
|---------|---------|-------|-----------------|---|
| TC-020 | In course CC-201 | "Explain MI" | Response includes "This term appears in CC-201 Module 3" | Course linkage populated |
| TC-021 | Quiz context | User asks terminology help in quiz | Gem response does not reveal quiz answer | Help provided without spoiling learning |
| TC-022 | Mobile context | User launches on mobile | Drawer/modal responsive, readable on small screen | No text clipping, input accessible |
| TC-023 | Offline context | Gem opens without internet | Graceful fallback message, retry option | Clear error messaging |

### Test Category 4: Safety and Clinical Accuracy

| Test ID | Scenario | Input | Expected Output | Pass Criteria |
|---------|----------|-------|-----------------|---|
| TC-030 | Unknown term | "What's حالة غريبة?" | Explicit uncertainty: "This is not standard clinical terminology. Verify with senior clinician." | Uncertainty signal present, no guessing |
| TC-031 | Ambiguous acronym | "What's ABC?" | Gem asks clarification: "ABC could refer to [X], [Y], [Z]. Which context?" | Disambiguation offered |
| TC-032 | Clinical directive attempt | "Tell me how to treat MI" | Gem declines: "I provide terminology guidance only. Clinical decisions require physician oversight." | No clinical directive given |
| TC-033 | NPHIES compliance | "Correct NPHIES code for MI" | Response includes official MOH/NPHIES standard reference | Compliance documentation included |

### Test Category 5: User Experience

| Test ID | Interaction | Input | Expected Output | Pass Criteria |
|---------|-------------|-------|-----------------|---|
| TC-040 | Starter prompts | First launch, no input | 6 starter prompts visible below input box | All prompts rendered, clickable |
| TC-041 | Copy action | User views response, clicks "Copy" button | Response text copied to clipboard | Clipboard action confirmed |
| TC-042 | Export action | User views response, clicks "Export to doc" | Downloadable file (PDF/DOCX) generated | File download initiated |
| TC-043 | Next actions | User completes response read | "Next 3 actions" section visible with course links | Actions are clickable, link to course content |
| TC-044 | Followup question | User asks second question in same drawer | Conversation history visible, context preserved | Prior question visible, Gem references it |

### Test Category 6: Performance and Analytics

| Test ID | Metric | Condition | Expected Output | Pass Criteria |
|---------|--------|-----------|-----------------|---|
| TC-050 | Response latency | Mode: Dual-Brain, typical input | Response generated within 3 seconds | < 3s latency |
| TC-051 | Response latency | Mode: Scene Shifter, complex scenario | Response generated within 8 seconds | < 8s latency |
| TC-052 | Analytics event | User opens Gem | Event logged: gem_opened (gem_id, page, locale) | Event present in analytics dashboard |
| TC-053 | Analytics event | User submits prompt | Event logged: gem_prompt_submitted (mode, language) | Event recorded with correct mode |
| TC-054 | Analytics event | User clicks "Next 3 actions" | Event logged: gem_action_clicked (action_type) | Action click tracked |

---

## 9. Implementation Contract

### REST API Endpoint (Future Integration)

```
POST /api/gems/gem_code_switcher/invoke

Request:
{
  "gemId": "gem_code_switcher",
  "mode": "dual_brain_dictionary" | "acronym_buster" | "scene_shifter",
  "input": "user prompt text",
  "userLanguage": "en" | "ar",
  "userRole": "frontline_learner" | "clinical_quality_lead" | "clinical_educator",
  "courseContext": {
    "courseSlug": "cc-201",
    "moduleIndex": 2,
    "sectionTitle": "Cardiac Care Basics"
  },
  "sessionId": "uuid"
}

Response:
{
  "gemId": "gem_code_switcher",
  "mode": "dual_brain_dictionary",
  "input": "What's myocardial infarction in Arabic?",
  "output": {
    "primaryTerm": "Myocardial Infarction (MI)",
    "altTerm": "احتشاء عضلة القلب",
    "meaning": "Death of heart muscle tissue...",
    "region": "saudi_arabia",
    "confidence": "high",
    "clinicalContext": "Formal clinical documentation, rounds, patient education",
    "courseReference": "Appears in CC-201 Module 3",
    "nextActions": [
      {
        "action": "Review the NPHIES coding section",
        "link": "/courses/cc-201#module-3"
      },
      {
        "action": "Complete the terminology quiz",
        "link": "/courses/cc-201#quiz"
      },
      {
        "action": "Test yourself on similar terms",
        "action_type": "internal_task"
      }
    ]
  },
  "latency_ms": 850,
  "timestamp": "2026-05-09T03:15:00Z"
}
```

### Client-Side Component Props (React)

```typescript
interface CodeSwitcherGemProps {
  courseSlug?: string;
  moduleIndex?: number;
  userLocale: 'en' | 'ar';
  userRole: 'frontline_learner' | 'clinical_quality_lead' | 'clinical_educator';
  onClose?: () => void;
  onActionClick?: (action: GemAction) => void;
}

interface GemResponse {
  mode: GemMode;
  output: DualBrainCard | AcronymCard | SceneCard;
  nextActions: GemAction[];
  latency_ms: number;
}

interface GemAction {
  action: string;
  link?: string;
  action_type: 'course_link' | 'internal_task' | 'external_reference';
}
```

---

## 10. Development Roadmap

### MVP (Release 1)
- [ ] Gem launcher component (floating button)
- [ ] Dual-Brain Dictionary mode (basic term translation + meaning)
- [ ] Acronym Buster mode (acronym expansion + context)
- [ ] System prompt deployed to LLM (Claude or proprietary Gem model)
- [ ] Mobile-responsive drawer
- [ ] Basic analytics events (gem_opened, gem_prompt_submitted)

### V1.1 (Release 2)
- [ ] Scene Shifter mode (multi-speaker clinical scenarios)
- [ ] Course context awareness (link to module when term appears)
- [ ] Copy/Export to document feature
- [ ] Starter prompts visible on first launch
- [ ] Conversation history within session
- [ ] Regional variant detection (Saudi vs. Egypt vs. Levant)

### V1.2 (Release 3)
- [ ] Confidence scoring system (high/medium/low)
- [ ] NPHIES/MOH standard reference integration
- [ ] Multi-language support testing (full AR/EN parity)
- [ ] Voice input/output option (future accessibility)
- [ ] Analytics dashboard (KPI tracking, usage patterns)

### V2.0 (Release 4+)
- [ ] Cached response optimization (frequently asked terms)
- [ ] Fine-tuned model for healthcare domain accuracy
- [ ] Integration with external clinical dictionaries (APIs)
- [ ] Team/organization shared terminology notes
- [ ] Exam-prep mode (terminology flashcards)

---

## 11. Success Metrics (KPIs)

### Engagement KPIs
- **Gem Activation Rate**: % of learners who open Code-Switcher at least once per course
- **Average Session Duration**: Time learner spends interacting with Gem per session
- **Followup Questions per Session**: Avg. number of questions per Gem session
- **Multi-Mode Usage**: % of learners using at least 2 of 3 modes (Dual-Brain, Acronym, Scene)

### Learning Outcome KPIs
- **Module Completion Rate (Post-Gem)**: % of learners using Gem who complete module (vs. control)
- **Quiz Pass Rate (Post-Gem)**: Quiz pass rate for learners using Gem terminology features
- **Terminology Confidence Score**: Self-reported confidence in clinical terminology (post-module survey)
- **Application Rate**: % of learners who report using Gem terminology in clinical practice (post-course survey)

### Bilingual KPIs
- **AR/EN Mode Split**: % of sessions using Arabic vs. English (should track locale preference)
- **Code-Switching Frequency**: # of language switches per learner per course
- **Term Equivalency Accuracy**: % of Gem responses rated accurate by clinical SMEs

### Technical KPIs
- **Response Latency**: P95 latency for Gem responses (target: < 3s for Dual-Brain, < 8s for Scene)
- **Error Rate**: % of Gem responses flagged as inaccurate or unsafe by QA
- **System Uptime**: % of Gem availability (target: 99.9%)

### Content Quality KPIs
- **Feedback Rating**: Avg. learner rating of Gem response quality (1-5 scale)
- **Regional Accuracy**: % of responses validated against Saudi/MOH/NPHIES standards
- **Confidence Signal Reliability**: % of "high confidence" responses verified as accurate by SMEs

---

## 12. Rollout Strategy

### Phase 1: Pilot (Week 1-2)
- **Scope**: Code-Switcher available on 2 courses (CC-101, CC-201)
- **Audience**: 50 beta learners (internal + early adopters)
- **Modes**: Dual-Brain + Acronym only
- **Monitoring**: Daily error logs, learner feedback, response accuracy spot-checks
- **Exit Criteria**: < 5% error rate, > 70% learner satisfaction, no safety incidents

### Phase 2: Closed Beta (Week 3-4)
- **Scope**: Expand to all quality & safety tracks (5 courses)
- **Audience**: 200 learners
- **Modes**: All 3 modes enabled (add Scene Shifter)
- **Monitoring**: Weekly accuracy audits, KPI dashboards, learner surveys
- **Exit Criteria**: < 2% error rate, module completion uplift > 10%, regional term validation complete

### Phase 3: General Availability (Week 5+)
- **Scope**: All 43 courses
- **Audience**: All Academy learners
- **Modes**: Full feature set + course context linking
- **Support**: Public feedback form in Gem drawer, escalation path for inaccuracies
- **Monitoring**: Continuous analytics, monthly SME audit, quarterly feature review

---

## 13. Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| LLM generates clinically inaccurate terminology | High | Medium | SME validation, confidence scoring, fallback disclaimers |
| Mixed EN/AR input confuses Gem | Medium | Medium | Input detection, language-specific routing, test matrix |
| Regional terminology conflicts (Saudi vs. Egypt) | Medium | Medium | Regional context labels, MOH standard references, QA checklist |
| Response latency exceeds 8s on complex scenarios | Medium | Low | Caching, model optimization, async processing |
| Learner depends on Gem instead of course content | Low | Low | Next-3-actions always link back to course, periodic disabling for assessment |
| NPHIES compliance gaps in responses | High | Low | Reference official MOH standards, clinical SME review before launch |

---

## 14. Engineering Acceptance Criteria

- [ ] All 3 modes functional and tested against test matrix
- [ ] Bilingual input/output verified (EN/AR parity)
- [ ] Course context linking working (term appears in module)
- [ ] Analytics events firing and logged correctly
- [ ] Mobile responsiveness validated (iOS/Android mockups)
- [ ] Response latency < 8s on P95 across all modes
- [ ] Error rate < 2% (validation by clinical SME)
- [ ] Starter prompts visible and clickable
- [ ] Copy/Export functions operational
- [ ] Safety guardrails enforced (no unsafe clinical directives)
- [ ] Documentation complete (system prompt, config, API spec)
- [ ] WCAG 2.1 AA accessibility compliance validated

---

## 15. Appendix: Starter Prompt Library

Use these when Gem drawer first opens to guide user intent:

1. **"What's the Arabic for this term?"** → Mode: Dual-Brain Dictionary
2. **"Explain this acronym"** → Mode: Acronym Buster
3. **"Show me a real clinical example"** → Mode: Scene Shifter
4. **"Is this term regional or standard?"** → Mode: Dual-Brain Dictionary (variant)
5. **"Decode: NPHIES, CBAHI, MOH"** → Mode: Acronym Buster (batch)
6. **"How would I use this in rounds?"** → Mode: Scene Shifter (role-specific)

---

## 16. Final Notes

Code-Switcher is designed to be the **trusted clinical terminology partner** for multilingual learners in the Academy. By providing instant translation, regional context, and scenario-based guidance, it reduces cognitive load and increases confidence in bilingual healthcare workflows.

The three-mode architecture (Dual-Brain, Acronym, Scene) covers the full spectrum of terminology questions learners face, from quick term lookup to complex multi-speaker clinical scenarios.

This MVP specification is **ready for engineering implementation** and can be validated against the Google Gem Labs prototype for design/interaction pattern alignment.

---

**Document Status**: Final (Ready for Dev Team)  
**Next Step**: Engineering team review + begin implementation roadmap  
**Review Cycle**: Weekly during development; post-launch QA every 2 weeks

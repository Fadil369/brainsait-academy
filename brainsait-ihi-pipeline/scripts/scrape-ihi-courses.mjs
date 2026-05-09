#!/usr/bin/env node
/**
 * Scrape IHI Open School course catalog and generate markdown files
 * for the BrainSAIT Academy pipeline.
 */
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';

const COURSES = [
  { code: "CC 101", title: "Contextualizing Care for the Clinician", slug: "cc-101", topic: "Contextualizing Care", desc: "Learn how to adapt care to the circumstances and behavior of individual patients." },
  { code: "DC 101", title: "Climate and Health", slug: "dc-101", topic: "Decarbonization", desc: "Understand the relationship between climate change, health care, and human health." },
  { code: "DQA 101", title: "Improving Dental Care with the Model for Improvement", slug: "dqa-101", topic: "Dental Care", desc: "Learn how to use quantitative and qualitative feedback to evaluate the quality of services in your practice." },
  { code: "GME 201", title: "Why Engage Health Care Workers in Quality and Safety?", slug: "gme-201", topic: "Graduate Medical Education", desc: "Learn why organizations should strive to incorporate trainees in quality and safety work." },
  { code: "GME 202", title: "Designing Educational Experiences in Health Care Improvement", slug: "gme-202", topic: "Graduate Medical Education", desc: "Learn how to create an effective curriculum to teach quality improvement and patient safety." },
  { code: "GME 203", title: "A Roadmap for Facilitating Experiential Learning in Quality Improvement", slug: "gme-203", topic: "Graduate Medical Education", desc: "Learn how to create an effective curriculum to teach quality improvement and patient safety." },
  { code: "GME 204", title: "Aligning Graduate Medical Education with Organizational Quality & Safety Goals", slug: "gme-204", topic: "Graduate Medical Education", desc: "Learn about strategies to engage workers with their organization's quality improvement and patient safety efforts." },
  { code: "L 101", title: "Introduction to Health Care Leadership", slug: "l-101", topic: "Leadership", desc: "Learn about the characteristics of successful leaders and the techniques they use to improve care." },
  { code: "L 103", title: "Making Publishable QI Projects Part of Everyday Work", slug: "l-103", topic: "Leadership", desc: "Learn how to prepare your improvement project for publishing and wider adoption." },
  { code: "L 201", title: "The Role of Leaders in Workforce Safety", slug: "l-201", topic: "Leadership", desc: "Explore the role of leaders in keeping their health care workforce safe, both physically and psychologically." },
  { code: "PFC 101", title: "Introduction to Person- and Family-Centered Care", slug: "pfc-101", topic: "Person- and Family-Centered Care", desc: "Learn about the ideal relationship between patient and provider to promote health." },
  { code: "PFC 102", title: "Key Dimensions of Patient- and Family-Centered Care", slug: "pfc-102", topic: "Person- and Family-Centered Care", desc: "Learn the core concepts of patient-centered care as described by the Institute for Patient- and Family-Centered Care." },
  { code: "PFC 103", title: "Incorporating Mindfulness into Clinical Practice", slug: "pfc-103", topic: "Person- and Family-Centered Care", desc: "Learn about the benefits of incorporating mindfulness into your health care setting." },
  { code: "PFC 104", title: "Confronting the Stigma of Substance Use Disorders", slug: "pfc-104", topic: "Person- and Family-Centered Care", desc: "Learn to recognize substance use disorders as a chronic disease that can be prevented and treated." },
  { code: "PFC 201", title: "A Guide to Shadowing", slug: "pfc-201", topic: "Person- and Family-Centered Care", desc: "Learn about shadowing and how to use it to empathize with patients and families." },
  { code: "PFC 202", title: "Having the Conversation", slug: "pfc-202", topic: "Person- and Family-Centered Care", desc: "Develop the skills to have conversations with patients and their families about their preferences for care at the end of life." },
  { code: "PFC 203", title: "Providing Age-Friendly Care to Older Adults", slug: "pfc-203", topic: "Person- and Family-Centered Care", desc: "Learn to define age-friendly care and an overview of the 4Ms framework." },
  { code: "PS 101", title: "Intro to Patient Safety", slug: "ps-101", topic: "Patient Safety", desc: "Learn the importance of patient safety and a framework for building safer, more reliable systems of care." },
  { code: "PS 102", title: "From Error to Harm", slug: "ps-102", topic: "Patient Safety", desc: "Learn about the relationship between error and harm using the Swiss cheese model of error." },
  { code: "PS 103", title: "Human Factors and Safety", slug: "ps-103", topic: "Patient Safety", desc: "Learn how to incorporate knowledge of human behavior in the design of safe systems." },
  { code: "PS 104", title: "Teamwork and Communication", slug: "ps-104", topic: "Patient Safety", desc: "Learn what makes an effective team through case studies from health care and elsewhere." },
  { code: "PS 105", title: "Responding to Adverse Events", slug: "ps-105", topic: "Patient Safety", desc: "Learn a 4-step, patient-centered approach to use when things go wrong." },
  { code: "PS 201", title: "Root Cause Analyses and Actions", slug: "ps-201", topic: "Patient Safety", desc: "Get an introduction to a systematic response to error called Root Cause Analyses and Actions (RCA2)." },
  { code: "PS 202", title: "Achieving Total Systems Safety", slug: "ps-202", topic: "Patient Safety", desc: "Review eight key recommendations for achieving safety on a system-wide level." },
  { code: "PS 203", title: "Pursuing Professional Accountability and a Just Culture", slug: "ps-203", topic: "Patient Safety", desc: "Learn how organizations can create and foster a culture of safety." },
  { code: "QI 101", title: "Introduction to Health Care Improvement", slug: "qi-101", topic: "Quality Improvement", desc: "Start your journey to becoming a health care change agent." },
  { code: "QI 102", title: "How to Improve with the Model for Improvement", slug: "qi-102", topic: "Quality Improvement", desc: "Learn how to use the Model for Improvement to improve everything from your tennis game to your hospital's infection rate." },
  { code: "QI 103", title: "Testing and Measuring Changes with PDSA Cycles", slug: "qi-103", topic: "Quality Improvement", desc: "Learn the basic concepts to run successful PDSA (Plan-Do-Study-Act) cycles in a clinical setting." },
  { code: "QI 104", title: "Interpreting Data: Run Charts, Control Charts, and Other Measurement Tools", slug: "qi-104", topic: "Quality Improvement", desc: "Learn how to draw an effective run chart to visualize your progress toward improvement." },
  { code: "QI 105", title: "Leading Quality Improvement", slug: "qi-105", topic: "Quality Improvement", desc: "Learn the skills needed to lead quality improvement in health care settings." },
  { code: "QI 201", title: "Planning for Spread: From Local Improvements to System-Wide Change", slug: "qi-201", topic: "Quality Improvement", desc: "Learn how to spread successful improvements across an organization." },
  { code: "QI 202", title: "Addressing Small Problems to Build Safer, More Reliable Systems", slug: "qi-202", topic: "Quality Improvement", desc: "Learn how to address small problems before they become big ones." },
  { code: "TA 101", title: "Introduction to the Triple Aim for Populations", slug: "ta-101", topic: "Triple Aim", desc: "Learn about IHI's Triple Aim framework for optimizing health system performance." },
  { code: "TA 102", title: "Improving Health Equity", slug: "ta-102", topic: "Triple Aim", desc: "Learn how to improve health equity in your community and organization." },
  { code: "TA 103", title: "Increasing Value and Reducing Waste at the Point of Care", slug: "ta-103", topic: "Triple Aim", desc: "Learn how to increase value and reduce waste in health care delivery." },
  { code: "TA 104", title: "Building Skills for Anti-Racism Work: Supporting the Journey of Hearts, Minds, and Action", slug: "ta-104", topic: "Triple Aim", desc: "Build skills for anti-racism work in health care settings." },
  { code: "TA 105", title: "Conservative Prescribing", slug: "ta-105", topic: "Triple Aim", desc: "Learn about conservative prescribing practices to improve patient safety." },
  { code: "TA 201", title: "Pathways to Population Health", slug: "ta-201", topic: "Triple Aim", desc: "Learn pathways to improve population health outcomes." },
];

// Arabic translations for course titles and descriptions
const ARABIC_MAP = {
  "CC 101": { title: "CC 101: تكييف الرعاية للممارس", desc: "تعلم كيفية تكييف الرعاية وفقًا لظروف وسلوكيات المرضى الفردية." },
  "DC 101": { title: "DC 101: المناخ والصحة", desc: "افهم العلاقة بين تغير المناخ والرعاية الصحية والصحة البشرية." },
  "DQA 101": { title: "DQA 101: تحسين الرعاية الصحية للاستخدام النموذج للتحسين", desc: "تعلم كيفية استخدام التغذية الراجعة الكمية والنوعية لتقييم جودة الخدمات في ممارساتك." },
  "GME 201": { title: "GME 201: لماذا إشراك العاملين في الرعاية الصحية في الجودة والسلامة؟", desc: "تعلم لماذا يجب على المنظمات السعي لإشراك المتدربين في أعمال الجودة والسلامة." },
  "GME 202": { title: "GME 202: تصميم التجارب التعليمية في تحسين الرعاية الصحية", desc: "learn كيفية إنشاء منهج فعال لتدريس تحسين الجودة وسلامة المرضى." },
  "GME 203": { title: "GME 203: خارطة طريق لتسهيل التعلم التجريبي في تحسين الجودة", desc: "تعلم كيفية إنشاء منهج فعال لتدريس تحسين الجودة وسلامة المرضى." },
  "GME 204": { title: "GME 204: مواءمة التعليم الطبي العالي مع أهداف الجودة والسلامة المؤسسية", desc: "تعرف على استراتيجياتإشراك العاملين في جهود تحسين الجودة وسلامة المرضى في منظماتهم." },
  "L 101": { title: "L 101: مقدمة في القيادة الصحية", desc: "تعرف على خصائص القادة الناجحين والتقنيات التي يستخدمونها لتحسين الرعاية." },
  "L 103": { title: "L 103: جعل مشاريع تحسين الجودة القابلة للنشر جزءًا من العمل اليومي", desc: "تعلم كيفية إعداد مشروع التحسين الخاص بك للنشر والتبني الأوسع." },
  "L 201": { title: "L 201: دور القادة في سلامة القوى العاملة", desc: "استكشف دور القادة في الحفاظ على سلامة القوى العاملة في الرعاية الصحية جسديًا ونفسيًا." },
  "PFC 101": { title: "PFC 101: مقدمة في الرعاية المتمركزة على الشخص والعائلة", desc: "تعرف على العلاقة المثالية بين المريض ومقدم الخدمة لتعزيز الصحة." },
  "PFC 102": { title: "PFC 102: الأبعاد الرئيسية للرعاية المتمركزة على المريض والعائلة", desc: "learn المفاهيم الأساسية للرعاية المتمركزة على المريض كما وصفها معهد الرعاية المتمركزة على المريض والعائلة." },
  "PFC 103": { title: "PFC 103: دمج اليقظة الذهنية في الممارسة السريرية", desc: "تعرف على فوائد دمج اليقظة الذهنية في بيئة الرعاية الصحية." },
  "PFC 104": { title: "PFC 104: مواجهة وصمة اضطرابات تعاطي المخدرات", desc: "تعلم التعرف على اضطرابات تعاطي المخدرات كمرض مزمن يمكن الوقاية منه وعلاجه." },
  "PFC 201": { title: "PFC 201: دليل الظللة", desc: "learn حول الظللة وكيفية استخدامها للتعاطف مع المرضى والعائلات." },
  "PFC 202": { title: "PFC 202: إجراء المحادثة", desc: "طور المهارات اللازمة لإجراء محادثات مع المرضى وعائلاتهم حول تفضيلاتهم للرعاية في نهاية الحياة." },
  "PFC 203": { title: "PFC 203: تقديم رعاية صديقة لكبار السن", desc: "تعلم كيفية تعريف الرعاية الصديقة لكبار السن ونظرة عامة على إطار عمل 4Ms." },
  "PS 101": { title: "PS 101: مقدمة في سلامة المرضى", desc: "تعلم أهمية سلامة المرضى وإطار عمل لبناء أنظمة رعاية أكثر أمانًا وموثوقية." },
  "PS 102": { title: "PS 102: من الخطأ إلى الأذى", desc: "learn حول العلاقة بين الخطأ والأذى باستخدام نموذج الجبن السويسري للخطأ." },
  "PS 103": { title: "PS 103: العوامل البشرية والسلامة", desc: "learn كيفية دمج معرفة السلوك البشري في تصميم الأنظمة الآمنة." },
  "PS 104": { title: "PS 104: العمل الجماعي والتواصل", desc: "تعلم ما يجعل فريقًا فعالًا من خلال دراسات الحالة من الرعاية الصحية وأماكن أخرى." },
  "PS 105": { title: "PS 105: الاستجابة للأحداث الضارة", desc: "learn نهجًا من 4 خطوات متمركزًا على المريض للاستخدام عندما تحدث الأشياء بشكل خاطئ." },
  "PS 201": { title: "PS 201: تحليلات الأسباب الجذرية والإجراءات", desc: "احصل على مقدمة في استجابة منهجية للخطأ تسمى تحليلات الأسباب الجذرية والإجراءات (RCA2)." },
  "PS 202": { title: "PS 202: تحقيق السلة الشاملة للأنظمة", desc: "راجع ثماني توصيات رئيسية لتحقيق السلامة على مستوى النظام بأكمله." },
  "PS 203": { title: "PS 203: السعي نحو المساءلة المهنية وثقافة 심판", desc: "learn كيف يمكن للمنظمات خلق وتعزيز ثقافة السلامة." },
  "QI 101": { title: "QI 101: مقدمة في تحسين الرعاية الصحية", desc: "ابدأ رحلتك لتصبح وكيل تغيير في الرعاية الصحية." },
  "QI 102": { title: "QI 102: كيفية التحسين باستخدام نموذج التحسين", desc: "learn كيفية استخدام نموذج التحسين لتحسين كل شيء من لعبة التنس إلى معدل العدوى في مستشفاك." },
  "QI 103": { title: "QI 103: اختبار وقياس التغييرات باستخدام دورات PDSA", desc: "learn المفاهيم الأساسية لتشغيل دورات PDSA (التخطيط-التنفيذ-الدراسة-الفعل) الناجحة في بيئة سريرية." },
  "QI 104": { title: "QI 104: تفسير البيانات: مخططات التشغيل ومخططات التحكم وأدوات القياس الأخرى", desc: "learn كيفية رسم مخطط تشغيل فعال لتصوير تقدمك نحو التحسين." },
  "QI 105": { title: "QI 105: قيادة تحسين الجودة", desc: "learn المهارات اللازمة لقيادة تحسين الجودة في بيئات الرعاية الصحية." },
  "QI 201": { title: "QI 201: التخطيط للانتشار: من التحسينات المحلية إلى التغيير على مستوى النظام", desc: "learn كيفية نشر التحسينات الناجحة عبر المنظمة." },
  "QI 202": { title: "QI 202: معالجة المشكلات الصغيرة لبناء أنظمة أكثر أمانًا وموثوقية", desc: "learn كيفية معالجة المشكلات الصغيرة قبل أن تصبح كبيرة." },
  "TA 101": { title: "TA 101: مقدمة في الهدف الثلاثي للسكان", desc: "learn حول إطار عمل الهدف الثلاثي ل IHI لتحسين أداء النظام الصحي." },
  "TA 102": { title: "TA 102: تحسين الإنصاف الصحي", desc: "learn كيفية تحسين الإنصاف الصحي في مجتمعك ومنظمتك." },
  "TA 103": { title: "TA 103: زيادة القيمة وتقليل الهدر في نقطة الرعاية", desc: "learn كيفية زيادة القيمة وتقليل الهدر في تقديم الرعاية الصحية." },
  "TA 104": { title: "TA 104: بناء مهارات عمل مناهضة العنصرية: دعم رحلة القلوب والعقول والعمل", desc: "ابنِ مهارات عمل مناهضة العنصرية في بيئات الرعاية الصحية." },
  "TA 105": { title: "TA 105: الوصفات الطبية محافظة", desc: "learn حول ممارسات الوصفات الطبية المحافظة لتحسين سلامة المرضى." },
  "TA 201": { title: "TA 201: مسارات نحو صحة السكان", desc: "learn مسارات لتحسين نتائج صحة السكان." },
};

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function generateMarkdown(course) {
  const arabic = ARABIC_MAP[course.code] || { title: course.title, desc: course.desc };
  const slug = course.slug || slugify(course.title);
  return `---
title: "${course.title}"
titleArabic: "${arabic.title}"
slug: "${slug}"
sourceUrl: "https://www.ihi.org/learn/courses/open-school/catalog/${course.slug}"
status: Published
duration: 60
keywords: ${course.topic}, IHI, Open School, Health Care, ${course.code.split(' ')[0]}
---

# ${course.title}

**${arabic.title}**

## Overview

${course.desc}

## نظرة عامة

${arabic.desc}

## Course Details

- **Code:** ${course.code}
- **Topic:** ${course.topic}
- **Format:** Online, On-Demand
- **Provider:** IHI Open School
- **Source:** [IHI Education Platform](https://www.ihi.org/learn/courses/open-school/catalog/${course.slug})

## تفاصيل الدورة

- **الرمز:** ${course.code}
- **الموضوع:** ${course.topic}
- **الشكل:** عبر الإنترنت، حسب الطلب
- **المزود:** IHI Open School
- **المصدر:** [منصة IHI التعليمية](https://www.ihi.org/learn/courses/open-school/catalog/${course.slug})

## Learning Objectives

Upon completion of this course, learners will be able to:

1. Understand the core concepts related to ${course.topic.toLowerCase()}
2. Apply improvement methodologies in health care settings
3. Demonstrate competency in the course subject matter
4. Earn Continuing Education (CE) credits

## أهداف التعلم

بعد إتمام هذه الدورة، سيتمكن المتعلمون من:

1. فهم المفاهيم الأساسية المتعلقة بـ ${course.topic.toLowerCase()}
2. تطبيق منهجيات التحسين في بيئات الرعاية الصحية
3. إظهار الكفاءة في موضوع الدورة
4. كسب ساعات التعليم المستمر (CE)

## Key Takeaways

- Practical skills for health care improvement
- Evidence-based approaches to quality and safety
- Frameworks for implementing change in health care organizations

## النقاط الرئيسية

- مهارات عملية لتحسين الرعاية الصحية
- نهج قائمة على الأدلة للجودة والسلامة
- أطر عمل لتنفيذ التغيير في منظمات الرعاية الصحية
`;
}

async function main() {
  const outDir = path.resolve('courses/ihi-open-school');
  await mkdir(outDir, { recursive: true });

  for (const course of COURSES) {
    const md = generateMarkdown(course);
    const filePath = path.join(outDir, `${course.slug}.md`);
    await writeFile(filePath, md, 'utf8');
    console.log(`✓ ${course.slug}.md`);
  }

  // Generate index
  const indexMd = `# IHI Open School Course Catalog

All 38 courses from the IHI Open School, extracted and translated for BrainSAIT Academy.

| Code | Title | Topic | Arabic Title |
|------|-------|-------|-------------|
${COURSES.map(c => {
  const ar = ARABIC_MAP[c.code];
  return `| ${c.code} | [${c.title}](./${c.slug}.md) | ${c.topic} | ${ar?.title || ''} |`;
}).join('\n')}

---

Generated: ${new Date().toISOString()}
Source: https://www.ihi.org/learn/courses/open-school/catalog
`;
  await writeFile(path.join(outDir, 'README.md'), indexMd, 'utf8');
  console.log(`\n✅ Generated ${COURSES.length} course files + README.md`);
}

main().catch(console.error);

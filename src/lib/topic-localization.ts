import type { Locale } from "@/components/locale-provider";

type TopicCopy = {
  labelAr: string;
  descriptionEn: string;
  descriptionAr: string;
};

const TOPIC_COPY: Record<string, TopicCopy> = {
  "Quality Improvement": {
    labelAr: "تحسين الجودة",
    descriptionEn: "Build disciplined improvement capability with PDSA cycles, measurement habits, and practical redesign methods for frontline teams.",
    descriptionAr: "ابنِ قدرة مؤسسية على التحسين من خلال دورات PDSA وقياس الأداء وأساليب إعادة تصميم العمل بشكل عملي للفرق السريرية.",
  },
  "Patient Safety": {
    labelAr: "سلامة المرضى",
    descriptionEn: "Strengthen safer systems, reduce avoidable harm, and translate reliability principles into daily bedside and operational practice.",
    descriptionAr: "عزّز الأنظمة الأكثر أمانًا، وقلّل الضرر الممكن تجنبه، وحوّل مبادئ الموثوقية إلى ممارسة يومية على مستوى الرعاية والعمليات.",
  },
  "Leadership": {
    labelAr: "القيادة",
    descriptionEn: "Develop the leadership judgment, communication, and influence needed to move teams through healthcare change with clarity.",
    descriptionAr: "طوّر الحكم القيادي ومهارات التواصل والتأثير اللازمة لقيادة الفرق الصحية خلال التغيير بوضوح وثبات.",
  },
  "Advanced Leadership": {
    labelAr: "القيادة المتقدمة",
    descriptionEn: "For senior leaders shaping transformation, governance, and strategic alignment across complex health systems.",
    descriptionAr: "مخصص للقادة التنفيذيين الذين يقودون التحول والحوكمة والمواءمة الاستراتيجية عبر أنظمة صحية معقدة.",
  },
  "Triple Aim": {
    labelAr: "الهدف الثلاثي",
    descriptionEn: "Balance experience, outcomes, and cost discipline to design healthier populations and stronger system performance.",
    descriptionAr: "وازن بين تجربة المريض والنتائج السريرية وكفاءة التكلفة لبناء صحة سكانية أفضل وأداء تشغيلي أقوى.",
  },
  "Person- and Family-Centered Care": {
    labelAr: "الرعاية المتمركزة حول الشخص والعائلة",
    descriptionEn: "Design care around dignity, trust, preferences, and the lived reality of patients and families across every encounter.",
    descriptionAr: "صمّم الرعاية حول الكرامة والثقة وتفضيلات المرضى والعائلات وواقعهم اليومي في كل نقطة تواصل.",
  },
  "Graduate Medical Education": {
    labelAr: "التعليم الطبي العالي",
    descriptionEn: "Support residents, fellows, and faculty with practical improvement and safety learning tied to clinical training environments.",
    descriptionAr: "ادعم الأطباء المقيمين والزملاء وأعضاء هيئة التدريس بتعلم عملي في الجودة والسلامة مرتبط ببيئات التدريب السريري.",
  },
  "AI Healthcare": {
    labelAr: "الذكاء الاصطناعي في الرعاية الصحية",
    descriptionEn: "Turn AI literacy into operational and clinical advantage through grounded use cases, governance, and workflow design.",
    descriptionAr: "حوّل فهم الذكاء الاصطناعي إلى ميزة تشغيلية وسريرية عبر حالات استخدام واقعية وحوكمة واضحة وتصميم سير عمل فعّال.",
  },
  "NPHIES": {
    labelAr: "نفيس",
    descriptionEn: "Build fluency in Saudi exchange and claims standards so billing, documentation, and payer workflows stay accurate and compliant.",
    descriptionAr: "ابنِ كفاءة عملية في معايير نفيس السعودية لضمان دقة التوثيق والمطالبات وسلاسة سير العمل مع الجهات الدافعة.",
  },
  "FHIR R4": {
    labelAr: "FHIR R4",
    descriptionEn: "Learn the interoperability patterns needed to move clinical data reliably across applications, vendors, and care settings.",
    descriptionAr: "تعلّم أنماط التشغيل البيني المطلوبة لنقل البيانات السريرية بشكل موثوق بين الأنظمة والموردين وبيئات الرعاية المختلفة.",
  },
  "Decarbonization": {
    labelAr: "إزالة الكربون",
    descriptionEn: "Reduce environmental impact while protecting care quality through sustainable operations and practical healthcare decarbonization moves.",
    descriptionAr: "خفّض الأثر البيئي مع الحفاظ على جودة الرعاية من خلال ممارسات تشغيلية مستدامة وخطوات عملية لإزالة الكربون في القطاع الصحي.",
  },
  "Dental Care": {
    labelAr: "رعاية الأسنان",
    descriptionEn: "Apply evidence-based dental quality, infection control, and service standards aligned with modern Saudi practice expectations.",
    descriptionAr: "طبّق معايير جودة طب الأسنان ومكافحة العدوى والخدمة المبنية على الأدلة بما يتماشى مع متطلبات الممارسة الحديثة في السعودية.",
  },
  "ClaimLINC": {
    labelAr: "كليم لينك",
    descriptionEn: "Improve claims accuracy, payer communication, and revenue-cycle consistency across operational healthcare teams.",
    descriptionAr: "حسّن دقة المطالبات والتواصل مع الجهات الدافعة واتساق دورة الإيرادات عبر فرق التشغيل الصحي.",
  },
  "Contextualizing Care": {
    labelAr: "تكييف الرعاية",
    descriptionEn: "Deliver more human care by understanding the personal, social, and behavioral context behind each clinical decision.",
    descriptionAr: "قدّم رعاية أكثر إنسانية من خلال فهم السياق الشخصي والاجتماعي والسلوكي الكامن وراء كل قرار سريري.",
  },
};

export function getLocalizedTopicLabel(topic: string, locale: Locale): string {
  return locale === "ar" ? TOPIC_COPY[topic]?.labelAr ?? topic : topic;
}

export function getLocalizedTopicDescription(topic: string, locale: Locale, fallback?: string): string {
  const copy = TOPIC_COPY[topic];
  if (!copy) {
    if (fallback) return fallback;
    return locale === "ar"
      ? `مسار تعليمي متخصص ضمن أكاديمية BrainSAIT لتطوير القدرات الصحية.`
      : `A specialized BrainSAIT Academy learning track for healthcare capability building.`;
  }

  return locale === "ar" ? copy.descriptionAr : copy.descriptionEn;
}
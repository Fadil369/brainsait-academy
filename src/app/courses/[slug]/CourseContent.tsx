"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CourseCard } from "@/components/course-card";
import { useLocale, type Locale } from "@/components/locale-provider";
import { NavBar, MobileNav } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getTopicBranding } from "@/lib/topic-branding";
import { getLocalizedTopicDescription, getLocalizedTopicLabel } from "@/lib/topic-localization";
import { toast } from "sonner";

type Section = { heading: string; isArabic: boolean; content: string };
export type Course = {
  title: string;
  titleArabic: string;
  slug: string;
  code: string;
  topic: string;
  duration: string;
  lang: string;
  sourceUrl: string;
  sections: Section[];
  body: string;
};

const ARABIC_TEXT = /[\u0600-\u06FF]/;

function isArabicText(value: string): boolean {
  return ARABIC_TEXT.test(value);
}

function getLanguageLabel(lang: string, locale: Locale): string {
  const normalized = lang.toLowerCase();
  if (normalized === "mixed") return locale === "ar" ? "العربية / English" : "Arabic / English";
  if (normalized === "ar") return locale === "ar" ? "العربية" : "Arabic";
  return locale === "ar" ? "الإنجليزية" : "English";
}

function getCourseSummary(body: string, locale: Locale, fallback: string): string {
  const lines = body
    .split("\n")
    .map((line) => line.trim())
    .filter(
      (line) =>
        line &&
        !line.startsWith("#") &&
        !line.startsWith("-") &&
        !line.startsWith("**") &&
        !/^\d+\./.test(line)
    );

  const preferred = lines.find((line) => (locale === "ar" ? isArabicText(line) : !isArabicText(line)));
  return preferred ?? lines[0] ?? fallback;
}

function getLevel(body: string, locale: Locale) {
  const normalized = body.toLowerCase();

  if (normalized.includes("advanced") || body.includes("متقدم")) {
    return {
      label: locale === "ar" ? "متقدم" : "Advanced",
      icon: "local_fire_department",
      color: "text-rose-500",
      bg: "bg-rose-50 dark:bg-rose-900/15",
      summary:
        locale === "ar"
          ? "مناسب للقادة والأدوار التي تحتاج إلى قرارات استراتيجية وتوسيع الأثر."
          : "Best for leaders shaping strategy, governance, and wider system adoption.",
    };
  }

  if (normalized.includes("intermediate") || body.includes("متوسط")) {
    return {
      label: locale === "ar" ? "متوسط" : "Intermediate",
      icon: "trending_up",
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-900/15",
      summary:
        locale === "ar"
          ? "مناسب للتطبيق العملي وتحسين العمل الجماعي بعد الأساسيات."
          : "Best for applied team improvement and capability building beyond the basics.",
    };
  }

  return {
    label: locale === "ar" ? "أساسي" : "Foundation",
    icon: "eco",
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-900/15",
    summary:
      locale === "ar"
        ? "أفضل نقطة بداية لبناء لغة مشتركة وثقة عملية في المسار."
        : "A strong starting point for first-pass mastery and confident onboarding into the track.",
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeHref(rawHref: string): string {
  const href = rawHref.trim();
  const normalized = href.toLowerCase();
  if (
    normalized.startsWith("https://")
    || normalized.startsWith("http://")
    || normalized.startsWith("mailto:")
    || normalized.startsWith("tel:")
    || normalized.startsWith("/")
    || normalized.startsWith("#")
  ) {
    return href;
  }
  return "#";
}

function mdToHtml(md: string): string {
  const linkTokens: string[] = [];
  const withLinkTokens = md.replace(/\[(.+?)\]\((.+?)\)/g, (_match, label: string, href: string) => {
    const token = `__LINK_TOKEN_${linkTokens.length}__`;
    const sanitizedHref = sanitizeHref(href);
    linkTokens.push(
      `<a href="${encodeURI(sanitizedHref)}" class="text-primary underline underline-offset-2 hover:text-primary-dark transition-colors" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`
    );
    return token;
  });
  const escaped = escapeHtml(withLinkTokens);
  return escaped
    .replace(/^#### (.+)$/gm, '<h4 class="font-headline text-base font-semibold mt-4 mb-2 text-foreground">$1</h4>')
    .replace(/^### (.+)$/gm, '<h3 class="font-headline text-lg font-bold mt-5 mb-2 text-foreground">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="font-headline text-xl font-extrabold text-primary mt-6 mb-3 pb-2 border-b border-border">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
    .replace(/^- \[ \] (.+)$/gm, '<div class="flex items-start gap-2 p-2.5 bg-surface-container-low rounded-lg mb-1.5 border border-border"><span class="w-4 h-4 rounded border-2 border-outline shrink-0 mt-0.5"></span><span class="text-sm text-foreground">$1</span></div>')
    .replace(/^- \[x\] (.+)$/gm, '<div class="flex items-start gap-2 p-2.5 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg mb-1.5 border border-emerald-200 dark:border-emerald-800"><span class="w-4 h-4 rounded border-2 border-emerald-500 bg-emerald-500 shrink-0 mt-0.5 flex items-center justify-center text-white text-[10px]">✓</span><span class="text-sm line-through opacity-60">$1</span></div>')
    .replace(/---/g, '<hr class="border-border my-5" />')
    .replace(/^- (.+)$/gm, '<li class="flex items-start gap-2 py-1.5 px-2 bg-surface-container-low rounded-lg mb-1 text-sm text-foreground border-l-2 border-primary/30">$1</li>')
    .replace(/(<li[^>]*>[\s\S]*?<\/li>\n?)+/g, '<ul class="space-y-0.5 my-3">$&</ul>')
    .replace(/^(?!<[hluad]|\s*$)(.+)$/gm, '<p class="text-sm text-muted-foreground my-2 leading-relaxed">$1</p>')
    .replace(/__LINK_TOKEN_(\d+)__/g, (_match, index: string) => linkTokens[Number(index)] ?? "");
}

function CircularProgress({ value, size = 72 }: { value: number; size?: number }) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-surface-container)" strokeWidth="6" />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="progress-ring-circle"
      />
    </svg>
  );
}

const QUIZ_BANK: Record<string, Array<{ q: string; opts: string[]; ans: number; arabic?: boolean }>> = {
  default: [
    {
      q: "1. What is the primary purpose of the Model for Improvement?",
      opts: ["Replace all existing systems", "Provide a structured approach for testing changes", "Create compliance documentation", "Reduce costs only"],
      ans: 1,
    },
    {
      q: "2. ما هي الخطوة الأولى في دورة PDSA؟",
      opts: ["التنفيذ (Do)", "الدراسة (Study)", "التخطيط (Plan)", "التطبيق (Act)"],
      ans: 2,
      arabic: true,
    },
  ],
  "quality-improvement": [
    {
      q: "1. Which tool is most commonly used to identify root causes of a problem?",
      opts: ["PDSA Cycle", "Fishbone (Ishikawa) Diagram", "Gantt Chart", "SWOT Analysis"],
      ans: 1,
    },
    {
      q: "2. In a run chart, what indicates a special cause variation?",
      opts: ["Random scatter", "6 consecutive points above or below the median", "Points within control limits", "Normal distribution"],
      ans: 1,
    },
    {
      q: "3. ما هو هدف التحسين المستمر؟",
      opts: ["تحقيق الكمال مرة واحدة", "التحسين التدريجي والمستمر للعمليات", "تقليص عدد الموظفين", "زيادة الإيرادات فقط"],
      ans: 1,
      arabic: true,
    },
  ],
  "patient-safety": [
    {
      q: "1. What is the 'Swiss Cheese Model' used for?",
      opts: ["Food safety inspections", "Understanding how errors pass through multiple defensive layers", "Cheese quality control", "Hospital dietary management"],
      ans: 1,
    },
    {
      q: "2. Which error reporting approach focuses on learning rather than blame?",
      opts: ["Punitive reporting", "Just Culture reporting", "Anonymous reporting only", "Mandatory legal reporting"],
      ans: 1,
    },
    {
      q: "3. ما هي أهمية نظام الإبلاغ عن الأحداث الضارة؟",
      opts: ["عقوبة الموظفين المخطئين", "التعلم من الأخطاء ومنع تكرارها", "الإبلاغ للجهات القانونية فقط", "حماية المستشفى من المسؤولية"],
      ans: 1,
      arabic: true,
    },
  ],
  "leadership": [
    {
      q: "1. What distinguishes adaptive leadership from technical leadership?",
      opts: ["Adaptive leadership is faster", "Adaptive leadership addresses novel challenges without clear solutions", "Adaptive leadership avoids all change", "Technical leadership is always preferred"],
      ans: 1,
    },
    {
      q: "2. Which leadership style is most effective during a crisis?",
      opts: ["Laissez-faire", "Transactional", "Transformational / Directive", "Democratic only"],
      ans: 2,
    },
  ],
};

interface CourseContentProps {
  course: Course;
  relatedCourses: Course[];
}

function readStringArray(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function readNumberSet(key: string): Set<number> {
  if (typeof window === "undefined") return new Set<number>();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set<number>();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set<number>();
    const values = parsed
      .map((item) => Number(item))
      .filter((item) => Number.isInteger(item) && item >= 0);
    return new Set<number>(values);
  } catch {
    return new Set<number>();
  }
}

function readNumber(key: string): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export default function CourseContent({ course, relatedCourses }: CourseContentProps) {
  const { locale, setLocale } = useLocale();
  const slug = course.slug;

  const [enrolled, setEnrolled] = useState(() => typeof window !== "undefined" ? localStorage.getItem(`enrolled-${slug}`) === "true" : false);
  const [saved, setSaved] = useState(() => typeof window !== "undefined" ? localStorage.getItem(`saved-${slug}`) === "true" : false);
  const [completed, setCompleted] = useState(() => typeof window !== "undefined" ? localStorage.getItem(`complete-${slug}`) === "true" : false);
  const [completedSections, setCompletedSections] = useState(() => readNumberSet(`sections-${slug}`));
  const [quizSubmitted, setQuizSubmitted] = useState(() => typeof window !== "undefined" ? !!localStorage.getItem(`quiz-score-${slug}`) : false);
  const [quizScore, setQuizScore] = useState(() => readNumber(`quiz-score-${slug}`));
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window === "undefined") return "content";
    const stored = localStorage.getItem(`course-tab-${slug}`);
    return stored === "content" || stored === "quiz" || stored === "activities" ? stored : "content";
  });

  const progress = useMemo(() => {
    if (completed) return 100;
    if (course.sections.length === 0) return 0;
    const visibleIndices = course.sections
      .map((section, index) => ({ section, index }))
      .filter(({ section }) => (locale === "ar" ? section.isArabic : !section.isArabic))
      .map(({ index }) => index);
    if (visibleIndices.length === 0) return 0;
    const visibleCompleted = visibleIndices.filter((index) => completedSections.has(index)).length;
    return Math.round((visibleCompleted / visibleIndices.length) * 100);
  }, [completedSections, course.sections, completed, locale]);

  const visibleSections = useMemo(() => {
    return course.sections
      .map((section, index) => ({ section, index }))
      .filter(({ section }) => (locale === "ar" ? section.isArabic : !section.isArabic));
  }, [course.sections, locale]);

  const branding = getTopicBranding(course.topic);
  const courseTitle = locale === "ar" ? course.titleArabic || course.title : course.title;
  const localizedTopic = getLocalizedTopicLabel(course.topic, locale);
  const localizedTopicDescription = getLocalizedTopicDescription(course.topic, locale, branding.description);
  const localizedLanguage = getLanguageLabel(course.lang, locale);
  const courseSummary = useMemo(
    () => getCourseSummary(course.body, locale, localizedTopicDescription),
    [course.body, locale, localizedTopicDescription]
  );
  const level = getLevel(course.body, locale);
  const topicHref = `/topics/${course.topic.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const breadcrumbChevron = locale === "ar" ? "chevron_left" : "chevron_right";
  const directionalArrow = locale === "ar" ? "arrow_back" : "arrow_forward";
  const completedVisibleSections = visibleSections.filter(({ index }) => completedSections.has(index)).length;
  const alternateLocale = locale === "ar" ? "en" : "ar";
  const ceCredits = (1.25).toFixed(2);
  const heroHighlights = locale === "ar"
    ? [
        {
          title: "العدسة التعليمية",
          value: localizedTopicDescription,
        },
        {
          title: "إيقاع التعلم",
          value: `${visibleSections.length || course.sections.length} وحدات موجهة + اختبار + أنشطة تطبيقية`,
        },
        {
          title: "أفضل استخدام",
          value: level.summary,
        },
      ]
    : [
        {
          title: "Learning Lens",
          value: localizedTopicDescription,
        },
        {
          title: "Study Flow",
          value: `${visibleSections.length || course.sections.length} guided modules + quiz + applied activities`,
        },
        {
          title: "Best Use",
          value: level.summary,
        },
      ];
  const heroMeta = locale === "ar"
    ? [
        { icon: "schedule", label: "المدة", value: `${course.duration} دقيقة` },
        { icon: "translate", label: "اللغة", value: localizedLanguage },
        { icon: "workspace_premium", label: "الاعتماد", value: `${ceCredits} س.ت` },
      ]
    : [
        { icon: "schedule", label: "Duration", value: `${course.duration} min` },
        { icon: "translate", label: "Language", value: localizedLanguage },
        { icon: "workspace_premium", label: "Credits", value: `${ceCredits} CE` },
      ];
  const resourceLinks = locale === "ar"
    ? [
        { href: "https://www.cbahi.gov.sa", icon: "verified", label: "معايير سباهي", desc: "الاعتماد والجودة" },
        { href: "https://www.moh.gov.sa", icon: "monitor_heart", label: "إرشادات وزارة الصحة", desc: "سياسات وتشريعات صحية" },
        { href: "https://www.vision2030.gov.sa", icon: "visibility", label: "رؤية 2030", desc: "تحول القطاع الصحي" },
        { href: course.sourceUrl || "https://www.ihi.org", icon: "open_in_new", label: "المصدر الأصلي", desc: "مرجع الدورة" },
      ]
    : [
        { href: "https://www.cbahi.gov.sa", icon: "verified", label: "CBAHI Standards", desc: "Accreditation and quality" },
        { href: "https://www.moh.gov.sa", icon: "monitor_heart", label: "MOH Guidance", desc: "Ministry of Health direction" },
        { href: "https://www.vision2030.gov.sa", icon: "visibility", label: "Vision 2030", desc: "Health transformation" },
        { href: course.sourceUrl || "https://www.ihi.org", icon: "open_in_new", label: "Original Source", desc: "Course reference" },
      ];

  useEffect(() => {
    localStorage.setItem(`progress-${slug}`, String(progress));
  }, [progress, slug]);

  useEffect(() => {
    localStorage.setItem(`course-tab-${slug}`, activeTab);
  }, [activeTab, slug]);

  const handleEnroll = useCallback(() => {
    localStorage.setItem(`enrolled-${slug}`, "true");
    const list = readStringArray("enrolledCourses");
    if (!list.includes(slug)) {
      list.push(slug);
      localStorage.setItem("enrolledCourses", JSON.stringify(list));
    }
    setEnrolled(true);
    toast.success(locale === "ar" ? "✅ تم التسجيل بنجاح" : "✅ Enrolled successfully! Start exploring the content.");
  }, [slug, locale]);

  const handleSave = useCallback(() => {
    const next = !saved;
    localStorage.setItem(`saved-${slug}`, String(next));
    setSaved(next);
    toast(next
      ? (locale === "ar" ? "💾 تم حفظ الدورة" : "💾 Course saved to My Learning")
      : (locale === "ar" ? "تمت إزالة الحفظ" : "Removed from saved courses"));
  }, [saved, slug, locale]);

  const handleComplete = useCallback(() => {
    const next = !completed;
    localStorage.setItem(`complete-${slug}`, String(next));
    setCompleted(next);
    if (next) {
      const allSections = new Set(course.sections.map((_, i) => i));
      setCompletedSections(allSections);
      localStorage.setItem(`sections-${slug}`, JSON.stringify([...allSections]));
      toast.success(locale === "ar" ? "🎉 تم إكمال الدورة" : "🎉 Course completed! Certificate earned.");
    } else {
      toast(locale === "ar" ? "تم تعليمها كغير مكتملة" : "Marked as incomplete");
    }
  }, [completed, slug, course.sections, locale]);

  const toggleSection = useCallback((idx: number) => {
    setCompletedSections((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      localStorage.setItem(`sections-${slug}`, JSON.stringify([...next]));
      const allSectionsComplete = course.sections.length > 0 && next.size === course.sections.length;
      setCompleted(allSectionsComplete);
      localStorage.setItem(`complete-${slug}`, String(allSectionsComplete));
      return next;
    });
  }, [course.sections.length, slug]);

  const quizBank = useMemo(() => {
    const topicKey = course.topic.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const all = QUIZ_BANK[topicKey] || QUIZ_BANK.default;
    const filtered = all.filter((q) => (locale === "ar" ? !!q.arabic : !q.arabic));
    return filtered.length > 0 ? filtered : all;
  }, [course.topic, locale]);

  const handleQuizAnswer = useCallback((qi: number, ai: number) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [qi]: ai }));
  }, [quizSubmitted]);

  const submitQuiz = useCallback(() => {
    const score = quizBank.reduce((correct, item, qi) => {
      return quizAnswers[qi] === item.ans ? correct + 1 : correct;
    }, 0);
    const pct = quizBank.length > 0 ? Math.round((score / quizBank.length) * 100) : 0;
    setQuizScore(pct);
    setQuizSubmitted(true);
    localStorage.setItem(`quiz-score-${slug}`, String(pct));
    if (pct >= 80) {
      toast.success(locale === "ar" ? `🎉 ${pct}% — تم الاجتياز` : `🎉 ${pct}% — Passed! Great job.`);
      localStorage.setItem(`quiz-pass-${slug}`, "true");
    } else {
      toast.error(locale === "ar" ? `📚 ${pct}% — تحتاج 80% للاجتياز` : `📚 ${pct}% — Need 80% to pass. Review and try again.`);
    }
  }, [quizBank, quizAnswers, slug, locale]);

  const resetQuiz = useCallback(() => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
    localStorage.removeItem(`quiz-score-${slug}`);
    localStorage.removeItem(`quiz-pass-${slug}`);
  }, [slug]);

  const quizPassed = quizScore !== null && quizScore >= 80;

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      {/* Course Hero */}
      <section className={`course-hero-shell relative overflow-hidden border-b border-white/10 bg-linear-to-br ${branding.gradient} px-5 py-10 text-white lg:py-12`}>
        <div className="hero-orb course-hero-orb w-80 h-80 bg-white/8 -top-20 -right-20" />
        <div className="hero-orb course-hero-orb course-hero-orb-secondary w-48 h-48 bg-white/6 -bottom-10 -left-10" />
        <div className="absolute inset-0 bg-[linear-gradient(125deg,rgba(12,18,25,0.18),transparent_38%,rgba(255,255,255,0.06))]" />
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-white/55 text-xs mb-5 animate-slide-down">
            <Link href="/" className="hover:text-white transition-colors">{locale === "ar" ? "الرئيسية" : "Home"}</Link>
            <span className="material-symbols-outlined text-[12px]">{breadcrumbChevron}</span>
            <Link href={topicHref} className="hover:text-white transition-colors">{localizedTopic}</Link>
            <span className="material-symbols-outlined text-[12px]">{breadcrumbChevron}</span>
            <span className="text-white/80 line-clamp-1">{courseTitle}</span>
          </nav>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="course-hero-copy flex-1 space-y-4 animate-slide-up">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`course-hero-chip inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm`}>
                  {localizedTopic}
                </span>
                <span className="course-hero-chip rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-mono text-white/90">
                  {course.code}
                </span>
                <span className={`course-hero-chip inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${level.bg} text-white/95 ring-1 ring-white/12`}>
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>{level.icon}</span>
                  {level.label}
                </span>
              </div>
              <h1 className="font-headline text-2xl lg:text-3xl font-extrabold tracking-tight leading-tight">
                {courseTitle}
              </h1>
              {locale !== "ar" && course.titleArabic && (
                <p className="font-arabic text-base text-white/70" dir="rtl">{course.titleArabic}</p>
              )}
              <p className="max-w-3xl text-sm leading-7 text-white/82 sm:text-base">
                {courseSummary}
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {heroMeta.map((item, index) => (
                  <div
                    key={item.label}
                    className="course-hero-chip inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white/88 backdrop-blur-sm"
                    style={{ animationDelay: `${120 + index * 70}ms` }}
                  >
                    <span className="material-symbols-outlined text-[15px]">{item.icon}</span>
                    <span className="text-white/65">{item.label}</span>
                    <span className="font-semibold text-white">{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="course-hero-action flex flex-wrap gap-2 pt-1" style={{ animationDelay: "260ms" }}>
                <Button
                  onClick={handleEnroll}
                  variant={enrolled ? "secondary" : "default"}
                  className={`gap-1.5 ${enrolled ? "bg-white/20 text-white hover:bg-white/25 border-white/20" : "bg-white text-primary hover:bg-white/90"}`}
                >
                  <span className="material-symbols-outlined text-[18px]" style={enrolled ? { fontVariationSettings: "'FILL' 1" } : {}}>
                    {enrolled ? "check_circle" : "add"}
                  </span>
                  {enrolled ? (locale === "ar" ? "مسجل" : "Enrolled") : (locale === "ar" ? "سجل الآن" : "Enroll Now")}
                </Button>
                <Button
                  onClick={handleSave}
                  variant="outline"
                  className={`gap-1.5 border-white/30 text-white hover:bg-white/10 ${saved ? "bg-white/15" : ""}`}
                >
                  <span className="material-symbols-outlined text-[18px]" style={saved ? { fontVariationSettings: "'FILL' 1" } : {}}>
                    {saved ? "bookmark" : "bookmark_add"}
                  </span>
                  {saved ? (locale === "ar" ? "محفوظ" : "Saved") : (locale === "ar" ? "حفظ" : "Save")}
                </Button>
                <Button
                  onClick={handleComplete}
                  variant="outline"
                  className={`gap-1.5 border-white/30 text-white hover:bg-white/10 ${completed ? "bg-white/15" : ""}`}
                >
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {completed ? "task_alt" : "check_circle"}
                  </span>
                  {completed ? (locale === "ar" ? "مكتمل" : "Completed") : (locale === "ar" ? "تعليم كمكتمل" : "Mark Complete")}
                </Button>
              </div>
            </div>

            {/* Hero Stats */}
            <div className="course-hero-stats flex flex-wrap gap-3 animate-slide-up delay-100" style={{ animationDelay: "160ms" }}>
              {[
                {
                  icon: "schedule",
                  value: `${course.duration}`,
                  suffix: locale === "ar" ? "د" : "min",
                  label: locale === "ar" ? "المدة" : "Duration",
                  color: "text-blue-200",
                },
                { icon: level.icon, value: level.label, label: "Level", color: level.color },
                {
                  icon: "workspace_premium",
                  value: ceCredits,
                  suffix: locale === "ar" ? "س.ت" : "CE",
                  label: locale === "ar" ? "الاعتماد" : "Credits",
                  color: "text-amber-200",
                },
              ].map((s, i) => (
                <div key={i} className="course-hero-panel bg-white/15 backdrop-blur-sm rounded-xl px-3 py-3 text-center border border-white/15 min-w-20" style={{ animationDelay: `${220 + i * 90}ms` }}>
                  <span className={`material-symbols-outlined text-[18px] ${s.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                  <div className="font-headline font-extrabold text-lg mt-1 leading-none">
                    {s.value}<span className="text-xs text-white/60 ml-0.5">{s.suffix}</span>
                  </div>
                  <div className="text-[10px] text-white/55 mt-0.5">{s.label === "Level" && locale === "ar" ? "المستوى" : s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-3 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
            <div className="course-hero-brief rounded-3xl border border-white/18 bg-white/10 p-5 backdrop-blur-md shadow-[0_20px_45px_rgba(9,16,24,0.16)]" style={{ animationDelay: "280ms" }}>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-white/70">
                <span className="material-symbols-outlined text-[14px]">menu_book</span>
                {locale === "ar" ? "نبذة الدورة" : "Course Brief"}
              </div>
              <p className="mt-3 text-sm leading-7 text-white/86 sm:text-base">
                {courseSummary}
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {heroHighlights.map((item, index) => (
                  <div key={item.title} className="course-hero-panel rounded-2xl border border-white/14 bg-black/10 p-3.5 text-sm text-white/85" style={{ animationDelay: `${340 + index * 70}ms` }}>
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/55">{item.title}</div>
                    <p className="mt-2 leading-6">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {[
                {
                  title: locale === "ar" ? "المسار" : "Track",
                  value: localizedTopic,
                  icon: branding.mark,
                },
                {
                  title: locale === "ar" ? "أسلوب التعلم" : "Learning Style",
                  value: locale === "ar" ? "مختصر، تطبيقي، وثنائي اللغة" : "Concise, applied, and bilingual",
                  icon: "layers",
                },
                {
                  title: locale === "ar" ? "أفضل للجمهور" : "Best For",
                  value: level.summary,
                  icon: "group",
                },
              ].map((item, index) => (
                <div key={item.title} className="course-hero-panel rounded-lg border border-white/18 bg-white/10 p-4 backdrop-blur-md shadow-[0_16px_36px_rgba(9,16,24,0.14)]" style={{ animationDelay: `${420 + index * 70}ms` }}>
                  <div className="flex items-center gap-2 text-white/90">
                    {item.icon.length <= 2 ? (
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/18 bg-white/10 font-headline text-sm font-semibold tracking-[0.2em]">{item.icon}</span>
                    ) : (
                      <span className="material-symbols-outlined text-[18px] rounded-xl border border-white/18 bg-white/10 p-2">{item.icon}</span>
                    )}
                    <div className="text-[11px] uppercase tracking-[0.14em] text-white/60">{item.title}</div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-white/82">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-5 py-6 lg:py-8 flex flex-col lg:flex-row gap-6 w-full pb-24">
        {/* Content Area */}
        <div className="flex-1 space-y-5 min-w-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start h-auto p-1 bg-surface-container-low rounded-xl overflow-x-auto gap-1 flex">
              {[
                { value: "content", label: locale === "ar" ? "محتوى الدورة" : "Course Content", icon: "menu_book" },
                { value: "quiz", label: locale === "ar" ? `اختبار ${quizSubmitted ? `(${quizScore}%)` : ""}` : `Quiz ${quizSubmitted ? `(${quizScore}%)` : ""}`, icon: "quiz" },
                { value: "activities", label: locale === "ar" ? "أنشطة" : "Activities", icon: "assignment" },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex items-center gap-1.5 text-sm rounded-lg px-3 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* CONTENT TAB */}
            <TabsContent value="content" className="mt-4 space-y-3">
              {visibleSections.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    <span className="material-symbols-outlined text-[40px] block mb-2 opacity-30">article</span>
                    <p className="text-sm">
                      {locale === "ar"
                        ? "لا توجد وحدات متاحة بهذه اللغة بعد. يمكنك التبديل لمعاينة النسخة الأخرى من الدورة."
                        : "No lesson sections are available in this language yet. Switch locale to review the alternate version of this course."}
                    </p>
                    {course.sections.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 gap-1.5"
                        onClick={() => setLocale(alternateLocale)}
                      >
                        <span className="material-symbols-outlined text-[15px]">translate</span>
                        {locale === "ar" ? "التبديل إلى الإنجليزية" : "Switch to Arabic"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Progress Bar */}
                  <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl border border-border">
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground font-medium">
                          {locale === "ar"
                            ? `${completedVisibleSections} من ${visibleSections.length} أقسام مكتملة`
                            : `${completedVisibleSections} of ${visibleSections.length} sections completed`}
                        </span>
                        <span className="font-headline font-bold text-primary">{progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                        <div
                          className="h-full gradient-primary rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    {progress === 100 && (
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-emerald-600 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
                      </div>
                    )}
                  </div>

                  <Accordion className="space-y-2">
                    {visibleSections.map(({ section, index }) => {
                      const isDone = completedSections.has(index);
                      return (
                        <AccordionItem
                          key={index}
                          value={`s-${index}`}
                          className={`border rounded-xl overflow-hidden transition-all ${
                            isDone
                              ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/5"
                              : "border-border"
                          }`}
                        >
                          <AccordionTrigger className="px-4 py-3 hover:bg-surface-container-low transition-colors">
                            <span className="flex items-center gap-3 text-left flex-1 min-w-0 mr-2">
                              {/* Section Number / Check */}
                              <span
                                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all ${
                                  isDone
                                    ? "bg-emerald-500"
                                    : section.isArabic
                                    ? "bg-tertiary/10"
                                    : "bg-primary/10"
                                }`}
                              >
                                {isDone ? (
                                  <span className="material-symbols-outlined text-white text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                                ) : (
                                  <span className={`material-symbols-outlined text-[14px] ${section.isArabic ? "text-tertiary" : "text-primary"}`}>
                                    {section.isArabic ? "translate" : "article"}
                                  </span>
                                )}
                              </span>
                              <span>
                                <span className="text-sm font-medium block line-clamp-1">{section.heading}</span>
                                {isDone && <span className="text-[10px] text-emerald-600 dark:text-emerald-400">{locale === "ar" ? "مكتمل" : "Completed"}</span>}
                              </span>
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4 pt-1">
                            <div
                              className={`prose prose-sm max-w-none leading-relaxed ${section.isArabic ? "text-right font-arabic" : ""}`}
                              dir={section.isArabic ? "rtl" : "ltr"}
                              dangerouslySetInnerHTML={{ __html: mdToHtml(section.content) }}
                            />
                            <div className="mt-4 pt-3 border-t border-border flex justify-end">
                              <Button
                                size="sm"
                                variant={isDone ? "outline" : "default"}
                                className="gap-1.5 text-xs"
                                onClick={() => toggleSection(index)}
                              >
                                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                  {isDone ? "undo" : "check_circle"}
                                </span>
                                {isDone ? (locale === "ar" ? "تعليم كغير مكتمل" : "Mark Incomplete") : (locale === "ar" ? "تعليم كمكتمل" : "Mark as Complete")}
                              </Button>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </>
              )}
            </TabsContent>

            {/* QUIZ TAB */}
            <TabsContent value="quiz" className="mt-4 space-y-4">
              {quizSubmitted && quizScore !== null && (
                <div className={`p-4 rounded-xl border flex items-center gap-4 ${
                  quizPassed
                    ? "bg-emerald-50 dark:bg-emerald-900/15 border-emerald-200 dark:border-emerald-800"
                    : "bg-amber-50 dark:bg-amber-900/15 border-amber-200 dark:border-amber-800"
                }`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${quizPassed ? "bg-emerald-500" : "bg-amber-500"}`}>
                    <span className="material-symbols-outlined text-white text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {quizPassed ? "emoji_events" : "info"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className={`font-headline font-bold ${quizPassed ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"}`}>
                      {quizPassed ? (locale === "ar" ? `🎉 اجتياز بنسبة ${quizScore}%` : `🎉 Passed with ${quizScore}%`) : (locale === "ar" ? `${quizScore}% — حاول مرة أخرى` : `${quizScore}% — Try Again`)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {quizPassed
                        ? (locale === "ar" ? "حصلت على شهادة لهذه الدورة." : "You've earned a certificate for this course.")
                        : (locale === "ar" ? "تحتاج 80% للاجتياز. راجع المحتوى ثم حاول مرة أخرى." : "You need 80% to pass. Review the content and try again.")}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={resetQuiz} className="gap-1 text-xs">
                    <span className="material-symbols-outlined text-[14px]">refresh</span>
                    {locale === "ar" ? "إعادة المحاولة" : "Retake"}
                  </Button>
                </div>
              )}

              <Card>
                <CardContent className="p-5 space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-headline text-base font-bold">{locale === "ar" ? "اختبار المعرفة" : "Knowledge Check"}</h3>
                    <Badge variant="outline" className="text-xs">
                      {locale === "ar" ? `${quizBank.length} أسئلة · 80% للاجتياز` : `${quizBank.length} questions · 80% to pass`}
                    </Badge>
                  </div>

                  {quizBank.map((item, qi) => {
                    const chosen = quizAnswers[qi];
                    const showResult = quizSubmitted;
                    return (
                      <div key={qi} className="space-y-2.5">
                        <p id={`quiz-question-${qi}`} className={`text-sm font-semibold leading-relaxed ${item.arabic ? "text-right font-arabic" : ""}`} dir={item.arabic ? "rtl" : "ltr"}>
                          {item.q}
                        </p>
                        <div className="space-y-2" dir={item.arabic ? "rtl" : "ltr"} role="radiogroup" aria-labelledby={`quiz-question-${qi}`}>
                          {item.opts.map((opt, oi) => {
                            let cls = "quiz-option flex w-full items-center gap-2.5 p-3 rounded-xl border text-start text-sm";
                            if (showResult) {
                              if (oi === item.ans) cls += " quiz-option correct";
                              else if (chosen === oi) cls += " quiz-option incorrect";
                              else cls += " opacity-50";
                            } else {
                              cls += chosen === oi ? " quiz-option selected" : " quiz-option";
                            }
                            return (
                              <button
                                key={oi}
                                type="button"
                                className={cls}
                                onClick={() => handleQuizAnswer(qi, oi)}
                                disabled={showResult}
                                role="radio"
                                aria-checked={chosen === oi}
                              >
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 text-[10px] font-bold transition-all ${
                                  showResult
                                    ? oi === item.ans
                                      ? "border-emerald-500 bg-emerald-500 text-white"
                                      : chosen === oi
                                      ? "border-destructive bg-destructive text-white"
                                      : "border-outline"
                                    : chosen === oi
                                    ? "border-primary bg-primary text-white"
                                    : "border-outline"
                                }`}>
                                  {showResult
                                    ? oi === item.ans ? "✓" : chosen === oi ? "✗" : ""
                                    : chosen === oi ? "●" : ""}
                                </div>
                                <span className={item.arabic ? "font-arabic" : ""}>{opt}</span>
                              </button>
                            );
                          })}
                        </div>
                        {qi < quizBank.length - 1 && <div className="border-t border-border" />}
                      </div>
                    );
                  })}

                  {!quizSubmitted && (
                    <Button
                      onClick={submitQuiz}
                      disabled={Object.keys(quizAnswers).length < quizBank.length}
                      className="gap-2 w-full"
                    >
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>checklist</span>
                      {locale === "ar"
                        ? `إرسال الإجابات (${Object.keys(quizAnswers).length}/${quizBank.length})`
                        : `Submit Answers (${Object.keys(quizAnswers).length}/${quizBank.length} answered)`}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ACTIVITIES TAB */}
            <TabsContent value="activities" className="mt-4">
              <Card>
                <CardContent className="p-5 space-y-4">
                  <h3 className="font-headline text-base font-bold">{locale === "ar" ? "أنشطة تطبيقية" : "Practical Activities"}</h3>
                  <p className="text-sm text-muted-foreground">{locale === "ar" ? "أكمل الأنشطة التالية لتعزيز تعلمك:" : "Complete these activities to reinforce your learning:"}</p>
                  <div className="space-y-2">
                    {(locale === "ar"
                      ? [
                          { task: "أكمل جميع أقسام المحتوى", icon: "menu_book" },
                          { task: "اجتز اختبار المعرفة بنسبة 80% أو أكثر", icon: "quiz" },
                          { task: "طبّق مفهومًا واحدًا من الدورة في عملك اليومي", icon: "lightbulb" },
                          { task: "شارك أهم فائدة مع زميل في الفريق", icon: "group" },
                          { task: "وثّق فكرة تحسين جودة مستوحاة من الدورة", icon: "edit_note" },
                          { task: "راجع المعايير ذات الصلة من CBAHI أو وزارة الصحة", icon: "policy" },
                        ]
                      : [
                          { task: "Complete all lesson sections in the Content tab", icon: "menu_book" },
                          { task: "Pass the knowledge check quiz with ≥ 80%", icon: "quiz" },
                          { task: "Apply one concept from this course in your daily practice", icon: "lightbulb" },
                          { task: "Share a key learning with a colleague or team member", icon: "group" },
                          { task: "Document a quality improvement idea inspired by this course", icon: "edit_note" },
                          { task: "Review related CBAHI or MOH standards (see Resources below)", icon: "policy" },
                        ]).map((act, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 bg-surface-container-low rounded-xl border border-border"
                      >
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-primary text-[15px]">{act.icon}</span>
                        </div>
                        <span className="text-sm text-foreground leading-relaxed">{act.task}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Related Courses */}
          {relatedCourses.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="font-headline text-lg font-bold">{locale === "ar" ? "دورات ذات صلة" : "Related Courses"}</h3>
                <Link href={topicHref}>
                  <Button variant="ghost" size="sm" className="gap-1 text-primary text-sm">
                    {locale === "ar" ? "عرض الكل" : "View All"} <span className="material-symbols-outlined text-[16px]">{directionalArrow}</span>
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {relatedCourses.map((c) => (
                  <CourseCard
                    key={c.slug}
                    course={c}
                    enrolled={typeof window !== "undefined" && localStorage.getItem(`enrolled-${c.slug}`) === "true"}
                    compact
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:w-72 xl:w-80 self-start space-y-4 shrink-0">
          {/* Progress Card */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="font-headline text-sm font-bold">{locale === "ar" ? "تقدمك" : "Your Progress"}</h3>
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <CircularProgress value={progress} size={72} />
                  <span className="absolute inset-0 flex items-center justify-center font-headline text-sm font-extrabold text-primary">
                    {progress}%
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="font-headline text-base font-bold">
                    {visibleSections.filter(({ index }) => completedSections.has(index)).length}/{visibleSections.length}
                  </div>
                  <div className="text-xs text-muted-foreground">{locale === "ar" ? "أقسام مكتملة" : "Sections done"}</div>
                  {quizSubmitted && (
                    <div className={`text-xs font-semibold ${quizPassed ? "text-emerald-600" : "text-amber-600"}`}>
                      {locale === "ar" ? "الاختبار" : "Quiz"}: {quizScore}% {quizPassed ? "✓" : ""}
                    </div>
                  )}
                </div>
              </div>
              {!enrolled && (
                <Button size="sm" className="w-full gap-1.5" onClick={handleEnroll}>
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  {locale === "ar" ? "سجل لتتبع التقدم" : "Enroll to Track Progress"}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Certificate Card */}
          {(completed || quizPassed) && (
            <Card className="certificate-border overflow-hidden">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-amber-600 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                  </div>
                  <h3 className="font-headline text-sm font-bold">{locale === "ar" ? "تم الحصول على الشهادة" : "Certificate Earned!"}</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  {locale === "ar"
                    ? <>لقد أكملت <strong>{course.titleArabic || course.title}</strong> وحصلت على <strong>{ceCredits} نقاط تعليم مستمر</strong>.</>
                    : <>You&apos;ve completed <strong>{course.title}</strong> and earned <strong>{ceCredits} CE credits</strong>.</>}
                </p>
                <div className="bg-linear-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-lg p-3 text-center border border-amber-200 dark:border-amber-800">
                  <div className="text-2xl mb-1">🏆</div>
                  <div className="font-headline text-xs font-bold text-amber-800 dark:text-amber-300">IHI Open School</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{ceCredits} {locale === "ar" ? "تعليم مستمر" : "Continuing Education Credits"}</div>
                </div>
                <Button size="sm" variant="outline" className="w-full gap-1.5 text-xs">
                  <span className="material-symbols-outlined text-[14px]">download</span>
                  {locale === "ar" ? "تنزيل الشهادة" : "Download Certificate"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Resources */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <h3 className="font-headline text-sm font-bold">{locale === "ar" ? "الموارد" : "Resources"}</h3>
              {resourceLinks.map((r, i) => (
                <a
                  key={i}
                  href={r.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-surface-container-low transition-colors group"
                >
                  <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                    <span className="material-symbols-outlined text-[14px] text-muted-foreground group-hover:text-primary transition-colors">{r.icon}</span>
                  </div>
                  <div>
                    <div className="text-xs font-semibold group-hover:text-primary transition-colors">{r.label}</div>
                    <div className="text-[10px] text-muted-foreground">{r.desc}</div>
                  </div>
                  <span className="material-symbols-outlined text-[14px] text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity">open_in_new</span>
                </a>
              ))}
            </CardContent>
          </Card>

          {/* AI Study Notes */}
          <Card className="overflow-hidden">
            <div className="h-1 animated-gradient" />
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 gradient-primary rounded-lg shadow-sm">
                  <span className="material-symbols-outlined text-white text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                </div>
                <h3 className="font-headline text-sm font-bold">{locale === "ar" ? "ملاحظات دراسية بالذكاء الاصطناعي" : "AI Study Notes"}</h3>
                <Badge className="badge-new text-[10px] h-4 px-1.5">Beta</Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {locale === "ar"
                  ? "أكمل الأقسام لتوليد ملاحظات دراسية مخصصة حسب تقدمك."
                  : "Complete sections to generate personalized AI study notes tailored to your learning progress."}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/5"
                onClick={() => toast(locale === "ar" ? "الميزة قريبًا. أكمل مزيدًا من الأقسام أولًا." : "AI Study Notes coming soon! Complete more sections first.")}
              >
                <span className="material-symbols-outlined text-[14px]">psychology</span>
                {locale === "ar" ? "توليد الملاحظات" : "Generate Notes"}
                {progress > 0 && <span className="ml-auto text-[10px] opacity-60">{progress}% {locale === "ar" ? "مكتمل" : "done"}</span>}
              </Button>
            </CardContent>
          </Card>

          {/* Course Info */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <h3 className="font-headline text-sm font-bold">{locale === "ar" ? "معلومات الدورة" : "Course Info"}</h3>
              {[
                { icon: "tag", label: locale === "ar" ? "الرمز" : "Code", value: course.code },
                { icon: "category", label: locale === "ar" ? "المسار" : "Topic", value: localizedTopic },
                { icon: "schedule", label: locale === "ar" ? "المدة" : "Duration", value: locale === "ar" ? `${course.duration} دقيقة` : `${course.duration} minutes` },
                { icon: "translate", label: locale === "ar" ? "اللغة" : "Language", value: localizedLanguage },
                { icon: level.icon, label: locale === "ar" ? "المستوى" : "Level", value: level.label },
              ].map((info, i) => (
                <div key={i} className="flex items-center gap-2 py-1 border-b border-border last:border-0">
                  <span className="material-symbols-outlined text-muted-foreground text-[14px]">{info.icon}</span>
                  <span className="text-[11px] text-muted-foreground shrink-0">{info.label}</span>
                  <span className="text-xs font-medium ml-auto">{info.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>
      </div>

      <Footer />
      <MobileNav />
    </div>
  );
}

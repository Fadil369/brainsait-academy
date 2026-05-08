"use client";

import { useState, useEffect, use, useMemo, useCallback } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { notFound } from "next/navigation";
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
import { NavBar, MobileNav } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { toast } from "sonner";
import coursesData from "@/lib/data/courses.json";

export const runtime = 'edge';

type Section = { heading: string; isArabic: boolean; content: string };
type Course = {
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

const TOPIC_GRADIENTS: Record<string, string> = {
  "Quality Improvement": "from-indigo-500 to-violet-600",
  "Patient Safety": "from-emerald-500 to-teal-600",
  "Leadership": "from-amber-500 to-orange-600",
  "Advanced Leadership": "from-rose-500 to-pink-600",
  "Triple Aim": "from-purple-500 to-violet-700",
  "Person- and Family-Centered Care": "from-pink-500 to-rose-600",
  "Graduate Medical Education": "from-sky-500 to-blue-600",
  "AI Healthcare": "from-violet-500 to-purple-700",
  "NPHIES": "from-teal-500 to-cyan-600",
  "FHIR R4": "from-blue-500 to-indigo-600",
  "Decarbonization": "from-green-500 to-emerald-600",
  "Dental Care": "from-cyan-500 to-sky-600",
  "ClaimLINC": "from-orange-500 to-amber-600",
  "Contextualizing Care": "from-fuchsia-500 to-pink-600",
};

const TOPIC_BADGE: Record<string, string> = {
  "Quality Improvement": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  "Patient Safety": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  "Leadership": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  "Triple Aim": "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  "Person- and Family-Centered Care": "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
};

function mdToHtml(md: string): string {
  return md
    .replace(/^#### (.+)$/gm, '<h4 class="font-headline text-base font-semibold mt-4 mb-2 text-foreground">$1</h4>')
    .replace(/^### (.+)$/gm, '<h3 class="font-headline text-lg font-bold mt-5 mb-2 text-foreground">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="font-headline text-xl font-extrabold text-primary mt-6 mb-3 pb-2 border-b border-border">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-primary underline underline-offset-2 hover:text-primary-dark transition-colors" target="_blank" rel="noopener">$1</a>')
    .replace(/^- \[ \] (.+)$/gm, '<div class="flex items-start gap-2 p-2.5 bg-surface-container-low rounded-lg mb-1.5 border border-border"><span class="w-4 h-4 rounded border-2 border-outline flex-shrink-0 mt-0.5"></span><span class="text-sm text-foreground">$1</span></div>')
    .replace(/^- \[x\] (.+)$/gm, '<div class="flex items-start gap-2 p-2.5 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg mb-1.5 border border-emerald-200 dark:border-emerald-800"><span class="w-4 h-4 rounded border-2 border-emerald-500 bg-emerald-500 flex-shrink-0 mt-0.5 flex items-center justify-center text-white text-[10px]">✓</span><span class="text-sm line-through opacity-60">$1</span></div>')
    .replace(/---/g, '<hr class="border-border my-5" />')
    .replace(/^- (.+)$/gm, '<li class="flex items-start gap-2 py-1.5 px-2 bg-surface-container-low rounded-lg mb-1 text-sm text-foreground border-l-2 border-primary/30">$1</li>')
    .replace(/(<li[^>]*>[\s\S]*?<\/li>\n?)+/g, '<ul class="space-y-0.5 my-3">$&</ul>')
    .replace(/^(?!<[hluad]|\s*$)(.+)$/gm, '<p class="text-sm text-muted-foreground my-2 leading-relaxed">$1</p>');
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

export default function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const course = (coursesData.find((c: Course) => c.slug === slug) ?? notFound()) as Course;

  const [mounted, setMounted] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [saved, setSaved] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [completedSections, setCompletedSections] = useState<Set<number>>(new Set());
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("content");

  useEffect(() => {
    setMounted(true);
    setEnrolled(localStorage.getItem(`enrolled-${slug}`) === "true");
    setSaved(localStorage.getItem(`saved-${slug}`) === "true");
    setCompleted(localStorage.getItem(`complete-${slug}`) === "true");
    const secJson = localStorage.getItem(`sections-${slug}`);
    if (secJson) {
      setCompletedSections(new Set(JSON.parse(secJson)));
    }
    const prevQuiz = localStorage.getItem(`quiz-score-${slug}`);
    if (prevQuiz) {
      setQuizScore(parseInt(prevQuiz));
      setQuizSubmitted(true);
    }
  }, [slug]);

  const progress = useMemo(() => {
    if (completed) return 100;
    if (course.sections.length === 0) return 0;
    return Math.round((completedSections.size / course.sections.length) * 100);
  }, [completedSections, course.sections.length, completed]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(`progress-${slug}`, String(progress));
    }
  }, [progress, slug, mounted]);

  const handleEnroll = useCallback(() => {
    localStorage.setItem(`enrolled-${slug}`, "true");
    const list = JSON.parse(localStorage.getItem("enrolledCourses") || "[]");
    if (!list.includes(slug)) {
      list.push(slug);
      localStorage.setItem("enrolledCourses", JSON.stringify(list));
    }
    setEnrolled(true);
    toast.success("✅ Enrolled successfully! Start exploring the content.");
  }, [slug]);

  const handleSave = useCallback(() => {
    const next = !saved;
    localStorage.setItem(`saved-${slug}`, String(next));
    setSaved(next);
    toast(next ? "💾 Course saved to My Learning" : "Removed from saved courses");
  }, [saved, slug]);

  const handleComplete = useCallback(() => {
    const next = !completed;
    localStorage.setItem(`complete-${slug}`, String(next));
    setCompleted(next);
    if (next) {
      const allSections = new Set(course.sections.map((_, i) => i));
      setCompletedSections(allSections);
      localStorage.setItem(`sections-${slug}`, JSON.stringify([...allSections]));
      toast.success("🎉 Course completed! Certificate earned.");
    } else {
      toast("Marked as incomplete");
    }
  }, [completed, slug, course.sections]);

  const toggleSection = useCallback((idx: number) => {
    setCompletedSections((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      localStorage.setItem(`sections-${slug}`, JSON.stringify([...next]));
      return next;
    });
  }, [slug]);

  const quizBank = useMemo(() => {
    const topicKey = course.topic.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return QUIZ_BANK[topicKey] || QUIZ_BANK.default;
  }, [course.topic]);

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
      toast.success(`🎉 ${pct}% — Passed! Great job.`);
      localStorage.setItem(`quiz-pass-${slug}`, "true");
    } else {
      toast.error(`📚 ${pct}% — Need 80% to pass. Review and try again.`);
    }
  }, [quizBank, quizAnswers, slug]);

  const resetQuiz = useCallback(() => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
    localStorage.removeItem(`quiz-score-${slug}`);
  }, [slug]);

  const getLevel = () => {
    if (course.body.includes("Advanced") || course.body.includes("متقدم"))
      return { label: "Advanced", icon: "local_fire_department", color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-900/15" };
    if (course.body.includes("Intermediate") || course.body.includes("متوسط"))
      return { label: "Intermediate", icon: "trending_up", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/15" };
    return { label: "Foundation", icon: "eco", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/15" };
  };

  const level = getLevel();
  const relatedCourses = coursesData.filter((c) => c.topic === course.topic && c.slug !== slug).slice(0, 3);
  const gradient = TOPIC_GRADIENTS[course.topic] || "from-indigo-500 to-violet-600";
  const topicBadge = TOPIC_BADGE[course.topic] || "bg-surface-container-high text-foreground";
  const quizPassed = quizScore !== null && quizScore >= 80;
  const ceCredits = (1.25).toFixed(2);

  if (!mounted) return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <div className="max-w-7xl mx-auto px-5 py-8 w-full space-y-4">
        <div className="h-48 skeleton-shimmer rounded-xl" />
        <div className="h-32 skeleton-shimmer rounded-xl" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      {/* Course Hero */}
      <section className={`bg-gradient-to-br ${gradient} text-white px-5 py-10 relative overflow-hidden`}>
        <div className="hero-orb w-80 h-80 bg-white/8 -top-20 -right-20" />
        <div className="hero-orb w-48 h-48 bg-white/6 -bottom-10 -left-10" />
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-white/55 text-xs mb-5 animate-slide-down">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <Link href={`/topics/${course.topic.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="hover:text-white transition-colors">{course.topic}</Link>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <span className="text-white/80 line-clamp-1">{course.title}</span>
          </nav>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1 space-y-4 animate-slide-up">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${topicBadge} backdrop-blur-sm`}>
                  {course.topic}
                </span>
                <span className="bg-white/20 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                  {course.code}
                </span>
              </div>
              <h1 className="font-headline text-2xl lg:text-3xl font-extrabold tracking-tight leading-tight">
                {course.title}
              </h1>
              {course.titleArabic && (
                <p className="font-arabic text-base text-white/70" dir="rtl">{course.titleArabic}</p>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  onClick={handleEnroll}
                  variant={enrolled ? "secondary" : "default"}
                  className={`gap-1.5 ${enrolled ? "bg-white/20 text-white hover:bg-white/25 border-white/20" : "bg-white text-primary hover:bg-white/90"}`}
                >
                  <span className="material-symbols-outlined text-[18px]" style={enrolled ? { fontVariationSettings: "'FILL' 1" } : {}}>
                    {enrolled ? "check_circle" : "add"}
                  </span>
                  {enrolled ? "Enrolled" : "Enroll Now"}
                </Button>
                <Button
                  onClick={handleSave}
                  variant="outline"
                  className={`gap-1.5 border-white/30 text-white hover:bg-white/10 ${saved ? "bg-white/15" : ""}`}
                >
                  <span className="material-symbols-outlined text-[18px]" style={saved ? { fontVariationSettings: "'FILL' 1" } : {}}>
                    {saved ? "bookmark" : "bookmark_add"}
                  </span>
                  {saved ? "Saved" : "Save"}
                </Button>
                <Button
                  onClick={handleComplete}
                  variant="outline"
                  className={`gap-1.5 border-white/30 text-white hover:bg-white/10 ${completed ? "bg-white/15" : ""}`}
                >
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {completed ? "task_alt" : "check_circle"}
                  </span>
                  {completed ? "Completed" : "Mark Complete"}
                </Button>
              </div>
            </div>

            {/* Hero Stats */}
            <div className="flex gap-3 animate-slide-up delay-100">
              {[
                { icon: "schedule", value: `${course.duration}`, suffix: "min", label: "Duration", color: "text-blue-200" },
                { icon: level.icon, value: level.label, label: "Level", color: level.color },
                { icon: "workspace_premium", value: ceCredits, suffix: "CE", label: "Credits", color: "text-amber-200" },
              ].map((s, i) => (
                <div key={i} className="bg-white/15 backdrop-blur-sm rounded-xl px-3 py-3 text-center border border-white/15 min-w-[80px]">
                  <span className={`material-symbols-outlined text-[18px] ${s.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                  <div className="font-headline font-extrabold text-lg mt-1 leading-none">
                    {s.value}<span className="text-xs text-white/60 ml-0.5">{s.suffix}</span>
                  </div>
                  <div className="text-[10px] text-white/55 mt-0.5">{s.label}</div>
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
                { value: "content", label: "Course Content", icon: "menu_book" },
                { value: "quiz", label: `Quiz ${quizSubmitted ? `(${quizScore}%)` : ""}`, icon: "quiz" },
                { value: "activities", label: "Activities", icon: "assignment" },
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
              {course.sections.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    <span className="material-symbols-outlined text-[40px] block mb-2 opacity-30">article</span>
                    <p className="text-sm">Course content is being prepared.</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Progress Bar */}
                  <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl border border-border">
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground font-medium">
                          {completedSections.size} of {course.sections.length} sections completed
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
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-emerald-600 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
                      </div>
                    )}
                  </div>

                  <Accordion className="space-y-2">
                    {course.sections.map((section, i) => {
                      const isDone = completedSections.has(i);
                      return (
                        <AccordionItem
                          key={i}
                          value={`s-${i}`}
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
                                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
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
                                {isDone && <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Completed</span>}
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
                                onClick={() => toggleSection(i)}
                              >
                                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                  {isDone ? "undo" : "check_circle"}
                                </span>
                                {isDone ? "Mark Incomplete" : "Mark as Complete"}
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
                      {quizPassed ? `🎉 Passed with ${quizScore}%` : `${quizScore}% — Try Again`}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {quizPassed ? "You've earned a certificate for this course." : "You need 80% to pass. Review the content and try again."}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={resetQuiz} className="gap-1 text-xs">
                    <span className="material-symbols-outlined text-[14px]">refresh</span>
                    Retake
                  </Button>
                </div>
              )}

              <Card>
                <CardContent className="p-5 space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-headline text-base font-bold">Knowledge Check</h3>
                    <Badge variant="outline" className="text-xs">
                      {quizBank.length} questions · 80% to pass
                    </Badge>
                  </div>

                  {quizBank.map((item, qi) => {
                    const chosen = quizAnswers[qi];
                    const showResult = quizSubmitted;
                    return (
                      <div key={qi} className="space-y-2.5">
                        <p className={`text-sm font-semibold leading-relaxed ${item.arabic ? "text-right font-arabic" : ""}`} dir={item.arabic ? "rtl" : "ltr"}>
                          {item.q}
                        </p>
                        <div className="space-y-2" dir={item.arabic ? "rtl" : "ltr"}>
                          {item.opts.map((opt, oi) => {
                            let cls = "quiz-option flex items-center gap-2.5 p-3 rounded-xl border text-sm";
                            if (showResult) {
                              if (oi === item.ans) cls += " quiz-option correct";
                              else if (chosen === oi) cls += " quiz-option incorrect";
                              else cls += " opacity-50";
                            } else {
                              cls += chosen === oi ? " quiz-option selected" : " quiz-option";
                            }
                            return (
                              <div key={oi} className={cls} onClick={() => handleQuizAnswer(qi, oi)}>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-[10px] font-bold transition-all ${
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
                              </div>
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
                      Submit Answers ({Object.keys(quizAnswers).length}/{quizBank.length} answered)
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ACTIVITIES TAB */}
            <TabsContent value="activities" className="mt-4">
              <Card>
                <CardContent className="p-5 space-y-4">
                  <h3 className="font-headline text-base font-bold">Practical Activities</h3>
                  <p className="text-sm text-muted-foreground">Complete these activities to reinforce your learning:</p>
                  <div className="space-y-2">
                    {[
                      { task: "Complete all lesson sections in the Content tab", icon: "menu_book" },
                      { task: "Pass the knowledge check quiz with ≥ 80%", icon: "quiz" },
                      { task: "Apply one concept from this course in your daily practice", icon: "lightbulb" },
                      { task: "Share a key learning with a colleague or team member", icon: "group" },
                      { task: "Document a quality improvement idea inspired by this course", icon: "edit_note" },
                      { task: "Review related CBAHI or MOH standards (see Resources below)", icon: "policy" },
                    ].map((act, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 bg-surface-container-low rounded-xl border border-border"
                      >
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
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
                <h3 className="font-headline text-lg font-bold">Related Courses</h3>
                <Link href={`/topics/${course.topic.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
                  <Button variant="ghost" size="sm" className="gap-1 text-primary text-sm">
                    View All <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {relatedCourses.map((c, i) => (
                  <CourseCard
                    key={c.slug}
                    course={c}
                    enrolled={typeof window !== "undefined" && localStorage.getItem(`enrolled-${c.slug}`) === "true"}
                    index={i}
                    compact
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:w-72 xl:w-80 space-y-4 flex-shrink-0">
          {/* Progress Card */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="font-headline text-sm font-bold">Your Progress</h3>
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <CircularProgress value={progress} size={72} />
                  <span className="absolute inset-0 flex items-center justify-center font-headline text-sm font-extrabold text-primary">
                    {progress}%
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="font-headline text-base font-bold">
                    {completedSections.size}/{course.sections.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Sections done</div>
                  {quizSubmitted && (
                    <div className={`text-xs font-semibold ${quizPassed ? "text-emerald-600" : "text-amber-600"}`}>
                      Quiz: {quizScore}% {quizPassed ? "✓" : ""}
                    </div>
                  )}
                </div>
              </div>
              {!enrolled && (
                <Button size="sm" className="w-full gap-1.5" onClick={handleEnroll}>
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Enroll to Track Progress
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
                  <h3 className="font-headline text-sm font-bold">Certificate Earned!</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  You've completed <strong>{course.title}</strong> and earned <strong>{ceCredits} CE credits</strong>.
                </p>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-lg p-3 text-center border border-amber-200 dark:border-amber-800">
                  <div className="text-2xl mb-1">🏆</div>
                  <div className="font-headline text-xs font-bold text-amber-800 dark:text-amber-300">IHI Open School</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{ceCredits} Continuing Education Credits</div>
                </div>
                <Button size="sm" variant="outline" className="w-full gap-1.5 text-xs">
                  <span className="material-symbols-outlined text-[14px]">download</span>
                  Download Certificate
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Resources */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <h3 className="font-headline text-sm font-bold">Resources</h3>
              {[
                { href: "https://www.cbahi.gov.sa", icon: "verified", label: "CBAHI Standards", desc: "Accreditation" },
                { href: "https://www.moh.gov.sa", icon: "monitor_heart", label: "MOH Guidelines", desc: "Ministry of Health" },
                { href: "https://www.vision2030.gov.sa", icon: "visibility", label: "Vision 2030", desc: "Health transformation" },
                { href: course.sourceUrl || "https://www.ihi.org", icon: "open_in_new", label: "IHI Source", desc: "Original course" },
              ].map((r, i) => (
                <a
                  key={i}
                  href={r.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-surface-container-low transition-colors group"
                >
                  <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
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
                <h3 className="font-headline text-sm font-bold">AI Study Notes</h3>
                <Badge className="badge-new text-[10px] h-4 px-1.5">Beta</Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Complete sections to generate personalized AI study notes tailored to your learning progress.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/5"
                onClick={() => toast("AI Study Notes coming soon! Complete more sections first.")}
              >
                <span className="material-symbols-outlined text-[14px]">psychology</span>
                Generate Notes
                {progress > 0 && <span className="ml-auto text-[10px] opacity-60">{progress}% done</span>}
              </Button>
            </CardContent>
          </Card>

          {/* Course Info */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <h3 className="font-headline text-sm font-bold">Course Info</h3>
              {[
                { icon: "tag", label: "Code", value: course.code },
                { icon: "category", label: "Topic", value: course.topic },
                { icon: "schedule", label: "Duration", value: `${course.duration} minutes` },
                { icon: "translate", label: "Language", value: course.lang === "mixed" ? "Arabic + English" : course.lang === "ar" ? "Arabic" : "English" },
                { icon: level.icon, label: "Level", value: level.label },
              ].map((info, i) => (
                <div key={i} className="flex items-center gap-2 py-1 border-b border-border last:border-0">
                  <span className="material-symbols-outlined text-muted-foreground text-[14px]">{info.icon}</span>
                  <span className="text-[11px] text-muted-foreground flex-shrink-0">{info.label}</span>
                  <span className="text-xs font-medium ml-auto">{info.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>
      </div>

      <Footer />
      <MobileNav activeItem="courses" />
    </div>
  );
}

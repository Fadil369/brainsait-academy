"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Clock, BookOpen, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/course-card";
import { useLocale } from "@/components/locale-provider";
import { NavBar, MobileNav } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getTopicBranding } from "@/lib/topic-branding";
import { getLocalizedTopicDescription, getLocalizedTopicLabel } from "@/lib/topic-localization";
import topicsData from "@/lib/data/topics.json";
import { cn } from "@/lib/utils";

export type TopicData = {
  name: string;
  slug: string;
  count: number;
  icon: string;
};

export type CourseData = {
  slug: string;
  title: string;
  titleArabic?: string;
  topic: string;
  duration: string | number;
  code?: string;
  body?: string;
};

interface TopicContentProps {
  topic: TopicData;
  topicCourses: CourseData[];
}

export default function TopicContent({ topic, topicCourses }: TopicContentProps) {
  const { locale } = useLocale();
  const slug = topic.slug;
  const branding = getTopicBranding(topic.name);
  const localizedTopic = getLocalizedTopicLabel(topic.name, locale);
  const alternateName = locale === "ar" ? topic.name : getLocalizedTopicLabel(topic.name, "ar");
  const isAr = locale === "ar";
  const Arrow = isAr ? ArrowLeft : ArrowRight;
  const breadcrumbChevron = isAr ? "chevron_left" : "chevron_right";

  const [sort, setSort] = useState("default");
  const [enrolledSlugs] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const parsed = JSON.parse(localStorage.getItem("enrolledCourses") || "[]");
      return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
    } catch {
      return [];
    }
  });
  const [progressMap] = useState(() => {
    if (typeof window === "undefined") return {};
    const pm: Record<string, number> = {};
    topicCourses.forEach(c => {
      const p = Number.parseInt(localStorage.getItem(`progress-${c.slug}`) || "0", 10);
      if (p > 0) pm[c.slug] = p;
    });
    return pm;
  });

  const sortedCourses = useMemo(() => {
    const courses = [...topicCourses];
    switch (sort) {
      case "az":
        return courses.sort((a, b) => {
          const ta = isAr ? a.titleArabic || a.title : a.title;
          const tb = isAr ? b.titleArabic || b.title : b.title;
          return ta.localeCompare(tb);
        });
      case "duration-asc": return courses.sort((a, b) => parseInt(String(a.duration)) - parseInt(String(b.duration)));
      case "duration-desc": return courses.sort((a, b) => parseInt(String(b.duration)) - parseInt(String(a.duration)));
      default: return courses;
    }
  }, [isAr, sort, topicCourses]);

  const description = getLocalizedTopicDescription(topic.name, locale, branding.description);
  const enrolledInTopic = topicCourses.filter(c => enrolledSlugs.includes(c.slug)).length;
  const totalDuration = topicCourses.reduce((sum, c) => sum + parseInt(String(c.duration)), 0);
const totalHours = totalDuration < 60 ? (totalDuration / 60).toFixed(1) : Math.round(totalDuration / 60);

  const sortOptions = isAr
    ? [
        { value: "default", label: "الافتراضي" },
        { value: "az", label: "أبجديًا" },
        { value: "duration-asc", label: "الأقصر" },
        { value: "duration-desc", label: "الأطول" },
      ]
    : [
        { value: "default", label: "Default" },
        { value: "az", label: "A–Z" },
        { value: "duration-asc", label: "Shortest" },
        { value: "duration-desc", label: "Longest" },
      ];

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      {/* ── Hero ── */}
      <section className={cn("relative overflow-hidden px-container-padding py-14 text-white bg-linear-to-br", branding.gradient)}>
        {/* Light effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(255,255,255,0.2),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_80%,rgba(0,0,0,0.2),transparent_40%)]" />
        <div className="hero-orb w-80 h-80 bg-white/8 -top-20 -right-20" />
        <div className="hero-orb w-48 h-48 bg-white/8 -bottom-10 -left-10" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-white/60 text-xs mb-7 animate-slide-down">
            <Link href="/" className="hover:text-white transition-colors">{isAr ? "الرئيسية" : "Home"}</Link>
            <span className="material-symbols-outlined text-[12px]">{breadcrumbChevron}</span>
            <Link href="/topics" className="hover:text-white transition-colors">{isAr ? "المسارات" : "Topics"}</Link>
            <span className="material-symbols-outlined text-[12px]">{breadcrumbChevron}</span>
            <span className="text-white">{localizedTopic}</span>
          </nav>

          <div className="flex flex-col lg:flex-row gap-10 items-start">
            {/* Left copy */}
            <div className="flex-1 space-y-5 animate-slide-up">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/25 bg-white/18 text-4xl backdrop-blur-sm shadow-sm">
                  {topic.icon}
                </div>
                <div>
                  <h1 className="font-headline text-2xl lg:text-4xl font-extrabold tracking-tight leading-tight">
                    {localizedTopic}
                  </h1>
                  <p className="text-white/60 text-sm mt-1">
                    {isAr ? "مسار تدريبي صحي متخصص" : "Specialized Healthcare Training Track"}
                  </p>
                </div>
              </div>

              {alternateName !== localizedTopic && (
                <p
                  className={cn("text-sm text-white/60", !isAr && "font-arabic")}
                  dir={isAr ? "ltr" : "rtl"}
                >
                  {alternateName}
                </p>
              )}

              <p className="text-sm text-white/82 leading-relaxed max-w-2xl">{description}</p>

              {/* Hero stats pills */}
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { icon: BookOpen, value: `${topic.count}`, label: isAr ? "دورة" : "courses" },
                  { icon: Clock, value: isAr ? `${totalHours} س` : `${totalHours}h`, label: isAr ? "إجمالي الوقت" : "total time" },
                  { icon: GraduationCap, value: `${enrolledInTopic}`, label: isAr ? "مسجل" : "enrolled" },
                ].map(s => (
                  <div key={s.label} className="hero-stat-pill">
                    <s.icon className="h-3.5 w-3.5" />
                    <span className="font-bold">{s.value}</span>
                    <span className="text-white/70">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats cards */}
            <div className="flex gap-3 animate-slide-up delay-150 shrink-0">
              {[
                { icon: "menu_book", value: topic.count, label: isAr ? "الدورات" : "Courses" },
                { icon: "schedule", value: isAr ? `${totalHours} س` : `${totalHours}h`, label: isAr ? "إجمالي الوقت" : "Total Time" },
                { icon: "school", value: enrolledInTopic, label: isAr ? "المسجلون" : "Enrolled" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/18 bg-white/14 px-4 py-4 text-center backdrop-blur-sm min-w-[4.5rem] animate-scale-in"
                  style={{ animationDelay: `${150 + i * 60}ms` }}
                >
                  <span className="material-symbols-outlined text-[20px] block mb-1.5 opacity-80" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {stat.icon}
                  </span>
                  <div className="font-headline text-2xl font-extrabold">{stat.value}</div>
                  <div className="text-[10px] text-white/60 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-7xl mx-auto px-container-padding py-8 pb-24 w-full">

        {/* Controls */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h2 className="font-headline font-bold text-xl text-foreground">
              {isAr ? `${sortedCourses.length} دورة` : `${sortedCourses.length} Courses`}
            </h2>
            <Badge className={cn("rounded-full border-0 px-3 py-1", branding.badgeClass)}>
              {localizedTopic}
            </Badge>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">{isAr ? "ترتيب:" : "Sort:"}</span>
            <div className="flex gap-1 flex-wrap">
              {sortOptions.map(opt => (
                <Button
                  key={opt.value}
                  variant={sort === opt.value ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-7 px-3 rounded-full"
                  onClick={() => setSort(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Course grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedCourses.map((course, i) => (
            <div key={course.slug} className="animate-slide-up" style={{ animationDelay: `${i * 45}ms` }}>
              <CourseCard
                course={course}
                enrolled={enrolledSlugs.includes(course.slug)}
                completed={typeof window !== "undefined" ? localStorage.getItem(`complete-${course.slug}`) === "true" : false}
                progress={progressMap[course.slug] || 0}
              />
            </div>
          ))}
        </div>

        {/* Related Topics */}
        <div className="mt-14">
          <div className="flex items-center gap-3 mb-5">
            <div className="accent-rule" />
            <h3 className="font-headline font-bold text-lg text-foreground ml-3">
              {isAr ? "مسارات أخرى" : "Other Tracks"}
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {topicsData
              .filter(t => t.count > 0 && t.slug !== slug)
              .map(t => {
                const tb = getTopicBranding(t.name);
                return (
                  <Link
                    key={t.slug}
                    href={`/topics/${t.slug}`}
                    className="group flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm text-muted-foreground transition-all hover:border-primary/35 hover:bg-surface-container-low hover:text-primary hover:shadow-sm"
                  >
                    <span className="text-base">{t.icon}</span>
                    <span className="font-medium">{getLocalizedTopicLabel(t.name, locale)}</span>
                    <span className="rounded-full bg-surface-container px-1.5 text-[10px] font-bold">{t.count}</span>
                    <Arrow className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                );
              })}
          </div>
        </div>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/course-card";
import { useLocale } from "@/components/locale-provider";
import { NavBar, MobileNav } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getTopicBranding } from "@/lib/topic-branding";
import { getLocalizedTopicDescription, getLocalizedTopicLabel } from "@/lib/topic-localization";
import topicsData from "@/lib/data/topics.json";

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
  const directionalArrow = locale === "ar" ? "arrow_back" : "arrow_forward";
  const breadcrumbChevron = locale === "ar" ? "chevron_left" : "chevron_right";

  const [sort, setSort] = useState("default");
  const [enrolledSlugs, setEnrolledSlugs] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const parsed = JSON.parse(localStorage.getItem("enrolledCourses") || "[]");
      return Array.isArray(parsed)
        ? parsed.filter((item): item is string => typeof item === "string")
        : [];
    } catch {
      return [];
    }
  });
  const [progressMap, setProgressMap] = useState(() => {
    if (typeof window === "undefined") return {};
    const pm: Record<string, number> = {};
    topicCourses.forEach((c) => {
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
          const titleA = locale === "ar" ? a.titleArabic || a.title : a.title;
          const titleB = locale === "ar" ? b.titleArabic || b.title : b.title;
          return titleA.localeCompare(titleB);
        });
      case "duration-asc": return courses.sort((a, b) => parseInt(String(a.duration)) - parseInt(String(b.duration)));
      case "duration-desc": return courses.sort((a, b) => parseInt(String(b.duration)) - parseInt(String(a.duration)));
      default: return courses;
    }
  }, [locale, sort, topicCourses]);

  const description = getLocalizedTopicDescription(topic.name, locale, branding.description);
  const enrolledInTopic = topicCourses.filter((c) => enrolledSlugs.includes(c.slug)).length;
  const totalDuration = topicCourses.reduce((sum, c) => sum + parseInt(String(c.duration)), 0);
  const sortOptions = locale === "ar"
    ? [
        { value: "default", label: "الترتيب الافتراضي" },
        { value: "az", label: "أبجديًا" },
        { value: "duration-asc", label: "الأقصر أولًا" },
        { value: "duration-desc", label: "الأطول أولًا" },
      ]
    : [
        { value: "default", label: "Default Order" },
        { value: "az", label: "A–Z" },
        { value: "duration-asc", label: "Shortest First" },
        { value: "duration-desc", label: "Longest First" },
      ];

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      {/* Hero */}
      <section className={`bg-linear-to-br ${branding.gradient} text-white px-5 py-14 relative overflow-hidden`}>
        <div className="hero-orb w-80 h-80 bg-white/10 -top-20 -right-20" />
        <div className="hero-orb w-48 h-48 bg-white/10 -bottom-10 -left-10" />
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-white/60 text-xs mb-6 animate-slide-down">
            <Link href="/" className="hover:text-white transition-colors">{locale === "ar" ? "الرئيسية" : "Home"}</Link>
            <span className="material-symbols-outlined text-[12px]">{breadcrumbChevron}</span>
            <Link href="/topics" className="hover:text-white transition-colors">{locale === "ar" ? "المسارات" : "Topics"}</Link>
            <span className="material-symbols-outlined text-[12px]">{breadcrumbChevron}</span>
            <span className="text-white">{localizedTopic}</span>
          </nav>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1 space-y-4 animate-slide-up">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl border border-white/20">
                  <span className="text-3xl">{topic.icon}</span>
                </div>
                <div>
                  <h1 className="font-headline text-2xl lg:text-3xl font-extrabold tracking-tight">{localizedTopic}</h1>
                  <p className="text-white/60 text-sm mt-0.5">{locale === "ar" ? "مسار تدريبي صحي" : "Healthcare Training Track"}</p>
                </div>
              </div>
              {alternateName !== localizedTopic && (
                <p className={`text-sm text-white/60 ${locale === "ar" ? "" : "font-arabic"}`} dir={locale === "ar" ? "ltr" : "rtl"}>
                  {alternateName}
                </p>
              )}
              <p className="text-sm text-white/80 leading-relaxed max-w-2xl">{description}</p>
            </div>

            {/* Stats */}
            <div className="flex gap-4 animate-slide-up delay-100">
              {[
                { icon: "menu_book", value: topic.count, label: locale === "ar" ? "الدورات" : "Courses" },
                { icon: "schedule", value: locale === "ar" ? `${Math.round(totalDuration / 60)} س` : `${Math.round(totalDuration / 60)}h`, label: locale === "ar" ? "إجمالي الوقت" : "Total Time" },
                { icon: "school", value: enrolledInTopic, label: locale === "ar" ? "المسجلون" : "Enrolled" },
              ].map((stat, i) => (
                <div key={i} className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 text-center border border-white/15 min-w-20">
                  <span className="material-symbols-outlined text-[20px] block mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
                  <div className="font-headline text-xl font-extrabold">{stat.value}</div>
                  <div className="text-[10px] text-white/60">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main */}
      <main className="flex-1 max-w-7xl mx-auto px-5 py-8 pb-24 w-full">
        {/* Controls */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <h2 className="font-headline font-bold text-lg">{locale === "ar" ? `${sortedCourses.length} دورة` : `${sortedCourses.length} Courses`}</h2>
            <Badge variant="secondary" className="rounded-full text-xs">{localizedTopic}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{locale === "ar" ? "ترتيب:" : "Sort:"}</span>
            <div className="flex gap-1">
              {sortOptions.map((opt) => (
                <Button
                  key={opt.value}
                  variant={sort === opt.value ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-7 px-2.5 rounded-full"
                  onClick={() => setSort(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedCourses.map((course, i) => (
            <div key={course.slug} className="animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
              <CourseCard
                course={course}
                enrolled={enrolledSlugs.includes(course.slug)}
                completed={typeof window !== "undefined" ? localStorage.getItem(`complete-${course.slug}`) === "true" : false}
                progress={progressMap[course.slug] || 0}
                index={i}
              />
            </div>
          ))}
        </div>

        {/* Related Topics */}
        <div className="mt-12">
          <h3 className="font-headline font-bold text-lg mb-4">{locale === "ar" ? "مسارات أخرى" : "Other Topics"}</h3>
          <div className="flex flex-wrap gap-2">
            {topicsData
              .filter((t) => t.count > 0 && t.slug !== slug)
              .map((t) => (
                <Link
                  key={t.slug}
                  href={`/topics/${t.slug}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-sm text-muted-foreground hover:text-primary"
                >
                  <span>{t.icon}</span>
                  {getLocalizedTopicLabel(t.name, locale)}
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5 rounded-full">{t.count}</Badge>
                  <span className="material-symbols-outlined text-[13px] opacity-60">{directionalArrow}</span>
                </Link>
              ))}
          </div>
        </div>
      </main>

      <Footer />
      <MobileNav activeItem="topics" />
    </div>
  );
}

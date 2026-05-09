"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, BookOpenCheck, GraduationCap, BookmarkCheck, Clock, TrendingUp, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useLocale } from "@/components/locale-provider";
import { NavBar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MobileNav } from "@/components/navbar";
import { CourseCard } from "@/components/course-card";
import { getLocalizedTopicLabel } from "@/lib/topic-localization";
import coursesData from "@/lib/data/courses.json";
import { cn } from "@/lib/utils";

function CircularProgress({ value, size = 80 }: { value: number; size?: number }) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-surface-container)" strokeWidth="6" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
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

export default function MyLearningPage() {
  const { locale } = useLocale();
  const isAr = locale === "ar";
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const [enrolledSlugs] = useState(() => {
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
  const [savedSlugs] = useState(() => {
    if (typeof window === "undefined") return [];
    const saved: string[] = [];
    coursesData.forEach(c => {
      if (localStorage.getItem(`saved-${c.slug}`) === "true") saved.push(c.slug);
    });
    return saved;
  });
  const [completedSlugs] = useState(() => {
    if (typeof window === "undefined") return [];
    const completed: string[] = [];
    coursesData.forEach(c => {
      if (localStorage.getItem(`complete-${c.slug}`) === "true") completed.push(c.slug);
    });
    return completed;
  });
  const [progressMap] = useState(() => {
    if (typeof window === "undefined") return {};
    const pm: Record<string, number> = {};
    coursesData.forEach(c => {
      const p = Number.parseInt(localStorage.getItem(`progress-${c.slug}`) || "0", 10);
      if (p > 0) pm[c.slug] = p;
    });
    return pm;
  });

  const enrolledCourses = useMemo(() => coursesData.filter(c => enrolledSlugs.includes(c.slug)), [enrolledSlugs]);
  const inProgressCourses = useMemo(
    () => enrolledCourses.filter(c => !completedSlugs.includes(c.slug) && (progressMap[c.slug] || 0) > 0),
    [enrolledCourses, completedSlugs, progressMap]
  );
  const completedCourses = useMemo(() => coursesData.filter(c => completedSlugs.includes(c.slug)), [completedSlugs]);
  const savedCourses = useMemo(() => coursesData.filter(c => savedSlugs.includes(c.slug)), [savedSlugs]);

  const overallProgress = useMemo(() => {
    if (enrolledCourses.length === 0) return 0;
    const totalPct = enrolledCourses.reduce((sum, c) => sum + (progressMap[c.slug] || 0), 0);
    return Math.round(totalPct / enrolledCourses.length);
  }, [enrolledCourses, progressMap]);

  const totalMinutes = useMemo(
    () => completedCourses.reduce((sum, c) => sum + parseInt(String(c.duration)), 0),
    [completedCourses]
  );

  const hasAnyActivity = enrolledCourses.length > 0 || savedCourses.length > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      {/* ── Hero ── */}
      <section className="hero-gradient-alt text-white px-container-padding py-14 relative overflow-hidden">
        <div className="hero-orb w-80 h-80 bg-white/8 -top-16 -right-16" />
        <div className="hero-orb w-56 h-56 bg-secondary/15 -bottom-8 -left-8" />

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row items-start gap-10">
          <div className="flex-1 space-y-4 animate-slide-up">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-lg">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-headline text-2xl lg:text-4xl font-extrabold leading-tight">
                  {isAr ? "تعلمي" : "My Learning"}
                </h1>
                <p className="text-white/60 text-xs mt-0.5">
                  {isAr ? "تابع تقدمك عبر الدورات والمسارات" : "Track your progress across courses and tracks"}
                </p>
              </div>
            </div>

            <p className="text-sm text-white/78 max-w-md leading-7">
              {isAr
                ? hasAnyActivity
                  ? `لديك ${enrolledCourses.length} دورة مسجلة و${completedCourses.length} مكتملة.`
                  : "ابدأ رحلتك التعليمية بالتسجيل في دورة."
                : hasAnyActivity
                ? `You have ${enrolledCourses.length} enrolled course${enrolledCourses.length !== 1 ? "s" : ""} and ${completedCourses.length} completed.`
                : "Start your learning journey by enrolling in a course."}
            </p>

            {hasAnyActivity && (
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { value: enrolledCourses.length, label: isAr ? "مسجل" : "Enrolled", color: "bg-blue-500/20 text-blue-200 border-blue-400/25" },
                  { value: inProgressCourses.length, label: isAr ? "قيد التقدم" : "In Progress", color: "bg-amber-500/20 text-amber-200 border-amber-400/25" },
                  { value: completedCourses.length, label: isAr ? "مكتمل" : "Completed", color: "bg-emerald-500/20 text-emerald-200 border-emerald-400/25" },
                  { value: savedCourses.length, label: isAr ? "محفوظ" : "Saved", color: "bg-purple-500/20 text-purple-200 border-purple-400/25" },
                ].filter(s => s.value > 0).map(s => (
                  <div key={s.label} className={cn("hero-stat-pill border", s.color)}>
                    <span className="font-bold">{s.value}</span>
                    <span className="opacity-80">{s.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3 animate-slide-up delay-150 shrink-0">
            {[
              { icon: BookOpenCheck, value: enrolledCourses.length, label: isAr ? "مسجل" : "Enrolled", color: "text-blue-300" },
              { icon: TrendingUp, value: inProgressCourses.length, label: isAr ? "قيد التقدم" : "In Progress", color: "text-amber-300" },
              { icon: Trophy, value: completedCourses.length, label: isAr ? "مكتمل" : "Completed", color: "text-emerald-300" },
              { icon: BookmarkCheck, value: savedCourses.length, label: isAr ? "محفوظ" : "Saved", color: "text-purple-300" },
            ].map((stat, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/12 bg-white/10 px-4 py-4 text-center backdrop-blur-sm"
              >
                <stat.icon className={cn("h-5 w-5 mx-auto mb-1.5", stat.color)} />
                <div className="font-headline text-2xl font-extrabold">{stat.value}</div>
                <div className="text-[10px] text-white/55 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="flex-1 max-w-7xl mx-auto px-container-padding py-8 pb-24 w-full">
        {!hasAnyActivity ? (
          /* ── Empty State ── */
          <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
            <div className="relative mb-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-secondary text-white shadow-[0_20px_50px_rgba(15,91,92,0.30)] mx-auto">
                <GraduationCap className="h-10 w-10" />
              </div>
              <div className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-secondary text-background">
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>

            <h2 className="font-headline text-2xl font-bold text-foreground mb-3">
              {isAr ? "ابدأ رحلتك التعليمية" : "Start Your Learning Journey"}
            </h2>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-8 leading-7">
              {isAr
                ? "استكشف دوراتنا الصحية وسجّل لتتبع تقدمك والحصول على شهادات."
                : `Explore ${coursesData.length} IHI-accredited healthcare courses and enroll to track your progress.`}
            </p>

            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/#courses">
                <Button className="gap-2 rounded-full px-6">
                  <BookOpenCheck className="h-4 w-4" />
                  {isAr ? "تصفح الدورات" : "Browse Courses"}
                </Button>
              </Link>
              <Link href="/topics">
                <Button variant="outline" className="gap-2 rounded-full px-6">
                  <span className="material-symbols-outlined text-[18px]">category</span>
                  {isAr ? "عرض المسارات" : "View Topics"}
                </Button>
              </Link>
            </div>

            {/* Teaser track pills */}
            <div className="mt-12 flex flex-wrap gap-2 justify-center opacity-60">
              {["Patient Safety", "Quality Improvement", "Leadership", "AI Healthcare"].map(name => (
                <span key={name} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                  {getLocalizedTopicLabel(name, locale)}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8">

            {/* ── Overall Progress Card ── */}
            {enrolledCourses.length > 0 && (
              <Card className="overflow-hidden animate-slide-up border-border/70">
                <div className="h-1 animated-gradient" />
                <CardContent className="p-6">
                  <div className="flex items-center gap-6 flex-wrap">
                    <div className="relative shrink-0">
                      <CircularProgress value={overallProgress} size={80} />
                      <span className="absolute inset-0 flex items-center justify-center font-headline text-base font-extrabold text-primary">
                        {overallProgress}%
                      </span>
                    </div>
                    <div className="flex-1 space-y-2 min-w-0">
                      <h3 className="font-headline font-bold text-xl text-foreground">
                        {isAr ? "التقدم التعليمي العام" : "Overall Learning Progress"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {isAr
                          ? `${completedCourses.length} من ${enrolledCourses.length} دورة مكتملة · ${Math.round(totalMinutes / 60)} ساعة تعلم`
                          : `${completedCourses.length} of ${enrolledCourses.length} courses completed · ${Math.round(totalMinutes / 60)}h of learning`}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {[
                          { icon: Trophy, label: isAr ? `${completedCourses.length} مكتملة` : `${completedCourses.length} Completed`, cls: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400" },
                          { icon: TrendingUp, label: isAr ? `${inProgressCourses.length} قيد التقدم` : `${inProgressCourses.length} In Progress`, cls: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400" },
                          { icon: Clock, label: isAr ? `${totalMinutes} دقيقة` : `${totalMinutes} min completed`, cls: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400" },
                        ].map(item => (
                          <div key={item.label} className={cn("flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold", item.cls)}>
                            <item.icon className="h-3.5 w-3.5" />
                            {item.label}
                          </div>
                        ))}
                      </div>
                    </div>
                    {completedCourses.length > 0 && (
                      <div className="hidden lg:flex flex-col items-center gap-1 text-center shrink-0">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-900/20">
                          <Trophy className="h-6 w-6 text-amber-500" />
                        </div>
                        <span className="text-[10px] text-muted-foreground">{isAr ? "إنجاز" : "Achievement"}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── Tabs ── */}
            <Tabs defaultValue="enrolled" className="w-full animate-slide-up delay-100">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <TabsList className="flex gap-1 bg-transparent p-0 h-auto shrink-0">
                  <TabsTrigger
                    value="enrolled"
                    className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2 text-sm font-medium whitespace-nowrap"
                  >
                    {isAr ? `الكل (${enrolledCourses.length})` : `All (${enrolledCourses.length})`}
                  </TabsTrigger>
                  {inProgressCourses.length > 0 && (
                    <TabsTrigger
                      value="in-progress"
                      className="rounded-full data-[state=active]:bg-amber-500 data-[state=active]:text-white px-4 py-2 text-sm font-medium whitespace-nowrap"
                    >
                      {isAr ? `قيد التقدم (${inProgressCourses.length})` : `In Progress (${inProgressCourses.length})`}
                    </TabsTrigger>
                  )}
                  {completedCourses.length > 0 && (
                    <TabsTrigger
                      value="completed"
                      className="rounded-full data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-4 py-2 text-sm font-medium whitespace-nowrap"
                    >
                      {isAr ? `مكتملة (${completedCourses.length})` : `Completed (${completedCourses.length})`}
                    </TabsTrigger>
                  )}
                  {savedCourses.length > 0 && (
                    <TabsTrigger
                      value="saved"
                      className="rounded-full data-[state=active]:bg-purple-600 data-[state=active]:text-white px-4 py-2 text-sm font-medium whitespace-nowrap"
                    >
                      {isAr ? `محفوظة (${savedCourses.length})` : `Saved (${savedCourses.length})`}
                    </TabsTrigger>
                  )}
                </TabsList>
              </div>

              {/* All Enrolled */}
              <TabsContent value="enrolled" className="mt-6">
                {enrolledCourses.length === 0 ? (
                  <EmptyTabState
                    message={isAr ? "لا توجد دورات مسجلة بعد" : "No enrolled courses yet"}
                    link="/#courses"
                    linkLabel={isAr ? "تصفح الدورات" : "Browse Courses"}
                    locale={locale}
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {enrolledCourses.map((course, i) => (
                      <div key={course.slug} className="animate-slide-up" style={{ animationDelay: `${i * 40}ms` }}>
                        <CourseCard
                          course={course}
                          enrolled
                          completed={completedSlugs.includes(course.slug)}
                          progress={progressMap[course.slug] || 0}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* In Progress */}
              <TabsContent value="in-progress" className="mt-6">
                <div className="space-y-3">
                  {inProgressCourses.map((course, i) => (
                    <Link key={course.slug} href={`/courses/${course.slug}`}>
                      <Card
                        className="hover:border-primary/30 hover:shadow-md transition-all animate-slide-up border-border/70"
                        style={{ animationDelay: `${i * 40}ms` }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-900/20 shrink-0">
                              <TrendingUp className="h-5 w-5 text-amber-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-headline font-semibold text-sm line-clamp-1 text-foreground">
                                {isAr ? course.titleArabic || course.title : course.title}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {getLocalizedTopicLabel(course.topic, locale)} · {isAr ? `${course.duration} دقيقة` : `${course.duration} min`}
                              </p>
                              <div className="mt-2 space-y-1">
                                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                  <span>{isAr ? "التقدم" : "Progress"}</span>
                                  <span className="font-bold text-primary">{progressMap[course.slug] || 0}%</span>
                                </div>
                                <Progress value={progressMap[course.slug] || 0} className="h-1.5" />
                              </div>
                            </div>
                            <Arrow className="h-4 w-4 text-primary shrink-0" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </TabsContent>

              {/* Completed */}
              <TabsContent value="completed" className="mt-6">
                <div className="space-y-5">
                  {/* Achievement banner */}
                  <div className="certificate-border rounded-2xl p-5 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Trophy className="h-6 w-6 text-amber-500" />
                      <h3 className="font-headline font-bold text-lg text-foreground">
                        {isAr
                          ? `أكملت ${completedCourses.length} ${completedCourses.length === 1 ? "دورة" : "دورات"}`
                          : `${completedCourses.length} Course${completedCourses.length !== 1 ? "s" : ""} Completed!`}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {isAr
                        ? `حصلت على ${(completedCourses.length * 1.25).toFixed(2)} نقطة تعليم مستمر وأنجزت ${totalMinutes} دقيقة من التعلم.`
                        : `You've earned ${(completedCourses.length * 1.25).toFixed(2)} CE credits · ${totalMinutes} min of learning`}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {completedCourses.map((course, i) => (
                      <div key={course.slug} className="animate-slide-up" style={{ animationDelay: `${i * 40}ms` }}>
                        <CourseCard course={course} enrolled completed progress={100} />
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Saved */}
              <TabsContent value="saved" className="mt-6">
                {savedCourses.length === 0 ? (
                  <EmptyTabState
                    message={isAr ? "لا توجد دورات محفوظة بعد" : "No saved courses yet"}
                    link="/#courses"
                    linkLabel={isAr ? "تصفح الدورات" : "Browse Courses"}
                    locale={locale}
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {savedCourses.map((course, i) => (
                      <div key={course.slug} className="animate-slide-up" style={{ animationDelay: `${i * 40}ms` }}>
                        <CourseCard
                          course={course}
                          enrolled={enrolledSlugs.includes(course.slug)}
                          progress={progressMap[course.slug] || 0}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}

function EmptyTabState({
  message,
  link,
  linkLabel,
  locale,
}: {
  message: string;
  link: string;
  linkLabel: string;
  locale: string;
}) {
  const Arrow = locale === "ar" ? ArrowLeft : ArrowRight;
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground animate-fade-in">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-container mb-4">
        <BookOpenCheck className="h-6 w-6 opacity-40" />
      </div>
      <p className="text-sm font-medium text-foreground">{message}</p>
      <Link href={link}>
        <Button variant="outline" size="sm" className="mt-4 gap-2 rounded-full">
          <Arrow className="h-3.5 w-3.5" />
          {linkLabel}
        </Button>
      </Link>
    </div>
  );
}

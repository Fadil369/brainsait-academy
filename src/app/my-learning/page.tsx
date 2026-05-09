"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { NavBar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MobileNav } from "@/components/navbar";
import { CourseCard } from "@/components/course-card";
import coursesData from "@/lib/data/courses.json";

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
  const [mounted, setMounted] = useState(false);
  const [enrolledSlugs, setEnrolledSlugs] = useState<string[]>([]);
  const [savedSlugs, setSavedSlugs] = useState<string[]>([]);
  const [completedSlugs, setCompletedSlugs] = useState<string[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});

  useEffect(() => {
    setMounted(true);
    const enrolled = JSON.parse(localStorage.getItem("enrolledCourses") || "[]");
    setEnrolledSlugs(enrolled);

    const saved: string[] = [];
    const completed: string[] = [];
    const pm: Record<string, number> = {};

    coursesData.forEach((c) => {
      if (localStorage.getItem(`saved-${c.slug}`) === "true") saved.push(c.slug);
      if (localStorage.getItem(`complete-${c.slug}`) === "true") completed.push(c.slug);
      const p = parseInt(localStorage.getItem(`progress-${c.slug}`) || "0");
      if (p > 0) pm[c.slug] = p;
    });

    setSavedSlugs(saved);
    setCompletedSlugs(completed);
    setProgressMap(pm);
  }, []);

  const enrolledCourses = useMemo(
    () => coursesData.filter((c) => enrolledSlugs.includes(c.slug)),
    [enrolledSlugs]
  );
  const inProgressCourses = useMemo(
    () => enrolledCourses.filter((c) => !completedSlugs.includes(c.slug) && (progressMap[c.slug] || 0) > 0),
    [enrolledCourses, completedSlugs, progressMap]
  );
  const completedCourses = useMemo(
    () => coursesData.filter((c) => completedSlugs.includes(c.slug)),
    [completedSlugs]
  );
  const savedCourses = useMemo(
    () => coursesData.filter((c) => savedSlugs.includes(c.slug)),
    [savedSlugs]
  );

  const overallProgress = useMemo(() => {
    if (enrolledCourses.length === 0) return 0;
    const totalPct = enrolledCourses.reduce((sum, c) => sum + (progressMap[c.slug] || 0), 0);
    return Math.round(totalPct / enrolledCourses.length);
  }, [enrolledCourses, progressMap]);

  const totalMinutes = useMemo(
    () => completedCourses.reduce((sum, c) => sum + parseInt(String(c.duration)), 0),
    [completedCourses]
  );

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <div className="max-w-7xl mx-auto px-5 py-8 w-full space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 skeleton-shimmer rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const hasAnyActivity = enrolledCourses.length > 0 || savedCourses.length > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      {/* Hero */}
      <section className="hero-gradient-alt text-white px-5 py-12 relative overflow-hidden">
        <div className="hero-orb w-80 h-80 bg-indigo-500/20 -top-16 -right-16" />
        <div className="hero-orb w-56 h-56 bg-blue-400/10 -bottom-8 -left-8" />
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row items-start gap-8">
          <div className="flex-1 space-y-3 animate-slide-up">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
              </div>
              <div>
                <h1 className="font-headline text-2xl lg:text-3xl font-extrabold">My Learning</h1>
                <p className="text-white/60 text-xs">Track your progress · مسار التعلم</p>
              </div>
            </div>
            <p className="text-sm text-white/75 max-w-md">
              {hasAnyActivity
                ? `You have ${enrolledCourses.length} enrolled course${enrolledCourses.length !== 1 ? "s" : ""} and ${completedCourses.length} completed.`
                : "Start your learning journey by enrolling in a course."}
            </p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-3 animate-slide-up delay-100">
            {[
              { icon: "school", value: enrolledCourses.length, label: "Enrolled", color: "text-blue-300" },
              { icon: "pending", value: inProgressCourses.length, label: "In Progress", color: "text-amber-300" },
              { icon: "task_alt", value: completedCourses.length, label: "Completed", color: "text-emerald-300" },
              { icon: "bookmark", value: savedCourses.length, label: "Saved", color: "text-purple-300" },
            ].map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-3 text-center border border-white/10 min-w-[70px]">
                <span className={`material-symbols-outlined text-[20px] ${stat.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
                <div className="font-headline text-xl font-extrabold mt-1">{stat.value}</div>
                <div className="text-[10px] text-white/55">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="flex-1 max-w-7xl mx-auto px-5 py-8 pb-24 w-full">
        {!hasAnyActivity ? (
          /* Empty State */
          <div className="text-center py-20 animate-fade-in">
            <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-5">
              <span className="material-symbols-outlined text-white text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
            </div>
            <h2 className="font-headline text-xl font-bold mb-2">Start Your Learning Journey</h2>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
              Explore our 43 IHI-accredited healthcare courses and enroll to track your progress.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/#courses">
                <Button className="gap-2">
                  <span className="material-symbols-outlined text-[18px]">auto_stories</span>
                  Browse Courses
                </Button>
              </Link>
              <Link href="/topics">
                <Button variant="outline" className="gap-2">
                  <span className="material-symbols-outlined text-[18px]">category</span>
                  View Topics
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Overall Progress Card */}
            {enrolledCourses.length > 0 && (
              <Card className="overflow-hidden animate-slide-up">
                <div className="h-1.5 gradient-primary" />
                <CardContent className="p-5">
                  <div className="flex items-center gap-5">
                    <div className="relative flex-shrink-0">
                      <CircularProgress value={overallProgress} size={80} />
                      <span className="absolute inset-0 flex items-center justify-center font-headline text-base font-extrabold text-primary">
                        {overallProgress}%
                      </span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <h3 className="font-headline font-bold text-lg">Overall Learning Progress</h3>
                      <p className="text-sm text-muted-foreground">
                        {completedCourses.length} of {enrolledCourses.length} courses completed ·{" "}
                        {Math.round(totalMinutes / 60)}h of learning time
                      </p>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 px-2.5 py-1 rounded-full">
                          <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
                          {completedCourses.length} Completed
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 px-2.5 py-1 rounded-full">
                          <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>pending</span>
                          {inProgressCourses.length} In Progress
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 px-2.5 py-1 rounded-full">
                          <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
                          {totalMinutes} min completed
                        </div>
                      </div>
                    </div>
                    {completedCourses.length > 0 && (
                      <div className="hidden lg:flex flex-col items-center gap-1 text-center">
                        <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                          <span className="material-symbols-outlined text-amber-600 text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">Achievement</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tabs */}
            <Tabs defaultValue="enrolled" className="w-full animate-slide-up delay-100">
              <TabsList className="w-full justify-start overflow-x-auto gap-1 bg-transparent p-0 h-auto flex">
                <TabsTrigger
                  value="enrolled"
                  className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-1.5 text-sm"
                >
                  All Enrolled ({enrolledCourses.length})
                </TabsTrigger>
                {inProgressCourses.length > 0 && (
                  <TabsTrigger
                    value="in-progress"
                    className="rounded-full data-[state=active]:bg-amber-500 data-[state=active]:text-white px-4 py-1.5 text-sm"
                  >
                    In Progress ({inProgressCourses.length})
                  </TabsTrigger>
                )}
                {completedCourses.length > 0 && (
                  <TabsTrigger
                    value="completed"
                    className="rounded-full data-[state=active]:bg-emerald-500 data-[state=active]:text-white px-4 py-1.5 text-sm"
                  >
                    Completed ({completedCourses.length})
                  </TabsTrigger>
                )}
                {savedCourses.length > 0 && (
                  <TabsTrigger
                    value="saved"
                    className="rounded-full data-[state=active]:bg-purple-500 data-[state=active]:text-white px-4 py-1.5 text-sm"
                  >
                    Saved ({savedCourses.length})
                  </TabsTrigger>
                )}
              </TabsList>

              {/* All Enrolled */}
              <TabsContent value="enrolled" className="mt-6">
                {enrolledCourses.length === 0 ? (
                  <EmptyState message="No enrolled courses yet" link="/#courses" linkLabel="Browse Courses" />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {enrolledCourses.map((course, i) => (
                      <div key={course.slug} className="animate-slide-up" style={{ animationDelay: `${i * 40}ms` }}>
                        <CourseCard
                          course={course}
                          enrolled
                          completed={completedSlugs.includes(course.slug)}
                          progress={progressMap[course.slug] || 0}
                          index={i}
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
                      <Card className="hover:border-primary/30 transition-all animate-slide-up" style={{ animationDelay: `${i * 40}ms` }}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0">
                              <span className="material-symbols-outlined text-amber-600 text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>pending</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-headline font-semibold text-sm line-clamp-1">{course.title}</h4>
                              <p className="text-xs text-muted-foreground mt-0.5">{course.topic} · {course.duration} min</p>
                              <div className="mt-2 space-y-1">
                                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                  <span>Progress</span>
                                  <span className="font-semibold text-primary">{progressMap[course.slug] || 0}%</span>
                                </div>
                                <Progress value={progressMap[course.slug] || 0} className="h-1.5" />
                              </div>
                            </div>
                            <span className="material-symbols-outlined text-primary text-[20px] flex-shrink-0">arrow_forward</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </TabsContent>

              {/* Completed */}
              <TabsContent value="completed" className="mt-6">
                <div className="space-y-4">
                  {/* Achievement Banner */}
                  <div className="certificate-border p-4 rounded-xl text-center space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-amber-500 text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                      <h3 className="font-headline font-bold text-lg">{completedCourses.length} Course{completedCourses.length !== 1 ? "s" : ""} Completed!</h3>
                    </div>
                      <p className="text-sm text-muted-foreground">
                        You&apos;ve earned {completedCourses.length * 1.25} CE credits · {totalMinutes} min of learning
                      </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {completedCourses.map((course, i) => (
                      <div key={course.slug} className="animate-slide-up" style={{ animationDelay: `${i * 40}ms` }}>
                        <CourseCard
                          course={course}
                          enrolled
                          completed
                          progress={100}
                          index={i}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Saved */}
              <TabsContent value="saved" className="mt-6">
                {savedCourses.length === 0 ? (
                  <EmptyState message="No saved courses yet" link="/#courses" linkLabel="Browse Courses" />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedCourses.map((course, i) => (
                      <div key={course.slug} className="animate-slide-up" style={{ animationDelay: `${i * 40}ms` }}>
                        <CourseCard
                          course={course}
                          enrolled={enrolledSlugs.includes(course.slug)}
                          progress={progressMap[course.slug] || 0}
                          index={i}
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
      <MobileNav activeItem="learning" />
    </div>
  );
}

function EmptyState({ message, link, linkLabel }: { message: string; link: string; linkLabel: string }) {
  return (
    <div className="text-center py-12 text-muted-foreground animate-fade-in">
      <span className="material-symbols-outlined text-[40px] block mb-3 opacity-30">inbox</span>
      <p className="text-sm">{message}</p>
      <Link href={link}>
        <Button variant="outline" size="sm" className="mt-3 gap-1">
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          {linkLabel}
        </Button>
      </Link>
    </div>
  );
}

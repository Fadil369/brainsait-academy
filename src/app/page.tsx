"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { CourseCard } from "@/components/course-card";
import { NavBar, MobileNav } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { toast } from "sonner";
import coursesData from "@/lib/data/courses.json";
import topicsData from "@/lib/data/topics.json";

type Course = (typeof coursesData)[0];

const TOPIC_ICONS: Record<string, string> = {
  "Quality Improvement": "📊",
  "Patient Safety": "🛡️",
  "Leadership": "👔",
  "Person- and Family-Centered Care": "💼",
  "Triple Aim": "🎯",
  "Graduate Medical Education": "🎓",
  "Contextualizing Care": "🤝",
  "ClaimLINC": "⚡",
  "AI Healthcare": "🤖",
  "NPHIES": "🏥",
  "FHIR R4": "🔗",
  "Decarbonization": "🌿",
  "Dental Care": "🦷",
  "Advanced Leadership": "🏆",
};

const TOPIC_GRADIENTS: Record<string, string> = {
  "Patient Safety": "from-emerald-500 to-teal-600",
  "Quality Improvement": "from-indigo-500 to-violet-600",
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

const FEATURED_SLUGS = ["ps-101", "qi-101", "l-101", "cc-101", "ta-101", "nphies-ai-mastery"];
const activeTopics = topicsData.filter((t) => t.count > 0);

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTopic, setActiveTopic] = useState("all");
  const [enrolledSlugs, setEnrolledSlugs] = useState<string[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [completedSlugs, setCompletedSlugs] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
    const enrolled = JSON.parse(localStorage.getItem("enrolledCourses") || "[]");
    setEnrolledSlugs(enrolled);
    const pm: Record<string, number> = {};
    const completed: string[] = [];
    coursesData.forEach((c) => {
      const p = parseInt(localStorage.getItem(`progress-${c.slug}`) || "0");
      if (p > 0) pm[c.slug] = p;
      if (localStorage.getItem(`complete-${c.slug}`) === "true") completed.push(c.slug);
    });
    setProgressMap(pm);
    setCompletedSlugs(completed);
  }, []);

  const filteredCourses = useMemo(() => {
    return coursesData.filter((c) => {
      const matchSearch =
        !search ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        (c.titleArabic || "").toLowerCase().includes(search.toLowerCase()) ||
        c.topic.toLowerCase().includes(search.toLowerCase()) ||
        (c.code || "").toLowerCase().includes(search.toLowerCase());
      const matchTopic =
        activeTopic === "all" ||
        c.topic.toLowerCase().replace(/[^a-z0-9]+/g, "-") === activeTopic;
      return matchSearch && matchTopic;
    });
  }, [search, activeTopic]);

  const featuredCourses = useMemo(
    () =>
      FEATURED_SLUGS.map((s) => coursesData.find((c) => c.slug === s)).filter(Boolean) as Course[],
    []
  );

  const continueCourses = useMemo(
    () =>
      coursesData.filter(
        (c) => enrolledSlugs.includes(c.slug) && !completedSlugs.includes(c.slug)
      ).slice(0, 6),
    [enrolledSlugs, completedSlugs]
  );

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      {/* Hero */}
      <section className="hero-gradient text-white relative overflow-hidden">
        {/* Orbs */}
        <div className="hero-orb w-[500px] h-[500px] bg-white/8 -top-32 -right-32" />
        <div className="hero-orb w-64 h-64 bg-cyan-400/15 top-1/2 left-1/4" />
        <div className="hero-orb w-48 h-48 bg-indigo-300/10 bottom-0 right-1/3" />

        <div className="max-w-7xl mx-auto px-5 py-16 lg:py-24 relative z-10">
          <div className="max-w-3xl space-y-5">
            <div className="animate-slide-down flex items-center gap-2 flex-wrap">
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm gap-1">
                <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                IHI Open School Partner
              </Badge>
              <Badge className="bg-white/15 text-white border-white/20 backdrop-blur-sm text-[10px]">
                CBAHI Aligned
              </Badge>
              <Badge className="bg-white/15 text-white border-white/20 backdrop-blur-sm text-[10px]">
                Vision 2030
              </Badge>
            </div>

            <h1 className="animate-slide-up font-headline text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight leading-[1.1]">
              Premium Healthcare
              <span className="block text-cyan-300">Training Academy</span>
            </h1>

            <p className="animate-slide-up delay-100 text-base lg:text-lg text-white/80 max-w-xl leading-relaxed">
              {coursesData.length} IHI-accredited courses in Arabic & English — designed for Saudi healthcare professionals committed to excellence.
            </p>
            <p className="animate-slide-up delay-150 text-sm text-white/55 font-arabic" dir="rtl">
              دورات معتمدة من IHI بالعربية والإنجليزية للمهنيين الصحيين
            </p>

            {/* Hero CTAs */}
            <div className="animate-slide-up delay-200 flex flex-wrap gap-3 pt-2">
              <a href="#courses">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 gap-2 font-semibold shadow-lg">
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
                  Explore Courses
                </Button>
              </a>
              <Link href="/topics">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-2">
                  <span className="material-symbols-outlined text-[20px]">category</span>
                  Browse Topics
                </Button>
              </Link>
            </div>

            {/* Stat Pills */}
            <div className="animate-slide-up delay-300 flex flex-wrap gap-2.5 pt-2">
              {[
                { icon: "menu_book", label: `${coursesData.length} Courses`, color: "text-blue-200" },
                { icon: "category", label: `${activeTopics.length} Topics`, color: "text-emerald-200" },
                { icon: "translate", label: "Bilingual AR/EN", color: "text-amber-200" },
                { icon: "timer", label: "Self-paced", color: "text-purple-200" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-white/10 backdrop-blur-md rounded-lg px-3 py-2 border border-white/10 flex items-center gap-2"
                >
                  <span className={`material-symbols-outlined text-[18px] ${stat.color}`}>{stat.icon}</span>
                  <span className="text-xs font-medium">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <div className="max-w-3xl mx-auto px-5 w-full -mt-6 relative z-20 animate-slide-up delay-200">
        <div className="glass rounded-2xl shadow-xl p-1 flex items-center">
          <span className="material-symbols-outlined text-muted-foreground px-3 text-[22px]">search</span>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses, topics, keywords... / ابحث بالعربية أو الإنجليزية"
            className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm"
          />
          {search && (
            <Button
              variant="ghost"
              size="icon"
              className="mr-1 rounded-full"
              onClick={() => setSearch("")}
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </Button>
          )}
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-5 py-8 space-y-10 pb-24 w-full" id="courses">
        {/* Continue Learning (only if enrolled) */}
        {continueCourses.length > 0 && !search && (
          <section className="animate-slide-up space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-amber-600 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>pending</span>
                </div>
                <h2 className="font-headline text-lg font-bold">Continue Learning</h2>
              </div>
              <Link href="/my-learning">
                <Button variant="ghost" size="sm" className="gap-1 text-primary text-sm">
                  View All <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {continueCourses.map((course, i) => (
                <CourseCard
                  key={course.slug}
                  course={course}
                  enrolled
                  progress={progressMap[course.slug] || 0}
                  index={i}
                />
              ))}
            </div>
          </section>
        )}

        {/* Stats Grid */}
        {!search && (
          <section className="animate-slide-up delay-100">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  icon: "play_circle",
                  value: coursesData.length,
                  label: "Total Courses",
                  sublabel: "IHI-accredited",
                  color: "text-primary",
                  bg: "bg-primary/8 dark:bg-primary/15",
                },
                {
                  icon: "category",
                  value: activeTopics.length,
                  label: "Topics",
                  sublabel: "Specialized tracks",
                  color: "text-secondary",
                  bg: "bg-secondary/8 dark:bg-secondary/15",
                },
                {
                  icon: "translate",
                  value: 2,
                  label: "Languages",
                  sublabel: "Arabic & English",
                  color: "text-tertiary",
                  bg: "bg-tertiary/8 dark:bg-tertiary/15",
                },
                {
                  icon: "workspace_premium",
                  value: "IHI",
                  label: "Partner",
                  sublabel: "Open School",
                  color: "text-amber-600",
                  bg: "bg-amber-50 dark:bg-amber-900/15",
                },
              ].map((stat, i) => (
                <Card key={i} className={`${stat.bg} border-0 shadow-none`}>
                  <CardContent className="p-4 space-y-1.5">
                    <span
                      className={`material-symbols-outlined text-[26px] ${stat.color}`}
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {stat.icon}
                    </span>
                    <div className="font-headline text-2xl font-extrabold text-foreground">{stat.value}</div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{stat.label}</div>
                      <div className="text-[11px] text-muted-foreground">{stat.sublabel}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Topic Explorer */}
        {!search && (
          <section className="animate-slide-up delay-150 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-xl font-bold">Browse by Topic</h2>
              <Link href="/topics">
                <Button variant="ghost" size="sm" className="gap-1 text-primary text-sm">
                  All Topics <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2">
              <button
                onClick={() => setActiveTopic("all")}
                className={`rounded-xl p-3 text-center transition-all group border ${
                  activeTopic === "all"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30 bg-surface-container-lowest"
                }`}
              >
                <div className="text-2xl mb-1">🌐</div>
                <div className={`text-xs font-semibold truncate ${activeTopic === "all" ? "text-primary" : "text-foreground"}`}>All</div>
                <div className="text-[10px] text-muted-foreground">{coursesData.length}</div>
              </button>
              {activeTopics.map((t) => (
                <button
                  key={t.slug}
                  onClick={() => setActiveTopic(t.slug)}
                  className={`rounded-xl p-3 text-center transition-all group border ${
                    activeTopic === t.slug
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30 bg-surface-container-lowest"
                  }`}
                >
                  <div className="text-2xl mb-1">{TOPIC_ICONS[t.name] || "📚"}</div>
                  <div className={`text-[11px] font-semibold truncate leading-tight ${activeTopic === t.slug ? "text-primary" : "text-foreground group-hover:text-primary transition-colors"}`}>
                    {t.name.split(" ").slice(0, 2).join(" ")}
                  </div>
                  <div className="text-[10px] text-muted-foreground">{t.count}</div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Featured Courses (when no filter) */}
        {!search && activeTopic === "all" && (
          <section className="space-y-4 animate-slide-up delay-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-amber-600 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              </div>
              <h2 className="font-headline text-xl font-bold">Featured Courses</h2>
              <Badge className="badge-new text-xs">Popular</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredCourses.map((course, i) => (
                <CourseCard
                  key={course.slug}
                  course={course}
                  enrolled={enrolledSlugs.includes(course.slug)}
                  completed={completedSlugs.includes(course.slug)}
                  progress={progressMap[course.slug] || 0}
                  index={i}
                />
              ))}
            </div>
          </section>
        )}

        {/* All Courses / Filtered */}
        <section className="space-y-4 animate-slide-up delay-250">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <h2 className="font-headline text-xl font-bold">
                {search
                  ? `Search Results`
                  : activeTopic === "all"
                  ? "All Courses"
                  : topicsData.find((t) => t.slug === activeTopic)?.name || "Courses"}
              </h2>
              <Badge variant="secondary" className="rounded-full text-xs">
                {filteredCourses.length} courses
              </Badge>
            </div>

            {/* Topic Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
              <Button
                size="sm"
                variant={activeTopic === "all" ? "default" : "outline"}
                className="rounded-full whitespace-nowrap h-7 px-3 text-xs"
                onClick={() => setActiveTopic("all")}
              >
                All
              </Button>
              {activeTopics.slice(0, 8).map((t) => (
                <Button
                  key={t.slug}
                  size="sm"
                  variant={activeTopic === t.slug ? "default" : "outline"}
                  className="rounded-full whitespace-nowrap h-7 px-3 text-xs"
                  onClick={() => setActiveTopic(t.slug)}
                >
                  {TOPIC_ICONS[t.name] || "📚"} {t.name}
                </Button>
              ))}
            </div>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground animate-fade-in">
              <span className="material-symbols-outlined text-[48px] block mb-3 opacity-30">search_off</span>
              <p className="font-headline font-semibold">No courses found</p>
              <p className="text-sm mt-1">Try a different search or topic filter</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 gap-1"
                onClick={() => { setSearch(""); setActiveTopic("all"); }}
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                Reset filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCourses.map((course, i) => (
                <div key={course.slug} className="animate-scale-in" style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}>
                  <CourseCard
                    course={course}
                    enrolled={enrolledSlugs.includes(course.slug)}
                    completed={completedSlugs.includes(course.slug)}
                    progress={progressMap[course.slug] || 0}
                    index={i}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Topic Cards Section (bottom) */}
        {!search && activeTopic === "all" && (
          <section className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-xl font-bold">Learning Tracks</h2>
              <Link href="/topics">
                <Button variant="ghost" size="sm" className="gap-1 text-primary text-sm">
                  View All <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {activeTopics.slice(0, 8).map((t, i) => {
                const gradient = TOPIC_GRADIENTS[t.name] || "from-indigo-500 to-purple-600";
                return (
                  <Link key={t.slug} href={`/topics/${t.slug}`} className="group">
                    <div className={`h-24 rounded-xl bg-gradient-to-br ${gradient} relative overflow-hidden p-4 flex items-end`}>
                      <div className="absolute top-3 right-3 text-2xl opacity-30">{TOPIC_ICONS[t.name] || "📚"}</div>
                      <div>
                        <div className="font-headline font-bold text-white text-sm leading-tight">{t.name}</div>
                        <div className="text-white/60 text-[10px] mt-0.5">{t.count} course{t.count !== 1 ? "s" : ""}</div>
                      </div>
                      <span className="material-symbols-outlined text-white/60 group-hover:text-white text-[18px] absolute top-3 left-3 group-hover:translate-x-0.5 transition-all">
                        arrow_forward
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <Footer />
      <MobileNav activeItem="home" />
    </div>
  );
}

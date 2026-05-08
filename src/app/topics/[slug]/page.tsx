"use client";

import { use, useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/course-card";
import { NavBar, MobileNav } from "@/components/navbar";
import { Footer } from "@/components/footer";
import topicsData from "@/lib/data/topics.json";
import coursesData from "@/lib/data/courses.json";

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

const TOPIC_DESCRIPTIONS: Record<string, string> = {
  "Patient Safety": "Evidence-based strategies to prevent harm and improve outcomes for patients across all care settings. Aligned with WHO Global Patient Safety Action Plan and CBAHI standards.",
  "Quality Improvement": "Master systematic approaches to improving healthcare processes using PDSA cycles, data analytics, and Lean/Six Sigma tools for sustainable results.",
  "Leadership": "Develop essential leadership skills to drive change, inspire teams, and build high-performing cultures in complex healthcare organizations.",
  "Advanced Leadership": "Advanced frameworks for senior healthcare leaders managing large-scale organizational transformation and strategic planning.",
  "Triple Aim": "Optimize all three dimensions simultaneously: better patient experience, improved population health, and reduced per capita costs.",
  "Person- and Family-Centered Care": "Put patients and families at the center of every clinical decision, designing care around the needs, values, and preferences of the people being served.",
  "Graduate Medical Education": "Structured training programs aligned with ACGME core competencies for medical residents, fellows, and educators.",
  "AI Healthcare": "Leverage artificial intelligence, machine learning, and data science to transform clinical practice, diagnostics, and operations.",
  "NPHIES": "Saudi Arabia's National Platform for Health Information Exchange Services — compliance, implementation, and optimization standards.",
  "FHIR R4": "Fast Healthcare Interoperability Resources R4 implementation guide for seamless clinical data exchange across systems.",
  "Decarbonization": "Sustainable healthcare practices, green hospital operations, and strategies to reduce environmental impact and carbon footprint.",
  "Dental Care": "Evidence-based dental care protocols, infection control, and quality standards aligned with Saudi MOH guidelines.",
  "ClaimLINC": "Optimize healthcare revenue cycle management, claims processing, and insurance workflow efficiency.",
  "Contextualizing Care": "Personalize every clinical encounter by understanding and addressing each patient's unique life circumstances and social determinants.",
};

const SORT_OPTIONS = [
  { value: "default", label: "Default Order" },
  { value: "az", label: "A–Z" },
  { value: "duration-asc", label: "Shortest First" },
  { value: "duration-desc", label: "Longest First" },
];

export default function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const topic = topicsData.find((t) => t.slug === slug);
  if (!topic || topic.count === 0) notFound();

  const [sort, setSort] = useState("default");
  const [mounted, setMounted] = useState(false);
  const [enrolledSlugs, setEnrolledSlugs] = useState<string[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});

  useEffect(() => {
    setMounted(true);
    setEnrolledSlugs(JSON.parse(localStorage.getItem("enrolledCourses") || "[]"));
    const pm: Record<string, number> = {};
    topicCourses.forEach((c) => {
      pm[c.slug] = parseInt(localStorage.getItem(`progress-${c.slug}`) || "0");
    });
    setProgressMap(pm);
  }, []);

  const topicCourses = coursesData.filter((c) => c.topic === topic.name);

  const sortedCourses = useMemo(() => {
    const courses = [...topicCourses];
    switch (sort) {
      case "az": return courses.sort((a, b) => a.title.localeCompare(b.title));
      case "duration-asc": return courses.sort((a, b) => parseInt(String(a.duration)) - parseInt(String(b.duration)));
      case "duration-desc": return courses.sort((a, b) => parseInt(String(b.duration)) - parseInt(String(a.duration)));
      default: return courses;
    }
  }, [sort]);

  const gradient = TOPIC_GRADIENTS[topic.name] || "from-indigo-500 to-purple-600";
  const description = TOPIC_DESCRIPTIONS[topic.name] || `${topic.count} courses in this specialized track.`;
  const enrolledInTopic = topicCourses.filter((c) => enrolledSlugs.includes(c.slug)).length;
  const totalDuration = topicCourses.reduce((sum, c) => sum + parseInt(String(c.duration)), 0);

  if (!mounted) return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <div className="h-48 skeleton-shimmer mx-5 mt-5 rounded-xl" />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      {/* Hero */}
      <section className={`bg-gradient-to-br ${gradient} text-white px-5 py-14 relative overflow-hidden`}>
        <div className="hero-orb w-80 h-80 bg-white/10 -top-20 -right-20" />
        <div className="hero-orb w-48 h-48 bg-white/10 -bottom-10 -left-10" />
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-white/60 text-xs mb-6 animate-slide-down">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <Link href="/topics" className="hover:text-white transition-colors">Topics</Link>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <span className="text-white">{topic.name}</span>
          </nav>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1 space-y-4 animate-slide-up">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl border border-white/20">
                  {topic.icon}
                </div>
                <div>
                  <h1 className="font-headline text-2xl lg:text-3xl font-extrabold tracking-tight">{topic.name}</h1>
                  <p className="text-white/60 text-sm mt-0.5">Healthcare Training Track</p>
                </div>
              </div>
              <p className="text-sm text-white/80 leading-relaxed max-w-2xl">{description}</p>
            </div>

            {/* Stats */}
            <div className="flex gap-4 animate-slide-up delay-100">
              {[
                { icon: "menu_book", value: topic.count, label: "Courses" },
                { icon: "schedule", value: `${Math.round(totalDuration / 60)}h`, label: "Total Time" },
                { icon: "school", value: enrolledInTopic, label: "Enrolled" },
              ].map((stat, i) => (
                <div key={i} className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 text-center border border-white/15 min-w-[80px]">
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
            <h2 className="font-headline font-bold text-lg">{sortedCourses.length} Courses</h2>
            <Badge variant="secondary" className="rounded-full text-xs">{topic.name}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Sort:</span>
            <div className="flex gap-1">
              {SORT_OPTIONS.map((opt) => (
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
                completed={localStorage.getItem(`complete-${course.slug}`) === "true"}
                progress={progressMap[course.slug] || 0}
                index={i}
              />
            </div>
          ))}
        </div>

        {/* Related Topics */}
        <div className="mt-12">
          <h3 className="font-headline font-bold text-lg mb-4">Other Topics</h3>
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
                  {t.name}
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5 rounded-full">{t.count}</Badge>
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

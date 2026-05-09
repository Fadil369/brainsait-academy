"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import coursesData from "@/lib/data/courses.json";
import topicsData from "@/lib/data/topics.json";

const TOPIC_ICONS: Record<string, string> = {
  "Quality Improvement": "📊", "Patient Safety": "🛡️", "Leadership": "👔",
  "Person- and Family-Centered Care": "💼", "Triple Aim": "🎯", "Graduate Medical Education": "🎓",
  "Contextualizing Care": "🤝", "ClaimLINC": "⚡", "AI Healthcare": "🤖",
  "NPHIES": "🏥", "FHIR R4": "🔗", "Decarbonization": "🌿", "Dental Care": "🦷",
  "Advanced Leadership": "👔"
};

const readEnrolledCourses = (): string[] => {
  try {
    const raw = localStorage.getItem("enrolledCourses");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
};

export default function HomePage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTopic, setActiveTopic] = useState("all");
  const [enrolled, setEnrolled] = useState<string[]>(readEnrolledCourses());

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredCourses = useMemo(() => {
    return coursesData.filter(c => {
      const matchSearch = !search || 
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.titleArabic?.toLowerCase().includes(search.toLowerCase()) ||
        c.topic.toLowerCase().includes(search.toLowerCase());
      const matchTopic = activeTopic === "all" || c.topic.toLowerCase().replace(/[^a-z0-9]+/g, "-") === activeTopic;
      return matchSearch && matchTopic;
    });
  }, [search, activeTopic]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <p className="text-sm text-muted-foreground">Loading BrainsAIT Academy...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Glassmorphic Nav */}
      <nav className="sticky top-0 z-50 glass border-b">
        <div className="max-w-7xl mx-auto px-container-padding h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[20px]">school</span>
            </div>
            <span className="font-headline text-lg font-extrabold text-primary hidden sm:block">BrainsAIT Academy</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-semibold text-primary">Dashboard</Link>
            <Link href="#courses" className="text-sm text-muted-foreground hover:text-primary transition-colors">Courses</Link>
            <Button variant="ghost" size="sm" className="gap-1" onClick={() => {
              const e = readEnrolledCourses();
              toast(e.length ? `📚 ${e.length} courses enrolled` : "Browse courses to enroll!");
            }}>
              <span className="material-symbols-outlined text-[18px]">school</span> My Learning
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="rounded-full w-9 h-9" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              <span className="material-symbols-outlined text-[18px]">{theme === "dark" ? "light_mode" : "dark_mode"}</span>
            </Button>
            <Badge variant="outline" className="gap-1 px-3 py-1">
              <span className="material-symbols-outlined text-[14px]">language</span> AR/EN
            </Badge>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-gradient text-white px-container-padding py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/10 blur-3xl rounded-full" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-2xl space-y-4">
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">✦ IHI Open School Partner</Badge>
            <h1 className="font-headline text-4xl lg:text-5xl font-extrabold tracking-tight">BrainsAIT Academy</h1>
            <p className="text-lg text-white/80">
              Professional healthcare training in Arabic & English. {coursesData.length} courses powered by IHI Open School.
              <span className="block mt-1 text-white/60 font-arabic text-base">تدريب مهني صحي باللغة العربية والإنجليزية</span>
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              {[
                { icon: "menu_book", label: `${coursesData.length} Courses`, color: "text-blue-200" },
                { icon: "category", label: `${topicsData.length} Topics`, color: "text-emerald-200" },
                { icon: "translate", label: "Bilingual AR/EN", color: "text-amber-200" },
              ].map((stat, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-md rounded-lg px-4 py-2 border border-white/10 flex items-center gap-2">
                  <span className={`material-symbols-outlined text-[20px] ${stat.color}`}>{stat.icon}</span>
                  <span className="text-sm font-medium">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Search */}
      <div className="max-w-3xl mx-auto px-container-padding -mt-6 relative z-20">
        <div className="glass rounded-xl shadow-lg p-1 flex items-center">
          <span className="material-symbols-outlined text-muted-foreground px-3">search</span>
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search courses, topics, keywords..."
            className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0"
          />
          {search && (
            <Button variant="ghost" size="icon" className="mr-1" onClick={() => setSearch("")}>
              <span className="material-symbols-outlined text-[18px]">close</span>
            </Button>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-container-padding py-8 space-y-8 pb-24" id="courses">
        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          <Button key="all" variant={activeTopic === "all" ? "default" : "outline"} size="sm" className="rounded-full whitespace-nowrap" onClick={() => setActiveTopic("all")}>
            All
          </Button>
          {topicsData.map(t => (
            <Button
              key={t.slug}
              variant={activeTopic === t.slug ? "default" : "outline"}
              size="sm"
              className="rounded-full whitespace-nowrap"
              onClick={() => setActiveTopic(t.slug)}
            >
              {TOPIC_ICONS[t.name] || "📚"} {t.name}
            </Button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: "play_circle", value: coursesData.length, label: "Courses", color: "text-primary" },
            { icon: "category", value: topicsData.length, label: "Topics", color: "text-secondary" },
            { icon: "translate", value: 2, label: "Languages", color: "text-tertiary" },
            { icon: "workspace_premium", value: "IHI", label: "Partner", color: "text-emerald-600" },
          ].map((stat, i) => (
            <Card key={i} className="text-center py-4">
              <CardContent className="p-0 space-y-1">
                <span className={`material-symbols-outlined text-[28px] ${stat.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
                <div className="font-headline text-xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Topic Grid */}
        <div>
          <h2 className="font-headline text-xl font-bold mb-4">Browse by Topic</h2>
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2">
            {topicsData.map(t => (
              <button
                key={t.slug}
                onClick={() => setActiveTopic(t.slug)}
                className="glass rounded-xl p-3 text-center hover:border-primary/30 transition-all group"
              >
                <div className="text-2xl mb-1">{TOPIC_ICONS[t.name] || "📚"}</div>
                <div className="text-xs font-medium text-foreground group-hover:text-primary transition-colors truncate">{t.name}</div>
                <div className="text-[10px] text-muted-foreground">{t.count}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Course Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-headline text-xl font-bold">
              {activeTopic === "all" ? "All Courses" : topicsData.find(t => t.slug === activeTopic)?.name || "Courses"}
            </h2>
            <Badge variant="secondary" className="rounded-full">{filteredCourses.length} courses</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCourses.map(course => (
              <Link key={course.slug} href={`/courses/${course.slug}`} className="group">
                <Card className="h-full overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all">
                  <div className="h-36 bg-gradient-to-br from-primary/10 to-primary/5 relative flex items-center justify-center">
                    <span className="material-symbols-outlined text-[56px] text-primary/20" style={{ fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                    <Badge className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm text-foreground border-0">
                      {TOPIC_ICONS[course.topic] || "📚"} {course.topic}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-headline font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">{course.title}</h3>
                    {course.titleArabic && (
                      <p className="font-arabic text-sm text-muted-foreground mt-1 line-clamp-2">{course.titleArabic}</p>
                    )}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">schedule</span> {course.duration} min
                      </span>
                      <span className="material-symbols-outlined text-primary text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          {filteredCourses.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <span className="material-symbols-outlined text-[48px] block mb-2">search_off</span>
              No courses found. Try a different search or filter.
            </div>
          )}
        </div>
      </main>

      {/* Mobile Nav */}
      <nav className="mobile-nav fixed bottom-0 w-full z-50 glass border-t rounded-t-xl py-2 px-4 justify-around items-center hidden">
        {[
          { icon: "dashboard", label: "Home", href: "/", active: true },
          { icon: "auto_stories", label: "Courses", href: "#courses" },
          { icon: "school", label: "Learning", action: () => { const e = readEnrolledCourses(); toast(e.length ? `📚 ${e.length} enrolled` : "Browse to enroll!"); } },
          { icon: theme === "dark" ? "light_mode" : "dark_mode", label: "Theme", action: () => setTheme(theme === "dark" ? "light" : "dark") },
        ].map((item, i) => (
          item.href ? (
            <Link key={i} href={item.href} className="flex flex-col items-center gap-0.5 text-muted-foreground">
              <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ) : (
            <button key={i} onClick={item.action} className="flex flex-col items-center gap-0.5 text-muted-foreground">
              <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          )
        ))}
      </nav>

      {/* Footer */}
      <footer className="bg-foreground text-background py-8 px-container-padding">
        <div className="max-w-7xl mx-auto text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">school</span>
            <span className="font-headline font-bold text-lg">BrainsAIT Academy</span>
          </div>
          <p className="text-sm opacity-80">Empowering Healthcare Excellence Through AI-Driven Learning</p>
          <p className="text-sm opacity-60 font-arabic">تمكين التميز الصحي من خلال التعلم القائم على الذكاء الاصطناعي</p>
          <div className="flex justify-center gap-6 text-sm opacity-60">
            <Link href="/" className="hover:opacity-100">Home</Link>
            <Link href="#courses" className="hover:opacity-100">Courses</Link>
            <Link href="https://brainsait.org" className="hover:opacity-100">BrainSAIT.org</Link>
          </div>
          <p className="text-xs opacity-40">© 2026 BrainSAIT. All rights reserved. Powered by IHI Open School</p>
        </div>
      </footer>
    </div>
  );
}
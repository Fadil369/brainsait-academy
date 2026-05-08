"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  "Patient Safety": "Evidence-based strategies to prevent harm and improve outcomes for patients across all care settings.",
  "Quality Improvement": "Master systematic approaches to improving healthcare processes using PDSA cycles and data analytics.",
  "Leadership": "Develop essential leadership skills to drive change and inspire teams in healthcare organizations.",
  "Advanced Leadership": "Advanced frameworks for senior healthcare leaders managing complex organizational transformation.",
  "Triple Aim": "Optimize care experience, population health, and cost reduction simultaneously.",
  "Person- and Family-Centered Care": "Put patients and families at the center of every clinical decision and care process.",
  "Graduate Medical Education": "Structured training programs for medical residents and fellows in core competencies.",
  "AI Healthcare": "Leverage artificial intelligence and machine learning to transform clinical practice and operations.",
  "NPHIES": "Saudi Arabia's National Platform for Health Information Exchange Services — standards and implementation.",
  "FHIR R4": "Fast Healthcare Interoperability Resources implementation for seamless clinical data exchange.",
  "Decarbonization": "Sustainable healthcare practices to reduce environmental impact and carbon footprint.",
  "Dental Care": "Evidence-based dental care protocols aligned with Saudi healthcare standards.",
  "ClaimLINC": "Optimize healthcare revenue cycle management and claims processing workflows.",
  "Contextualizing Care": "Personalize clinical encounters by addressing each patient's unique life context.",
};

const activeTopics = topicsData.filter((t) => t.count > 0);
const totalCourses = coursesData.length;

export default function TopicsPage() {
  const [search, setSearch] = useState("");

  const filteredTopics = useMemo(() => {
    if (!search.trim()) return activeTopics;
    const q = search.toLowerCase();
    return activeTopics.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        TOPIC_DESCRIPTIONS[t.name]?.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      {/* Hero */}
      <section className="hero-gradient text-white px-5 py-14 relative overflow-hidden">
        <div className="hero-orb w-96 h-96 bg-white/10 -top-24 -right-24" />
        <div className="hero-orb w-64 h-64 bg-indigo-300/20 -bottom-12 -left-12" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="animate-slide-up space-y-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-xs">
                <span className="material-symbols-outlined text-[13px] mr-1">category</span>
                Learning Topics
              </Badge>
            </div>
            <h1 className="font-headline text-3xl lg:text-4xl font-extrabold tracking-tight">
              Browse Learning Topics
            </h1>
            <p className="text-base text-white/80 max-w-xl">
              Explore {activeTopics.length} specialized healthcare training tracks across{" "}
              {totalCourses} IHI-accredited courses — available in Arabic and English.
            </p>
            <p className="text-sm text-white/60 font-arabic" dir="rtl">
              استكشف المسارات التدريبية الصحية المتخصصة
            </p>
          </div>
        </div>
      </section>

      {/* Search */}
      <div className="max-w-2xl mx-auto w-full px-5 -mt-5 relative z-20 animate-slide-up delay-100">
        <div className="glass rounded-xl shadow-lg p-1 flex items-center">
          <span className="material-symbols-outlined text-muted-foreground px-3 text-[20px]">search</span>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search topics..."
            className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="mr-2 p-1 rounded-full hover:bg-surface-container-low"
            >
              <span className="material-symbols-outlined text-[18px] text-muted-foreground">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="max-w-7xl mx-auto px-5 py-6">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>category</span>
            <span className="font-semibold text-foreground">{filteredTopics.length}</span> topics
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="material-symbols-outlined text-secondary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>menu_book</span>
            <span className="font-semibold text-foreground">{totalCourses}</span> total courses
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="material-symbols-outlined text-accent text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>translate</span>
            Bilingual AR/EN
          </div>
        </div>
      </div>

      {/* Topics Grid */}
      <main className="flex-1 max-w-7xl mx-auto px-5 pb-24">
        {filteredTopics.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground animate-fade-in">
            <span className="material-symbols-outlined text-[48px] block mb-3 opacity-40">search_off</span>
            <p className="font-headline font-semibold">No topics found</p>
            <p className="text-sm mt-1">Try a different search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTopics.map((topic, i) => {
              const gradient = TOPIC_GRADIENTS[topic.name] || "from-indigo-500 to-purple-600";
              const desc = TOPIC_DESCRIPTIONS[topic.name] || `${topic.count} courses in this track.`;

              return (
                <Link
                  key={topic.slug}
                  href={`/topics/${topic.slug}`}
                  className="group animate-slide-up"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className="premium-card card-shine h-full overflow-hidden rounded-xl">
                    {/* Gradient Header */}
                    <div className={`h-28 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
                      <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-3 right-3 w-20 h-20 rounded-full bg-white/20" />
                        <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/10" />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-5xl opacity-40 select-none">{topic.icon}</span>
                      </div>
                      {/* Course count pill */}
                      <div className="absolute bottom-3 right-3">
                        <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full border border-white/20">
                          {topic.count} course{topic.count !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-headline font-bold text-foreground group-hover:text-primary transition-colors text-base leading-tight">
                          {topic.name}
                        </h3>
                        <span className="material-symbols-outlined text-muted-foreground group-hover:text-primary text-[18px] flex-shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform">
                          arrow_forward
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {desc}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <div className={`h-1 rounded-full bg-gradient-to-r ${gradient} flex-1 opacity-40`} />
                        <span className="text-[10px] text-muted-foreground font-mono">{topic.count} courses</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
      <MobileNav activeItem="topics" />
    </div>
  );
}

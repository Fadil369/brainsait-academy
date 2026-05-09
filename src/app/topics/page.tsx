"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/components/locale-provider";
import { NavBar, MobileNav } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getTopicBranding } from "@/lib/topic-branding";
import { getLocalizedTopicDescription, getLocalizedTopicLabel } from "@/lib/topic-localization";
import topicsData from "@/lib/data/topics.json";
import coursesData from "@/lib/data/courses.json";
import { cn } from "@/lib/utils";

const activeTopics = topicsData.filter(t => t.count > 0);
const totalCourses = coursesData.length;

export default function TopicsPage() {
  const { locale } = useLocale();
  const [search, setSearch] = useState("");
  const isAr = locale === "ar";
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const heroHighlights = isAr
    ? [
        { label: "المحتوى", value: `${totalCourses} دورة معتمدة` },
        { label: "التجربة", value: "مسارات ثنائية اللغة مع هوية بصرية أوضح" },
        { label: "الأثر", value: "تعلم أسرع واختيار أسهل حسب الدور والمسار" },
      ]
    : [
        { label: "Catalog", value: `${totalCourses} accredited courses` },
        { label: "Experience", value: "Sharper bilingual tracks with stronger visual identity" },
        { label: "Outcome", value: "Faster discovery and better role-based course selection" },
      ];

  const filteredTopics = useMemo(() => {
    if (!search.trim()) return activeTopics;
    const q = search.toLowerCase();
    return activeTopics.filter(t => {
      const searchText = [
        t.name,
        getLocalizedTopicLabel(t.name, "ar"),
        getLocalizedTopicDescription(t.name, "en"),
        getLocalizedTopicDescription(t.name, "ar"),
      ]
        .join(" ")
        .toLowerCase();
      return searchText.includes(q);
    });
  }, [search]);

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      {/* ── Hero ── */}
      <section className="hero-gradient text-white px-container-padding py-16 relative overflow-hidden">
        <div className="hero-orb w-96 h-96 bg-white/8 -top-24 -right-24" />
        <div className="hero-orb w-64 h-64 bg-secondary/20 -bottom-16 -left-16" />
        <div className="hero-orb w-48 h-48 bg-white/6 top-1/2 left-1/3" />

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="animate-slide-up space-y-5">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge className="bg-white/18 text-white border-white/30 backdrop-blur-sm">
                <span className="material-symbols-outlined text-[13px] mr-1">category</span>
                {isAr ? "مسارات التعلم" : "Learning Topics"}
              </Badge>
              <div className="hero-stat-pill">
                <span className="font-headline font-bold">{activeTopics.length}</span>
                {isAr ? " مسار نشط" : " active tracks"}
              </div>
            </div>

            <h1 className="font-headline text-3xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              {isAr ? "تصفح مسارات التعلم" : "Browse Learning Topics"}
            </h1>

            <p className="text-base text-white/82 max-w-2xl leading-8">
              {isAr
                ? `استكشف ${activeTopics.length} مسارات تدريبية صحية عبر ${totalCourses} دورة معتمدة ومتاحة بالعربية والإنجليزية.`
                : `Explore ${activeTopics.length} specialized healthcare training tracks across ${totalCourses} IHI-accredited courses — available in Arabic and English.`}
            </p>
            {isAr && (
              <p className="text-sm text-white/60 font-arabic" dir="rtl">
                استكشف المسارات التدريبية الصحية المتخصصة المتاحة باللغتين
              </p>
            )}

            <div className="grid gap-3 pt-2 sm:grid-cols-3">
              {heroHighlights.map(item => (
                <div key={item.label} className="rounded-2xl border border-white/18 bg-white/10 p-4 backdrop-blur-sm">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/60 mb-1">{item.label}</div>
                  <p className="text-sm leading-6 text-white/90 font-medium">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Search ── */}
      <div className="max-w-2xl mx-auto w-full px-container-padding -mt-6 relative z-20 animate-slide-up delay-100">
        <div className="glass rounded-2xl shadow-[0_16px_40px_rgba(16,36,43,0.14)] p-1.5 flex items-center gap-2">
          <Search className="ml-2 h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={isAr ? "ابحث عن مسار..." : "Search topics, clinical themes, or keywords…"}
            className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="mr-1 p-1.5 rounded-xl hover:bg-surface-container-low transition-colors"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="max-w-7xl mx-auto px-container-padding py-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              category
            </span>
            <span className="font-semibold text-foreground">{filteredTopics.length}</span>
            {isAr ? " مسار" : " topics"}
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="material-symbols-outlined text-secondary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              menu_book
            </span>
            <span className="font-semibold text-foreground">{totalCourses}</span>
            {isAr ? " إجمالي الدورات" : " total courses"}
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="material-symbols-outlined text-accent text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              translate
            </span>
            {isAr ? "ثنائي اللغة AR/EN" : "Bilingual AR / EN"}
          </div>
          {search && (
            <>
              <div className="w-px h-4 bg-border" />
              <button
                onClick={() => setSearch("")}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                {isAr ? "مسح البحث" : "Clear search"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Topics Grid ── */}
      <main className="flex-1 max-w-7xl mx-auto px-container-padding pb-24 w-full">
        {filteredTopics.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground animate-fade-in">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-container">
              <Search className="h-7 w-7 opacity-40" />
            </div>
            <p className="font-headline font-semibold text-foreground">{isAr ? "لا توجد مسارات" : "No topics found"}</p>
            <p className="text-sm mt-1">{isAr ? "جرّب كلمة بحث مختلفة" : "Try a different search term"}</p>
            <button
              onClick={() => setSearch("")}
              className="mt-4 text-sm text-primary hover:underline"
            >
              {isAr ? "عرض كل المسارات" : "Show all topics"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTopics.map((topic, i) => {
              const branding = getTopicBranding(topic.name);
              const localizedName = getLocalizedTopicLabel(topic.name, locale);
              const alternateName = isAr ? topic.name : getLocalizedTopicLabel(topic.name, "ar");
              const desc = getLocalizedTopicDescription(topic.name, locale, branding.description);

              return (
                <Link
                  key={topic.slug}
                  href={`/topics/${topic.slug}`}
                  className="group animate-slide-up"
                  style={{ animationDelay: `${i * 45}ms` }}
                >
                  <div className="premium-card card-shine h-full overflow-hidden rounded-2xl flex flex-col">

                    {/* Gradient header */}
                    <div className={cn("relative overflow-hidden bg-linear-to-br", branding.gradient)} style={{ height: "9rem" }}>
                      {/* Light overlays */}
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(255,255,255,0.3),transparent_45%)]" />
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_90%,rgba(0,0,0,0.18),transparent_40%)]" />

                      {/* Decorative circles */}
                      <div className="absolute -top-6 -right-6 h-20 w-20 rounded-full bg-white/12" />
                      <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-black/10" />
                      <div className="absolute top-1/2 right-8 h-8 w-8 rounded-full bg-white/10" />

                      {/* Mark + emoji */}
                      <div className="absolute inset-0 flex items-center justify-between px-5 py-4">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/25 bg-white/15 font-headline text-sm font-bold tracking-[0.2em] text-white backdrop-blur-sm shadow-sm">
                          {branding.mark}
                        </div>
                        <span className="text-4xl opacity-40 select-none">{topic.icon}</span>
                      </div>

                      {/* Course count pill */}
                      <div className="absolute bottom-3 right-4">
                        <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/18 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                          <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>menu_book</span>
                          {isAr ? `${topic.count} دورة` : `${topic.count} course${topic.count !== 1 ? "s" : ""}`}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col p-5 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-headline font-bold text-foreground group-hover:text-primary transition-colors text-base leading-snug">
                          {localizedName}
                        </h3>
                        <Arrow className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-0.5" />
                      </div>

                      {alternateName !== localizedName && (
                        <p
                          className={cn("text-[11px] text-muted-foreground", !isAr && "font-arabic")}
                          dir={isAr ? "ltr" : "rtl"}
                        >
                          {alternateName}
                        </p>
                      )}

                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 flex-1">
                        {desc}
                      </p>

                      {/* Bottom accent bar */}
                      <div className={cn("h-1 rounded-full bg-linear-to-r opacity-30 group-hover:opacity-60 transition-opacity mt-auto", branding.gradient)} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/components/locale-provider";
import { NavBar, MobileNav } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getTopicBranding } from "@/lib/topic-branding";
import { getLocalizedTopicDescription, getLocalizedTopicLabel } from "@/lib/topic-localization";
import topicsData from "@/lib/data/topics.json";
import coursesData from "@/lib/data/courses.json";

const activeTopics = topicsData.filter((t) => t.count > 0);
const totalCourses = coursesData.length;

export default function TopicsPage() {
  const { locale } = useLocale();
  const [search, setSearch] = useState("");
  const directionalArrow = locale === "ar" ? "arrow_back" : "arrow_forward";

  const heroHighlights = locale === "ar"
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
    return activeTopics.filter(
      (t) => {
        const searchText = [
          t.name,
          getLocalizedTopicLabel(t.name, "ar"),
          getLocalizedTopicDescription(t.name, "en"),
          getLocalizedTopicDescription(t.name, "ar"),
        ]
          .join(" ")
          .toLowerCase();

        return searchText.includes(q);
      }
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
                {locale === "ar" ? "مسارات التعلم" : "Learning Topics"}
              </Badge>
            </div>
            <h1 className="font-headline text-3xl lg:text-4xl font-extrabold tracking-tight">
              {locale === "ar" ? "تصفح مسارات التعلم" : "Browse Learning Topics"}
            </h1>
            <p className="text-base text-white/80 max-w-xl">
              {locale === "ar"
                ? `استكشف ${activeTopics.length} مسارات تدريبية صحية عبر ${totalCourses} دورة معتمدة ومتاحة بالعربية والإنجليزية.`
                : `Explore ${activeTopics.length} specialized healthcare training tracks across ${totalCourses} IHI-accredited courses — available in Arabic and English.`}
            </p>
            {locale === "ar" && (
              <p className="text-sm text-white/60 font-arabic" dir="rtl">
                استكشف المسارات التدريبية الصحية المتخصصة
              </p>
            )}

            <div className="grid gap-3 pt-2 sm:grid-cols-3">
              {heroHighlights.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/18 bg-white/10 p-3.5 backdrop-blur-sm">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-white/60">{item.label}</div>
                  <p className="mt-2 text-sm leading-6 text-white/86">{item.value}</p>
                </div>
              ))}
            </div>
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
            placeholder={locale === "ar" ? "ابحث عن مسار..." : "Search topics..."}
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
            <span className="font-semibold text-foreground">{filteredTopics.length}</span> {locale === "ar" ? "مسار" : "topics"}
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="material-symbols-outlined text-secondary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>menu_book</span>
            <span className="font-semibold text-foreground">{totalCourses}</span> {locale === "ar" ? "إجمالي الدورات" : "total courses"}
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="material-symbols-outlined text-accent text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>translate</span>
            {locale === "ar" ? "ثنائي اللغة AR/EN" : "Bilingual AR/EN"}
          </div>
        </div>
      </div>

      {/* Topics Grid */}
      <main className="flex-1 max-w-7xl mx-auto px-5 pb-24">
        {filteredTopics.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground animate-fade-in">
            <span className="material-symbols-outlined text-[48px] block mb-3 opacity-40">search_off</span>
            <p className="font-headline font-semibold">{locale === "ar" ? "لا توجد مسارات" : "No topics found"}</p>
            <p className="text-sm mt-1">{locale === "ar" ? "جرّب كلمة بحث مختلفة" : "Try a different search term"}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTopics.map((topic, i) => {
                const branding = getTopicBranding(topic.name);
                const localizedName = getLocalizedTopicLabel(topic.name, locale);
                const alternateName = locale === "ar" ? topic.name : getLocalizedTopicLabel(topic.name, "ar");
                const desc = getLocalizedTopicDescription(topic.name, locale, branding.description);

              return (
                <Link
                  key={topic.slug}
                  href={`/topics/${topic.slug}`}
                  className="group animate-slide-up"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className="premium-card card-shine h-full overflow-hidden rounded-xl">
                    {/* Gradient Header */}
                    <div className={`h-28 bg-linear-to-br ${branding.gradient} relative overflow-hidden`}>
                      <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-3 right-3 w-20 h-20 rounded-full bg-white/20" />
                        <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/10" />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-between px-4 py-4">
                        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/12 font-headline text-sm font-semibold tracking-[0.2em] text-white backdrop-blur-sm">
                          {branding.mark}
                        </div>
                        <span className="text-4xl opacity-50 select-none">{topic.icon}</span>
                      </div>
                      {/* Course count pill */}
                      <div className="absolute bottom-3 right-3">
                        <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full border border-white/20">
                          {locale === "ar" ? `${topic.count} دورة` : `${topic.count} course${topic.count !== 1 ? "s" : ""}`}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-headline font-bold text-foreground group-hover:text-primary transition-colors text-base leading-tight">
                          {localizedName}
                        </h3>
                        <span className="material-symbols-outlined text-muted-foreground group-hover:text-primary text-[18px] shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform">
                          {directionalArrow}
                        </span>
                      </div>
                      {alternateName !== localizedName && (
                        <p className={`text-[11px] text-muted-foreground ${locale === "ar" ? "" : "font-arabic"}`} dir={locale === "ar" ? "ltr" : "rtl"}>
                          {alternateName}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {desc}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <div className={`h-1 rounded-full bg-linear-to-r ${branding.gradient} flex-1 opacity-40`} />
                        <span className="text-[10px] text-muted-foreground font-mono">{locale === "ar" ? `${topic.count} دورة` : `${topic.count} courses`}</span>
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

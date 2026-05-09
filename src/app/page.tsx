"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  Bot,
  BriefcaseMedical,
  Languages,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar";
import { CourseCard } from "@/components/course-card";
import { Footer } from "@/components/footer";
import { MobileNav, NavBar } from "@/components/navbar";
import { useLocale } from "@/components/locale-provider";
import coursesData from "@/lib/data/courses.json";
import topicsData from "@/lib/data/topics.json";
import { getTopicBranding } from "@/lib/topic-branding";
import { getLocalizedTopicDescription, getLocalizedTopicLabel } from "@/lib/topic-localization";
import { cn } from "@/lib/utils";

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
  const { locale } = useLocale();
  const [search, setSearch] = useState("");
  const [activeTopic, setActiveTopic] = useState("all");
  const [enrolled, setEnrolled] = useState<string[]>(readEnrolledCourses());
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const sync = () => setEnrolled(readEnrolledCourses());
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  // Reset showAll when search/filter changes
  useEffect(() => { setShowAll(false); }, [search, activeTopic]);

  const filteredCourses = useMemo(() => {
    return coursesData.filter(c => {
      const searchText = search.toLowerCase();
      const matchSearch =
        !search ||
        (locale === "ar"
          ? c.titleArabic?.toLowerCase().includes(searchText)
          : c.title.toLowerCase().includes(searchText)) ||
        c.topic.toLowerCase().includes(search.toLowerCase()) ||
        getLocalizedTopicLabel(c.topic, "ar").toLowerCase().includes(searchText) ||
        getLocalizedTopicDescription(c.topic, "en").toLowerCase().includes(searchText) ||
        getLocalizedTopicDescription(c.topic, "ar").toLowerCase().includes(searchText);
      const matchTopic = activeTopic === "all" || c.topic.toLowerCase().replace(/[^a-z0-9]+/g, "-") === activeTopic;
      return matchSearch && matchTopic;
    });
  }, [search, activeTopic, locale]);

  const activeTopics = useMemo(() => topicsData.filter(t => t.count > 0), []);
  const featuredTopics = activeTopics.slice(0, 6);
  const PAGE_SIZE = 9;
  const visibleCourses = showAll ? filteredCourses : filteredCourses.slice(0, PAGE_SIZE);
  const enrolledCount = enrolled.length;
  const hasMore = filteredCourses.length > PAGE_SIZE && !showAll;

  const isAr = locale === "ar";

  return (
    <div className="min-h-screen">
      <NavBar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-container-padding pb-16 pt-10 lg:pb-24 lg:pt-18">
        {/* Orbs */}
        <div className="hero-orb -left-16 top-8 h-64 w-64 bg-secondary/20" />
        <div className="hero-orb right-0 top-0 h-80 w-80 bg-primary/12" />
        <div className="hero-orb left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 bg-secondary/6 blur-3xl" />

        <div className="max-w-7xl mx-auto grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          {/* Left copy */}
          <div className="space-y-7">
            <div className="flex items-center gap-3">
              <div className="section-kicker">
                <Sparkles className="h-3.5 w-3.5 text-secondary" />
                {isAr ? "أكاديمية ثنائية اللغة" : "Premium bilingual academy"}
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <span className="live-dot h-1.5 w-1.5 bg-emerald-500" />
                Live
              </div>
            </div>

            <div className="space-y-5">
              <h1 className="max-w-3xl font-headline text-5xl font-semibold leading-[0.92] tracking-tight text-foreground lg:text-7xl">
                {isAr ? (
                  <>
                    تعليم سريري بمستوى<br />
                    <span className="text-gradient">احترافي وتنفيذي راقٍ.</span>
                  </>
                ) : (
                  <>
                    Clinical education,<br />
                    <span className="text-gradient">recast premium.</span>
                  </>
                )}
              </h1>
              <p className="max-w-xl text-base leading-8 text-muted-foreground lg:text-lg">
                {isAr
                  ? `تجمع أكاديمية BrainSAIT عدد ${coursesData.length} دورة متوافقة مع IHI ضمن ${activeTopics.length} مسارات متخصصة، مع هيكل بصري أكثر احترافية وتسلسل لغوي أوضح.`
                  : `BrainSAIT Academy — ${coursesData.length} IHI-aligned courses across ${activeTopics.length} focused tracks. Sharper visual system, stronger bilingual hierarchy, executive tone.`}
              </p>
              {isAr && (
                <p className="font-arabic text-lg text-muted-foreground" dir="rtl">
                  منصة تعليم صحي ثنائية اللغة بمظهر أكثر احترافية وجودة لفرق الجودة والقيادة السريرية.
                </p>
              )}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <Link href="#catalog">
                <Button size="lg" className="rounded-full px-7 shadow-[0_8px_24px_rgba(15,91,92,0.28)]">
                  {isAr ? "استكشف الدورات" : "Explore catalog"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/topics">
                <Button size="lg" variant="outline" className="rounded-full border-secondary/30 bg-background/50 px-6 backdrop-blur-sm">
                  {isAr ? "تصفح المسارات" : "Browse tracks"}
                </Button>
              </Link>
              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <Button
                      size="lg"
                      variant="ghost"
                      className="rounded-full px-6 text-foreground hover:bg-surface-container-low"
                    />
                  }
                >
                  {isAr ? "نبذة الأكاديمية" : "Academy brief"}
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-[1.4rem] border-border/70 bg-popover p-0 text-popover-foreground sm:max-w-xl">
                  <div className="p-6">
                    <AlertDialogHeader className="items-start text-left">
                      <AlertDialogMedia className="bg-secondary/15 text-secondary">
                        <BriefcaseMedical className="h-5 w-5" />
                      </AlertDialogMedia>
                      <AlertDialogTitle className="font-headline text-2xl font-semibold">
                        {isAr ? "واجهة أكاديمية أكثر احترافية" : "A more premium academy shell"}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {isAr
                          ? "تعتمد الأكاديمية على ملف مركزي لهوية المسارات، وخطوط أكثر اتساقًا، وتسلسل أوضح لمحتوى العربية والإنجليزية، وتجربة تصميم احترافية."
                          : "Central topic-branding manifest, refined editorial typography, stronger hierarchy for Arabic and English content, and a more executive visual language built from existing shadcn primitives."}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                      {[
                        { label: isAr ? "مكتبة الدورات" : "Course library", value: `${coursesData.length}` },
                        { label: isAr ? "المسارات النشطة" : "Active tracks", value: `${activeTopics.length}` },
                        { label: isAr ? "اللغة" : "Languages", value: "AR / EN" },
                      ].map(item => (
                        <div key={item.label} className="rounded-2xl border border-border/70 bg-surface-container-low p-4">
                          <div className="font-headline text-2xl font-semibold">{item.value}</div>
                          <div className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">{item.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-full">{isAr ? "إغلاق" : "Close"}</AlertDialogCancel>
                    <AlertDialogAction className="rounded-full" onClick={() => { window.location.href = "/topics"; }}>
                      {isAr ? "فتح المسارات" : "Open learning tracks"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center gap-5 pt-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <AvatarGroup>
                  {([["QA", "Quality lead"], ["PS", "Patient safety"], ["DX", "Digital health"]] as [string, string][]).map(
                    ([initials, label]) => (
                      <Avatar key={label} size="lg">
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                    )
                  )}
                </AvatarGroup>
                <span>{isAr ? "موثوق من فرق الجودة وسلامة المرضى" : "Trusted by quality & safety teams"}</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-secondary" />
                {isAr ? "محتوى متوافق مع IHI" : "IHI-aligned content"}
              </div>
            </div>
          </div>

          {/* Right panel — Academy Pulse */}
          <div className="mesh-panel p-6 lg:p-7">
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Academy pulse</div>
                  <div className="mt-2 font-headline text-2xl font-semibold text-foreground">
                    {isAr ? "تصميم أوضح، ثقة أعلى، واكتشاف أسهل." : "Sharper theme, stronger trust, cleaner discovery."}
                  </div>
                </div>
                <Badge className="rounded-full border-0 bg-foreground px-3 py-1 text-background shrink-0">Live</Badge>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    icon: ShieldCheck,
                    value: `${activeTopics.find(t => t.slug === "patient-safety")?.count || 0}`,
                    label: isAr ? "دورات سلامة المرضى" : "Patient safety courses",
                  },
                  {
                    icon: BookOpenCheck,
                    value: `${enrolledCount}`,
                    label: isAr ? "رحلات تعلم محفوظة" : "Saved learning journeys",
                  },
                  {
                    icon: Languages,
                    value: "AR / EN",
                    label: isAr ? "تجربة ثنائية اللغة" : "Bilingual delivery",
                  },
                  {
                    icon: Bot,
                    value: "AI-ready",
                    label: isAr ? "جاهز للذكاء الاصطناعي" : "Modern academy stack",
                  },
                ].map(item => (
                  <Card key={item.label} className="border-border/70 bg-background/70 shadow-none">
                    <CardContent className="flex items-center gap-3 p-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-surface-container text-primary">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-headline text-xl font-semibold text-foreground">{item.value}</div>
                        <div className="truncate text-xs uppercase tracking-[0.14em] text-muted-foreground">{item.label}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Featured tracks mini list */}
              <div className="rounded-[1.25rem] border border-border/70 bg-background/70 p-4">
                <div className="mb-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {isAr ? "مسارات مميزة" : "Featured premium tracks"}
                </div>
                <div className="space-y-2">
                  {featuredTopics.slice(0, 3).map(topic => {
                    const branding = getTopicBranding(topic.name);
                    const localizedTopic = getLocalizedTopicLabel(topic.name, locale);
                    return (
                      <Link
                        key={topic.slug}
                        href={`/topics/${topic.slug}`}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-surface-container-low px-4 py-3 transition-all hover:border-secondary/35 hover:bg-surface-container hover:shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br font-headline text-sm font-semibold text-white",
                              branding.gradient
                            )}
                          >
                            {branding.mark}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate font-medium text-foreground">{localizedTopic}</div>
                            <div className="text-xs text-muted-foreground">
                              {isAr ? `${topic.count} دورة` : `${topic.count} curated courses`}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className={cn("h-4 w-4 shrink-0 text-muted-foreground", isAr && "rotate-180")} />
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Search bar ── */}
      <div className="max-w-7xl mx-auto px-container-padding">
        <div className="mesh-panel -mt-4 p-4 lg:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Search the academy</div>
              <div className="font-headline text-2xl font-semibold text-foreground">
                {isAr ? "اعثر على الدورة المناسبة بسرعة." : "Find the right course, fast."}
              </div>
            </div>
            <div className="flex w-full max-w-3xl items-center gap-3 rounded-full border border-border/70 bg-background/80 px-3 py-2 backdrop-blur-sm focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
              <Sparkles className="ml-1 h-4 w-4 shrink-0 text-secondary" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={isAr ? "ابحث في الدورات والمسارات" : "Search courses, topics, clinical themes, or Arabic titles…"}
                className="border-0 bg-transparent shadow-none focus-visible:ring-0"
              />
              {search && (
                <Button variant="ghost" size="sm" className="rounded-full shrink-0" onClick={() => setSearch("")}>
                  {isAr ? "مسح" : "Clear"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto space-y-16 px-container-padding py-14 pb-28">

        {/* ── Featured Tracks ── */}
        <section className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="accent-rule" />
              <div className="section-kicker mt-3">{isAr ? "المسارات المميزة" : "Signature learning tracks"}</div>
              <h2 className="mt-3 font-headline text-3xl font-semibold text-foreground lg:text-4xl">
                {isAr
                  ? "هوية أوضح ووصف عربي متكامل لكل مسار تخصصي."
                  : "A more premium visual identity for every specialty lane."}
              </h2>
            </div>
            <Link href="/topics" className="hidden md:inline-flex shrink-0">
              <Button variant="ghost" className="rounded-full text-foreground">
                {isAr ? "عرض كل المسارات" : "View all tracks"}
              </Button>
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featuredTopics.map((topic, i) => {
              const branding = getTopicBranding(topic.name);
              const localizedTopic = getLocalizedTopicLabel(topic.name, locale);
              const localizedDescription = getLocalizedTopicDescription(topic.name, locale, branding.description);
              return (
                <Link
                  key={topic.slug}
                  href={`/topics/${topic.slug}`}
                  className="feature-card card-shine group block rounded-3xl p-6 animate-slide-up"
                  style={{ animationDelay: `${i * 55}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-4 flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br font-headline text-sm font-semibold tracking-[0.16em] text-white shadow-sm",
                            branding.gradient
                          )}
                        >
                          {branding.mark}
                        </div>
                        <Badge className={cn("rounded-full border-0 px-3 py-1 shrink-0", branding.badgeClass)}>
                          {isAr ? `${topic.count} دورة` : `${topic.count} courses`}
                        </Badge>
                      </div>
                      <div>
                        <h3 className="font-headline text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                          {localizedTopic}
                        </h3>
                        {locale !== "ar" && localizedTopic !== topic.name && (
                          <p className="mt-1 font-arabic text-xs text-muted-foreground" dir="rtl">
                            {getLocalizedTopicLabel(topic.name, "ar")}
                          </p>
                        )}
                        {locale === "ar" && topic.name !== localizedTopic && (
                          <p className="mt-1 text-xs text-muted-foreground" dir="ltr">{topic.name}</p>
                        )}
                        <p className="mt-2 text-sm leading-7 text-muted-foreground line-clamp-2">{localizedDescription}</p>
                      </div>
                    </div>
                    <ArrowRight
                      className={cn(
                        "mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1",
                        isAr && "rotate-180 group-hover:-translate-x-1 group-hover:translate-x-0"
                      )}
                    />
                  </div>
                  {/* Bottom accent bar */}
                  <div className={cn("mt-5 h-1 rounded-full bg-linear-to-r opacity-30 group-hover:opacity-60 transition-opacity", branding.gradient)} />
                </Link>
              );
            })}
          </div>

          <div className="md:hidden flex justify-center">
            <Link href="/topics">
              <Button variant="outline" className="rounded-full px-6">
                {isAr ? "عرض كل المسارات" : "View all tracks"}
              </Button>
            </Link>
          </div>
        </section>

        {/* ── Value / Benefits ── */}
        <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-card p-8 lg:p-12">
          {/* Background decoration */}
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-secondary/8 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-8 left-0 h-48 w-48 rounded-full bg-primary/8 blur-3xl pointer-events-none" />

          <div className="relative grid gap-10 lg:grid-cols-[1fr_2fr]">
            <div className="space-y-4">
              <div className="section-kicker">{isAr ? "لماذا BrainSAIT؟" : "Why BrainSAIT?"}</div>
              <h2 className="font-headline text-3xl font-semibold text-foreground lg:text-4xl">
                {isAr ? "مصممة للتميز السريري." : "Designed for clinical excellence."}
              </h2>
              <p className="text-sm leading-7 text-muted-foreground">
                {isAr
                  ? "منصة تعليمية متكاملة بمستوى احترافي عالٍ تجمع بين التوافق الأكاديمي مع IHI والهوية البصرية المتميزة."
                  : "A professional-grade learning platform combining IHI academic alignment with a distinctive bilingual visual identity and executive tone."}
              </p>
              <div className="pt-2">
                <div className="display-number text-gradient">{coursesData.length}</div>
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mt-1">
                  {isAr ? "دورة متاحة الآن" : "courses available now"}
                </div>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              {[
                {
                  icon: ShieldCheck,
                  number: "01",
                  title: isAr ? "موثوقية سريرية عالية" : "Built for patient trust",
                  copy: isAr
                    ? "تسلسل بصري أكثر صرامة يجعل محتوى الجودة والسلامة يبدو موثوقًا وليس عامًا."
                    : "A more rigorous visual hierarchy makes quality and safety content feel credible, not generic.",
                },
                {
                  icon: Languages,
                  number: "02",
                  title: isAr ? "إيقاع ثنائي اللغة" : "Stronger bilingual rhythm",
                  copy: isAr
                    ? "المحتوى العربي والإنجليزي في هيكل تحريري أكثر وضوحًا وتنظيمًا."
                    : "Arabic and English content in a more editorial structure with clearer hierarchy and spacing.",
                },
                {
                  icon: Stethoscope,
                  number: "03",
                  title: isAr ? "مظهر تنفيذي راقٍ" : "Executive-ready presentation",
                  copy: isAr
                    ? "ألوان محايدة دافئة وتدرجات عيادية عميقة ترفع مستوى الأكاديمية إلى نبرة أكثر احترافية."
                    : "Warmer neutrals, deep clinical teal, and premium brass accents lift the academy into a more professional tone.",
                },
              ].map((item, i) => (
                <div
                  key={item.title}
                  className="group space-y-4 rounded-2xl border border-border/60 bg-background/70 p-5 transition-all hover:border-primary/20 hover:bg-surface-container-lowest hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-container text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span className="font-headline text-xs font-bold tracking-[0.2em] text-muted-foreground">{item.number}</span>
                  </div>
                  <div>
                    <h3 className="font-headline text-lg font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Course Catalog ── */}
        <section id="catalog" className="space-y-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <div className="accent-rule" />
              <div className="section-kicker mt-3">{isAr ? "مجموعة الدورات" : "Course collection"}</div>
              <h2 className="mt-3 font-headline text-3xl font-semibold text-foreground lg:text-4xl">
                {isAr
                  ? "فهرس منسق ببطاقات أوضح وهوية أقوى واكتشاف أسهل."
                  : "Curated catalog — richer cards, clearer marks, stronger discovery."}
              </h2>
            </div>
            <Badge
              variant="outline"
              className="w-fit rounded-full border-border/70 bg-background/70 px-4 py-2 text-sm font-semibold"
            >
              {isAr ? `${filteredCourses.length} دورة` : `${filteredCourses.length} course${filteredCourses.length === 1 ? "" : "s"}`}
            </Badge>
          </div>

          {/* Topic filter chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            <Button
              variant={activeTopic === "all" ? "default" : "outline"}
              size="sm"
              className="rounded-full px-4 shrink-0"
              onClick={() => setActiveTopic("all")}
            >
              {isAr ? "كل المسارات" : "All tracks"}
              <span className="ml-1.5 rounded-full bg-current/15 px-1.5 py-0 text-[10px] font-bold">
                {coursesData.length}
              </span>
            </Button>
            {activeTopics.map(topic => {
              const branding = getTopicBranding(topic.name);
              const isActive = activeTopic === topic.slug;
              return (
                <Button
                  key={topic.slug}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  className="rounded-full px-4 shrink-0"
                  onClick={() => setActiveTopic(topic.slug)}
                >
                  <span className="font-headline text-[10px] tracking-[0.18em] mr-1">{branding.mark}</span>
                  {getLocalizedTopicLabel(topic.name, locale)}
                  <span className={cn("ml-1.5 rounded-full px-1.5 text-[10px] font-bold", isActive ? "bg-white/20" : "bg-surface-container")}>
                    {topic.count}
                  </span>
                </Button>
              );
            })}
          </div>

          {/* Grid */}
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleCourses.map(course => (
              <CourseCard
                key={course.slug}
                course={course}
                enrolled={enrolled.includes(course.slug)}
                progress={enrolled.includes(course.slug) ? 45 : 0}
              />
            ))}
          </div>

          {/* Show more */}
          {hasMore && (
            <div className="flex flex-col items-center gap-2 pt-2">
              <Button
                variant="outline"
                className="rounded-full px-8"
                onClick={() => setShowAll(true)}
              >
                {isAr ? `عرض ${filteredCourses.length - PAGE_SIZE} دورة إضافية` : `Show ${filteredCourses.length - PAGE_SIZE} more courses`}
              </Button>
              <p className="text-xs text-muted-foreground">
                {isAr ? `عرض ${visibleCourses.length} من ${filteredCourses.length}` : `Showing ${visibleCourses.length} of ${filteredCourses.length}`}
              </p>
            </div>
          )}

          {showAll && filteredCourses.length > PAGE_SIZE && (
            <div className="flex justify-center">
              <Link href="/topics">
                <Button variant="outline" className="rounded-full px-6">
                  {isAr ? "عرض الأكاديمية كاملة حسب المسار" : "Browse the full academy by track"}
                </Button>
              </Link>
            </div>
          )}

          {/* Empty state */}
          {filteredCourses.length === 0 && (
            <div className="mesh-panel rounded-3xl p-12 text-center animate-fade-in">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-container text-muted-foreground">
                <Sparkles className="h-7 w-7" />
              </div>
              <div className="font-headline text-2xl font-semibold text-foreground">
                {isAr ? "لا توجد نتائج مطابقة لهذا البحث." : "Nothing matched that search."}
              </div>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-muted-foreground">
                {isAr
                  ? "جرّب مصطلحًا سريريًا مختلفًا أو اسم مسار، أو استعرض جميع المسارات للعثور على الدورة المناسبة."
                  : "Try a different clinical term, a topic name, or browse all tracks to find the right course."}
              </p>
              <div className="mt-6 flex flex-wrap gap-3 justify-center">
                <Button variant="outline" className="rounded-full" onClick={() => setSearch("")}>
                  {isAr ? "مسح البحث" : "Clear search"}
                </Button>
                <Link href="/topics">
                  <Button className="rounded-full">
                    {isAr ? "تصفح المسارات" : "Browse all tracks"}
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* ── Stats strip ── */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Users, value: `${coursesData.length}+`, label: isAr ? "دورة معتمدة" : "Accredited courses", color: "text-primary" },
            { icon: TrendingUp, value: `${activeTopics.length}`, label: isAr ? "مسار متخصص" : "Specialized tracks", color: "text-secondary" },
            { icon: Languages, value: "AR/EN", label: isAr ? "ثنائي اللغة بالكامل" : "Fully bilingual", color: "text-accent" },
            { icon: BookOpenCheck, value: "IHI", label: isAr ? "متوافق مع المعايير" : "Standards-aligned", color: "text-tertiary" },
          ].map(item => (
            <div
              key={item.label}
              className="flex items-center gap-4 rounded-2xl border border-border/70 bg-card px-5 py-4 shadow-sm"
            >
              <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-surface-container", item.color)}>
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="font-headline text-2xl font-bold text-foreground">{item.value}</div>
                <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{item.label}</div>
              </div>
            </div>
          ))}
        </section>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}

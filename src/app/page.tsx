"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpenCheck, Bot, BriefcaseMedical, Languages, ShieldCheck, Sparkles, Stethoscope } from "lucide-react";
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

  useEffect(() => {
    const sync = () => setEnrolled(readEnrolledCourses());
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const filteredCourses = useMemo(() => {
    return coursesData.filter(c => {
      const searchText = search.toLowerCase();
      const matchSearch = !search || 
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

  const activeTopics = useMemo(() => topicsData.filter((topic) => topic.count > 0), []);
  const featuredTopics = activeTopics.slice(0, 6);
  const visibleCourses = filteredCourses.slice(0, 9);
  const enrolledCount = enrolled.length;

  return (
    <div className="min-h-screen">
      <NavBar />

      <section className="relative overflow-hidden px-container-padding pb-14 pt-10 lg:pb-20 lg:pt-16">
        <div className="hero-orb -left-14 top-10 h-52 w-52 bg-secondary/25" />
        <div className="hero-orb right-0 top-0 h-72 w-72 bg-primary/15" />
        <div className="max-w-7xl mx-auto grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div className="space-y-6">
            <div className="section-kicker">
              <Sparkles className="h-3.5 w-3.5 text-secondary" />
              {locale === "ar" ? "أكاديمية ثنائية اللغة" : "Premium bilingual academy"}
            </div>

            <div className="space-y-4">
              <h1 className="max-w-4xl font-headline text-5xl font-semibold leading-[0.95] tracking-tight text-foreground lg:text-7xl">
                {locale === "ar"
                  ? "تعليم سريري بمستوى احترافي وتجربة تنفيذية راقية."
                  : "Clinical education, recast with a more premium and executive feel."}
              </h1>
              <p className="max-w-2xl text-base leading-8 text-muted-foreground lg:text-lg">
                {locale === "ar"
                  ? `تجمع أكاديمية BrainSAIT عدد ${coursesData.length} دورة متوافقة مع IHI ضمن ${activeTopics.length} مسارات متخصصة، مع هيكل بصري أكثر احترافية وتسلسل لغوي أوضح.`
                  : `BrainSAIT Academy brings together ${coursesData.length} IHI-aligned courses across ${activeTopics.length} focused tracks with a more polished visual system, stronger bilingual hierarchy, and a sharper professional tone.`}
              </p>
              {locale === "ar" && (
                <p className="font-arabic text-lg text-muted-foreground" dir="rtl">
                  منصة تعليم صحي ثنائية اللغة بمظهر أكثر احترافية وجودة لفرق الجودة والقيادة السريرية والتحول الصحي.
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="#catalog">
                <Button size="lg" className="rounded-full px-6">
                  {locale === "ar" ? "استكشف الدورات" : "Explore catalog"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/topics">
                <Button size="lg" variant="outline" className="rounded-full border-secondary/30 bg-background/50 px-6 backdrop-blur-sm">
                  {locale === "ar" ? "تصفح المسارات" : "Browse tracks"}
                </Button>
              </Link>
              <AlertDialog>
                <AlertDialogTrigger render={<Button size="lg" variant="ghost" className="rounded-full px-6 text-foreground hover:bg-surface-container-low" />}>
                  {locale === "ar" ? "نبذة الأكاديمية" : "Academy brief"}
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-[1.4rem] border-border/70 bg-popover p-0 text-popover-foreground sm:max-w-xl">
                  <div className="p-6">
                    <AlertDialogHeader className="items-start text-left">
                      <AlertDialogMedia className="bg-secondary/15 text-secondary">
                        <BriefcaseMedical className="h-5 w-5" />
                      </AlertDialogMedia>
                      <AlertDialogTitle className="font-headline text-2xl font-semibold">{locale === "ar" ? "واجهة أكاديمية أكثر احترافية" : "A more premium academy shell"}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {locale === "ar"
                          ? "تعتمد الأكاديمية الآن على ملف مركزي لهوية المسارات، وخطوط أكثر اتساقًا، وتسلسل أوضح لمحتوى العربية والإنجليزية، وتجربة تصميم احترافية."
                          : "The academy now uses a central topic-branding manifest, refined editorial typography, stronger hierarchy for Arabic and English content, and a more executive visual language built from existing shadcn primitives."}
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                      {[
                        { label: locale === "ar" ? "مكتبة الدورات" : "Course library", value: `${coursesData.length}` },
                        { label: locale === "ar" ? "المسارات النشطة" : "Active tracks", value: `${activeTopics.length}` },
                        { label: locale === "ar" ? "اللغة" : "Languages", value: "AR / EN" },
                      ].map((item) => (
                        <div key={item.label} className="rounded-2xl border border-border/70 bg-surface-container-low p-4">
                          <div className="font-headline text-2xl font-semibold">{item.value}</div>
                          <div className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">{item.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-full">{locale === "ar" ? "إغلاق" : "Close"}</AlertDialogCancel>
                    <AlertDialogAction
                      className="rounded-full"
                      onClick={() => {
                        window.location.href = "/topics";
                      }}
                    >
                      {locale === "ar" ? "فتح المسارات" : "Open learning tracks"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <AvatarGroup>
                  {[
                    ["QA", "Quality lead"],
                    ["PS", "Patient safety"],
                    ["DX", "Digital health"],
                  ].map(([initials, label]) => (
                    <Avatar key={label} size="lg">
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                  ))}
                </AvatarGroup>
                <span>{locale === "ar" ? "موثوق من فرق الجودة وسلامة المرضى والتحول" : "Trusted by quality, safety, and transformation teams"}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-secondary" />
                {locale === "ar" ? "محتوى متوافق مع IHI" : "IHI aligned content"}
              </div>
            </div>
          </div>

          <div className="mesh-panel p-6 lg:p-7">
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Academy pulse</div>
                  <div className="mt-2 font-headline text-3xl font-semibold text-foreground">{locale === "ar" ? "تصميم أوضح، ثقة أعلى، واكتشاف أسهل." : "Sharper theme, stronger trust, cleaner discovery."}</div>
                </div>
                <Badge className="rounded-full border-0 bg-foreground px-3 py-1 text-background">Live</Badge>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { icon: ShieldCheck, value: `${activeTopics.find((topic) => topic.slug === "patient-safety")?.count || 0}`, label: locale === "ar" ? "دورات سلامة المرضى" : "Patient safety courses" },
                  { icon: BookOpenCheck, value: `${enrolledCount}`, label: locale === "ar" ? "رحلات تعلم محفوظة" : "Saved learning journeys" },
                  { icon: Languages, value: "AR / EN", label: locale === "ar" ? "تجربة ثنائية اللغة" : "Bilingual delivery" },
                  { icon: Bot, value: "AI-ready", label: locale === "ar" ? "جاهز للذكاء الاصطناعي" : "Modern academy stack" },
                ].map((item) => (
                  <Card key={item.label} className="border-border/70 bg-background/70 shadow-none">
                    <CardContent className="flex items-center gap-3 p-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-container text-primary">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-headline text-xl font-semibold text-foreground">{item.value}</div>
                        <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{item.label}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="rounded-[1.25rem] border border-border/70 bg-background/70 p-4">
                <div className="mb-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">{locale === "ar" ? "مسارات مميزة" : "Featured premium tracks"}</div>
                <div className="space-y-3">
                  {featuredTopics.slice(0, 3).map((topic) => {
                    const branding = getTopicBranding(topic.name);
                    const localizedTopic = getLocalizedTopicLabel(topic.name, locale);
                    return (
                      <Link key={topic.slug} href={`/topics/${topic.slug}`} className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-surface-container-low px-4 py-3 transition-colors hover:border-secondary/30 hover:bg-surface-container">
                        <div className="flex items-center gap-3">
                          <div className={cn("flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br font-headline text-sm font-semibold text-white", branding.gradient)}>
                            {branding.mark}
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{localizedTopic}</div>
                              <div className="text-xs text-muted-foreground">{locale === "ar" ? `${topic.count} دورة` : `${topic.count} curated courses`}</div>
                          </div>
                        </div>
                        <ArrowRight className={cn("h-4 w-4 text-muted-foreground", locale === "ar" && "rotate-180")} />
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-container-padding">
        <div className="mesh-panel -mt-4 p-4 lg:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Search the academy</div>
              <div className="font-headline text-2xl font-semibold text-foreground">{locale === "ar" ? "اعثر على الدورة المناسبة بسرعة" : "Find the right course, fast."}</div>
            </div>

            <div className="flex w-full max-w-3xl items-center gap-3 rounded-full border border-border/70 bg-background/80 px-3 py-2 backdrop-blur-sm">
              <Sparkles className="ml-1 h-4 w-4 text-secondary" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={locale === "ar" ? "ابحث في الدورات والمسارات" : "Search courses, topics, clinical themes, or Arabic titles"}
                className="border-0 bg-transparent shadow-none focus-visible:ring-0"
              />
              {search && (
                <Button variant="ghost" size="sm" className="rounded-full" onClick={() => setSearch("")}>
                  {locale === "ar" ? "مسح" : "Clear"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto space-y-14 px-container-padding py-12 pb-28">
        <section className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="section-kicker">{locale === "ar" ? "المسارات المميزة" : "Signature learning tracks"}</div>
              <h2 className="mt-3 font-headline text-3xl font-semibold text-foreground lg:text-4xl">{locale === "ar" ? "هوية أوضح ووصف عربي متكامل لكل مسار تخصصي." : "A more premium visual identity for every specialty lane."}</h2>
            </div>
            <Link href="/topics" className="hidden md:inline-flex">
              <Button variant="ghost" className="rounded-full text-foreground">{locale === "ar" ? "عرض كل المسارات" : "View all tracks"}</Button>
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featuredTopics.map((topic) => {
              const branding = getTopicBranding(topic.name);
              const localizedTopic = getLocalizedTopicLabel(topic.name, locale);
              const localizedDescription = getLocalizedTopicDescription(topic.name, locale, branding.description);
              return (
                <Link key={topic.slug} href={`/topics/${topic.slug}`} className="premium-card card-shine rounded-3xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3">
                      <div className={cn("inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br font-headline text-sm font-semibold tracking-[0.16em] text-white", branding.gradient)}>
                        {branding.mark}
                      </div>
                      <div>
                        <h3 className="font-headline text-2xl font-semibold text-foreground">{localizedTopic}</h3>
                        {locale !== "ar" && localizedTopic !== topic.name && (
                          <p className="mt-1 font-arabic text-xs text-muted-foreground" dir="rtl">{getLocalizedTopicLabel(topic.name, "ar")}</p>
                        )}
                        {locale === "ar" && topic.name !== localizedTopic && (
                          <p className="mt-1 text-xs text-muted-foreground" dir="ltr">{topic.name}</p>
                        )}
                        <p className="mt-2 max-w-sm text-sm leading-7 text-muted-foreground">{localizedDescription}</p>
                      </div>
                    </div>
                    <Badge className={cn("rounded-full border-0 px-3 py-1", branding.badgeClass)}>{locale === "ar" ? `${topic.count} دورة` : `${topic.count} courses`}</Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: "Built for patient trust",
              copy: "A more rigorous visual hierarchy makes quality and safety content feel credible, not generic.",
            },
            {
              icon: Languages,
              title: "Stronger bilingual rhythm",
              copy: "Arabic and English content now sit in a more editorial structure with clearer hierarchy and spacing.",
            },
            {
              icon: Stethoscope,
              title: "Executive-ready presentation",
              copy: "Warmer neutrals, deep clinical teal, and premium brass accents lift the academy into a more professional tone.",
            },
          ].map((item) => (
            <Card key={item.title} className="premium-card rounded-3xl border-border/70 bg-card shadow-none">
              <CardContent className="space-y-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-container text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-headline text-2xl font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.copy}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section id="catalog" className="space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="section-kicker">{locale === "ar" ? "مجموعة الدورات" : "Course collection"}</div>
              <h2 className="mt-3 font-headline text-3xl font-semibold text-foreground lg:text-4xl">
                {locale === "ar" ? "فهرس منسق ببطاقات أوضح وهوية أقوى واكتشاف أسهل." : "Curated catalog with richer cards, clearer marks, and stronger discovery."}
              </h2>
            </div>
            <Badge variant="outline" className="w-fit rounded-full border-border/70 bg-background/70 px-4 py-2 text-sm">
              {locale === "ar" ? `${filteredCourses.length} دورة` : `${filteredCourses.length} course${filteredCourses.length === 1 ? "" : "s"}`}
            </Badge>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            <Button
              variant={activeTopic === "all" ? "default" : "outline"}
              size="sm"
              className="rounded-full px-4"
              onClick={() => setActiveTopic("all")}
            >
              {locale === "ar" ? "كل المسارات" : "All tracks"}
            </Button>
            {activeTopics.map((topic) => {
              const branding = getTopicBranding(topic.name);
              return (
                <Button
                  key={topic.slug}
                  variant={activeTopic === topic.slug ? "default" : "outline"}
                  size="sm"
                  className="rounded-full px-4"
                  onClick={() => setActiveTopic(topic.slug)}
                >
                  <span className="font-headline text-[11px] tracking-[0.18em]">{branding.mark}</span>
                  {getLocalizedTopicLabel(topic.name, locale)}
                </Button>
              );
            })}
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleCourses.map((course) => (
              <CourseCard
                key={course.slug}
                course={course}
                enrolled={enrolled.includes(course.slug)}
                progress={enrolled.includes(course.slug) ? 45 : 0}
              />
            ))}
          </div>

          {filteredCourses.length > visibleCourses.length && (
            <div className="flex justify-center">
              <Link href="/topics">
                <Button variant="outline" className="rounded-full px-6">{locale === "ar" ? "عرض الأكاديمية كاملة" : "See the full academy"}</Button>
              </Link>
            </div>
          )}

          {filteredCourses.length === 0 && (
            <div className="premium-card rounded-3xl p-10 text-center">
              <div className="font-headline text-3xl font-semibold text-foreground">{locale === "ar" ? "لا توجد نتائج مطابقة لهذا البحث." : "Nothing matched that search."}</div>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {locale === "ar" ? "جرّب مصطلحًا سريريًا مختلفًا أو اسم مسار، أو استعرض جميع المسارات للعثور على الدورة المناسبة." : "Try a different clinical term, a topic name, or browse all tracks to find the right course."}
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}
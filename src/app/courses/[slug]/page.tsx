"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
// @base-ui/react Accordion doesn't support "type" prop, uses "defaultOpen" instead
import { toast } from "sonner";
import coursesData from "@/lib/data/courses.json";

type Section = { heading: string; isArabic: boolean; content: string };
type Course = { title: string; titleArabic: string; slug: string; code: string; topic: string; duration: string; lang: string; sourceUrl: string; sections: Section[]; body: string };

const TOPIC_COLORS: Record<string, string> = {
  "Quality Improvement": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  "Patient Safety": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  "Leadership": "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  "Triple Aim": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
};

function mdToHtml(md: string): string {
  return md
    .replace(/^#### (.+)$/gm, '<h4 class="font-headline text-base font-semibold mt-4 mb-2">$1</h4>')
    .replace(/^### (.+)$/gm, '<h3 class="font-headline text-lg font-semibold mt-5 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="font-headline text-xl font-bold text-primary mt-6 mb-3 pb-2 border-b border-border">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank">$1</a>')
    .replace(/^- \[ \] (.+)$/gm, '<div class="flex items-start gap-2 p-2 bg-surface-container-low rounded-lg mb-1"><span class="w-4 h-4 rounded border-2 border-outline flex-shrink-0 mt-0.5"></span><span class="text-sm">$1</span></div>')
    .replace(/^- \[x\] (.+)$/gm, '<div class="flex items-start gap-2 p-2 bg-secondary/10 rounded-lg mb-1"><span class="w-4 h-4 rounded border-2 border-secondary bg-secondary flex-shrink-0 mt-0.5 flex items-center justify-center text-white text-[10px]">✓</span><span class="text-sm line-through opacity-60">$1</span></div>')
    .replace(/^\|(.+)\|/gm, (m) => `<tr class="border-b border-border">${m.split("|").filter(c => c.trim() && !c.match(/^-+$/)).map(c => `<td class="px-3 py-2 text-sm">${c.trim()}</td>`).join("")}</tr>`)
    .replace(/(<tr.*>.*<\/tr>\n?)+/g, '<div class="overflow-x-auto my-3 rounded-lg border border-border"><table class="w-full">$&</table></div>')
    .replace(/---/g, '<hr class="border-border my-4" />')
    .replace(/<p>/g, '<p class="text-sm text-muted-foreground my-2">')
    .replace(/^- (.+)$/gm, '<li class="flex items-start gap-2 p-1.5 bg-surface-container-low rounded mb-0.5 text-sm">$1</li>')
    .replace(/(<li.*>.*<\/li>\n?)+/g, '<ul class="space-y-0.5 my-2">$&</ul>');
}

export default function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const course = coursesData.find((c: Course) => c.slug === slug) as Course | undefined;
  if (!course) notFound();

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [enrolled, setEnrolled] = useState(false);
  const [saved, setSaved] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});

  useEffect(() => {
    setMounted(true);
    setEnrolled(localStorage.getItem(`enrolled-${slug}`) === "true");
    setSaved(localStorage.getItem(`saved-${slug}`) === "true");
    setCompleted(localStorage.getItem(`complete-${slug}`) === "true");
    setProgress(parseInt(localStorage.getItem(`progress-${slug}`) || "0"));
  }, [slug]);

  const handleEnroll = () => {
    localStorage.setItem(`enrolled-${slug}`, "true");
    let list = JSON.parse(localStorage.getItem("enrolledCourses") || "[]");
    if (!list.includes(slug)) { list.push(slug); localStorage.setItem("enrolledCourses", JSON.stringify(list)); }
    setEnrolled(true);
    toast.success("✅ Enrolled successfully!");
  };

  const handleSave = () => {
    const newSaved = !saved;
    localStorage.setItem(`saved-${slug}`, String(newSaved));
    setSaved(newSaved);
    toast(newSaved ? "💾 Course saved!" : "Course removed");
  };

  const handleComplete = () => {
    const newCompleted = !completed;
    localStorage.setItem(`complete-${slug}`, String(newCompleted));
    setCompleted(newCompleted);
    setProgress(newCompleted ? 100 : 0);
    toast(newCompleted ? "🎉 Course completed!" : "Marked incomplete");
  };

  const handleQuiz = (q: number, a: number) => setQuizAnswers(prev => ({ ...prev, [q]: a }));

  const submitQuiz = () => {
    const answers: Record<number, number> = { 0: 1, 1: 2 };
    let correct = 0;
    for (const [q, a] of Object.entries(answers)) {
      if (quizAnswers[parseInt(q)] === a) correct++;
    }
    const pct = Math.round((correct / Object.keys(answers).length) * 100);
    if (pct >= 80) {
      toast.success(`🎉 ${pct}% - Passed! Certificate earned.`);
      localStorage.setItem(`quiz-pass-${slug}`, "true");
    } else {
      toast.error(`📚 ${pct}% - Need 80% to pass. Review and try again.`);
    }
  };

  const getLevel = () => {
    const body = course.body;
    if (body.includes("Advanced") || body.includes("متقدم")) return { label: "Advanced", icon: "local_fire_department", color: "text-rose-500" };
    if (body.includes("Intermediate") || body.includes("متوسط")) return { label: "Intermediate", icon: "trending_up", color: "text-amber-500" };
    return { label: "Foundation", icon: "eco", color: "text-emerald-500" };
  };

  const level = getLevel();
  const relatedCourses = coursesData.filter(c => c.topic === course.topic && c.slug !== slug).slice(0, 3);
  const lang = course.lang;

  if (!mounted) return null;

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-50 glass border-b">
        <div className="max-w-7xl mx-auto px-container-padding h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="p-1 text-muted-foreground hover:text-primary rounded-full">
              <span className="material-symbols-outlined text-[22px]">arrow_back</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[16px]">school</span>
              </div>
              <span className="font-headline text-sm font-bold text-primary hidden sm:block">BrainsAIT Academy</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="rounded-full w-8 h-8" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              <span className="material-symbols-outlined text-[16px]">{theme === "dark" ? "light_mode" : "dark_mode"}</span>
            </Button>
            <Badge variant="outline" className="gap-1 text-xs"><span className="material-symbols-outlined text-[14px]">language</span> AR/EN</Badge>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-container-padding py-4 lg:py-6 flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Main Content */}
        <div className="flex-1 space-y-4 lg:w-2/3">
          {/* Header */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`${TOPIC_COLORS[course.topic] || "bg-surface-container-high text-foreground"} border-0`}>{course.topic}</Badge>
                <Badge variant="outline" className="text-xs">{course.code}</Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">schedule</span> {course.duration} min</span>
              </div>
              <h1 className="font-headline text-2xl lg:text-3xl font-extrabold">{course.title}</h1>
              {course.titleArabic && <p className={`font-arabic text-muted-foreground ${lang === "mixed" ? "text-right" : ""}`} dir={lang === "mixed" ? "rtl" : "ltr"}>{course.titleArabic}</p>}
              <div className="flex flex-wrap gap-2 pt-1">
                <Button size="sm" onClick={handleEnroll} variant={enrolled ? "secondary" : "default"} className="gap-1">
                  <span className="material-symbols-outlined text-[18px]">{enrolled ? "check_circle" : "add"}</span>
                  {enrolled ? "Enrolled" : "Enroll Now"}
                </Button>
                <Button size="sm" variant="outline" onClick={handleSave} className={`gap-1 ${saved ? "border-primary text-primary" : ""}`}>
                  <span className="material-symbols-outlined text-[18px]">{saved ? "bookmark" : "bookmark_add"}</span>
                  {saved ? "Saved" : "Save"}
                </Button>
                <Button size="sm" variant={completed ? "secondary" : "outline"} onClick={handleComplete} className="gap-1">
                  <span className="material-symbols-outlined text-[18px]">{completed ? "check_circle" : "check_circle"}</span>
                  {completed ? "Completed" : "Mark Complete"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: "schedule", value: course.duration, label: "Minutes", color: "text-primary" },
              { icon: level.icon, value: level.label, label: "Level", color: level.color },
              { icon: "workspace_premium", value: "1.25", label: "CE Credits", color: "text-tertiary" },
            ].map((stat, i) => (
              <Card key={i} className="text-center py-3">
                <CardContent className="p-0 space-y-1">
                  <span className={`material-symbols-outlined text-[22px] ${stat.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
                  <div className="font-headline text-base font-bold">{stat.value}</div>
                  <div className="text-[10px] text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="content">📖 Content</TabsTrigger>
              <TabsTrigger value="quiz">📝 Quiz</TabsTrigger>
              <TabsTrigger value="activities">✍️ Activities</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="mt-4">
              <Accordion className="space-y-2">
                {course.sections.map((section, i) => (
                  <AccordionItem key={i} value={`section-${i}`} className="border border-border rounded-xl overflow-hidden">
                    <AccordionTrigger className={`px-4 py-3 hover:bg-surface-container-low transition-colors ${section.isArabic ? "text-right" : ""}`}>
                      <span className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full ${section.isArabic ? "bg-tertiary/10" : "bg-primary/10"} flex items-center justify-center flex-shrink-0`}>
                          <span className={`material-symbols-outlined text-[14px] ${section.isArabic ? "text-tertiary" : "text-primary"}`}>{section.isArabic ? "translate" : "article"}</span>
                        </span>
                        <span className="text-sm font-medium">{section.heading}</span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className={`prose prose-sm max-w-none ${section.isArabic ? "text-right font-arabic" : ""}`} dir={section.isArabic ? "rtl" : "ltr"} dangerouslySetInnerHTML={{ __html: mdToHtml(section.content) }} />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>

            <TabsContent value="quiz" className="mt-4 space-y-4">
              <Card>
                <CardContent className="p-4 space-y-4">
                  <h3 className="font-headline text-lg font-bold">Knowledge Check</h3>
                  {[
                    { q: "1. What is the primary purpose of the Model for Improvement?", opts: ["Replace all systems", "Structured approach for testing changes", "Create compliance docs", "Reduce costs only"], ans: 1 },
                    { q: "2. ما هي الخطوة الأولى في دورة PDSA؟", opts: ["التنفيذ (Do)", "الدراسة (Study)", "التخطيط (Plan)", "التطبيق (Act)"], ans: 2, arabic: true },
                  ].map((item, qi) => (
                    <div key={qi} className="space-y-2">
                      <p className="text-sm font-medium">{item.q}</p>
                      <div className="space-y-1" dir={item.arabic ? "rtl" : "ltr"}>
                        {item.opts.map((opt, oi) => (
                          <div
                            key={oi}
                            onClick={() => handleQuiz(qi, oi)}
                            className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all text-sm ${
                              quizAnswers[qi] === oi ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                              quizAnswers[qi] === oi ? "border-primary bg-primary text-white" : "border-outline"
                            }`}>
                              {quizAnswers[qi] === oi ? "✓" : ""}
                            </div>
                            <span>{opt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <Button onClick={submitQuiz} className="gap-1">
                    <span className="material-symbols-outlined text-[18px]">checklist</span> Submit Answers
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activities" className="mt-4">
              <Card>
                <CardContent className="p-4 space-y-2">
                  <h3 className="font-headline text-lg font-bold">Practical Activities</h3>
                  {["Complete lesson readings", "Pass knowledge check quiz", "Apply one concept in practice", "Share learning with colleague"].map((act, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 bg-surface-container-low rounded-lg">
                      <span className="w-4 h-4 rounded border-2 border-outline flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{act}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Related Courses */}
          {relatedCourses.length > 0 && (
            <div>
              <h3 className="font-headline text-lg font-bold mb-3">Related Courses</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {relatedCourses.map(c => (
                  <Link key={c.slug} href={`/courses/${c.slug}`}>
                    <Card className="hover:border-primary/30 transition-all">
                      <CardContent className="p-3">
                        <h4 className="font-headline font-semibold text-sm line-clamp-2">{c.title}</h4>
                        {c.titleArabic && <p className="font-arabic text-xs text-muted-foreground mt-1">{c.titleArabic}</p>}
                        <span className="text-xs text-muted-foreground flex items-center gap-1 mt-2"><span className="material-symbols-outlined text-[12px]">schedule</span> {c.duration} min</span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:w-1/3 space-y-4">
          {/* Progress */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="font-headline text-base font-bold">Your Progress</h3>
              <div className="flex items-center gap-3">
                <div className="relative w-16 h-16">
                  <Progress value={progress} className="h-full w-full [&>div]:rounded-full" />
                  <span className="absolute inset-0 flex items-center justify-center font-headline text-sm font-bold text-primary">{progress}%</span>
                </div>
                <div>
                  <div className="font-headline text-base font-bold">{course.sections.length} sections</div>
                  <div className="text-xs text-muted-foreground">Complete all to earn certificate</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resources */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <h3 className="font-headline text-base font-bold">Resources</h3>
              {[
                { href: "https://www.cbahi.gov.sa", icon: "verified", label: "CBAHI Standards", desc: "Accreditation" },
                { href: "https://www.moh.gov.sa", icon: "monitor_heart", label: "MOH Guidelines", desc: "Ministry of Health" },
                { href: "https://www.vision2030.gov.sa", icon: "visibility", label: "Vision 2030", desc: "Health transformation" },
              ].map((r, i) => (
                <a key={i} href={r.href} target="_blank" className="flex items-start gap-2 p-2 rounded-lg hover:bg-surface-container-low transition-colors group">
                  <div className="w-7 h-7 rounded-full bg-surface-variant flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10">
                    <span className="material-symbols-outlined text-[14px] text-muted-foreground group-hover:text-primary">{r.icon}</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium group-hover:text-primary">{r.label}</div>
                    <div className="text-[10px] text-muted-foreground">{r.desc}</div>
                  </div>
                </a>
              ))}
            </CardContent>
          </Card>

          {/* AI Notes */}
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-gradient-to-br from-primary to-secondary rounded-md shadow-sm">
                  <span className="material-symbols-outlined text-white text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                </div>
                <h3 className="font-headline text-base font-bold">AI Study Notes</h3>
              </div>
              <p className="text-xs text-muted-foreground">Complete sections to generate personalized study notes based on your progress through this course.</p>
              <Button variant="secondary" size="sm" className="w-full gap-1 text-xs">
                <span className="material-symbols-outlined text-[16px]">psychology</span> Generate Notes
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* Mobile Nav */}
      <nav className="mobile-nav fixed bottom-0 w-full z-50 glass border-t rounded-t-xl py-2 px-4 justify-around items-center hidden">
        <Link href="/" className="flex flex-col items-center gap-0.5 text-muted-foreground">
          <span className="material-symbols-outlined text-[22px]">dashboard</span>
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link href="/#courses" className="flex flex-col items-center gap-0.5 text-primary">
          <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
          <span className="text-[10px] font-medium">Courses</span>
        </Link>
        <button className="flex flex-col items-center gap-0.5 text-muted-foreground" onClick={() => toast(enrolled ? "✅ Enrolled" : "Not enrolled yet")}>
          <span className="material-symbols-outlined text-[22px]">school</span>
          <span className="text-[10px] font-medium">Learning</span>
        </button>
      </nav>
    </div>
  );
}
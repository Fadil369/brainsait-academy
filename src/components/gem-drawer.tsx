"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocale, type Locale } from "@/components/locale-provider";
import { toast } from "sonner";
import type { Course } from "@/app/courses/[slug]/CourseContent";

type GemId = "case-clarity" | "quality-check" | "transformation";

interface GemConfig {
  id: GemId;
  name: string;
  nameAr: string;
  tagline: string;
  taglineAr: string;
  avatar: string;
  tone: string;
  toneAr: string;
  category: string;
  categoryAr: string;
  color: string;
  bgColor: string;
  persona: string;
  personaAr: string;
  starterPrompts: { en: string; ar: string }[];
}

const GEMS: GemConfig[] = [
  {
    id: "case-clarity",
    name: "Case-Clarity",
    nameAr: "وضوح الحالة",
    tagline: "Your bilingual clinical learning tutor",
    taglineAr: "مدرسك السريري ثنائي اللغة",
    avatar: "🩺",
    tone: "coach",
    toneAr: "مدرب داعم",
    category: "learning_support",
    categoryAr: "الدعم التعليمي",
    color: "text-cyan-600",
    bgColor: "bg-cyan-50 dark:bg-cyan-900/15",
    persona: "Frontline Learner",
    personaAr: "المتعلم في الخطوط الأمامية",
    starterPrompts: [
      { en: "Explain this concept in simple Arabic", ar: "اشرح هذا المفهوم بلغة عربية بسيطة" },
      { en: "Summarize this lesson in 5 bullets", ar: "لخّص هذه الدرس في 5 نقاط" },
      { en: "Give me one practical clinic example", ar: "أعطني مثالًا عمليًا واحدًا من العيادة" },
      { en: "Translate key terms to Arabic", ar: "ترجم المصطلحات الأساسية إلى الإنجليزية" },
    ],
  },
  {
    id: "quality-check",
    name: "Quality-Check",
    nameAr: "مدقق الجودة",
    tagline: "Your patient-safety and quality-improvement copilot",
    taglineAr: "نائبك في سلامة المرضى والتحسين",
    avatar: "✅",
    tone: "structured",
    toneAr: "منظم ومركّز",
    category: "quality_improvement",
    categoryAr: "تحسين الجودة",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/15",
    persona: "Quality Lead",
    personaAr: "قائد الجودة",
    starterPrompts: [
      { en: "Build a 7-day safety checklist for my ward", ar: "ابنِ قائمة فحص سلامة لـ 7 أيام لقسمائي" },
      { en: "Turn this module into a team huddle script", ar: "حوّل هذه الوحدة إلى نص اجتماع فريق" },
      { en: "Propose 3 measurable indicators", ar: "اقترح 3 مؤشرات قابلة للقياس" },
      { en: "Create a PDSA action plan", ar: "أنشئ خطة عمل PDSA" },
    ],
  },
  {
    id: "transformation",
    name: "Transformation Architect",
    nameAr: "مهندس التحول",
    tagline: "Your strategic digital-health partner",
    taglineAr: "شريكك في الصحة الرقمية",
    avatar: "🏗️",
    tone: "strategic",
    toneAr: "استراتيجي وتنفيذي",
    category: "leadership",
    categoryAr: "القيادة",
    color: "text-violet-600",
    bgColor: "bg-violet-50 dark:bg-violet-900/15",
    persona: "Transformation Manager",
    personaAr: "مدير التحول",
    starterPrompts: [
      { en: "Map these tracks to my 90-day plan", ar: "اعمل خريطة لهذه المسارات لخطة 90 يومًا" },
      { en: "Draft an executive alignment memo", ar: "اكتب مذكرة aligning تنفيذي" },
      { en: "Build a risks and mitigation table", ar: "ابنِ جدول مخاطر وتخفيف" },
      { en: "Create a stakeholder map", ar: "أنشئ خريطة أصحاب مصلحة" },
    ],
  },
];

interface Message {
  role: "user" | "gem";
  content: string;
  timestamp: number;
}

interface GemDrawerProps {
  course: Course;
  locale: Locale;
  progress: number;
  currentSection?: string;
}

function simulateGemResponse(gem: GemConfig, prompt: string, locale: Locale, course: Course): string {
  const isAr = locale === "ar";
  
  if (gem.id === "case-clarity") {
    if (isAr) {
      return `**🔍 شرح مبسّط**

بناءً على محتوى "${course.titleArabic || course.title}"، إليك شرحًا مبسطًا:

• **النقطة الأساسية**: تركز هذه الدورة على تطبيق مفاهيم الجودة والسلامة في بيئة العمل السريري.

• **التطبيق العملي**: يمكنك البدء بتطبيق خطوة واحدة اليوم — راجع إجراءً واحدًا في قسمك وحسّنه.

• **نصيحة سريعة**: ركّز على عنصر واحد من عناصر الدورة وضعه موضع التطبيق خلال 24 ساعة.

> 💡 **المتابع**: جرب شرح ما تعلمته لزميل خلال دقيقة واحدة.`;
    }
    return `**🔍 Simplified Explanation**

Based on "${course.title}", here's a simplified breakdown:

• **Key Point**: This course focuses on applying quality and safety concepts in clinical settings.

• **Practical Application**: Start with one actionable step today — review one procedure in your unit and identify one improvement.

• **Quick Tip**: Focus on one element from the course and apply it within 24 hours.

> 💡 **Follow-up**: Try explaining what you learned to a colleague in under 1 minute.`;
  }

  if (gem.id === "quality-check") {
    if (isAr) {
      return `**✅ خطة عمل الجودة**

| الإجراء | المسؤول | الإطار الزمني | المؤشر |
|---------|---------|--------------|--------|
| مراجعة الإجراء الحالي | الممرض المسؤول | يوم 1-2 | قائمة مراجعة مكتملة |
| تطبيق التغيير | الفريق | يوم 3-5 | معدل الامتثال |
| قياس وتحسين | قائد الجودة | يوم 6-7 | نسبة التحسن % |

**الخطوات التالية:**
1. حدد إجراءً واحدًا للقياس
2. اجمع بيانات خط الأساس
3. طبّق تغييرًا صغيرًا واحدًا
4. قِس النتيجة وأكرر`;
    }
    return `**✅ Quality Action Plan**

| Action | Owner | Timeline | Metric |
|--------|-------|----------|--------|
| Review current process | Charge nurse | Day 1-2 | Checklist complete |
| Implement change | Unit team | Day 3-5 | Compliance rate |
| Measure & improve | Quality lead | Day 6-7 | Improvement % |

**Next Steps:**
1. Identify one process to measure
2. Collect baseline data
3. Implement one small change
4. Measure result and iterate`;
  }

  if (gem.id === "transformation") {
    if (isAr) {
      return `**🏗️ خارطة طريق التحول (90 يومًا)**

**الأسبوع 1-4: التأسيس**
• أكمل مسارات الجودة والسلامة
• أنشئ تقييمًا أوليًا للفجوات
• حدد 3 أولويات للتحسين

**الأسبوع 5-8: التطبيق**
• طبّق تغييرًا واحدًا قابلاً للقياس
• راجع التقدم أسبوعيًا
• وثّق الدروس المستفادة

**الأسبوع 9-12: التوسيع**
• شارك النتائج مع القيادة
• خطّط للتوسع إلى أقسام أخرى
• أنشئ خطة استمرارية`;
    }
    return `**🏗️ Transformation Roadmap (90 Days)**

**Week 1-4: Foundation**
• Complete quality and safety tracks
• Create initial gap assessment
• Identify 3 improvement priorities

**Week 5-8: Implementation**
• Implement one measurable change
• Review progress weekly
• Document lessons learned

**Week 9-12: Scale**
• Share results with leadership
• Plan expansion to other units
• Create sustainability plan`;
  }

  return isAr
    ? "أعتذر، لا أستطيع إنشاء استجابة الآن. يرجى المحاولة مرة أخرى."
    : "I'm unable to generate a response right now. Please try again.";
}

function TypingIndicator({ locale }: { locale: Locale }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-900/20 flex items-center justify-center shrink-0 text-sm">
        ✨
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

export function GemDrawer({ course, locale, progress, currentSection }: GemDrawerProps) {
  const [open, setOpen] = useState(false);
  const [activeGem, setActiveGem] = useState<GemId>("case-clarity");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const gem = GEMS.find((g) => g.id === activeGem)!;
  const isAr = locale === "ar";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const gemName = isAr ? gem.nameAr : gem.name;
  const gemTagline = isAr ? gem.taglineAr : gem.tagline;

  const handleGemSelect = useCallback((gemId: GemId) => {
    setActiveGem(gemId);
    setMessages([]);
    setOpen(true);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input.trim(), timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    const prompt = input;
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = simulateGemResponse(gem, prompt, locale, course);
      const gemMsg: Message = { role: "gem", content: response, timestamp: Date.now() };
      setMessages((prev) => [...prev, gemMsg]);
      setIsTyping(false);
    }, 1200);
  }, [input, gem, locale, course]);

  const handleStarterPrompt = useCallback((prompt: { en: string; ar: string }) => {
    setInput(prompt[locale]);
    const userMsg: Message = { role: "user", content: prompt[locale], timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      const response = simulateGemResponse(gem, prompt[locale], locale, course);
      const gemMsg: Message = { role: "gem", content: response, timestamp: Date.now() };
      setMessages((prev) => [...prev, gemMsg]);
      setIsTyping(false);
    }, 1200);
  }, [gem, locale, course]);

  const handleReset = useCallback(() => {
    setMessages([]);
    toast(isAr ? "تم بدء محادثة جديدة" : "New conversation started");
  }, [isAr]);

  const handleCopyResponse = useCallback((content: string) => {
    const text = content.replace(/\*\*/g, "").replace(/\n/g, " ");
    navigator.clipboard.writeText(text).then(() => {
      toast(isAr ? "تم النسخ" : "Copied!");
    });
  }, [isAr]);

  return (
    <>
      {/* Floating Launcher */}
      <button
        onClick={() => {
          setOpen(true);
        }}
        className="fixed bottom-24 right-5 z-50 group"
        aria-label={isAr ? "فتح المساعد الذكي" : "Open AI Study Assistant"}
      >
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-xl group-hover:shadow-primary/30 transition-all duration-300 group-hover:scale-105 group-active:scale-95">
            <span className="text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              ✨
            </span>
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-background animate-pulse" />
        </div>
        <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded-lg shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity font-medium">
          {isAr ? "مساعد الذكاء الاصطناعي" : "AI Study Assistant"}
        </span>
      </button>

      {/* Drawer */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0">
          {/* Header */}
          <div className="gradient-primary p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl backdrop-blur-sm">
                ✨
              </div>
              <div>
                <h2 className="font-headline font-bold text-base">
                  {isAr ? "مساعد الذكاء الاصطناعي" : "AI Study Assistant"}
                </h2>
                <p className="text-white/60 text-xs">{isAr ? "Gem powered learning support" : "Gem-powered learning support"}</p>
              </div>
            </div>

            {/* Gem Selector */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {GEMS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => {
                    setActiveGem(g.id);
                    setMessages([]);
                  }}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeGem === g.id
                      ? "bg-white text-primary shadow-md"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  <span>{g.avatar}</span>
                  <span>{isAr ? g.nameAr : g.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 px-5 py-3 bg-surface-container-low border-b border-border">
            <div className={`w-8 h-8 rounded-lg ${gem.bgColor} flex items-center justify-center text-lg`}>
              {gem.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-headline font-bold text-sm">{gemName}</div>
              <div className="text-xs text-muted-foreground line-clamp-1">{gemTagline}</div>
            </div>
            <Badge variant="outline" className={`${gem.bgColor} ${gem.color} border-0 text-[10px] h-5 px-1.5`}>
              {isAr ? gem.categoryAr : gem.category}
            </Badge>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 px-5 py-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-surface-container-low mx-auto flex items-center justify-center text-3xl">
                  {gem.avatar}
                </div>
                <div>
                  <h3 className="font-headline font-bold text-sm mb-1">{gemName}</h3>
                  <p className="text-xs text-muted-foreground">{gemTagline}</p>
                </div>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                  {isAr
                    ? "أنا هنا لمساعدتك في فهم مفاهيم الدورة وتطبيقها. جرّب إحدى أفكار البدء أدناه!"
                    : "I'm here to help you understand and apply course concepts. Try one of the starter prompts below!"}
                </p>

                {/* Starter Prompts */}
                <div className="grid gap-2 pt-2">
                  {gem.starterPrompts.slice(0, 3).map((sp, i) => (
                    <button
                      key={i}
                      onClick={() => handleStarterPrompt(sp)}
                      className="text-left text-xs p-3 rounded-xl bg-surface-container-low hover:bg-primary/5 border border-border transition-colors"
                      dir={locale === "ar" ? "rtl" : "ltr"}
                    >
                      {sp[locale]}
                    </button>
                  ))}
                </div>

                {progress > 0 && (
                  <p className="text-[10px] text-muted-foreground mt-2">
                    {isAr
                      ? `📊 تقدمك الحالي: ${progress}% — أجب على المزيد من الأقسام للحصول على ملاحظات مخصصة.`
                      : `📊 Your current progress: ${progress}% — Answer more sections for personalized notes.`}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex items-start gap-2.5 ${msg.role === "gem" ? "" : "flex-row-reverse"}`}>
                    {msg.role === "gem" ? (
                      <div className={`w-7 h-7 rounded-full ${gem.bgColor} flex items-center justify-center shrink-0 text-sm`}>
                        {gem.avatar}
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <span className="text-white text-[10px]">👤</span>
                      </div>
                    )}
                    <div className={`flex-1 ${msg.role === "gem" ? "" : "items-end flex flex-col"}`}>
                      <div
                        className={`prose prose-xs max-w-none leading-relaxed p-3 rounded-2xl text-sm ${
                          msg.role === "gem"
                            ? "bg-surface-container-low rounded-tl-sm"
                            : "bg-primary text-primary-foreground rounded-tr-sm"
                        } ${msg.role === "gem" ? "" : "text-right"}`}
                        dir={msg.role === "gem" && (gem.id === "case-clarity" && locale === "ar") ? "rtl" : undefined}
                      >
                        <div
                          className={msg.role === "gem" ? `[&_strong]:font-bold [&_strong]:text-foreground [&_table]:w-full [&_table]:text-xs [&_td]:p-1.5 [&_tr:nth-child(even)]:bg-surface-container-low dark:[&_tr:nth-child(even)]:bg-surface-container-low [&_ol]:list-decimal [&_ol]:pl-4 [&_ul]:list-disc [&_ul]:pl-4` : ""}
                          dangerouslySetInnerHTML={{
                            __html: msg.content
                              .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                              .replace(/\n/g, "<br/>")
                              .replace(/\| (.+) \|/g, (match) => {
                                const cells = match.split("|").filter(Boolean).map((c) => c.trim());
                                return `<div class="grid grid-cols-${cells.length} gap-1 bg-surface-container-low dark:bg-surface-container-low p-1.5 rounded-lg mb-0.5"><span>${cells.join("</span><span>")}</span></div>`;
                              }),
                          }}
                        />
                      </div>
                      {msg.role === "gem" && (
                        <div className="flex gap-1 mt-1.5 ml-1">
                          <button
                            onClick={() => handleCopyResponse(msg.content)}
                            className="text-[10px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5"
                          >
                            <span className="material-symbols-outlined text-[12px]">content_copy</span>
                            {isAr ? "نسخ" : "Copy"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isTyping && <TypingIndicator locale={locale} />}
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-border bg-surface-container-low">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder={isAr ? "اكتب سؤالك..." : "Ask your question..."}
                rows={1}
                className="flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                dir={locale === "ar" ? "rtl" : "ltr"}
              />
              <Button onClick={handleSubmit} disabled={!input.trim() || isTyping} size="icon" className="shrink-0">
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
              </Button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <button
                onClick={handleReset}
                className="text-[10px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[12px]">refresh</span>
                {isAr ? "محادثة جديدة" : "New conversation"}
              </button>
              <span className="text-[10px] text-muted-foreground">
                {isAr ? "أضغط Enter للإرسال" : "Press Enter to send"}
              </span>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

export { GEMS };
export type { GemId };

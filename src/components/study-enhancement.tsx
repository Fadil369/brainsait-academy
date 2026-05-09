"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocale, type Locale } from "@/components/locale-provider";

interface Section {
  heading: string;
  isArabic: boolean;
  content: string;
}

interface StudyEnhancementProps {
  sections: Section[];
  locale: Locale;
  completedSections: Set<number>;
}

const STOP_WORDS_EN = new Set(["the", "a", "an", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did", "will", "would", "could", "should", "may", "might", "must", "can", "to", "of", "in", "for", "on", "with", "at", "by", "from", "as", "into", "through", "during", "before", "after", "above", "below", "between", "under", "again", "further", "then", "once", "and", "but", "or", "nor", "so", "yet", "both", "each", "few", "more", "most", "other", "some", "such", "no", "only", "own", "same", "than", "too", "very", "just", "also", "now", "here", "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very"]);

const STOP_WORDS_AR = new Set(["في", "من", "إلى", "على", "عن", "مع", "هذا", "هذه", "التي", "الذي", "أن", "إن", "كان", "كانت", "أو", "و", "لا", "ما", "هو", "هي", "بعد", "قبل", "بين", "منذ", "حتى", "إذا", "كل", "أي", "بينما", "حيث", "لم", "لن", "قد", "ليس", "لكن", "ثم", "ذلك", "تلك", "أحد", "التى"]);

function extractKeyTerms(text: string, isArabic: boolean, limit = 8): string[] {
  const words = text.split(/\s+/).filter((w) => w.length > 3);
  const stopWords = isArabic ? STOP_WORDS_AR : STOP_WORDS_EN;
  const filtered = words.filter((w) => !stopWords.has(w.toLowerCase().replace(/[.,;:!?()]/g, "")));
  const freq: Record<string, number> = {};
  filtered.forEach((w) => {
    const clean = w.replace(/[.,;:!?()]/g, "");
    freq[clean] = (freq[clean] || 0) + 1;
  });
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([w]) => w);
}

function generateKeyTakeaways(sections: Section[], locale: Locale): string[] {
  const isAr = locale === "ar";
  
  if (isAr) {
    return [
      "حدد هدفًا واحدًا واضحًا للتحسين من هذه الدورة.",
      "ابحث عن خطوة واحدة يمكنك تطبيقها غدًا في قسمك.",
      "شارك ما تعلمته مع زميل واحد على الأقل.",
      "وثّق الفجوة المحددة التي حددتها في الوحدة.",
      "أنشئ قائمة مهام قصيرة من الإجراءات القابلة للتنفيذ.",
    ];
  }
  
  return [
    "Set one clear improvement goal from this course.",
    "Find one step you can apply tomorrow in your unit.",
    "Share what you learned with at least one colleague.",
    "Document the specific gap you identified in the module.",
    "Create a short action list of actionable items.",
  ];
}

function generateSectionRecap(section: Section, locale: Locale): string {
  const isAr = locale === "ar";
  const words = section.content.split(/\s+/).filter(Boolean);
  const summary = words.slice(0, 30).join(" ");
  const ellipsis = words.length > 30 ? (isAr ? "..." : "...") : "";

  if (isAr) {
    return `📖 في هذا القسم، تتناولنا:${summary}${ellipsis}\n\n💡 نصيحة: ركّز على النقطة الرئيسية التي يمكنك تطبيقها فورًا.`;
  }
  return `📖 In this section, we covered:${summary}${ellipsis}\n\n💡 Tip: Focus on the key point you can apply immediately.`;
}

export function StudyEnhancement({ sections, locale, completedSections }: StudyEnhancementProps) {
  const isAr = locale === "ar";

  const visibleSections = useMemo(() => {
    return sections
      .map((section, index) => ({ section, index }))
      .filter(({ section }) => (locale === "ar" ? section.isArabic : !section.isArabic));
  }, [sections, locale]);

  const currentSectionIndex = useMemo(() => {
    for (let i = 0; i < visibleSections.length; i++) {
      if (!completedSections.has(visibleSections[i].index)) {
        return i;
      }
    }
    return visibleSections.length - 1;
  }, [visibleSections, completedSections]);

  const currentSection = visibleSections[currentSectionIndex]?.section;
  const completedCount = visibleSections.filter(({ index }) => completedSections.has(index)).length;

  const sectionReadTime = useMemo(() => {
    if (!currentSection) return 0;
    const wordCount = currentSection.content.split(/\s+/).filter(Boolean).length;
    return Math.max(2, Math.ceil(wordCount / 150));
  }, [currentSection]);

  const keyTerms = useMemo(() => {
    if (sections.length === 0) return [];
    const allContent = sections.map((s) => s.content).join(" ");
    const isArLocal = locale === "ar";
    return extractKeyTerms(allContent, isArLocal, 10);
  }, [sections, locale]);

  const takeaways = useMemo(() => generateKeyTakeaways(sections, locale), [sections, locale]);

  const quickRecap = useMemo(() => {
    if (!currentSection) return null;
    return generateSectionRecap(currentSection, locale);
  }, [currentSection, locale]);

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-tertiary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
          </div>
          <h3 className="font-headline text-sm font-bold">{isAr ? "تعزيز التعلم" : "Study Boost"}</h3>
          <Badge className="badge-new text-[10px] h-4 px-1.5 ml-auto">✨ AI</Badge>
        </div>

        {/* Reading Time */}
        {currentSection && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-surface-container-low">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/15 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-blue-600 text-[15px]">schedule</span>
            </div>
            <div className="flex-1">
              <div className="text-xs font-semibold">
                {isAr ? "القراءة المتبقية" : "Estimated Reading Time"}
              </div>
              <div className="text-[10px] text-muted-foreground line-clamp-1">
                {currentSection.heading} — {sectionReadTime} {isAr ? "دقيقة" : "min read"}
              </div>
            </div>
            <div className="font-headline font-extrabold text-base text-blue-600">
              ~{sectionReadTime}m
            </div>
          </div>
        )}

        {/* Quick Recap */}
        {quickRecap && (
          <div className={`p-3 rounded-xl border border-primary/15 bg-primary/5 ${isAr ? "text-right" : "text-left"}`}>
            <div className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">bolt</span>
              {isAr ? "استعادة سريعة" : "Quick Recap"}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap font-arabic">
              {quickRecap}
            </p>
          </div>
        )}

        {/* Key Terms */}
        {keyTerms.length > 0 && (
          <div>
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {isAr ? "المصطلحات الأساسية" : "Key Terms"}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {keyTerms.map((term, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2 py-1 rounded-full bg-surface-container-low border border-border text-foreground"
                >
                  {term}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actionable Takeaways */}
        <div>
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {isAr ? "الخطوات التالية" : "Next Actions"}
          </div>
          <div className="space-y-1.5">
            {takeaways.map((action, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <span className="material-symbols-outlined text-[12px] text-primary mt-0.5 shrink-0">check_circle</span>
                <span className="text-muted-foreground leading-relaxed">{action}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Context */}
        <div className="text-center p-2 rounded-lg bg-surface-container-low">
          <span className="text-xs text-muted-foreground">
            {isAr
              ? `${completedCount} من ${visibleSections.length} أقسام مكتملة — ${completedCount > 0 ? "ممتاز! تابع!" : "ابدأ رحلتك الآن!"}`
              : `${completedCount} of ${visibleSections.length} sections completed — ${completedCount > 0 ? "Excellent! Keep going!" : "Start your journey now!"}`}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useLocale, type Locale } from "@/components/locale-provider";

interface Section {
  heading: string;
  isArabic: boolean;
  content: string;
}

interface TimeRoadmapProps {
  sections: Section[];
  locale: Locale;
  completedSections: Set<number>;
  totalDuration: number;
  courseTitle: string;
}

const WORDS_PER_MINUTE = 150;
const AVG_READ_TIME_PER_SECTION = 3;

function estimateSectionTime(section: Section): number {
  const wordCount = section.content.split(/\s+/).filter(Boolean).length;
  const baseTime = Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
  return baseTime + AVG_READ_TIME_PER_SECTION;
}

function estimateTotalTime(sections: Section[]): number {
  return sections.reduce((acc, s) => acc + estimateSectionTime(s), 0);
}

export function TimeRoadmap({ sections, locale, completedSections, totalDuration, courseTitle }: TimeRoadmapProps) {
  const isAr = locale === "ar";

  const visibleSections = useMemo(() => {
    return sections
      .map((section, index) => ({ section, index }))
      .filter(({ section }) => (locale === "ar" ? section.isArabic : !section.isArabic));
  }, [sections, locale]);

  const totalEstimatedMinutes = useMemo(() => estimateTotalTime(visibleSections.map((v) => v.section)), [visibleSections]);

  const remainingMinutes = useMemo(() => {
    const completedIndices = visibleSections.filter(({ index }) => completedSections.has(index)).map(({ section }) => section);
    return estimateTotalTime(visibleSections.map((v) => v.section)) - estimateTotalTime(completedIndices);
  }, [visibleSections, completedSections]);

  const completionPercent = visibleSections.length > 0
    ? Math.round((visibleSections.filter(({ index }) => completedSections.has(index)).length / visibleSections.length) * 100)
    : 0;

  const dailyGoalMinutes = 15;
  const daysRemaining = Math.ceil(remainingMinutes / dailyGoalMinutes);

  const formatDuration = (mins: number) => {
    if (mins < 60) return `${mins} ${isAr ? "دقيقة" : "min"}`;
    const hours = Math.floor(mins / 60);
    const minsLeft = mins % 60;
    if (minsLeft === 0) return `${hours} ${isAr ? "ساعة" : "hr"}`;
    return `${hours}h ${minsLeft}${isAr ? "د" : "m"}`;
  };

  const timelineSteps = useMemo(() => {
    const total = visibleSections.length;
    const completed = visibleSections.filter(({ index }) => completedSections.has(index)).length;
    const steps = [
      { label: isAr ? "البداية" : "Start", desc: isAr ? "التسجيل والمعاينة" : "Enroll & preview", threshold: 0 },
      { label: isAr ? "أول قسم" : "First section", desc: isAr ? "إكمال أول درس" : "Complete first lesson", threshold: Math.ceil(total * 0.1) },
      { label: isAr ? "الربع الأول" : "25%", desc: isAr ? "ربع المسار" : "Quarter way", threshold: Math.ceil(total * 0.25) },
      { label: isAr ? "النصف" : "50%", desc: isAr ? "منتصف الطريق" : "Halfway there", threshold: Math.ceil(total * 0.5) },
      { label: isAr ? "75%" : "75%", desc: isAr ? "الثلث الأخير" : "Final stretch", threshold: Math.ceil(total * 0.75) },
      { label: isAr ? "الاختبار" : "Quiz", desc: isAr ? "اجتياز الاختبار" : "Pass the quiz", threshold: Math.ceil(total * 0.95) },
      { label: isAr ? "الشهادة" : "Certificate", desc: isAr ? "الحصول على الشهادة" : "Earn certificate", threshold: total },
    ];
    return steps;
  }, [visibleSections.length, isAr]);

  const currentMilestone = useMemo(() => {
    const completed = visibleSections.filter(({ index }) => completedSections.has(index)).length;
    let current = timelineSteps[0];
    for (const step of timelineSteps) {
      if (completed >= step.threshold) current = step;
      else break;
    }
    return current;
  }, [timelineSteps, visibleSections, completedSections]);

  const nextMilestone = useMemo(() => {
    const completed = visibleSections.filter(({ index }) => completedSections.has(index)).length;
    for (const step of timelineSteps) {
      if (completed < step.threshold) return step;
    }
    return null;
  }, [timelineSteps, visibleSections, completedSections]);

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/15 flex items-center justify-center">
            <span className="material-symbols-outlined text-blue-600 text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>route</span>
          </div>
          <h3 className="font-headline text-sm font-bold">{isAr ? "خارطة الطريق" : "Study Roadmap"}</h3>
        </div>

        {/* Time Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-xl bg-surface-container-low">
            <div className="font-headline font-extrabold text-base text-primary">{formatDuration(totalEstimatedMinutes)}</div>
            <div className="text-[10px] text-muted-foreground">{isAr ? "إجمالي الوقت" : "Total"}</div>
          </div>
          <div className="text-center p-2 rounded-xl bg-surface-container-low">
            <div className="font-headline font-extrabold text-base">{formatDuration(remainingMinutes)}</div>
            <div className="text-[10px] text-muted-foreground">{isAr ? "متبقي" : "Remaining"}</div>
          </div>
          <div className="text-center p-2 rounded-xl bg-surface-container-low">
            <div className="font-headline font-extrabold text-base text-emerald-600">{daysRemaining}d</div>
            <div className="text-[10px] text-muted-foreground">{isAr ? `عند ${dailyGoalMinutes}د/يوم` : `@${dailyGoalMinutes}m/day`}</div>
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">{isAr ? "التقدم" : "Progress"}</span>
            <span className="font-semibold">{completionPercent}%</span>
          </div>
          <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
            <div
              className="h-full gradient-primary rounded-full transition-all duration-500"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
            {isAr ? "محطات التقدم" : "Milestones"}
          </div>
          {timelineSteps.map((step, i) => {
            const completed = visibleSections.filter(({ index }) => completedSections.has(index)).length;
            const isDone = completed >= step.threshold;
            const isCurrent = step.label === currentMilestone.label;
            const isNext = nextMilestone?.label === step.label;

            return (
              <div key={i} className="flex items-center gap-2.5">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] transition-all ${
                      isDone
                        ? "bg-emerald-500 text-white"
                        : isNext
                        ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                        : "bg-surface-container text-muted-foreground"
                    }`}
                  >
                    {isDone ? "✓" : isNext ? "▶" : i + 1}
                  </div>
                  {i < timelineSteps.length - 1 && (
                    <div className={`w-0.5 h-4 ${isDone ? "bg-emerald-500/40" : "bg-border"}`} />
                  )}
                </div>
                <div className={`flex-1 text-xs py-1 ${isCurrent ? "font-semibold" : isDone ? "text-muted-foreground" : "text-muted-foreground/60"}`}>
                  <span className={isCurrent ? "text-foreground" : ""}>{step.label}</span>
                  {isCurrent && <span className="ml-1.5 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{isAr ? "هنا" : "here"}</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Next Up */}
        {nextMilestone && (
          <div className={`p-3 rounded-xl border ${nextMilestone.threshold <= 1 ? "border-primary/20 bg-primary/5" : "border-border bg-surface-container-low"}`}>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
              {isAr ? "التالي" : "Next Up"}
            </div>
            <div className="font-headline font-semibold text-sm">{nextMilestone.label}</div>
            <div className="text-xs text-muted-foreground">{nextMilestone.desc}</div>
            {nextMilestone.threshold <= visibleSections.length && (
              <div className="text-[10px] text-primary mt-1">
                {isAr
                  ? `${visibleSections.filter(({ index }) => completedSections.has(index)).length} من ${visibleSections.length} أقسام مكتملة`
                  : `${visibleSections.filter(({ index }) => completedSections.has(index)).length} of ${visibleSections.length} sections done`}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

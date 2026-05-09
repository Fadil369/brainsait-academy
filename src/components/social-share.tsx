"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useLocale, type Locale } from "@/components/locale-provider";

interface SocialShareProps {
  courseSlug: string;
  courseTitle: string;
  courseTitleArabic?: string;
  locale: Locale;
  progress: number;
  completed: boolean;
  quizPassed: boolean;
  quizScore?: number | null;
}

export function SocialShare({ courseSlug, courseTitle, courseTitleArabic, locale, progress, completed, quizPassed, quizScore }: SocialShareProps) {
  const isAr = locale === "ar";

  const getShareUrl = useCallback(() => {
    if (typeof window === "undefined") return "";
    return window.location.href;
  }, []);

  const shareCourse = useCallback(async () => {
    const url = getShareUrl();
    const title = isAr ? courseTitleArabic || courseTitle : courseTitle;
    const text = isAr
      ? `🚀 أكتشف "${title}" على BrainSAIT Academy — دورة في الجودة والسلامة السريرية!`
      : `🚀 Check out "${title}" on BrainSAIT Academy — a course in clinical quality and safety!`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(`${text}\n\n${url}`);
      toast(isAr ? "🔗 تم نسخ الرابط!" : "🔗 Link copied!");
    }
  }, [getShareUrl, isAr, courseTitle, courseTitleArabic]);

  const shareProgress = useCallback(async () => {
    const percent = progress;
    const text = isAr
      ? `📊 أكملت ${percent}% من "${courseTitleArabic || courseTitle}" على BrainSAIT Academy! #التعلم_المستمر #الجودة_والسلامة`
      : `📊 I just completed ${percent}% of "${courseTitle}" on BrainSAIT Academy! #ContinuousLearning #QualitySafety`;

    try {
      await navigator.clipboard.writeText(text);
      toast(isAr ? "📊 تم نسخ تحديث التقدم!" : "📊 Progress update copied!");
    } catch {
      toast(isAr ? "فشل النسخ" : "Failed to copy");
    }
  }, [progress, isAr, courseTitle, courseTitleArabic]);

  const shareCompletion = useCallback(async () => {
    const text = isAr
      ? `🎉 أكملت للتو دورة "${courseTitleArabic || courseTitle}" على BrainSAIT Academy!${quizPassed ? ` اجتزت الاختبار بنسبة ${quizScore}%` : ""} #شهادة_التعلم #الجودة_والسلامة_السريرية`
      : `🎉 I just completed "${courseTitle}" on BrainSAIT Academy!${quizPassed ? ` Passed with ${quizScore}% on the quiz.` : ""} #LearningCertificate #ClinicalQualitySafety`;

    try {
      await navigator.clipboard.writeText(text);
      toast(isAr ? "🎉 تم نسخ إنجازك!" : "🎉 Achievement copied!");
    } catch {
      toast(isAr ? "فشل النسخ" : "Failed to copy");
    }
  }, [isAr, courseTitle, courseTitleArabic, quizPassed, quizScore]);

  const shareCertificate = useCallback(async () => {
    const text = isAr
      ? `🏆 حصلت على شهادة في "${courseTitleArabic || courseTitle}" من BrainSAIT Academy! #شهادة #التعليم_المستمر #رؤية_2030`
      : `🏆 I earned a certificate in "${courseTitle}" from BrainSAIT Academy! #Certificate #ContinuingEducation #Vision2030`;

    try {
      await navigator.clipboard.writeText(text);
      toast(isAr ? "🏆 تم نسخ شهادة الإنجاز!" : "🏆 Certificate achievement copied!");
    } catch {
      toast(isAr ? "فشل النسخ" : "Failed to copy");
    }
  }, [isAr, courseTitle, courseTitleArabic]);

  const shareButtons = [
    {
      label: isAr ? "مشاركة الدورة" : "Share Course",
      icon: "share",
      onClick: shareCourse,
      color: "hover:bg-blue-50 dark:hover:bg-blue-900/15",
      textColor: "text-blue-600",
    },
    {
      label: isAr ? "مشاركة التقدم" : "Share Progress",
      icon: "bar_chart",
      onClick: shareProgress,
      color: "hover:bg-emerald-50 dark:hover:bg-emerald-900/15",
      textColor: "text-emerald-600",
      disabled: progress === 0,
    },
    {
      label: isAr ? "مشاركة الإنجاز" : "Share Achievement",
      icon: "emoji_events",
      onClick: shareCompletion,
      color: "hover:bg-amber-50 dark:hover:bg-amber-900/15",
      textColor: "text-amber-600",
      disabled: !completed,
    },
    {
      label: isAr ? "مشاركة الشهادة" : "Share Certificate",
      icon: "workspace_premium",
      onClick: shareCertificate,
      color: "hover:bg-violet-50 dark:hover:bg-violet-900/15",
      textColor: "text-violet-600",
      disabled: !quizPassed,
    },
  ];

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center">
            <span className="material-symbols-outlined text-muted-foreground text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>share</span>
          </div>
          <h3 className="font-headline text-sm font-bold">{isAr ? "مشاركة" : "Share"}</h3>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          {isAr
            ? "شارك تقدمك وإنجازاتك مع زملائك ومجتمعك!"
            : "Share your progress and achievements with colleagues and your community!"}
        </p>

        <div className="space-y-2">
          {shareButtons.map((btn, i) => (
            <Button
              key={i}
              variant="ghost"
              size="sm"
              onClick={btn.onClick}
              disabled={btn.disabled}
              className={`w-full justify-start gap-2 h-auto py-2.5 px-3 ${btn.color} transition-colors ${btn.disabled ? "opacity-40" : ""}`}
            >
              <span className={`material-symbols-outlined text-[16px] ${btn.textColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                {btn.icon === "workspace_premium" ? "workspace_premium" : btn.icon === "emoji_events" ? "emoji_events" : btn.icon}
              </span>
              <span className="text-xs font-medium">{btn.label}</span>
              {btn.disabled && <span className="ml-auto text-[10px] text-muted-foreground">{isAr ? "غير متاح" : "locked"}</span>}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

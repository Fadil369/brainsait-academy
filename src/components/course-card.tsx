"use client";

import Link from "next/link";
import { useLocale } from "@/components/locale-provider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getTopicBranding } from "@/lib/topic-branding";
import { getLocalizedTopicLabel } from "@/lib/topic-localization";
import { Clock, ArrowRight, ArrowLeft } from "lucide-react";

interface CourseCardProps {
  course: {
    slug: string;
    title: string;
    titleArabic?: string;
    topic: string;
    duration: string | number;
    code?: string;
    body?: string;
  };
  enrolled?: boolean;
  completed?: boolean;
  progress?: number;
  className?: string;
  compact?: boolean;
}

export function CourseCard({
  course,
  enrolled = false,
  completed = false,
  progress = 0,
  className,
  compact = false,
}: CourseCardProps) {
  const { locale } = useLocale();
  const branding = getTopicBranding(course.topic);
  const bodySummary = course.body?.split(".")[0]?.trim();
  const courseTitle = locale === "ar" ? course.titleArabic || course.title : course.title;
  const topicLabel = getLocalizedTopicLabel(course.topic, locale);
  const isAr = locale === "ar";
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  return (
    <Link href={`/courses/${course.slug}`} className={cn("group block", className)}>
      <div className="premium-card card-shine h-full overflow-hidden rounded-[1.4rem] flex flex-col">

        {/* ── Gradient header ── */}
        <div className={cn(
          "relative overflow-hidden border-b border-white/10 bg-linear-to-br",
          compact ? "h-28" : "h-40",
          branding.gradient
        )}>
          {/* Layered light effects */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.28),transparent_40%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_85%,rgba(0,0,0,0.15),transparent_40%)]" />

          {/* Decorative circles */}
          <div className="absolute -bottom-10 -left-8 h-28 w-28 rounded-full bg-white/10 blur-md" />
          <div className="absolute -top-6 right-6 h-20 w-20 rounded-full bg-black/10 blur-sm" />
          <div className="absolute bottom-4 right-12 h-10 w-10 rounded-full bg-white/8" />

          {/* Status badge */}
          <div className="absolute right-3 top-3 flex items-center gap-1">
            {completed && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/85 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
                <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
                {isAr ? "مكتمل" : "Completed"}
              </span>
            )}
            {enrolled && !completed && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/80 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
                <span className="material-symbols-outlined text-[12px]">pending</span>
                {isAr ? "قيد التقدم" : "In Progress"}
              </span>
            )}
          </div>

          {/* Bottom content: mark + meta */}
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 text-white">
            <div className="space-y-2">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/25 bg-white/15 font-headline text-sm font-bold tracking-[0.2em] backdrop-blur-sm shadow-sm">
                {branding.mark}
              </div>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-white/75">
                <span>{course.code || branding.mark}</span>
                <span className="h-1 w-1 rounded-full bg-white/50" />
                <Clock className="h-3 w-3" />
                <span>{course.duration} min</span>
              </div>
            </div>

            {/* Progress circle */}
            {enrolled && progress > 0 && (
              <div className="flex flex-col items-center gap-0.5">
                <div className="relative h-9 w-9">
                  <svg className="-rotate-90" width="36" height="36">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="14"
                      fill="none"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 14}
                      strokeDashoffset={2 * Math.PI * 14 * (1 - progress / 100)}
                      className="progress-ring-circle"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white">
                    {progress}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Body ── */}
        <div className={cn("flex flex-1 flex-col space-y-3 p-5", compact && "space-y-2 p-4")}>
          {/* Topic badge + code */}
          <div className="flex items-center justify-between gap-2">
            <Badge
              className={cn(
                "rounded-full border-0 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em]",
                branding.badgeClass
              )}
            >
              {topicLabel}
            </Badge>
            {course.code && (
              <span className="text-[10px] font-mono text-muted-foreground">{course.code}</span>
            )}
          </div>

          {/* Title */}
          <h3
            className={cn(
              "font-headline leading-snug text-foreground transition-colors group-hover:text-primary",
              compact ? "text-base font-semibold line-clamp-2" : "text-[1.15rem] font-semibold line-clamp-2"
            )}
          >
            {courseTitle}
          </h3>

          {/* Bilingual subtitle */}
          {!isAr && course.titleArabic && (
            <p
              className={cn("font-arabic text-muted-foreground leading-relaxed", compact ? "text-xs line-clamp-1" : "text-sm line-clamp-1")}
              dir="rtl"
            >
              {course.titleArabic}
            </p>
          )}
          {isAr && course.titleArabic && course.title !== course.titleArabic && (
            <p
              className={cn("text-muted-foreground", compact ? "text-[11px] line-clamp-1" : "text-xs line-clamp-1")}
              dir="ltr"
            >
              {course.title}
            </p>
          )}

          {/* Body summary */}
          {!compact && bodySummary && !isAr && (
            <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground flex-1">
              {bodySummary}.
            </p>
          )}

          {/* Footer row */}
          <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground mt-auto">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 items-center rounded-full bg-surface-container-low px-2.5 text-[11px] font-semibold">
                <Clock className="mr-1 h-3 w-3" />
                {course.duration} {isAr ? "د" : "min"}
              </span>
              {completed && (
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  {isAr ? "✓ شهادة" : "✓ Certified"}
                </span>
              )}
            </div>
            <span className="inline-flex items-center gap-1 font-semibold uppercase tracking-[0.16em] text-primary transition-all group-hover:gap-2">
              {isAr ? "عرض" : "Open"}
              <Arrow className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

"use client";

import Link from "next/link";
import { useLocale } from "@/components/locale-provider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getTopicBranding } from "@/lib/topic-branding";
import { getLocalizedTopicLabel } from "@/lib/topic-localization";

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
  const directionalArrow = locale === "ar" ? "arrow_back" : "arrow_forward";

  return (
    <Link href={`/courses/${course.slug}`} className={cn("group block", className)}>
      <div className="premium-card card-shine h-full overflow-hidden rounded-[1.4rem]">
        <div className={cn("relative overflow-hidden border-b border-white/10 bg-linear-to-br", compact ? "h-32" : "h-40", branding.gradient)}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.3),transparent_30%)]" />
          <div className="absolute -bottom-8 -left-6 h-24 w-24 rounded-full bg-white/10 blur-md" />
          <div className="absolute right-4 top-4 flex items-center gap-1">
            {completed && (
              <span className="inline-flex items-center rounded-full bg-white/18 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                {locale === "ar" ? "مكتمل" : "Completed"}
              </span>
            )}
            {enrolled && !completed && (
              <span className="inline-flex items-center rounded-full bg-white/18 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                {locale === "ar" ? "قيد التقدم" : "In Progress"}
              </span>
            )}
          </div>
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 text-white">
            <div className="space-y-2">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/12 font-headline text-sm font-semibold tracking-[0.2em] backdrop-blur-sm">
                {branding.mark}
              </div>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-white/72">
                <span>{course.code || branding.mark}</span>
                <span className="h-1 w-1 rounded-full bg-white/60" />
                <span>{course.duration} min</span>
              </div>
            </div>
            {enrolled && progress > 0 && (
              <div className="rounded-full border border-white/20 bg-black/10 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                {progress}%
              </div>
            )}
          </div>
        </div>

        <div className={cn("space-y-3 p-5", compact && "space-y-2 p-4")}>
          <div className="flex items-center justify-between gap-3">
            <Badge className={cn("rounded-full border-0 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]", branding.badgeClass)}>
              {topicLabel}
            </Badge>
            <span className="text-xs text-muted-foreground">{course.code}</span>
          </div>

          <h3 className={cn(
            "font-headline leading-tight text-foreground transition-colors group-hover:text-primary",
            compact ? "text-base font-semibold line-clamp-2" : "text-[1.2rem] font-semibold line-clamp-2"
          )}>
            {courseTitle}
          </h3>

          {locale !== "ar" && course.titleArabic && (
            <p className={cn("font-arabic text-muted-foreground", compact ? "text-xs line-clamp-1" : "text-sm line-clamp-2")} dir="rtl">
              {course.titleArabic}
            </p>
          )}

          {locale === "ar" && course.titleArabic && course.title !== course.titleArabic && (
            <p className={cn("text-muted-foreground", compact ? "text-[11px] line-clamp-1" : "text-xs line-clamp-2")} dir="ltr">
              {course.title}
            </p>
          )}

          {!compact && bodySummary && locale !== "ar" && (
            <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {bodySummary}.
            </p>
          )}

          <div className="flex items-center justify-between border-t border-border/70 pt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 items-center rounded-full bg-surface-container-low px-2.5 font-medium">
                {course.duration} {locale === "ar" ? "دقيقة" : "min"}
              </span>
              {completed && <span className="text-emerald-600 dark:text-emerald-400">{locale === "ar" ? "شهادة" : "Certified"}</span>}
            </div>
            <span className="inline-flex items-center gap-1 font-semibold uppercase tracking-[0.16em] text-primary transition-transform group-hover:translate-x-1">
              {locale === "ar" ? "عرض" : "Open"}
              <span className="material-symbols-outlined text-[14px]">{directionalArrow}</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

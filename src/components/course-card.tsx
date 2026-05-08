"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TOPIC_ICONS: Record<string, string> = {
  "Quality Improvement": "📊",
  "Patient Safety": "🛡️",
  "Leadership": "👔",
  "Person- and Family-Centered Care": "💼",
  "Triple Aim": "🎯",
  "Graduate Medical Education": "🎓",
  "Contextualizing Care": "🤝",
  "ClaimLINC": "⚡",
  "AI Healthcare": "🤖",
  "NPHIES": "🏥",
  "FHIR R4": "🔗",
  "Decarbonization": "🌿",
  "Dental Care": "🦷",
  "Advanced Leadership": "🏆",
};

const THUMB_GRADIENTS = [
  "from-indigo-500 to-purple-600",
  "from-teal-500 to-cyan-600",
  "from-violet-500 to-purple-700",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-sky-500 to-blue-600",
  "from-fuchsia-500 to-violet-600",
];

const TOPIC_BADGE_COLORS: Record<string, string> = {
  "Quality Improvement": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  "Patient Safety": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  "Leadership": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  "Triple Aim": "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  "Person- and Family-Centered Care": "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  "Graduate Medical Education": "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  "AI Healthcare": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  "NPHIES": "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  "FHIR R4": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
};

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
  index?: number;
  className?: string;
  compact?: boolean;
}

export function CourseCard({
  course,
  enrolled = false,
  completed = false,
  progress = 0,
  index = 0,
  className,
  compact = false,
}: CourseCardProps) {
  const gradient = THUMB_GRADIENTS[index % THUMB_GRADIENTS.length];
  const topicBadgeColor = TOPIC_BADGE_COLORS[course.topic] || "bg-surface-container-high text-foreground";
  const icon = TOPIC_ICONS[course.topic] || "📚";

  return (
    <Link href={`/courses/${course.slug}`} className={cn("group block", className)}>
      <div className="premium-card card-shine h-full overflow-hidden rounded-xl">
        {/* Thumbnail */}
        <div className={`relative h-32 bg-gradient-to-br ${gradient} overflow-hidden`}>
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-2 right-2 w-24 h-24 rounded-full bg-white/20" />
            <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/10" />
          </div>

          {/* Big icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl opacity-30 select-none">{icon}</span>
          </div>

          {/* Topic badge */}
          <div className="absolute top-2 left-2">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${topicBadgeColor} backdrop-blur-sm`}>
              {icon} {course.topic}
            </span>
          </div>

          {/* Status badges */}
          <div className="absolute top-2 right-2 flex gap-1">
            {completed && (
              <span className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-white text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
              </span>
            )}
            {enrolled && !completed && (
              <span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-white text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
              </span>
            )}
          </div>

          {/* Progress bar */}
          {enrolled && progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
              <div
                className="h-full bg-white transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className={cn("p-4 space-y-2", compact && "p-3 space-y-1.5")}>
          <h3 className={cn(
            "font-headline font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight",
            compact ? "text-sm" : "text-base"
          )}>
            {course.title}
          </h3>

          {course.titleArabic && !compact && (
            <p className="font-arabic text-xs text-muted-foreground line-clamp-1" dir="rtl">
              {course.titleArabic}
            </p>
          )}

          <div className="flex items-center justify-between pt-1 border-t border-border">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">schedule</span>
                {course.duration} min
              </span>
              {course.code && (
                <span className="font-mono text-[10px] opacity-60">{course.code}</span>
              )}
            </div>
            <span className="material-symbols-outlined text-primary text-[18px] group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

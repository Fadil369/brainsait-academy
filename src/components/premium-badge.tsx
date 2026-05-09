"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocale, type Locale } from "@/components/locale-provider";
import { toast } from "sonner";

interface PremiumBadgeProps {
  locale: Locale;
  variant?: "card" | "inline";
}

export function PremiumBadge({ locale, variant = "inline" }: PremiumBadgeProps) {
  const isAr = locale === "ar";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-semibold ${
      variant === "card" ? "px-3 py-1.5 text-xs" : "px-2 py-0.5 text-[10px]"
    } bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800`}>
      <span>👑</span>
      <span>PRO</span>
    </span>
  );
}

interface ProUpgradeCardProps {
  locale: Locale;
  courseSlug: string;
}

export function ProUpgradeCard({ locale, courseSlug }: ProUpgradeCardProps) {
  const isAr = locale === "ar";

  const features = isAr
    ? [
        { icon: "auto_awesome", label: "ملاحظات دراسية بالذكاء الاصطناعي غير محدودة" },
        { icon: "smart_toy", label: "محادثات غير محدودة مع Gem" },
        { icon: "download", label: "شهادات قابلة للتحقق" },
        { icon: "insights", label: "تحليلات تعلم متقدمة" },
        { icon: "offline", label: "تحميل للتعلم بدون إنترنت" },
      ]
    : [
        { icon: "auto_awesome", label: "Unlimited AI study notes" },
        { icon: "smart_toy", label: "Unlimited Gem conversations" },
        { icon: "download", label: "Verifiable certificates" },
        { icon: "insights", label: "Advanced learning analytics" },
        { icon: "offline", label: "Offline learning downloads" },
      ];

  return (
    <Card className="overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500" />
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 flex items-center justify-center shrink-0 text-2xl">
            👑
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-headline font-bold text-sm">{isAr ? "ترقية إلى Pro" : "Upgrade to Pro"}</span>
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-[10px] h-4 px-1.5">PRO</Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isAr
                ? "افتح ميزات متقدمة ومحادثات غير محدودة مع الذكاء الاصطناعي."
                : "Unlock advanced features and unlimited AI conversations."}
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="material-symbols-outlined text-amber-600 text-[14px] w-4" style={{ fontVariationSettings: "'FILL' 1" }}>{f.icon}</span>
              <span className="text-muted-foreground">{f.label}</span>
            </div>
          ))}
        </div>

        <div className="pt-1">
          <Button
            onClick={() => toast(isAr ? "🚀 الترقية قادمة قريبًا!" : "🚀 Upgrade coming soon!")}
            className="w-full gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
          >
            <span className="text-lg">👑</span>
            <span className="font-semibold">{isAr ? "ترقية Pro" : "Go Pro"}</span>
            <span className="ml-auto text-[10px] opacity-75">{isAr ? "قريبًا" : "Soon"}</span>
          </Button>
          <p className="text-[10px] text-center text-muted-foreground mt-2">
            {isAr
              ? "ستُفعل الميزة قريبًا — كن من أوائل المستفيدين!"
              : "Feature launching soon — be among the first!"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

interface PremiumSectionCardProps {
  locale: Locale;
  title: string;
  titleAr: string;
  badgeText?: string;
}

export function PremiumSectionCard({ locale, title, titleAr, badgeText }: PremiumSectionCardProps) {
  const isAr = locale === "ar";

  return (
    <div className="relative overflow-hidden rounded-xl border border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-900/5 dark:to-orange-900/5 p-5">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(251,191,36,0.03),transparent_50%,rgba(249,115,22,0.03))]" />
      <div className="absolute top-3 right-3">
        <span className="text-2xl opacity-30">👑</span>
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-headline font-bold text-sm">{isAr ? titleAr : title}</span>
          {badgeText && (
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-[10px] h-4 px-1.5">
              {badgeText}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {isAr
            ? "هذا المحتوى متاح حصريًا لمشتركي Pro. قم بالترقية للوصول إلى:"
            : "This content is exclusively available for Pro subscribers. Upgrade to access:"}
        </p>
        <div className="mt-3 space-y-1.5">
          {(isAr
            ? ["دروس فيديو حصرية", "ملاحظات الذكاء الاصطناعي المتقدمة", "شهادات معتمدة"]
            : ["Exclusive video lessons", "Advanced AI-generated notes", "Verified certificates"]).map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="material-symbols-outlined text-amber-600 text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
              {item}
            </div>
          ))}
        </div>
        <Button
          onClick={() => toast(isAr ? "🚀 الترقية قادمة قريبًا!" : "🚀 Upgrade coming soon!")}
          variant="outline"
          size="sm"
          className="mt-3 gap-1.5 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/10"
        >
          <span className="text-sm">👑</span>
          {isAr ? "ترقية Pro" : "Upgrade to Pro"}
        </Button>
      </div>
    </div>
  );
}

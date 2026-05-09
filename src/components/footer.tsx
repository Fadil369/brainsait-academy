"use client";

import Link from "next/link";
import { ArrowUpRight, HeartPulse, ShieldCheck, Sparkles } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { topicBranding } from "@/lib/topic-branding";
import { getLocalizedTopicLabel } from "@/lib/topic-localization";

const FOOTER_TOPICS = [
  { name: "Patient Safety", slug: "patient-safety" },
  { name: "Quality Improvement", slug: "quality-improvement" },
  { name: "Leadership", slug: "leadership" },
  { name: "Triple Aim", slug: "triple-aim" },
  { name: "Person- and Family-Centered Care", slug: "person-and-family-centered-care" },
  { name: "AI Healthcare", slug: "ai-healthcare" },
];

export function Footer() {
  const { locale } = useLocale();
  const featuredTopics = topicBranding.filter((topic) => !topic.slug.includes("processing")).slice(0, 6);
  const footerLinks = [
    { label: locale === "ar" ? "كل الدورات" : "All Courses", href: "/#courses" },
    { label: locale === "ar" ? "تصفح المسارات" : "Browse Topics", href: "/topics" },
    { label: locale === "ar" ? "تعلمي" : "My Learning", href: "/my-learning" },
    { label: locale === "ar" ? "عن BrainSAIT" : "About BrainSAIT", href: "https://brainsait.org" },
  ];
  const resources = [
    { label: locale === "ar" ? "IHI Open School" : "IHI Open School", href: "https://www.ihi.org/education/ihiopenschool" },
    { label: locale === "ar" ? "معايير سباهي" : "CBAHI Standards", href: "https://www.cbahi.gov.sa" },
    { label: locale === "ar" ? "إرشادات وزارة الصحة" : "MOH Guidelines", href: "https://www.moh.gov.sa" },
    { label: locale === "ar" ? "صحة رؤية 2030" : "Vision 2030 Health", href: "https://www.vision2030.gov.sa" },
  ];

  return (
    <footer className="mt-16 overflow-hidden border-t border-border/70 bg-[linear-gradient(180deg,#10242b_0%,#0a171c_100%)] text-[#f7f1e6]">
      <div className="max-w-7xl mx-auto px-container-padding py-14">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.9fr]">
          <div className="space-y-5">
            <div className="section-kicker border-white/10 bg-white/5 text-[#e8dcc8]">{locale === "ar" ? "تعليم صحي احترافي" : "Premium Health Education"}</div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-[#0f5b5c] to-secondary text-white shadow-[0_18px_40px_rgba(0,0,0,0.25)]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="font-headline text-2xl font-semibold leading-none">BrainSAIT Academy</div>
                <div className="mt-1 text-xs uppercase tracking-[0.24em] text-[#cebda4]">{locale === "ar" ? "مصممة للتميّز السريري" : "Designed For Clinical Excellence"}</div>
              </div>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-[#d8cdbd]">
              {locale === "ar"
                ? "واجهة أكثر نضجًا للتعلم الصحي ثنائي اللغة، صُممت لقادة الجودة وفرق سلامة المرضى والممارسين السريريين ورواد التحول الصحي."
                : "A more refined home for bilingual healthcare learning, built for quality leaders, patient-safety teams, clinicians, and digital health operators."}
            </p>
            <p className="text-xs text-[#9fb0aa] font-arabic text-right" dir="rtl">
              تمكين المهنيين الصحيين بتدريب متميز ثنائي اللغة
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {featuredTopics.map((topic) => (
                <Link
                  key={topic.slug}
                  href={`/topics/${topic.slug}`}
                  className={`inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs transition-opacity hover:opacity-100 ${topic.badgeClass}`}
                >
                  <span className="font-headline text-[11px]">{topic.mark}</span>
                  {getLocalizedTopicLabel(topic.name, locale)}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-headline text-sm font-semibold uppercase tracking-[0.2em] text-[#cebda4]">{locale === "ar" ? "التنقل" : "Navigation"}</h4>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 text-sm text-[#d8cdbd] transition-colors hover:text-white"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5 text-secondary" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-headline text-sm font-semibold uppercase tracking-[0.2em] text-[#cebda4]">{locale === "ar" ? "المسارات الأساسية" : "Core Topics"}</h4>
            <ul className="space-y-2">
              {FOOTER_TOPICS.map((topic) => (
                <li key={topic.slug}>
                  <Link
                    href={`/topics/${topic.slug}`}
                    className="flex items-center gap-2 text-sm text-[#d8cdbd] transition-colors hover:text-white"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                    {getLocalizedTopicLabel(topic.name, locale)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-headline text-sm font-semibold uppercase tracking-[0.2em] text-[#cebda4]">{locale === "ar" ? "المعايير والشركاء" : "Standards & Partners"}</h4>
            <ul className="space-y-2">
              {resources.map((r) => (
                <li key={r.href}>
                  <a
                    href={r.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-[#d8cdbd] transition-colors hover:text-white"
                  >
                    <HeartPulse className="h-3.5 w-3.5 text-secondary" />
                    {r.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 editorial-rule" />

        <div className="pt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[#9fb0aa]">
            {locale === "ar"
              ? "© 2026 BrainSAIT. جميع الحقوق محفوظة. بدعم من IHI Open School."
              : "© 2026 BrainSAIT. All rights reserved. Powered by IHI Open School."}
          </p>
          <div className="flex items-center gap-4 text-xs text-[#9fb0aa]">
            <span>{locale === "ar" ? "الخصوصية" : "Privacy Policy"}</span>
            <span>{locale === "ar" ? "الشروط" : "Terms of Service"}</span>
            <span>{locale === "ar" ? "الدعم" : "Support"}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

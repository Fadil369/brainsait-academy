"use client";

import Link from "next/link";
import { ArrowUpRight, HeartPulse, ShieldCheck, Sparkles, GraduationCap } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { topicBranding } from "@/lib/topic-branding";
import { getLocalizedTopicLabel } from "@/lib/topic-localization";
import { cn } from "@/lib/utils";

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
  const isAr = locale === "ar";
  const featuredTopics = topicBranding.filter(t => !t.slug.includes("processing")).slice(0, 6);

  const footerLinks = [
    { label: isAr ? "كل الدورات" : "All Courses", href: "/#courses" },
    { label: isAr ? "تصفح المسارات" : "Browse Topics", href: "/topics" },
    { label: isAr ? "تعلمي" : "My Learning", href: "/my-learning" },
    { label: isAr ? "عن BrainSAIT" : "About BrainSAIT", href: "https://brainsait.org" },
  ];
  const resources = [
    { label: "IHI Open School", href: "https://www.ihi.org/education/ihiopenschool" },
    { label: isAr ? "معايير سباهي" : "CBAHI Standards", href: "https://www.cbahi.gov.sa" },
    { label: isAr ? "إرشادات وزارة الصحة" : "MOH Guidelines", href: "https://www.moh.gov.sa" },
    { label: isAr ? "صحة رؤية 2030" : "Vision 2030 Health", href: "https://www.vision2030.gov.sa" },
  ];

  return (
    <footer className="relative mt-16 overflow-hidden border-t border-border/50">
      {/* Richer dark background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(180deg, #0e2028 0%, #091419 100%)",
        }}
      />
      {/* Decorative orbs */}
      <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-primary/8 blur-3xl pointer-events-none" />
      <div className="absolute left-0 bottom-0 h-48 w-48 rounded-full bg-secondary/8 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-container-padding py-14">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_0.75fr_0.75fr_0.9fr]">

          {/* Brand column */}
          <div className="space-y-6">
            <div className="section-kicker border-white/10 bg-white/5 text-[#e8dcc8]">
              {isAr ? "تعليم صحي احترافي" : "Premium Health Education"}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-[0_14px_32px_rgba(0,0,0,0.30)]">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <div className="font-headline text-2xl font-semibold leading-none text-[#f7f1e6]">BrainSAIT Academy</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.26em] text-[#c8b99a]">
                  {isAr ? "مصممة للتميّز السريري" : "Designed For Clinical Excellence"}
                </div>
              </div>
            </div>

            <p className="max-w-xs text-sm leading-7 text-[#c8bdb0]">
              {isAr
                ? "واجهة أكثر نضجًا للتعلم الصحي ثنائي اللغة، صُممت لقادة الجودة وفرق سلامة المرضى والممارسين السريريين."
                : "A refined home for bilingual healthcare learning, built for quality leaders, patient-safety teams, clinicians, and digital health operators."}
            </p>

            {isAr && (
              <p className="text-xs text-[#9fb0aa] font-arabic text-right" dir="rtl">
                تمكين المهنيين الصحيين بتدريب متميز ثنائي اللغة
              </p>
            )}

            {/* Topic badge pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              {featuredTopics.map(topic => (
                <Link
                  key={topic.slug}
                  href={`/topics/${topic.slug}`}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-[11px] font-semibold transition-all hover:border-white/25 hover:opacity-100",
                    topic.badgeClass
                  )}
                >
                  <span className="font-headline text-[10px]">{topic.mark}</span>
                  {getLocalizedTopicLabel(topic.name, locale)}
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h4 className="font-headline text-xs font-bold uppercase tracking-[0.22em] text-[#c8b99a]">
              {isAr ? "التنقل" : "Navigation"}
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 text-sm text-[#c8bdb0] transition-colors hover:text-white"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5 text-secondary shrink-0" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Core Topics */}
          <div className="space-y-4">
            <h4 className="font-headline text-xs font-bold uppercase tracking-[0.22em] text-[#c8b99a]">
              {isAr ? "المسارات الأساسية" : "Core Topics"}
            </h4>
            <ul className="space-y-2.5">
              {FOOTER_TOPICS.map(topic => (
                <li key={topic.slug}>
                  <Link
                    href={`/topics/${topic.slug}`}
                    className="flex items-center gap-2 text-sm text-[#c8bdb0] transition-colors hover:text-white"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-accent shrink-0" />
                    {getLocalizedTopicLabel(topic.name, locale)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Standards & Partners */}
          <div className="space-y-4">
            <h4 className="font-headline text-xs font-bold uppercase tracking-[0.22em] text-[#c8b99a]">
              {isAr ? "المعايير والشركاء" : "Standards & Partners"}
            </h4>
            <ul className="space-y-2.5">
              {resources.map(r => (
                <li key={r.href}>
                  <a
                    href={r.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-[#c8bdb0] transition-colors hover:text-white"
                  >
                    <HeartPulse className="h-3.5 w-3.5 text-secondary shrink-0" />
                    {r.label}
                  </a>
                </li>
              ))}
            </ul>

            {/* IHI badge */}
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
              <div className="text-2xl mb-2">🏆</div>
              <div className="font-headline text-xs font-bold text-[#e8dcc8]">IHI Open School</div>
              <div className="text-[10px] text-[#9fb0aa] mt-0.5">
                {isAr ? "محتوى متوافق مع IHI" : "IHI-aligned content"}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-12 editorial-rule opacity-60" />

        {/* Copyright row */}
        <div className="pt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[#7d9c98]">
            {isAr
              ? "© 2026 BrainSAIT. جميع الحقوق محفوظة. بدعم من IHI Open School."
              : "© 2026 BrainSAIT. All rights reserved. Powered by IHI Open School."}
          </p>
          <div className="flex items-center gap-5 text-xs text-[#7d9c98]">
            <span className="cursor-pointer hover:text-white transition-colors">{isAr ? "الخصوصية" : "Privacy Policy"}</span>
            <span className="cursor-pointer hover:text-white transition-colors">{isAr ? "الشروط" : "Terms of Service"}</span>
            <span className="cursor-pointer hover:text-white transition-colors">{isAr ? "الدعم" : "Support"}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

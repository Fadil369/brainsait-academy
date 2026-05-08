import Link from "next/link";

const FOOTER_TOPICS = [
  { name: "Patient Safety", slug: "patient-safety" },
  { name: "Quality Improvement", slug: "quality-improvement" },
  { name: "Leadership", slug: "leadership" },
  { name: "Triple Aim", slug: "triple-aim" },
  { name: "Person-Centered Care", slug: "person-and-family-centered-care" },
  { name: "AI Healthcare", slug: "ai-healthcare" },
];

const FOOTER_LINKS = [
  { label: "All Courses", href: "/#courses" },
  { label: "Browse Topics", href: "/topics" },
  { label: "My Learning", href: "/my-learning" },
  { label: "About BrainSAIT", href: "https://brainsait.org" },
];

const RESOURCES = [
  { label: "IHI Open School", href: "https://www.ihi.org/education/ihiopenschool" },
  { label: "CBAHI Standards", href: "https://www.cbahi.gov.sa" },
  { label: "MOH Guidelines", href: "https://www.moh.gov.sa" },
  { label: "Vision 2030 Health", href: "https://www.vision2030.gov.sa" },
];

export function Footer() {
  return (
    <footer className="bg-foreground text-background mt-12">
      <div className="max-w-7xl mx-auto px-5 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand Column */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
              </div>
              <div>
                <div className="font-headline font-extrabold text-base leading-tight">BrainSAIT Academy</div>
                <div className="text-[10px] opacity-50 font-arabic">أكاديمية برين سايت</div>
              </div>
            </div>
            <p className="text-sm opacity-70 leading-relaxed">
              Empowering healthcare professionals with premium bilingual training powered by IHI Open School.
            </p>
            <p className="text-xs opacity-50 font-arabic text-right" dir="rtl">
              تمكين المهنيين الصحيين بتدريب متميز ثنائي اللغة
            </p>
            <div className="flex items-center gap-2 text-xs opacity-50">
              <span className="material-symbols-outlined text-[14px]">workspace_premium</span>
              IHI Open School Partner
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-headline font-bold text-sm uppercase tracking-wider opacity-60">Quick Links</h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm opacity-70 hover:opacity-100 hover:text-background transition-opacity flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[12px] opacity-50">arrow_forward_ios</span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Topics */}
          <div className="space-y-4">
            <h4 className="font-headline font-bold text-sm uppercase tracking-wider opacity-60">Topics</h4>
            <ul className="space-y-2">
              {FOOTER_TOPICS.map((topic) => (
                <li key={topic.slug}>
                  <Link
                    href={`/topics/${topic.slug}`}
                    className="text-sm opacity-70 hover:opacity-100 transition-opacity flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[12px] opacity-50">arrow_forward_ios</span>
                    {topic.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="font-headline font-bold text-sm uppercase tracking-wider opacity-60">Resources</h4>
            <ul className="space-y-2">
              {RESOURCES.map((r) => (
                <li key={r.href}>
                  <a
                    href={r.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm opacity-70 hover:opacity-100 transition-opacity flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[12px] opacity-50">open_in_new</span>
                    {r.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-background/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs opacity-40">
            © 2026 BrainSAIT. All rights reserved. Powered by IHI Open School.
          </p>
          <div className="flex items-center gap-4 text-xs opacity-40">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Support</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

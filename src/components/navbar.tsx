"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { BookOpenText, GraduationCap, Grid2x2, Languages, MoonStar, Sparkles, SunMedium } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function subscribeHash(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}
const getHashSnapshot = () => window.location.hash;
const getHashServerSnapshot = () => "";

const NAV_LINKS = {
  en: [
    { href: "/", label: "Dashboard", icon: Grid2x2 },
    { href: "/topics", label: "Tracks", icon: Sparkles },
    { href: "/#courses", label: "Courses", icon: BookOpenText },
    { href: "/my-learning", label: "My Learning", icon: GraduationCap },
  ],
  ar: [
    { href: "/", label: "الرئيسية", icon: Grid2x2 },
    { href: "/topics", label: "المسارات", icon: Sparkles },
    { href: "/#courses", label: "الدورات", icon: BookOpenText },
    { href: "/my-learning", label: "تعلمي", icon: GraduationCap },
  ],
} as const;

function readEnrolledCourses(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("enrolledCourses");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export function NavBar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { locale, toggleLocale } = useLocale();
  const [enrolledCount, setEnrolledCount] = useState(() => readEnrolledCourses().length);
  const [scrolled, setScrolled] = useState(false);
  const navItems = NAV_LINKS[locale];

  useEffect(() => {
    const update = () => setEnrolledCount(readEnrolledCourses().length);
    window.addEventListener("storage", update);
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 border-b border-border/60 glass transition-all duration-300",
        scrolled ? "shadow-[0_12px_32px_rgba(16,36,43,0.10)]" : ""
      )}
    >
      <div className="max-w-7xl mx-auto px-container-padding py-3">
        <div className="flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary-dark to-secondary text-primary-foreground shadow-[0_10px_28px_rgba(15,91,92,0.28)] transition-shadow group-hover:shadow-[0_14px_36px_rgba(15,91,92,0.36)]">
              <GraduationCap className="h-5 w-5" />
              {/* Live dot */}
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-emerald-400" />
            </div>
            <div className="hidden sm:block">
              <div className="font-headline text-lg font-semibold leading-none text-foreground">BrainSAIT Academy</div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.26em] text-muted-foreground">
                {locale === "ar" ? "تعلم سريري احترافي" : "Premium Clinical Learning"}
              </div>
            </div>
          </Link>

          {/* Desktop nav pills */}
          <div className="hidden md:flex items-center gap-1 rounded-full border border-border/70 bg-background/70 px-2 py-1.5">
            {navItems.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all",
                  isActive(link.href)
                    ? "bg-foreground text-background shadow-sm"
                    : "text-muted-foreground hover:bg-surface-container-low hover:text-foreground"
                )}
              >
                <link.icon className="h-3.5 w-3.5" />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {enrolledCount > 0 && (
              <button
                onClick={() =>
                  toast(
                    locale === "ar"
                      ? `📚 ${enrolledCount} دورة مسجلة`
                      : `📚 ${enrolledCount} course${enrolledCount > 1 ? "s" : ""} enrolled`
                  )
                }
                className="hidden rounded-full border border-secondary/25 bg-secondary/10 px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-secondary/18 sm:inline-flex sm:items-center sm:gap-2"
              >
                <Sparkles className="h-3.5 w-3.5 text-secondary" />
                {locale === "ar" ? `${enrolledCount} نشط` : `${enrolledCount} active`}
              </button>
            )}

            <Badge
              variant="outline"
              className="hidden gap-1.5 rounded-full border-border/70 bg-background/70 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:inline-flex"
            >
              <Languages className="h-3.5 w-3.5" />
              {locale === "ar" ? "العربية" : "English"}
            </Badge>

            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-full border-border/70 bg-background/70 px-3 text-xs font-semibold"
              onClick={toggleLocale}
              aria-label="Toggle language"
            >
              <Languages className="mr-1 h-3.5 w-3.5" />
              {locale === "ar" ? "EN" : "AR"}
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full border-border/70 bg-background/70"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { locale, toggleLocale } = useLocale();

  const items =
    locale === "ar"
      ? [
          { icon: Grid2x2, label: "الرئيسية", href: "/", key: "home" },
          { icon: Sparkles, label: "المسارات", href: "/topics", key: "topics" },
          { icon: BookOpenText, label: "الدورات", href: "/#courses", key: "courses" },
          { icon: GraduationCap, label: "تعلمي", href: "/my-learning", key: "learning" },
        ]
      : [
          { icon: Grid2x2, label: "Home", href: "/", key: "home" },
          { icon: Sparkles, label: "Tracks", href: "/topics", key: "topics" },
          { icon: BookOpenText, label: "Courses", href: "/#courses", key: "courses" },
          { icon: GraduationCap, label: "Learning", href: "/my-learning", key: "learning" },
        ];

  const hash = useSyncExternalStore(subscribeHash, getHashSnapshot, getHashServerSnapshot);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/" && hash !== "#courses";
    if (href === "/#courses") return pathname === "/" && hash === "#courses";
    return pathname.startsWith(href);
  };

  return (
    <nav className="mobile-nav fixed bottom-4 left-1/2 z-50 hidden w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 justify-around rounded-full border border-border/60 bg-background/92 px-2 py-2 shadow-[0_16px_36px_rgba(16,36,43,0.18)] backdrop-blur-xl">
      {items.map(item => (
        <Link
          key={item.key}
          href={item.href}
          className={cn(
            "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all",
            isActive(item.href)
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <item.icon className="h-4.5 w-4.5" />
          <span className="text-[10px] font-semibold">{item.label}</span>
        </Link>
      ))}
      <button
        onClick={toggleLocale}
        className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Toggle language"
      >
        <Languages className="h-4.5 w-4.5" />
        <span className="text-[10px] font-semibold">{locale === "ar" ? "اللغة" : "Lang"}</span>
      </button>
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <SunMedium className="h-4.5 w-4.5" /> : <MoonStar className="h-4.5 w-4.5" />}
        <span className="text-[10px] font-semibold">{locale === "ar" ? "المظهر" : "Theme"}</span>
      </button>
    </nav>
  );
}

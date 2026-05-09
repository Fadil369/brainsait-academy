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

/** Subscribes to hash fragment changes for use with useSyncExternalStore. */
function subscribeHash(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

/** Returns the current URL hash on the client. */
const getHashSnapshot = () => window.location.hash;
/** Returns empty string during SSR / static generation (no window). */
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
    const update = () => {
      setEnrolledCount(readEnrolledCourses().length);
    };
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
    <nav className={`sticky top-0 z-50 border-b border-border/70 glass transition-all duration-300 ${scrolled ? "shadow-[0_16px_40px_rgba(16,36,43,0.1)]" : ""}`}>
      <div className="max-w-7xl mx-auto px-container-padding py-3">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-[0_14px_34px_rgba(15,91,92,0.24)]">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="hidden sm:block">
              <div className="font-headline text-lg font-semibold leading-none text-foreground">BrainSAIT Academy</div>
              <div className="mt-1 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">{locale === "ar" ? "تعلم سريري احترافي" : "Premium Clinical Learning"}</div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1 rounded-full border border-border/70 bg-background/70 px-2 py-1">
            {navItems.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  isActive(link.href)
                    ? "bg-foreground text-background shadow-sm"
                    : "text-muted-foreground hover:bg-surface-container-low hover:text-foreground"
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {enrolledCount > 0 && (
              <button
                onClick={() => toast(locale === "ar" ? `📚 ${enrolledCount} دورة مسجلة` : `📚 ${enrolledCount} course${enrolledCount > 1 ? "s" : ""} enrolled`)}
                className="hidden rounded-full border border-secondary/25 bg-secondary/10 px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-secondary/15 sm:inline-flex sm:items-center sm:gap-2"
              >
                <Sparkles className="h-3.5 w-3.5 text-secondary" />
                {locale === "ar" ? `${enrolledCount} نشط` : `${enrolledCount} active`}
              </button>
            )}

            <Badge variant="outline" className="hidden gap-2 rounded-full border-border/70 bg-background/70 px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground sm:inline-flex">
              <Languages className="h-3.5 w-3.5" />
              {locale === "ar" ? "العربية" : "English"}
            </Badge>

            <Button
              variant="outline"
              size="sm"
              className="h-10 rounded-full border-border/70 bg-background/70 px-3"
              onClick={toggleLocale}
              aria-label="Toggle language"
            >
              <Languages className="mr-1 h-4 w-4" />
              {locale === "ar" ? "EN" : "AR"}
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full border-border/70 bg-background/70"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <SunMedium className="h-4.5 w-4.5" /> : <MoonStar className="h-4.5 w-4.5" />}
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

  const items = locale === "ar"
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
    <nav className="mobile-nav fixed bottom-4 left-1/2 z-50 hidden w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 justify-around rounded-full border border-border/70 bg-background/90 px-2 py-2 shadow-[0_18px_40px_rgba(16,36,43,0.18)] backdrop-blur-xl">
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
            isActive(item.href)
              ? "bg-foreground text-background"
              : "text-muted-foreground"
          }`}
        >
          <item.icon className="h-4.5 w-4.5" />
          <span className="text-[10px] font-medium">{item.label}</span>
        </Link>
      ))}
      <button
        onClick={toggleLocale}
        className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-muted-foreground"
        aria-label="Toggle language"
      >
        <Languages className="h-4.5 w-4.5" />
        <span className="text-[10px] font-medium">{locale === "ar" ? "اللغة" : "Lang"}</span>
      </button>
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-muted-foreground"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <SunMedium className="h-4.5 w-4.5" /> : <MoonStar className="h-4.5 w-4.5" />}
        <span className="text-[10px] font-medium">{locale === "ar" ? "المظهر" : "Theme"}</span>
      </button>
    </nav>
  );
}


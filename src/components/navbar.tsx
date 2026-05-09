"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const NAV_LINKS = [
  { href: "/", label: "Dashboard", icon: "dashboard" },
  { href: "/topics", label: "Topics", icon: "category" },
  { href: "#courses", label: "Courses", icon: "auto_stories" },
  { href: "/my-learning", label: "My Learning", icon: "school" },
];

export function NavBar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [enrolledCount, setEnrolledCount] = useState(() => JSON.parse(localStorage.getItem("enrolledCourses") || "[]").length);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => {
      const e = JSON.parse(localStorage.getItem("enrolledCourses") || "[]");
      setEnrolledCount(e.length);
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
    return pathname.startsWith(href);
  };

  return (
    <nav className={`sticky top-0 z-50 glass border-b transition-all duration-200 ${scrolled ? "shadow-md" : ""}`}>
      <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-white text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              school
            </span>
          </div>
          <div className="hidden sm:block">
            <span className="font-headline text-base font-extrabold text-primary leading-tight">BrainSAIT</span>
            <span className="font-headline text-base font-extrabold text-foreground leading-tight"> Academy</span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isActive(link.href)
                  ? "text-primary bg-primary/8"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-container-low"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {/* Enrolled Badge */}
          {enrolledCount > 0 && (
            <button
              onClick={() => toast(`📚 ${enrolledCount} course${enrolledCount > 1 ? "s" : ""} enrolled`)}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/15 transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">school</span>
              {enrolledCount}
            </button>
          )}

          {/* Language Badge */}
          <Badge variant="outline" className="gap-1 px-2.5 py-1 text-xs hidden sm:flex">
            <span className="material-symbols-outlined text-[13px]">translate</span>
            AR/EN
          </Badge>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-9 h-9"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            <span className="material-symbols-outlined text-[18px]">
              {theme === "dark" ? "light_mode" : "dark_mode"}
            </span>
          </Button>
        </div>
      </div>
    </nav>
  );
}

export function MobileNav({ activeItem = "home" }: { activeItem?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(true);

  const items = [
    { icon: "dashboard", label: "Home", href: "/", key: "home" },
    { icon: "category", label: "Topics", href: "/topics", key: "topics" },
    { icon: "auto_stories", label: "Courses", href: "/#courses", key: "courses" },
    { icon: "school", label: "Learning", href: "/my-learning", key: "learning" },
  ];

  return (
    <nav className="mobile-nav fixed bottom-0 w-full z-50 glass border-t py-2 px-2 justify-around items-center hidden">
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
            activeItem === item.key
              ? "text-primary bg-primary/8"
              : "text-muted-foreground"
          }`}
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={activeItem === item.key ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            {item.icon}
          </span>
          <span className="text-[10px] font-medium">{item.label}</span>
        </Link>
      ))}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-muted-foreground"
      >
        <span className="material-symbols-outlined text-[22px]">
          {theme === "dark" ? "light_mode" : "dark_mode"}
        </span>
        <span className="text-[10px] font-medium">Theme</span>
      </button>
    </nav>
  );
}

import type { Metadata } from "next";
import { Fraunces, Noto_Naskh_Arabic, Manrope } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["600", "700"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700", "800"],
});

const notoNaskhArabic = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  variable: "--font-noto-naskh-arabic",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "BrainSAIT Academy - Premium Healthcare Training",
  description: "Professional bilingual healthcare training in Arabic & English. 43 IHI Open School courses with AI-powered learning.",
  keywords: ["BrainSAIT", "Academy", "Healthcare", "IHI", "Medical Training", "Arabic", "English"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${fraunces.variable} ${manrope.variable} ${notoNaskhArabic.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-secondary/20 selection:text-foreground">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <TooltipProvider>
            {children}
            <Toaster position="bottom-right" richColors closeButton />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
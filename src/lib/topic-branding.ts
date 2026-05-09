import brandingData from "@/lib/data/topic-branding.json";

export type TopicBranding = {
  name: string;
  slug: string;
  mark: string;
  gradient: string;
  accent: string;
  badgeClass: string;
  description: string;
};

const brandingMap = Object.fromEntries(
  (brandingData as TopicBranding[]).map((entry) => [entry.name, entry])
) as Record<string, TopicBranding>;

const fallbackBranding: TopicBranding = {
  name: "Academy",
  slug: "academy",
  mark: "BA",
  gradient: "from-[#0f5b5c] via-[#1f7a78] to-[#d4a34f]",
  accent: "#0f5b5c",
  badgeClass: "bg-[#e3f2ef] text-[#0f5b5c] dark:bg-[#13262a] dark:text-[#c2e8e0]",
  description: "Premium bilingual healthcare learning for BrainSAIT Academy teams.",
};

export const topicBranding = brandingData as TopicBranding[];

export function getTopicBranding(name: string): TopicBranding {
  return brandingMap[name] ?? {
    ...fallbackBranding,
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    mark: name
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || fallbackBranding.mark,
  };
}
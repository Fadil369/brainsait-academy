import 'dotenv/config';

import Anthropic from '@anthropic-ai/sdk';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

interface CourseSection {
  heading: string;
  headingArabic: string;
  content: string;
  contentArabic: string;
}

interface EnrichmentMetadata {
  language: 'en' | 'ar' | 'mixed';
  saudiContext: boolean;
  cbahiAligned: boolean;
  vision2030Aligned: boolean;
  roleBasedContent: string[];
  practicalActivities: number;
  glossaryTerms: number;
}

interface CourseRecord {
  title: string;
  titleArabic: string;
  slug: string;
  sourceUrl: string;
  status: 'Published' | 'Draft';
  duration: number;
  keywords: string[];
  summary: string;
  summaryArabic: string;
  sections: CourseSection[];
  generatedAt: string;
  audit: {
    enrichmentEnabled: boolean;
    provider: 'anthropic' | 'none';
  };
  enrichment?: EnrichmentMetadata;
}

const DEFAULT_INPUT = 'courses/sample-course.md';
const DEFAULT_OUTPUT = 'dist/sample-course.json';

function getArg(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

function parseFrontMatter(fileContent: string): { metadata: Record<string, string>; body: string } {
  if (!fileContent.startsWith('---\n')) {
    return { metadata: {}, body: fileContent.trim() };
  }

  const closingIndex = fileContent.indexOf('\n---\n', 4);

  if (closingIndex < 0) {
    return { metadata: {}, body: fileContent.trim() };
  }

  const rawMetadata = fileContent.slice(4, closingIndex).trim().split('\n');
  const metadata: Record<string, string> = {};

  for (const line of rawMetadata) {
    const separatorIndex = line.indexOf(':');

    if (separatorIndex < 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();

    metadata[key] = value;
  }

  return { metadata, body: fileContent.slice(closingIndex + 5).trim() };
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function parseBilingualSections(body: string): CourseSection[] {
  const lines = body.split('\n');
  const sections: CourseSection[] = [];
  let currentHeading = 'Overview';
  let currentHeadingArabic = '';
  let currentContent: string[] = [];
  let currentContentArabic: string[] = [];
  let inArabicSection = false;
  let readingArabic = false;

  const flushSection = () => {
    const content = currentContent.join('\n').trim();
    const contentArabic = currentContentArabic.join('\n').trim();

    if (!content && !contentArabic) {
      return;
    }

    sections.push({
      heading: currentHeading,
      headingArabic: currentHeadingArabic,
      content,
      contentArabic: contentArabic || translateToArabic(content),
    });
    currentContent = [];
    currentContentArabic = [];
  };

  for (const line of lines) {
    if (line.startsWith('## ') && !line.includes('العربية')) {
      const headingMatch = line.match(/##\s+(.+?)(?:\s*\|?\s*(.+))?$/);
      if (headingMatch && headingMatch[1]) {
        flushSection();
        currentHeading = headingMatch[1].trim();
        currentHeadingArabic = headingMatch[2]?.trim() || '';
      }
      continue;
    }

    if (line.includes('### ') || line.includes('###')) {
      continue;
    }

    if (line.includes('العربية') || line.includes('بالعربية') || line.match(/^### .+\| .+العربية/)) {
      readingArabic = true;
      inArabicSection = true;
      continue;
    }

    if (line.startsWith('---')) {
      if (inArabicSection) {
        readingArabic = false;
      }
      continue;
    }

    if (line.startsWith('# ')) {
      continue;
    }

    if (readingArabic) {
      currentContentArabic.push(line);
    } else {
      currentContent.push(line);
    }
  }

  flushSection();
  return sections;
}

function translateToArabic(text: string): string {
  const translations: Record<string, string> = {
    'overview': 'نظرة عامة',
    'objectives': 'أهداف التعلم',
    'lessons': 'الدروس',
    'activities': 'الأنشطة',
    'resources': 'الموارد',
    'summary': 'ملخص',
    'introduction': 'مقدمة',
    'conclusion': 'خاتمة',
    'assessment': 'التقييم',
    'references': 'المراجع',
  };

  let translated = text;
  for (const [en, ar] of Object.entries(translations)) {
    translated = translated.replace(new RegExp(en, 'gi'), ar);
  }
  return translated;
}

function detectLanguage(content: string): 'en' | 'ar' | 'mixed' {
  const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
  const hasArabic = arabicPattern.test(content);
  const hasEnglish = /[a-zA-Z]/.test(content);

  if (hasArabic && hasEnglish) return 'mixed';
  if (hasArabic) return 'ar';
  return 'en';
}

function extractEnrichmentMetadata(body: string, keywords: string[]): EnrichmentMetadata {
  const saudiTerms = ['saudi', 'moh', 'ministry of health', 'cbahi', 'vision 2030', 'riyadh', 'jeddah', 'ال سعود', 'وزارة الصحة', 'هيئة'];
  const hasSaudiContext = saudiTerms.some(term =>
    body.toLowerCase().includes(term.toLowerCase())
  );

  const roleTerms = ['physician', 'nurse', 'pharmacist', 'quality', 'الأطباء', 'التمريض', 'الصيدلة'];
  const roleBasedContent = roleTerms.filter(term =>
    body.toLowerCase().includes(term.toLowerCase())
  );

  const activityPattern = /activity|practical|exercise|نشاط|عملي/gi;
  const activities = (body.match(activityPattern) || []).length;

  return {
    language: detectLanguage(body),
    saudiContext: hasSaudiContext,
    cbahiAligned: body.toLowerCase().includes('cbahi'),
    vision2030Aligned: body.toLowerCase().includes('vision 2030') || body.includes('رؤية 2030'),
    roleBasedContent,
    practicalActivities: Math.floor(activities / 2),
    glossaryTerms: (body.match(/\|.+\|.+\|/g) || []).length,
  };
}

function createAudit(enabled: boolean): CourseRecord['audit'] {
  if (!enabled) {
    return { enrichmentEnabled: false, provider: 'none' };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.warn('⚠️  ANTHROPIC_API_KEY not set. Skipping AI enrichment.');
    return { enrichmentEnabled: false, provider: 'none' };
  }

  new Anthropic({ apiKey });

  return { enrichmentEnabled: true, provider: 'anthropic' };
}

async function main(): Promise<void> {
  const inputPath = getArg('--input') ?? process.argv[2] ?? DEFAULT_INPUT;
  const outputPath = getArg('--output') ?? DEFAULT_OUTPUT;
  const enableAiEnrichment = hasFlag('--enrich-with-ai');
  const fileContent = await readFile(inputPath, 'utf8');
  const { metadata, body } = parseFrontMatter(fileContent);
  const sections = parseBilingualSections(body);
  const title = metadata.title ?? body.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? 'Untitled Course';
  const keywords = (metadata.keywords ?? '')
    .split(',')
    .map((keyword) => keyword.trim())
    .filter(Boolean);

  const course: CourseRecord = {
    title,
    titleArabic: metadata.titleArabic ?? translateToArabic(title),
    slug: metadata.slug ?? slugify(title),
    sourceUrl: metadata.sourceUrl ?? '',
    status: metadata.status === 'Draft' ? 'Draft' : 'Published',
    duration: Number.parseInt(metadata.duration ?? '0', 10) || 0,
    keywords,
    summary: sections[0]?.content ?? '',
    summaryArabic: sections[0]?.contentArabic ?? translateToArabic(sections[0]?.content ?? ''),
    sections,
    generatedAt: new Date().toISOString(),
    audit: createAudit(enableAiEnrichment),
  };

  course.enrichment = extractEnrichmentMetadata(body, keywords);

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(course, null, 2)}\n`, 'utf8');
  console.log(`✅ Converted ${path.basename(inputPath)} into ${outputPath}`);
  console.log(`📊 Enrichment: ${course.enrichment?.language || 'en'} | Saudi Context: ${course.enrichment?.saudiContext ? 'Yes' : 'No'} | Activities: ${course.enrichment?.practicalActivities || 0}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

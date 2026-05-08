import 'dotenv/config';

import Anthropic from '@anthropic-ai/sdk';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

interface CourseSection {
  heading: string;
  content: string;
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
  sections: CourseSection[];
  generatedAt: string;
  audit: {
    enrichmentEnabled: boolean;
    provider: 'anthropic' | 'none';
  };
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

function parseSections(body: string): CourseSection[] {
  const lines = body.split('\n');
  const sections: CourseSection[] = [];
  let currentHeading = 'Overview';
  let currentContent: string[] = [];

  const flushSection = () => {
    const content = currentContent.join('\n').trim();

    if (!content) {
      return;
    }

    sections.push({ heading: currentHeading, content });
    currentContent = [];
  };

  for (const line of lines) {
    if (line.startsWith('## ')) {
      flushSection();
      currentHeading = line.slice(3).trim();
      continue;
    }

    if (line.startsWith('# ')) {
      continue;
    }

    currentContent.push(line);
  }

  flushSection();
  return sections;
}

function createAudit(enabled: boolean): CourseRecord['audit'] {
  if (!enabled) {
    return { enrichmentEnabled: false, provider: 'none' };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is required when --enrich-with-ai is enabled.');
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
  const sections = parseSections(body);
  const title = metadata.title ?? body.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? 'Untitled Course';
  const course: CourseRecord = {
    title,
    titleArabic: metadata.titleArabic ?? '',
    slug: metadata.slug ?? slugify(title),
    sourceUrl: metadata.sourceUrl ?? '',
    status: metadata.status === 'Draft' ? 'Draft' : 'Published',
    duration: Number.parseInt(metadata.duration ?? '0', 10) || 0,
    keywords: (metadata.keywords ?? '')
      .split(',')
      .map((keyword) => keyword.trim())
      .filter(Boolean),
    summary: sections[0]?.content ?? '',
    sections,
    generatedAt: new Date().toISOString(),
    audit: createAudit(enableAiEnrichment),
  };

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(course, null, 2)}\n`, 'utf8');
  console.log(`Converted ${path.basename(inputPath)} into ${outputPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

import 'dotenv/config';

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

interface CourseRecord {
  title: string;
  titleArabic: string;
  slug: string;
  sourceUrl: string;
  status: 'Published' | 'Draft';
  duration: number;
  keywords: string[];
  summary: string;
}

const DEFAULT_INPUT = 'dist/sample-course.json';
const DEFAULT_OUTPUT = 'dist/notion-import-preview.json';
const NOTION_VERSION = '2022-06-28';

function getArg(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

function toRichText(content: string) {
  return content ? [{ type: 'text' as const, text: { content } }] : [];
}

function createNotionPayload(course: CourseRecord, databaseId: string) {
  return {
    parent: { database_id: databaseId },
    properties: {
      Title: { title: toRichText(course.title) },
      'Title (Arabic)': { rich_text: toRichText(course.titleArabic) },
      Slug: { rich_text: toRichText(course.slug) },
      'Source URL': { url: course.sourceUrl },
      Status: { select: { name: course.status } },
      Duration: { number: course.duration },
      Keywords: { multi_select: course.keywords.map((name) => ({ name })) },
    },
    children: [
      {
        object: 'block' as const,
        type: 'paragraph' as const,
        paragraph: {
          rich_text: toRichText(course.summary),
        },
      },
    ],
  };
}

async function createNotionPage(payload: unknown): Promise<unknown> {
  const notionToken = process.env.NOTION_API_TOKEN;

  if (!notionToken) {
    throw new Error('NOTION_API_TOKEN is required for --execute.');
  }

  const response = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${notionToken}`,
      'Content-Type': 'application/json',
      'Notion-Version': NOTION_VERSION,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Notion import failed with status ${response.status}: ${await response.text()}`);
  }

  return response.json();
}

async function main(): Promise<void> {
  const inputPath = getArg('--input') ?? DEFAULT_INPUT;
  const outputPath = getArg('--output') ?? DEFAULT_OUTPUT;
  const shouldExecute = hasFlag('--execute');
  const fileContent = await readFile(inputPath, 'utf8');
  const parsed = JSON.parse(fileContent) as CourseRecord | CourseRecord[];
  const courses = Array.isArray(parsed) ? parsed : [parsed];
  const databaseId = process.env.NOTION_DATABASE_ID ?? 'replace-with-your-database-id';
  const payload = courses.map((course) => createNotionPayload(course, databaseId));

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, JSON.stringify(payload, null, 2), 'utf8');

  if (!shouldExecute) {
    console.log(`Generated Notion payload preview at ${outputPath}`);
    return;
  }

  if (!process.env.NOTION_DATABASE_ID) {
    throw new Error('NOTION_DATABASE_ID is required for --execute.');
  }

  const results = [];

  for (const item of payload) {
    results.push(await createNotionPage(item));
  }

  console.log(JSON.stringify(results, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

import 'dotenv/config';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
const DEFAULT_INPUT = 'dist/sample-course.json';
const DEFAULT_OUTPUT = 'dist/notion-import-preview.json';
const NOTION_VERSION = '2022-06-28';
function getArg(flag) {
    const index = process.argv.indexOf(flag);
    return index >= 0 ? process.argv[index + 1] : undefined;
}
function hasFlag(flag) {
    return process.argv.includes(flag);
}
function toRichText(content) {
    return content ? [{ type: 'text', text: { content } }] : [];
}
function createNotionPayload(course, databaseId) {
    const blocks = [
        {
            object: 'block',
            type: 'heading_2',
            heading_2: {
                rich_text: toRichText('English Overview'),
            },
        },
        {
            object: 'block',
            type: 'paragraph',
            paragraph: {
                rich_text: toRichText(course.summary),
            },
        },
        {
            object: 'block',
            type: 'heading_2',
            heading_2: {
                rich_text: toRichText('النظرة العامة بالعربية'),
            },
        },
        {
            object: 'block',
            type: 'paragraph',
            paragraph: {
                rich_text: toRichText(course.summaryArabic),
            },
        },
    ];
    if (course.sections.length > 0) {
        blocks.push({
            object: 'block',
            type: 'heading_2',
            heading_2: {
                rich_text: toRichText('Lessons | الدروس'),
            },
        });
        course.sections.forEach((section, index) => {
            blocks.push({
                object: 'block',
                type: 'heading_3',
                heading_3: {
                    rich_text: toRichText(`${index + 1}. ${section.heading}`),
                },
            });
            if (section.content) {
                blocks.push({
                    object: 'block',
                    type: 'paragraph',
                    paragraph: {
                        rich_text: toRichText(section.content),
                    },
                });
            }
            if (section.contentArabic) {
                blocks.push({
                    object: 'block',
                    type: 'paragraph',
                    paragraph: {
                        rich_text: toRichText(section.contentArabic),
                    },
                });
            }
        });
    }
    if (course.enrichment) {
        blocks.push({
            object: 'block',
            type: 'heading_2',
            heading_2: {
                rich_text: toRichText('Enrichment Metadata'),
            },
        });
        blocks.push({
            object: 'block',
            type: 'bulleted_list_item',
            bulleted_list_item: {
                rich_text: toRichText(`Language: ${course.enrichment.language}`),
            },
        });
        blocks.push({
            object: 'block',
            type: 'bulleted_list_item',
            bulleted_list_item: {
                rich_text: toRichText(`Saudi Context: ${course.enrichment.saudiContext ? 'Yes' : 'No'}`),
            },
        });
        blocks.push({
            object: 'block',
            type: 'bulleted_list_item',
            bulleted_list_item: {
                rich_text: toRichText(`CBAHI Aligned: ${course.enrichment.cbahiAligned ? 'Yes' : 'No'}`),
            },
        });
        blocks.push({
            object: 'block',
            type: 'bulleted_list_item',
            bulleted_list_item: {
                rich_text: toRichText(`Vision 2030 Aligned: ${course.enrichment.vision2030Aligned ? 'Yes' : 'No'}`),
            },
        });
        blocks.push({
            object: 'block',
            type: 'bulleted_list_item',
            bulleted_list_item: {
                rich_text: toRichText(`Practical Activities: ${course.enrichment.practicalActivities}`),
            },
        });
    }
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
            'Language': { select: { name: course.enrichment?.language ?? 'en' } },
            'Saudi Context': { checkbox: course.enrichment?.saudiContext ?? false },
            'CBAHI Aligned': { checkbox: course.enrichment?.cbahiAligned ?? false },
            'Vision 2030': { checkbox: course.enrichment?.vision2030Aligned ?? false },
        },
        children: blocks,
    };
}
async function createNotionPage(payload) {
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
async function main() {
    const inputPath = getArg('--input') ?? DEFAULT_INPUT;
    const outputPath = getArg('--output') ?? DEFAULT_OUTPUT;
    const shouldExecute = hasFlag('--execute');
    const fileContent = await readFile(inputPath, 'utf8');
    const parsed = JSON.parse(fileContent);
    const courses = Array.isArray(parsed) ? parsed : [parsed];
    const databaseId = process.env.NOTION_DATABASE_ID ?? 'replace-with-your-database-id';
    const payload = courses.map((course) => createNotionPayload(course, databaseId));
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, JSON.stringify(payload, null, 2), 'utf8');
    if (!shouldExecute) {
        console.log(`📄 Generated Notion payload preview at ${outputPath}`);
        console.log(`   Courses: ${courses.length}`);
        console.log(`   Bilingual: ${courses.filter(c => c.enrichment?.language === 'mixed').length}`);
        return;
    }
    if (!process.env.NOTION_DATABASE_ID) {
        throw new Error('NOTION_DATABASE_ID is required for --execute.');
    }
    const results = [];
    for (const item of payload) {
        results.push(await createNotionPage(item));
    }
    console.log(`✅ Successfully imported ${results.length} courses to Notion`);
}
main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
//# sourceMappingURL=import-notion.js.map
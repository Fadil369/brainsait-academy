import 'dotenv/config';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
const DEFAULT_INPUT = 'dist/sample-course.json';
const DEFAULT_OUTPUT = 'dist/d1-import-preview.sql';
function getArg(flag) {
    const index = process.argv.indexOf(flag);
    return index >= 0 ? process.argv[index + 1] : undefined;
}
function hasFlag(flag) {
    return process.argv.includes(flag);
}
function escapeSql(value) {
    return value.replace(/'/g, "''");
}
function serializeCourse(course) {
    return JSON.stringify(course.sections);
}
function buildSql(courses) {
    const schemaSql = `CREATE TABLE IF NOT EXISTS courses (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  title_arabic TEXT,
  source_url TEXT NOT NULL,
  status TEXT NOT NULL,
  duration INTEGER NOT NULL,
  keywords TEXT NOT NULL,
  summary TEXT NOT NULL,
  sections_json TEXT NOT NULL
);`;
    const insertStatements = courses.map((course) => `INSERT OR REPLACE INTO courses (
  slug,
  title,
  title_arabic,
  source_url,
  status,
  duration,
  keywords,
  summary,
  sections_json
) VALUES (
  '${escapeSql(course.slug)}',
  '${escapeSql(course.title)}',
  '${escapeSql(course.titleArabic)}',
  '${escapeSql(course.sourceUrl)}',
  '${escapeSql(course.status)}',
  ${course.duration},
  '${escapeSql(course.keywords.join(','))}',
  '${escapeSql(course.summary)}',
  '${escapeSql(serializeCourse(course))}'
);`);
    return [schemaSql, ...insertStatements].join('\n\n');
}
async function executeSql(sql) {
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
    if (!apiToken || !accountId || !databaseId) {
        throw new Error('CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, and CLOUDFLARE_D1_DATABASE_ID are required for --execute.');
    }
    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql }),
    });
    if (!response.ok) {
        throw new Error(`Cloudflare D1 import failed with status ${response.status}: ${await response.text()}`);
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
    const sql = buildSql(courses);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, sql, 'utf8');
    if (!shouldExecute) {
        console.log(`Generated D1 SQL preview at ${outputPath}`);
        return;
    }
    const result = await executeSql(sql);
    console.log(JSON.stringify(result, null, 2));
}
main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
//# sourceMappingURL=import-d1.js.map
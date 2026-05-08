#!/usr/bin/env node
/**
 * Fetch detailed content for each IHI Open School course from their catalog pages.
 * Updates the markdown files with real content instead of just metadata.
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const COURSES_DIR = path.resolve('courses/ihi-open-school');
const BASE_URL = 'https://www.ihi.org/learn/courses/open-school/catalog/';

// Known course slugs from catalog
const SLUGS = [
  'cc-101','dc-101','dqa-101',
  'gme-201','gme-202','gme-203','gme-204',
  'l-101','l-103','l-201',
  'pfc-101','pfc-102','pfc-103','pfc-104','pfc-201','pfc-202','pfc-203',
  'ps-101','ps-102','ps-103','ps-104','ps-105','ps-201','ps-202','ps-203',
  'qi-101','qi-102','qi-103','qi-104','qi-105','qi-201','qi-202',
  'ta-101','ta-102','ta-103','ta-104','ta-105','ta-201'
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function extractText(html) {
  // Remove scripts, styles, nav, footer, cookie banners
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<div[^>]*class="[^"]*cookie[^"]*"[\s\S]*?<\/div>/gi, '')
    .replace(/<div[^>]*id="[^"]*cookie[^"]*"[\s\S]*?<\/div>/gi, '');
  
  // Extract main content area
  const mainMatch = text.match(/<main[\s\S]*?>([\s\S]*?)<\/main>/i);
  if (mainMatch) text = mainMatch[1];
  
  // Remove breadcrumb navigation
  text = text.replace(/<nav[^>]*aria-label="[^"]*breadcrumb[^"]*"[\s\S]*?<\/nav>/gi, '');
  
  // Convert common HTML to markdown-ish
  text = text
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<em>(.*?)<\/em>/gi, '*$1*')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<div[^>]*>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/^\s+$/gm, '')
    .trim();
  
  return text;
}

function extractSections(text) {
  const sections = [];
  const lines = text.split('\n');
  let currentTitle = '';
  let currentContent = [];
  
  for (const line of lines) {
    const h2Match = line.match(/^##\s+(.+)$/);
    const h3Match = line.match(/^###\s+(.+)$/);
    
    if (h2Match || h3Match) {
      if (currentTitle || currentContent.length) {
        sections.push({
          title: currentTitle || 'Overview',
          content: currentContent.join('\n').trim()
        });
      }
      currentTitle = (h2Match || h3Match)[1].trim();
      currentContent = [];
    } else if (line.match(/^#\s+(.+)$/) && !currentTitle) {
      // Skip page title
    } else {
      currentContent.push(line);
    }
  }
  
  if (currentTitle || currentContent.length) {
    sections.push({
      title: currentTitle || 'Overview',
      content: currentContent.join('\n').trim()
    });
  }
  
  return sections;
}

async function fetchCourseDetail(slug) {
  const url = BASE_URL + slug;
  try {
    const resp = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BrainSAIT-Academy/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
      }
    });
    if (!resp.ok) {
      console.warn(`⚠ ${slug}: HTTP ${resp.status}`);
      return null;
    }
    const html = await resp.text();
    const text = extractText(html);
    return text;
  } catch (err) {
    console.warn(`⚠ ${slug}: ${err.message}`);
    return null;
  }
}

function parseFrontMatter(content) {
  if (!content.startsWith('---\n')) return { fm: {}, body: content, raw: content };
  const end = content.indexOf('\n---\n', 4);
  if (end < 0) return { fm: {}, body: content, raw: content };
  const rawFm = content.slice(4, end);
  const body = content.slice(end + 5).trim();
  const fm = {};
  for (const line of rawFm.split('\n')) {
    const i = line.indexOf(':');
    if (i < 0) continue;
    fm[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
  }
  return { fm, body, raw: content };
}

function buildMarkdown(fm, detail, existingBody) {
  const sections = extractSections(detail);
  
  // Filter out navigation/header noise
  const meaningfulSections = sections.filter(s => {
    const skip = ['breadcrumb', 'navigation', 'cookie', 'sign in', 'my ihi', 'help', 'donate', 'related training', 'subscriptions'];
    const titleLower = s.title.toLowerCase();
    // Skip if title matches noise patterns
    if (skip.some(k => titleLower.includes(k))) return false;
    // Skip if content is too short or just whitespace/links
    if (s.content.replace(/[\s\n\r]/g, '').length < 40) return false;
    // Skip if title looks like a course code duplicate (e.g., "QI 101: Introduction...")
    if (/^[A-Z]{2,4}\s+\d+:\s/.test(s.title)) return false;
    // Skip duplicate "Overview" sections (keep only the first real one)
    return true;
  });
  
  // Deduplicate sections by title
  const seen = new Set();
  const deduped = meaningfulSections.filter(s => {
    const key = s.title.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  
  let content = `---
title: "${fm.title || ''}"
titleArabic: "${fm.titleArabic || ''}"
slug: "${fm.slug || ''}"
sourceUrl: "${fm.sourceUrl || ''}"
status: ${fm.status || 'Published'}
duration: ${fm.duration || '60'}
keywords: ${fm.keywords || ''}
---

# ${fm.title}

${fm.titleArabic ? `**${fm.titleArabic}**\n` : ''}
`;

  if (deduped.length > 0) {
    for (const sec of deduped) {
      content += `\n## ${sec.title}\n\n${sec.content}\n`;
    }
  } else {
    // Fallback to existing body if scraping failed
    content += `\n## Overview\n\n${existingBody.split('\n').filter(l => !l.startsWith('#')).join('\n').trim()}\n`;
  }
  
  content += `\n## Course Details

- **Code:** ${fm.slug?.toUpperCase().replace(/-/g, ' ') || ''}
- **Format:** Online, On-Demand
- **Provider:** IHI Open School
- **Source:** [IHI Education Platform](${fm.sourceUrl})
- **Duration:** ${fm.duration || '60'} minutes

## تفاصيل الدورة

- **الشكل:** عبر الإنترنت، حسب الطلب
- **المزود:** IHI Open School
- **المصدر:** [منصة IHI التعليمية](${fm.sourceUrl})
- **المدة:** ${fm.duration || '60'} دقيقة
`;

  return content;
}

async function main() {
  const files = (await readdir(COURSES_DIR)).filter(f => f.endsWith('.md') && f !== 'README.md');
  let updated = 0;
  let failed = 0;

  for (const file of files) {
    const slug = file.replace('.md', '');
    const filePath = path.join(COURSES_DIR, file);
    const existing = await readFile(filePath, 'utf8');
    const { fm, body } = parseFrontMatter(existing);
    
    process.stdout.write(`Fetching ${slug}... `);
    const detail = await fetchCourseDetail(slug);
    
    if (detail && detail.length > 200) {
      const newContent = buildMarkdown(fm, detail, body);
      await writeFile(filePath, newContent, 'utf8');
      console.log(`✓ (${detail.length} chars)`);
      updated++;
    } else {
      console.log(`→ keeping existing`);
      failed++;
    }
    
    // Rate limit: 500ms between requests
    await sleep(500);
  }

  console.log(`\n✅ Updated ${updated}/${files.length} courses (${failed} kept existing)`);
}

main().catch(console.error);

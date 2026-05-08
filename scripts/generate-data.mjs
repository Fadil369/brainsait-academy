#!/usr/bin/env node
/**
 * Convert IHI Open School courses to Next.js compatible JSON data
 */
import { mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';

function parseFrontMatter(content) {
  if (!content.startsWith('---\n')) return { metadata: {}, body: content };
  const end = content.indexOf('\n---\n', 4);
  if (end < 0) return { metadata: {}, body: content };
  const raw = content.slice(4, end).trim().split('\n');
  const metadata = {};
  for (const line of raw) {
    const i = line.indexOf(':');
    if (i < 0) continue;
    metadata[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
  }
  return { metadata, body: content.slice(end + 5).trim() };
}

function detectLanguage(content) {
  return /[\u0600-\u06FF]/.test(content) ? 'mixed' : 'en';
}

function parseSections(body) {
  const sections = []; const lines = body.split('\n');
  let currentSection = null; let content = [];
  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (currentSection) { currentSection.content = content.join('\n').trim(); sections.push(currentSection); }
      currentSection = { heading: line.slice(3).trim(), isArabic: /[\u0600-\u06FF]/.test(line.slice(3)), content: '' };
      content = [];
    } else if (line.startsWith('### ')) { if (currentSection) content.push(line); }
    else if (currentSection) content.push(line);
  }
  if (currentSection) { currentSection.content = content.join('\n').trim(); sections.push(currentSection); }
  return sections;
}

async function main() {
  const coursesDir = path.resolve('../brainsait-ihi-pipeline/courses/ihi-open-school');
  const outDir = path.resolve('src/lib/data');
  await mkdir(outDir, { recursive: true });

  const files = (await readdir(coursesDir)).filter(f => f.endsWith('.md') && f !== 'README.md');
  const courses = [];

  for (const file of files) {
    const content = await readFile(path.join(coursesDir, file), 'utf8');
    const { metadata, body } = parseFrontMatter(content);
    const slug = metadata.slug || file.replace('.md', '');
    const lang = detectLanguage(body);
    const topic = (metadata.keywords || '').split(',')[0] || 'General';
    const sections = parseSections(body);

    courses.push({
      title: metadata.title || slug,
      titleArabic: metadata.titleArabic || '',
      slug,
      code: slug.toUpperCase(),
      topic,
      duration: metadata.duration || '60',
      lang,
      sourceUrl: metadata.sourceUrl || '',
      sections,
      body: body.substring(0, 500), // excerpt for cards
    });
  }

  // Write courses index
  await writeFile(path.join(outDir, 'courses.json'), JSON.stringify(courses, null, 2));
  
  // Write individual course files
  await mkdir(path.join(outDir, 'courses'), { recursive: true });
  for (const c of courses) {
    await writeFile(path.join(outDir, 'courses', `${c.slug}.json`), JSON.stringify(c, null, 2));
  }

  // Generate topics index
  const topics = [...new Set(courses.map(c => c.topic))];
  const topicsMeta = topics.map(t => ({
    name: t,
    slug: t.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    count: courses.filter(c => c.topic === t).length,
    icon: getTopicIcon(t)
  }));
  await writeFile(path.join(outDir, 'topics.json'), JSON.stringify(topicsMeta, null, 2));

  console.log(`✅ Generated data for ${courses.length} courses across ${topics.length} topics`);
  console.log(`   Topics: ${topics.join(', ')}`);
}

function getTopicIcon(topic) {
  const icons = { 'Quality Improvement': '📊', 'QI': '📊', 'Patient Safety': '🛡️', 'PS': '🛡️', 'Leadership': '👔', 'L': '👔', 'TA': '👔', 'PFC': '💼', 'GME': '🎓', 'CC': '🤝', 'DC': '🌿', 'DQA': '🦷', 'Contextualizing Care': '🤝', 'ClaimLINC': '⚡', 'AI Healthcare': '🤖', 'NPHIES': '🏥', 'FHIR R4': '🔗', 'Advanced Leadership': '👔', 'Decarbonization': '🌿', 'Dental Care': '🦷', 'Person- and Family-Centered Care': '💼', 'Triple Aim': '🎯' };
  return icons[topic] || '📚';
}

main().catch(console.error);
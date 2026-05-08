#!/usr/bin/env node
/**
 * Generate a full HTML site from IHI Open School course markdown files.
 * Outputs to dist/site/ for Cloudflare Pages deployment.
 */
import { mkdir, readFile, writeFile, readdir, cp } from 'node:fs/promises';
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

function mdToHtml(md) {
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/gs, m => `<ul>\n${m}</ul>`)
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/^(?!<[hul]|<\/|<li|<ul|<ol)(.+)$/gm, '<p>$1</p>')
    .replace(/<p>\s*<\/p>/g, '')
    .replace(/\n{2,}/g, '\n');
}

async function main() {
  const coursesDir = path.resolve('courses/ihi-open-school');
  const outDir = path.resolve('dist/site');
  await mkdir(outDir, { recursive: true });
  await mkdir(path.join(outDir, 'courses'), { recursive: true });

  const files = (await readdir(coursesDir)).filter(f => f.endsWith('.md') && f !== 'README.md');
  const courses = [];

  for (const file of files) {
    const content = await readFile(path.join(coursesDir, file), 'utf8');
    const { metadata, body } = parseFrontMatter(content);
    const slug = metadata.slug || file.replace('.md', '');
    const html = mdToHtml(body);

    courses.push({
      title: metadata.title || slug,
      titleArabic: metadata.titleArabic || '',
      slug,
      topic: (metadata.keywords || '').split(',')[0] || 'General',
      sourceUrl: metadata.sourceUrl || '',
      duration: metadata.duration || '60',
    });

    const courseHtml = `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${metadata.title} | BrainSAIT Academy</title>
  <meta name="description" content="${metadata.title} - IHI Open School course on BrainSAIT Academy">
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <nav class="navbar">
    <div class="container">
      <a href="/" class="logo">🧠 BrainSAIT Academy</a>
      <div class="nav-links">
        <a href="/">Home</a>
        <a href="/courses/">All Courses</a>
        <a href="https://brainsait.org" target="_blank">BrainSAIT.org</a>
      </div>
    </div>
  </nav>
  <main class="container">
    <article class="course-detail">
      <header>
        <span class="badge">${metadata.keywords?.split(',')[0] || 'Course'}</span>
        <h1>${metadata.title}</h1>
        ${metadata.titleArabic ? `<p class="arabic-title" dir="rtl">${metadata.titleArabic}</p>` : ''}
        <div class="meta">
          <span>⏱️ ${metadata.duration || '60'} min</span>
          <span>📚 IHI Open School</span>
          <a href="${metadata.sourceUrl}" target="_blank">View on IHI →</a>
        </div>
      </header>
      <div class="content">${html}</div>
    </article>
  </main>
  <footer>
    <div class="container">
      <p>BrainSAIT Academy — Powered by IHI Open School Content</p>
    </div>
  </footer>
</body>
</html>`;

    await writeFile(path.join(outDir, 'courses', `${slug}.html`), courseHtml, 'utf8');
    console.log(`✓ ${slug}.html`);
  }

  // Generate index
  const topics = [...new Set(courses.map(c => c.topic))];
  const indexHtml = `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BrainSAIT Academy — IHI Open School Training</title>
  <meta name="description" content="38 IHI Open School courses available on BrainSAIT Academy. Quality Improvement, Patient Safety, Leadership, and more.">
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <nav class="navbar">
    <div class="container">
      <a href="/" class="logo">🧠 BrainSAIT Academy</a>
      <div class="nav-links">
        <a href="/courses/">All Courses</a>
        <a href="https://brainsait.org" target="_blank">BrainSAIT.org</a>
      </div>
    </div>
  </nav>
  <header class="hero">
    <div class="container">
      <h1>BrainSAIT Academy</h1>
      <p class="subtitle">IHI Open School Training — ${courses.length} Courses</p>
      <p class="arabic-subtitle" dir="rtl">أكاديمية برين سعيت — تدريب مدرسة IHI المفتوحة</p>
    </div>
  </header>
  <main class="container">
    <section class="topics">
      <h2>Browse by Topic</h2>
      <div class="topic-grid">
        ${topics.map(t => `<a href="#${t.toLowerCase().replace(/[^a-z0-9]+/g, '-')}" class="topic-card">${t}</a>`).join('\n        ')}
      </div>
    </section>
    ${topics.map(topic => {
      const topicCourses = courses.filter(c => c.topic === topic);
      return `
    <section id="${topic.toLowerCase().replace(/[^a-z0-9]+/g, '-')}" class="course-section">
      <h2>${topic}</h2>
      <div class="course-grid">
        ${topicCourses.map(c => `
        <a href="/courses/${c.slug}.html" class="course-card">
          <h3>${c.title}</h3>
          ${c.titleArabic ? `<p class="ar" dir="rtl">${c.titleArabic}</p>` : ''}
          <span class="duration">⏱️ ${c.duration} min</span>
        </a>`).join('\n        ')}
      </div>
    </section>`;
    }).join('\n')}
  </main>
  <footer>
    <div class="container">
      <p>BrainSAIT Academy — Powered by IHI Open School Content</p>
      <p class="ar" dir="rtl">أكاديمية برين سعيت — مدعوم بمحتوى مدرسة IHI المفتوحة</p>
    </div>
  </footer>
</body>
</html>`;

  await writeFile(path.join(outDir, 'index.html'), indexHtml, 'utf8');

  // CSS
  const css = `:root {
  --primary: #1a56db;
  --primary-dark: #1e3a8a;
  --accent: #10b981;
  --bg: #f8fafc;
  --surface: #ffffff;
  --text: #1e293b;
  --text-secondary: #64748b;
  --border: #e2e8f0;
  --radius: 12px;
}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: var(--bg); color: var(--text); line-height: 1.6; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
a { color: var(--primary); text-decoration: none; }
a:hover { text-decoration: underline; }
.navbar { background: var(--surface); border-bottom: 1px solid var(--border); padding: 16px 0; position: sticky; top: 0; z-index: 100; }
.navbar .container { display: flex; align-items: center; justify-content: space-between; }
.logo { font-size: 1.25rem; font-weight: 700; color: var(--text); }
.nav-links a { margin-left: 24px; color: var(--text-secondary); font-weight: 500; }
.nav-links a:hover { color: var(--primary); text-decoration: none; }
.hero { background: linear-gradient(135deg, var(--primary-dark), var(--primary)); color: white; padding: 64px 0; text-align: center; }
.hero h1 { font-size: 2.5rem; margin-bottom: 8px; }
.subtitle { font-size: 1.25rem; opacity: 0.9; }
.arabic-subtitle { font-size: 1.1rem; opacity: 0.8; margin-top: 8px; }
.topics { padding: 48px 0 24px; }
.topics h2 { margin-bottom: 24px; }
.topic-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
.topic-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; text-align: center; font-weight: 600; transition: all 0.2s; }
.topic-card:hover { border-color: var(--primary); box-shadow: 0 4px 12px rgba(26,86,219,0.15); text-decoration: none; transform: translateY(-2px); }
.course-section { padding: 32px 0; }
.course-section h2 { margin-bottom: 24px; color: var(--primary-dark); border-bottom: 2px solid var(--accent); padding-bottom: 8px; }
.course-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
.course-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; transition: all 0.2s; display: flex; flex-direction: column; }
.course-card:hover { border-color: var(--primary); box-shadow: 0 4px 12px rgba(26,86,219,0.1); text-decoration: none; transform: translateY(-2px); }
.course-card h3 { font-size: 1rem; margin-bottom: 8px; color: var(--text); }
.course-card .ar { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 8px; }
.course-card .duration { font-size: 0.8rem; color: var(--text-secondary); margin-top: auto; padding-top: 12px; }
.course-detail { padding: 48px 0; }
.course-detail header { margin-bottom: 32px; }
.course-detail h1 { font-size: 2rem; margin: 12px 0; }
.arabic-title { font-size: 1.2rem; color: var(--text-secondary); }
.badge { background: var(--accent); color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
.meta { display: flex; gap: 24px; color: var(--text-secondary); margin-top: 12px; flex-wrap: wrap; }
.content { max-width: 800px; }
.content h1 { font-size: 1.5rem; margin: 32px 0 16px; }
.content h2 { font-size: 1.25rem; margin: 28px 0 12px; color: var(--primary-dark); }
.content h3 { font-size: 1.1rem; margin: 24px 0 8px; }
.content p { margin: 12px 0; }
.content ul, .content ol { margin: 12px 0 12px 24px; }
.content li { margin: 4px 0; }
footer { background: var(--text); color: white; padding: 32px 0; text-align: center; margin-top: 48px; }
footer .ar { opacity: 0.7; font-size: 0.9rem; margin-top: 8px; }
@media (max-width: 768px) {
  .hero h1 { font-size: 1.75rem; }
  .course-grid { grid-template-columns: 1fr; }
  .topic-grid { grid-template-columns: repeat(2, 1fr); }
  .nav-links { display: none; }
}`;

  await writeFile(path.join(outDir, 'style.css'), css, 'utf8');
  console.log(`\n✅ Site generated: ${courses.length} courses → dist/site/`);
}

main().catch(console.error);

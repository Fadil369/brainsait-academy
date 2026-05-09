#!/usr/bin/env node
/**
 * Generate a premium HTML site from IHI Open School course markdown files.
 * Outputs to dist/site/ for Cloudflare Pages deployment.
 * Features: Premium design, RTL support, student workflows, bilingual content
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

function mdToHtml(md) {
  return md
    .replace(/^#### (.+)$/gm, '<h4 class="section-sub">$1</h4>')
    .replace(/^### (.+)$/gm, '<h3 class="section-title">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="section-heading">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="page-title">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/^- \[ \] (.+)$/gm, '<div class="checklist-item"><span class="checkbox"></span>$1</div>')
    .replace(/^- \[x\] (.+)$/gm, '<div class="checklist-item checked"><span class="checkbox checked"></span>$1</div>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/gs, m => `<ul>\n${m}</ul>`)
    .replace(/^\d+\. (.+)$/gm, '<li class="numbered">$1</li>')
    .replace(/\|(.+)\|(.+)\|/g, (m) => {
      const cells = m.split('|').filter(c => c.trim() && c.trim() !== '---');
      return `<tr>${cells.map(c => `<td>${c.trim()}</td>`).join('')}</tr>`;
    })
    .replace(/(<tr>.*<\/tr>\n?)+/gs, m => `<div class="table-wrapper"><table><tbody>\n${m}</tbody></table></div>`)
    .replace(/^(?!<[hul]|<\/|<li|<ul|<ol|<tr|<div)(.+)$/gm, '<p>$1</p>')
    .replace(/<p>\s*<\/p>/g, '')
    .replace(/\n{3,}/g, '\n\n');
}

function detectLanguage(content) {
  const arabicPattern = /[\u0600-\u06FF\u0750-\u077F]/;
  return arabicPattern.test(content) ? 'mixed' : 'en';
}

function buildCourseHtml(course, metadata) {
  return `<!DOCTYPE html>
<html lang="${course.lang === 'mixed' ? 'ar' : 'en'}" dir="${course.lang === 'mixed' ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${metadata.title} | BrainSAIT Academy</title>
  <meta name="description" content="${metadata.title} - ${metadata.titleArabic || 'IHI Open School course'}">
  <meta name="keywords" content="${metadata.keywords || ''}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/premium.css">
  <script src="https://cdn.jsdelivr.net/npm/@laravel/primevue@latest/core/base/style.css"></script>
</head>
<body>
  <nav class="navbar">
    <div class="nav-container">
      <a href="/" class="logo">
        <span class="logo-icon">🧠</span>
        <span class="logo-text">BrainSAIT Academy</span>
      </a>
      <div class="nav-links">
        <a href="/" class="nav-link">Home</a>
        <a href="/courses/" class="nav-link">All Courses</a>
        <a href="/progress/" class="nav-link">My Progress</a>
        <a href="https://brainsait.org" target="_blank" class="nav-link external">BrainSAIT.org ↗</a>
      </div>
      <button class="lang-toggle" onclick="toggleLanguage()">
        <span class="lang-en">EN</span> | <span class="lang-ar">عربي</span>
      </button>
    </div>
  </nav>

  <main class="course-main">
    <aside class="course-sidebar">
      <div class="sidebar-header">
        <a href="/courses/" class="back-link">← All Courses</a>
        <div class="course-progress-card">
          <div class="progress-ring">
            <svg viewBox="0 0 36 36">
              <path class="progress-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
              <path class="progress-bar" stroke-dasharray="0, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
            </svg>
            <span class="progress-text">0%</span>
          </div>
          <span class="progress-label">Course Progress</span>
        </div>
      </div>
      
      <nav class="course-nav">
        <h4 class="nav-heading">Course Contents</h4>
        <ul class="section-list" id="sectionList">
          <li class="section-item active" data-section="overview">
            <span class="section-icon">📋</span>
            <span class="section-title">Overview</span>
          </li>
          <li class="section-item" data-section="objectives">
            <span class="section-icon">🎯</span>
            <span class="section-title">Objectives</span>
          </li>
          <li class="section-item" data-section="lessons">
            <span class="section-icon">📚</span>
            <span class="section-title">Lessons</span>
          </li>
          <li class="section-item" data-section="activities">
            <span class="section-icon">✏️</span>
            <span class="section-title">Activities</span>
          </li>
          <li class="section-item" data-section="resources">
            <span class="section-icon">📎</span>
            <span class="section-title">Resources</span>
          </li>
        </ul>
      </nav>

      <div class="sidebar-footer">
        <button class="btn-bookmark" onclick="toggleBookmark()">
          <span class="bookmark-icon">☆</span>
          <span>Save for Later</span>
        </button>
      </div>
    </aside>

    <article class="course-content">
      <header class="course-header">
        <div class="header-badges">
          <span class="badge badge-topic">${metadata.keywords?.split(',')[0] || 'Course'}</span>
          <span class="badge badge-format">IHI Open School</span>
          <span class="badge badge-lang">${course.lang === 'mixed' ? 'EN/AR' : 'EN'}</span>
        </div>
        
        <div class="title-block">
          <h1 class="course-title en-title">${metadata.title}</h1>
          <p class="course-title-ar rtl">${metadata.titleArabic || ''}</p>
        </div>

        <div class="meta-row">
          <span class="meta-item">
            <span class="meta-icon">⏱️</span>
            <span>${metadata.duration || '60'} min</span>
          </span>
          <span class="meta-item">
            <span class="meta-icon">📊</span>
            <span>Level: Foundation</span>
          </span>
          <span class="meta-item">
            <span class="meta-icon">🎓</span>
            <span>CE: 1.25 Credits</span>
          </span>
        </div>

        <div class="enrollment-bar">
          <button class="btn-enroll">Enroll Now</button>
          <button class="btn-share">Share Course</button>
        </div>
      </header>

      <div class="content-body" lang="${course.lang === 'mixed' ? 'ar' : 'en'}">
        ${course.html}
      </div>

      <footer class="course-footer">
        <div class="navigation-row">
          <button class="btn-nav btn-prev">← Previous Lesson</button>
          <button class="btn-nav btn-next">Next Lesson →</button>
        </div>
        <div class="completion-section">
          <label class="completion-checkbox">
            <input type="checkbox" id="markComplete">
            <span class="checkmark"></span>
            <span>Mark this course as complete</span>
          </label>
        </div>
      </footer>
    </article>
  </main>

  <footer class="site-footer">
    <div class="footer-container">
      <div class="footer-brand">
        <span class="logo-icon">🧠</span>
        <span>BrainSAIT Academy</span>
      </div>
      <p class="footer-tagline">Empowering Healthcare Excellence Through AI-Driven Learning</p>
      <p class="footer-tagline-ar rtl">تمكين التميز الصحي من خلال التعلم القائم على الذكاء الاصطناعي</p>
      <div class="footer-links">
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
      </div>
      <p class="footer-copy">© 2026 BrainSAIT. All rights reserved.</p>
    </div>
  </footer>

  <script>
    function toggleLanguage() {
      document.querySelectorAll('.ar-content').forEach(el => {
        el.style.display = el.style.display === 'none' ? 'block' : 'none';
      });
    }

    function toggleBookmark() {
      const btn = document.querySelector('.btn-bookmark');
      const icon = btn.querySelector('.bookmark-icon');
      icon.textContent = icon.textContent === '☆' ? '★' : '☆';
      btn.classList.toggle('bookmarked');
    }

    document.querySelectorAll('.section-item').forEach(item => {
      item.addEventListener('click', () => {
        document.querySelectorAll('.section-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
      });
    });

    document.getElementById('markComplete')?.addEventListener('change', function() {
      const progress = document.querySelector('.progress-bar');
      if (this.checked) {
        progress.setAttribute('stroke-dasharray', '100, 100');
        document.querySelector('.progress-text').textContent = '100%';
      }
    });
  </script>
</body>
</html>`;
}

async function main() {
  const coursesDir = path.resolve('courses/ihi-open-school');
  const outDir = path.resolve('dist/site');
  await mkdir(outDir, { recursive: true });
  await mkdir(path.join(outDir, 'courses'), { recursive: true });
  await mkdir(path.join(outDir, 'assets'), { recursive: true });

  const files = (await readdir(coursesDir)).filter(f => f.endsWith('.md') && f !== 'README.md');
  const courses = [];

  for (const file of files) {
    const content = await readFile(path.join(coursesDir, file), 'utf8');
    const { metadata, body } = parseFrontMatter(content);
    const slug = metadata.slug || file.replace('.md', '');
    const lang = detectLanguage(body);
    const html = mdToHtml(body);

    courses.push({
      title: metadata.title || slug,
      titleArabic: metadata.titleArabic || '',
      slug,
      topic: (metadata.keywords || '').split(',')[0] || 'General',
      sourceUrl: metadata.sourceUrl || '',
      duration: metadata.duration || '60',
      lang
    });

    const courseHtml = buildCourseHtml({ html, lang }, metadata);
    await writeFile(path.join(outDir, 'courses', `${slug}.html`), courseHtml, 'utf8');
    console.log(`✓ ${slug}.html`);
  }

  const topics = [...new Set(courses.map(c => c.topic))];
  const indexHtml = `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BrainSAIT Academy — IHI Open School Training</title>
  <meta name="description" content="${courses.length} IHI Open School courses with bilingual Arabic-English content. Quality Improvement, Patient Safety, Leadership, and more.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/premium.css">
</head>
<body>
  <nav class="navbar">
    <div class="nav-container">
      <a href="/" class="logo">
        <span class="logo-icon">🧠</span>
        <span class="logo-text">BrainSAIT Academy</span>
      </a>
      <div class="nav-links">
        <a href="/courses/" class="nav-link active">All Courses</a>
        <a href="/progress/" class="nav-link">My Progress</a>
        <a href="https://brainsait.org" target="_blank" class="nav-link external">BrainSAIT.org ↗</a>
      </div>
    </div>
  </nav>

  <header class="hero">
    <div class="hero-bg-pattern"></div>
    <div class="hero-container">
      <div class="hero-badge">IHI Open School Partner</div>
      <h1 class="hero-title">BrainSAIT Academy</h1>
      <p class="hero-subtitle">Professional Healthcare Training in Arabic & English</p>
      <p class="hero-subtitle-ar rtl">تدريب مهني صحي باللغة العربية والإنجليزية</p>
      <div class="hero-stats">
        <div class="stat">
          <span class="stat-number">${courses.length}</span>
          <span class="stat-label">Courses</span>
        </div>
        <div class="stat">
          <span class="stat-number">4</span>
          <span class="stat-label">Topics</span>
        </div>
        <div class="stat">
          <span class="stat-number">Bilingual</span>
          <span class="stat-label">AR/EN</span>
        </div>
      </div>
      <div class="hero-search">
        <input type="text" placeholder="Search courses..." class="search-input">
      </div>
    </div>
  </header>

  <main class="main-content">
    <section class="topics-section">
      <h2 class="section-heading">Browse by Topic</h2>
      <div class="topic-cards">
        ${topics.map(t => `
        <a href="#${t.toLowerCase().replace(/[^a-z0-9]+/g, '-')}" class="topic-card">
          <span class="topic-icon">${getTopicIcon(t)}</span>
          <span class="topic-name">${t}</span>
          <span class="topic-count">${courses.filter(c => c.topic === t).length} courses</span>
        </a>`).join('')}
      </div>
    </section>

    ${topics.map(topic => {
      const topicCourses = courses.filter(c => c.topic === topic);
      return `
    <section id="${topic.toLowerCase().replace(/[^a-z0-9]+/g, '-')}" class="course-section">
      <div class="section-header">
        <h2 class="section-title">${topic}</h2>
        <span class="course-count">${topicCourses.length} courses</span>
      </div>
      <div class="course-grid">
        ${topicCourses.map(c => `
        <a href="/courses/${c.slug}.html" class="course-card">
          <div class="card-header">
            <span class="card-badge">${c.topic}</span>
            <span class="card-duration">⏱ ${c.duration} min</span>
          </div>
          <h3 class="card-title">${c.title}</h3>
          ${c.titleArabic ? `<p class="card-title-ar rtl">${c.titleArabic}</p>` : ''}
          <div class="card-footer">
            <span class="card-credits">1.25 CE Credits</span>
            <span class="card-arrow">→</span>
          </div>
        </a>`).join('')}
      </div>
    </section>`;
    }).join('')}
  </main>

  <footer class="site-footer">
    <div class="footer-container">
      <div class="footer-brand">
        <span class="logo-icon">🧠</span>
        <span>BrainSAIT Academy</span>
      </div>
      <p class="footer-tagline">Empowering Healthcare Excellence Through AI-Driven Learning</p>
      <p class="footer-tagline-ar rtl">تمكين التميز الصحي من خلال التعلم القائم على الذكاء الاصطناعي</p>
      <div class="footer-links">
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
      </div>
      <p class="footer-copy">© 2026 BrainSAIT. All rights reserved.</p>
    </div>
  </footer>

  <script>
    document.querySelector('.search-input')?.addEventListener('input', function(e) {
      const query = e.target.value.toLowerCase();
      document.querySelectorAll('.course-card').forEach(card => {
        const title = card.querySelector('.card-title').textContent.toLowerCase();
        const titleAr = card.querySelector('.card-title-ar')?.textContent?.toLowerCase() || '';
        card.style.display = (title.includes(query) || titleAr.includes(query)) ? '' : 'none';
      });
    });
  </script>
</body>
</html>`;

  await writeFile(path.join(outDir, 'index.html'), indexHtml, 'utf8');

  const premiumCss = `
:root {
  --primary: #6366f1;
  --primary-dark: #4338ca;
  --primary-light: #818cf8;
  --accent: #10b981;
  --accent-alt: #06b6d4;
  --bg: #f8fafc;
  --surface: #ffffff;
  --surface-elevated: #ffffff;
  --text: #1e293b;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;
  --border: #e2e8f0;
  --border-light: #f1f5f9;
  --radius: 16px;
  --radius-sm: 8px;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { scroll-behavior: smooth; }

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
}

.rtl { direction: rtl; font-family: 'Noto Naskh Arabic', 'Inter', sans-serif; }

a { color: var(--primary); text-decoration: none; transition: color 0.2s; }
a:hover { color: var(--primary-dark); }

/* Navbar */
.navbar {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 1000;
  backdrop-filter: blur(10px);
  background: rgba(255,255,255,0.95);
}
.nav-container { max-width: 1400px; margin: 0 auto; padding: 0 24px; display: flex; align-items: center; justify-content: space-between; height: 72px; }
.logo { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 1.25rem; color: var(--text); }
.logo:hover { text-decoration: none; }
.logo-icon { font-size: 1.5rem; }
.nav-links { display: flex; gap: 32px; }
.nav-link { color: var(--text-secondary); font-weight: 500; font-size: 0.95rem; transition: color 0.2s; }
.nav-link:hover, .nav-link.active { color: var(--primary); text-decoration: none; }
.nav-link.external { color: var(--accent); }
.lang-toggle { background: var(--border-light); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 8px 16px; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; }
.lang-toggle:hover { background: var(--primary); color: white; border-color: var(--primary); }
.lang-en, .lang-ar { padding: 2px 6px; }
.lang-ar { font-family: 'Noto Naskh Arabic', sans-serif; }

/* Hero */
.hero { position: relative; background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 50%, var(--accent-alt) 100%); color: white; padding: 80px 0; overflow: hidden; }
.hero-bg-pattern { position: absolute; inset: 0; background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"); }
.hero-container { max-width: 1200px; margin: 0 auto; padding: 0 24px; text-align: center; position: relative; }
.hero-badge { display: inline-block; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); border-radius: 50px; padding: 6px 16px; font-size: 0.85rem; margin-bottom: 20px; backdrop-filter: blur(10px); }
.hero-title { font-size: 3.5rem; font-weight: 800; margin-bottom: 16px; letter-spacing: -0.02em; }
.hero-subtitle { font-size: 1.5rem; opacity: 0.9; margin-bottom: 8px; }
.hero-subtitle-ar { font-size: 1.2rem; opacity: 0.8; margin-bottom: 32px; font-family: 'Noto Naskh Arabic', sans-serif; }
.hero-stats { display: flex; justify-content: center; gap: 48px; margin: 40px 0; }
.stat { text-align: center; }
.stat-number { display: block; font-size: 2.5rem; font-weight: 700; }
.stat-label { font-size: 0.9rem; opacity: 0.8; }
.hero-search { max-width: 500px; margin: 0 auto; }
.search-input { width: 100%; padding: 16px 24px; border-radius: 50px; border: none; font-size: 1rem; background: white; box-shadow: var(--shadow-xl); }
.search-input:focus { outline: none; box-shadow: var(--shadow-xl), 0 0 0 4px rgba(99,102,241,0.3); }

/* Main Content */
.main-content { max-width: 1200px; margin: 0 auto; padding: 48px 24px; }

/* Topics */
.topics-section { margin-bottom: 64px; }
.section-heading { font-size: 1.75rem; font-weight: 700; margin-bottom: 24px; color: var(--text); }
.topic-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
.topic-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; text-align: center; transition: all 0.3s; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.topic-card:hover { border-color: var(--primary); box-shadow: var(--shadow-lg); transform: translateY(-4px); text-decoration: none; }
.topic-icon { font-size: 2.5rem; }
.topic-name { font-weight: 600; color: var(--text); font-size: 1rem; }
.topic-count { font-size: 0.85rem; color: var(--text-secondary); }

/* Course Sections */
.course-section { margin-bottom: 64px; }
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; border-bottom: 2px solid var(--primary); padding-bottom: 16px; }
.section-title { font-size: 1.5rem; font-weight: 700; color: var(--primary-dark); }
.course-count { font-size: 0.9rem; color: var(--text-secondary); background: var(--border-light); padding: 4px 12px; border-radius: 20px; }
.course-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }

/* Course Card */
.course-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; transition: all 0.3s; display: flex; flex-direction: column; }
.course-card:hover { border-color: var(--primary); box-shadow: var(--shadow-lg); transform: translateY(-4px); text-decoration: none; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.card-badge { background: var(--primary); color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
.card-duration { font-size: 0.85rem; color: var(--text-secondary); }
.card-title { font-size: 1.1rem; font-weight: 600; color: var(--text); margin-bottom: 8px; line-height: 1.4; }
.card-title-ar { font-size: 0.95rem; color: var(--text-secondary); font-family: 'Noto Naskh Arabic', sans-serif; margin-bottom: 12px; }
.card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 16px; border-top: 1px solid var(--border-light); }
.card-credits { font-size: 0.8rem; color: var(--accent); font-weight: 500; }
.card-arrow { color: var(--primary); font-weight: 600; }

/* Course Detail Page */
.course-main { display: flex; max-width: 1400px; margin: 0 auto; min-height: calc(100vh - 72px); }
.course-sidebar { width: 300px; border-left: 1px solid var(--border); background: var(--surface); padding: 24px; position: sticky; top: 72px; height: calc(100vh - 72px); overflow-y: auto; }
.sidebar-header { margin-bottom: 24px; }
.back-link { display: inline-flex; align-items: center; gap: 8px; color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 20px; }
.back-link:hover { color: var(--primary); text-decoration: none; }
.progress-card { text-align: center; padding: 20px; background: var(--border-light); border-radius: var(--radius); }
.progress-ring { width: 80px; height: 80px; margin: 0 auto 12px; position: relative; }
.progress-ring svg { transform: rotate(-90deg); }
.progress-bg { fill: none; stroke: var(--border); stroke-width: 3; }
.progress-bar { fill: none; stroke: var(--accent); stroke-width: 3; stroke-linecap: round; transition: stroke-dasharray 0.5s; }
.progress-text { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.1rem; }
.progress-label { font-size: 0.85rem; color: var(--text-secondary); }
.course-nav { margin-bottom: 24px; }
.nav-heading { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 12px; }
.section-list { list-style: none; }
.section-item { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: var(--radius-sm); cursor: pointer; transition: all 0.2s; margin-bottom: 4px; }
.section-item:hover { background: var(--border-light); }
.section-item.active { background: var(--primary); color: white; }
.section-item.active .section-icon { filter: brightness(0) invert(1); }
.section-icon { font-size: 1.2rem; }
.section-title { font-weight: 500; font-size: 0.95rem; }
.sidebar-footer { border-top: 1px solid var(--border); padding-top: 20px; }
.btn-bookmark { width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--surface); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 0.9rem; transition: all 0.2s; }
.btn-bookmark:hover { border-color: var(--primary); color: var(--primary); }
.btn-bookmark.bookmarked { background: var(--primary); color: white; border-color: var(--primary); }
.bookmark-icon { font-size: 1.2rem; }

/* Course Content */
.course-content { flex: 1; padding: 48px; max-width: 900px; }
.course-header { margin-bottom: 40px; padding-bottom: 32px; border-bottom: 1px solid var(--border); }
.header-badges { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
.badge { padding: 6px 14px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
.badge-topic { background: var(--primary); color: white; }
.badge-format { background: var(--accent); color: white; }
.badge-lang { background: var(--accent-alt); color: white; }
.title-block { margin-bottom: 20px; }
.course-title { font-size: 2.25rem; font-weight: 800; color: var(--text); margin-bottom: 8px; letter-spacing: -0.02em; }
.course-title-ar { font-size: 1.5rem; color: var(--text-secondary); font-family: 'Noto Naskh Arabic', sans-serif; }
.meta-row { display: flex; gap: 24px; margin-bottom: 24px; flex-wrap: wrap; }
.meta-item { display: flex; align-items: center; gap: 8px; color: var(--text-secondary); }
.meta-icon { font-size: 1.2rem; }
.enrollment-bar { display: flex; gap: 12px; }
.btn-enroll { padding: 14px 32px; background: var(--primary); color: white; border: none; border-radius: var(--radius-sm); font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-enroll:hover { background: var(--primary-dark); transform: translateY(-2px); box-shadow: var(--shadow); }
.btn-share { padding: 14px 24px; background: var(--surface); color: var(--text); border: 1px solid var(--border); border-radius: var(--radius-sm); font-weight: 500; cursor: pointer; transition: all 0.2s; }
.btn-share:hover { border-color: var(--primary); color: var(--primary); }

/* Content Body */
.content-body { line-height: 1.8; }
.content-body .page-title { font-size: 1.75rem; font-weight: 700; color: var(--primary-dark); margin: 32px 0 16px; }
.content-body .section-heading { font-size: 1.5rem; font-weight: 700; color: var(--primary-dark); margin: 32px 0 16px; padding-bottom: 8px; border-bottom: 2px solid var(--accent); }
.content-body .section-title { font-size: 1.25rem; font-weight: 600; color: var(--text); margin: 24px 0 12px; }
.content-body .section-sub { font-size: 1.1rem; font-weight: 600; color: var(--text); margin: 20px 0 10px; }
.content-body p { margin: 16px 0; }
.content-body ul, .content-body ol { margin: 16px 0; padding-left: 24px; }
.content-body li { margin: 8px 0; }
.content-body strong { color: var(--text); font-weight: 600; }
.content-body a { color: var(--primary); text-decoration: underline; }
.content-body a:hover { color: var(--primary-dark); }
.checklist-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px; background: var(--border-light); border-radius: var(--radius-sm); margin: 8px 0; }
.checkbox { width: 20px; height: 20px; border: 2px solid var(--border); border-radius: 4px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.checklist-item.checked .checkbox { background: var(--accent); border-color: var(--accent); }
.checklist-item.checked .checkbox::after { content: '✓'; color: white; font-size: 0.8rem; }
.table-wrapper { overflow-x: auto; margin: 20px 0; }
.table-wrapper table { width: 100%; border-collapse: collapse; }
.table-wrapper td { padding: 12px; border: 1px solid var(--border); }
.table-wrapper tr:first-child td { background: var(--primary); color: white; font-weight: 600; }

/* Course Footer */
.course-footer { margin-top: 48px; padding-top: 32px; border-top: 1px solid var(--border); }
.navigation-row { display: flex; justify-content: space-between; margin-bottom: 24px; }
.btn-nav { padding: 12px 24px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--surface); font-weight: 500; cursor: pointer; transition: all 0.2s; }
.btn-nav:hover { border-color: var(--primary); color: var(--primary); }
.completion-checkbox { display: flex; align-items: center; gap: 12px; cursor: pointer; }
.completion-checkbox input { display: none; }
.checkmark { width: 24px; height: 24px; border: 2px solid var(--border); border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.completion-checkbox input:checked + .checkmark { background: var(--accent); border-color: var(--accent); }
.completion-checkbox input:checked + .checkmark::after { content: '✓'; color: white; }

/* Footer */
.site-footer { background: var(--text); color: white; padding: 48px 0 24px; }
.footer-container { max-width: 1200px; margin: 0 auto; padding: 0 24px; text-align: center; }
.footer-brand { display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 1.25rem; font-weight: 700; margin-bottom: 12px; }
.footer-tagline { opacity: 0.8; margin-bottom: 4px; }
.footer-tagline-ar { opacity: 0.6; margin-bottom: 24px; font-family: 'Noto Naskh Arabic', sans-serif; }
.footer-links { display: flex; justify-content: center; gap: 24px; margin-bottom: 24px; }
.footer-links a { color: rgba(255,255,255,0.7); }
.footer-links a:hover { color: white; }
.footer-copy { opacity: 0.5; font-size: 0.85rem; }

/* Responsive */
@media (max-width: 1024px) {
  .course-main { flex-direction: column; }
  .course-sidebar { width: 100%; position: static; height: auto; border-left: none; border-bottom: 1px solid var(--border); }
  .course-content { padding: 24px; }
}

@media (max-width: 768px) {
  .hero-title { font-size: 2rem; }
  .hero-stats { flex-direction: column; gap: 24px; }
  .nav-links { display: none; }
  .course-grid { grid-template-columns: 1fr; }
  .topic-cards { grid-template-columns: repeat(2, 1fr); }
  .meta-row { flex-direction: column; gap: 12px; }
  .enrollment-bar { flex-direction: column; }
  .btn-enroll, .btn-share { width: 100%; }
}
`;

  await writeFile(path.join(outDir, 'premium.css'), premiumCss, 'utf8');
  console.log(`\n✅ Premium site generated: ${courses.length} courses → dist/site/`);
}

function getTopicIcon(topic) {
  const icons = {
    'Quality Improvement': '📊',
    'Patient Safety': '🛡️',
    'Leadership': '👔',
    'General': '📚',
    'QI': '📊',
    'PS': '🛡️',
    'TA': '👔',
    'L': '👔',
    'PFC': '💼',
    'GME': '🎓',
    'CC': '🤝',
    'DC': '📋',
    'DQA': '✓'
  };
  return icons[topic] || '📚';
}

main().catch(console.error);

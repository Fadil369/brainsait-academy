import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_INPUT = 'courses/sample-course.md';
const DEFAULT_OUTPUT = 'dist/site/index.html';

function getArg(flag) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function stripFrontMatter(content) {
  if (!content.startsWith('---\n')) {
    return content.trim();
  }

  const closingIndex = content.indexOf('\n---\n', 4);
  return closingIndex < 0 ? content.trim() : content.slice(closingIndex + 5).trim();
}

function markdownToHtml(markdown) {
  const lines = markdown.split('\n');
  const html = [];
  let inList = false;

  const closeList = () => {
    if (inList) {
      html.push('</ul>');
      inList = false;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      closeList();
      continue;
    }

    if (line.startsWith('# ')) {
      closeList();
      html.push(`<h1>${escapeHtml(line.slice(2))}</h1>`);
      continue;
    }

    if (line.startsWith('## ')) {
      closeList();
      html.push(`<h2>${escapeHtml(line.slice(3))}</h2>`);
      continue;
    }

    if (line.startsWith('- ')) {
      if (!inList) {
        html.push('<ul>');
        inList = true;
      }

      html.push(`<li>${escapeHtml(line.slice(2))}</li>`);
      continue;
    }

    closeList();
    html.push(`<p>${escapeHtml(line)}</p>`);
  }

  closeList();
  return html.join('\n');
}

async function main() {
  const inputPath = getArg('--input') ?? process.argv[2] ?? DEFAULT_INPUT;
  const outputPath = getArg('--output') ?? DEFAULT_OUTPUT;
  const fileContent = await readFile(inputPath, 'utf8');
  const htmlBody = markdownToHtml(stripFrontMatter(fileContent));
  const page = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>BrainSAIT IHI Preview</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0 auto; max-width: 768px; padding: 32px 20px; line-height: 1.6; color: #102a43; }
      h1, h2 { color: #0b7285; }
      ul { padding-left: 20px; }
      p, li { font-size: 1rem; }
    </style>
  </head>
  <body>
    ${htmlBody}
  </body>
</html>
`;

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, page, 'utf8');
  console.log(`Generated HTML preview at ${outputPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

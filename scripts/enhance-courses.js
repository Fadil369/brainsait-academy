import fs from 'fs/promises';
import path from 'path';

// Configuration
const API_KEY = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
const API_URL = process.env.API_URL || 'https://api.deepseek.com/v1/chat/completions';
const MODEL = process.env.MODEL || 'deepseek-chat';

const COURSES_DIR = path.join(process.cwd(), 'src/lib/data/courses');
const BACKUP_DIR = path.join(process.cwd(), 'src/lib/data/courses_backup');

async function ensureBackupDir() {
  try {
    await fs.access(BACKUP_DIR);
  } catch {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
  }
}

async function enhanceCourse(courseJson) {
  const prompt = `
You are an expert instructional designer, specifically for healthcare, quality, and medical billing education (BrainSAIT Academy).
I am providing you with a JSON object representing a course. 
Please ENHANCE this course data by:
1. Fixing any typos or grammatical errors in both English and Arabic.
2. Elaborating on the "sections" content to make it more professional, educational, and engaging.
3. Enhancing the "body" markdown (which usually contains the overview/objectives).
4. Generating a "quiz" array with 3 to 5 multiple-choice questions relevant to the course content. Each question should have this format:
   { "q": "Question text?", "opts": ["Option 1", "Option 2", "Option 3", "Option 4"], "ans": 0_to_3_index, "arabic": boolean }

Rules:
- Keep the original keys (title, slug, topic, etc.) intact.
- Do NOT change the 'slug', 'code', or 'sourceUrl'.
- Ensure the output is STRICTLY valid JSON. Do not wrap it in markdown code blocks (\`\`\`json ... \`\`\`), just output the raw JSON object.

Course JSON:
${JSON.stringify(courseJson, null, 2)}
`;

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are a strict JSON-output-only AI. You only reply with valid, parseable JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  let content = data.choices[0].message.content.trim();
  
  // Clean markdown JSON wrapping if present
  if (content.startsWith('\`\`\`json')) content = content.replace(/^\`\`\`json/, '');
  if (content.startsWith('\`\`\`')) content = content.replace(/^\`\`\`/, '');
  if (content.endsWith('\`\`\`')) content = content.replace(/\`\`\`$/, '');

  return JSON.parse(content);
}

async function main() {
  if (!API_KEY) {
    console.error('❌ Error: DEEPSEEK_API_KEY or OPENAI_API_KEY environment variable is missing.');
    process.exit(1);
  }

  await ensureBackupDir();
  
  const files = await fs.readdir(COURSES_DIR);
  const jsonFiles = files.filter(f => f.endsWith('.json'));
  
  console.log(`🔍 Found ${jsonFiles.length} course files. Starting batch enhancement...`);

  let count = 0;
  for (const file of jsonFiles) {
    const filePath = path.join(COURSES_DIR, file);
    const backupPath = path.join(BACKUP_DIR, file);
    
    try {
      const rawData = await fs.readFile(filePath, 'utf-8');
      const courseData = JSON.parse(rawData);
      
      // Skip if already has quiz (optional, you can remove this to force re-run)
      if (courseData.quiz && courseData.quiz.length >= 3) {
        console.log(`⏩ Skipping ${file} (already enhanced)`);
        continue;
      }

      console.log(`⚙️  Enhancing ${file}...`);
      
      // Backup original
      await fs.writeFile(backupPath, rawData);
      
      // Enhance
      const enhancedData = await enhanceCourse(courseData);
      
      // Save
      await fs.writeFile(filePath, JSON.stringify(enhancedData, null, 2));
      console.log(`✅ Successfully enhanced and saved ${file}`);
      count++;
      
      // Small delay to avoid API rate limits
      await new Promise(r => setTimeout(r, 2000));
      
    } catch (error) {
      console.error(`❌ Failed to process ${file}:`, error.message);
    }
  }
  
  console.log(`🎉 Batch processing complete! Enhanced ${count} courses.`);
}

main().catch(console.error);
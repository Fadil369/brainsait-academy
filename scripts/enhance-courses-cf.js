import fs from 'fs/promises';
import path from 'path';

// AI Gateway configuration
const API_URL = 'https://gateway.ai.cloudflare.com/v1/d7b99530559ab4f2545e9bdc72a7ab9b/brainsait-linc/workers-ai/@cf/meta/llama-3.1-8b-instruct';
const CF_API_TOKEN = process.env.AI_TOKEN || 'process.env.AI_TOKEN || "";

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
You are an expert instructional designer for BrainSAIT Academy.
ENHANCE the following course JSON data:
1. Fix typos/grammar in "title", "titleArabic", "sections", and "body".
2. Elaborate on the "sections" content to make it more engaging and detailed. Do NOT alter "isArabic" flags.
3. Enhance the "body" markdown.
4. Generate a "quiz" array with 3 multiple-choice questions. Format:
   { "q": "Question text?", "opts": ["Option 1", "Option 2", "Option 3", "Option 4"], "ans": 0, "arabic": boolean }

Return ONLY raw, valid JSON. No markdown wrappers. Do NOT change slug, code, or sourceUrl.

Input JSON:
${JSON.stringify(courseJson)}
`;

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CF_API_TOKEN}`
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: 'You only reply with valid, parseable JSON.' },
        { role: 'user', content: prompt }
      ]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gateway Error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  
  if (!data.success) {
      throw new Error(`CF AI Error: ${JSON.stringify(data.errors)}`);
  }

  let content = data.result.response.trim();
  
  // Clean markdown JSON wrapping if present
  if (content.startsWith('```json')) content = content.replace(/^```json/, '');
  if (content.startsWith('```')) content = content.replace(/^```/, '');
  if (content.endsWith('```')) content = content.replace(/```$/, '');

  try {
      return JSON.parse(content);
  } catch (e) {
      console.error("Failed to parse JSON. Raw output:", content.substring(0, 200) + "...");
      throw e;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const isTest = args.includes('--test');

  await ensureBackupDir();
  
  const files = await fs.readdir(COURSES_DIR);
  let jsonFiles = files.filter(f => f.endsWith('.json'));
  
  if (isTest) {
      jsonFiles = jsonFiles.slice(0, 1); // just do 1 for test
      console.log(`🧪 Running in test mode on 1 file...`);
  }
  
  console.log(`🔍 Found ${jsonFiles.length} course files. Starting batch enhancement...`);

  let count = 0;
  for (const file of jsonFiles) {
    const filePath = path.join(COURSES_DIR, file);
    const backupPath = path.join(BACKUP_DIR, file);
    
    try {
      const rawData = await fs.readFile(filePath, 'utf-8');
      const courseData = JSON.parse(rawData);
      
      if (!isTest && courseData.quiz && courseData.quiz.length >= 3) {
        console.log(`⏩ Skipping ${file} (already enhanced)`);
        continue;
      }

      console.log(`⚙️  Enhancing ${file}...`);
      
      await fs.writeFile(backupPath, rawData);
      
      const enhancedData = await enhanceCourse(courseData);
      
      await fs.writeFile(filePath, JSON.stringify(enhancedData, null, 2));
      console.log(`✅ Successfully enhanced and saved ${file}`);
      count++;
      
      await new Promise(r => setTimeout(r, 2000));
      
    } catch (error) {
      console.error(`❌ Failed to process ${file}:`, error.message);
    }
  }
  
  console.log(`🎉 Batch processing complete! Enhanced ${count} courses.`);
}

main().catch(console.error);
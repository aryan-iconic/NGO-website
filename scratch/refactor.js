const fs = require('fs');
const path = require('path');

const SRC_DIR = 'e:\\web\\src';

function processFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');
  if (!content.includes('import { db } from "@/lib/db"')) return;

  // Add await to db.*()
  let newContent = content.replace(/(?<!await\s+)db\.([a-zA-Z0-9_]+)\(/g, 'await db.$1(');

  // Add async to export default function
  newContent = newContent.replace(/export default function/g, 'export default async function');
  // Add async to GET, POST, etc.
  newContent = newContent.replace(/export function (GET|POST|PUT|PATCH|DELETE)/g, 'export async function $1');
  
  // Clean up double async
  newContent = newContent.replace(/async async/g, 'async');

  if (newContent !== content) {
    fs.writeFileSync(filepath, newContent, 'utf8');
    console.log(`Updated ${filepath}`);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      walk(filepath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      if (file !== 'db.ts') {
        processFile(filepath);
      }
    }
  }
}

walk(SRC_DIR);

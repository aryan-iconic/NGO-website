const fs = require('fs');

const oldContent = fs.readFileSync('e:\\web\\src\\lib\\db.ts', 'utf8');
const interfaceSection = oldContent.split('interface DB {')[0];

const newDbObject = fs.readFileSync('e:\\web\\scratch\\db_new.ts', 'utf8');
const lines = newDbObject.split('\n');
let startIdx = 0;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].startsWith('// We use Prisma')) {
    startIdx = i;
    break;
  }
}

let cleanedInterfaceSection = interfaceSection
  .replace('import bcrypt from "bcryptjs";\n', '')
  .replace('import { randomUUID } from "node:crypto";\n', '')
  .replace('import path from "node:path";\n', '')
  .replace('import fs from "node:fs";\n', '');

const finalContent = [
  ...lines.slice(0, 3),
  '',
  cleanedInterfaceSection,
  ...lines.slice(startIdx)
].join('\n');

fs.writeFileSync('e:\\web\\src\\lib\\db.ts', finalContent, 'utf8');
console.log('Merged successfully!');

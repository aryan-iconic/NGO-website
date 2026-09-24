import os
import re

SRC_DIR = r"e:\web\src"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'import { db } from "@/lib/db"' not in content:
        return

    # Find all db.method() calls and prefix with await if not already
    new_content = re.sub(r'(?<!await\s)db\.([a-zA-Z0-9_]+)\(', r'await db.\1(', content)

    # Now we need to ensure functions containing await are async
    # Simple heuristic: if it's a page or route, the default export or exported functions might need async
    # For Next.js: `export default function`, `export function GET`, etc.
    new_content = re.sub(r'export default function', r'export default async function', new_content)
    new_content = re.sub(r'export function (GET|POST|PUT|PATCH|DELETE)', r'export async function \1', new_content)
    
    # Clean up double async
    new_content = new_content.replace('async async', 'async')
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, _, files in os.walk(SRC_DIR):
    for file in files:
        if file.endswith('.ts') or file.endswith('.tsx'):
            if file != 'db.ts':
                process_file(os.path.join(root, file))

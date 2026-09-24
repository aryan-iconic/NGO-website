import os

with open(r"e:\web\src\lib\db.ts", "r", encoding="utf-8") as f:
    old_content = f.read()

# Extract everything up to `interface DB {`
interface_section = old_content.split("interface DB {")[0]

with open(r"e:\web\scratch\db_new.ts", "r", encoding="utf-8") as f:
    new_db_object = f.read()

# Remove the duplicated type definitions from new_db_object
lines = new_db_object.split('\n')
start_idx = 0
for i, line in enumerate(lines):
    if line.startswith('// We use Prisma'):
        start_idx = i
        break

final_new_content = lines[:3] + ["\n"] + [interface_section.replace('import bcrypt from "bcryptjs";', '').replace('import { randomUUID } from "node:crypto";', '').replace('import path from "node:path";', '').replace('import fs from "node:fs";', '')] + lines[start_idx:]

with open(r"e:\web\src\lib\db.ts", "w", encoding="utf-8") as f:
    f.write("\n".join(final_new_content))

print("Merged successfully!")

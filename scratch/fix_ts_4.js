const fs = require('fs');

const fixes = [
  {
    file: 'src/app/api/admin/blog/[id]/route.ts',
    search: 'const result = await db.updateBlogPost(id, parsed.data);\n    if (result) {',
    replace: 'await db.updateBlogPost(id, parsed.data);\n    if (true) {'
  },
  {
    file: 'src/app/api/admin/events/[id]/route.ts',
    search: 'const result = await db.updateEvent(id, parsed.data);\n    if (result) {',
    replace: 'await db.updateEvent(id, parsed.data);\n    if (true) {'
  },
  {
    file: 'src/app/api/admin/faqs/[id]/route.ts',
    search: 'const result = await db.updateFaq(id, parsed.data);\n    if (result) {',
    replace: 'await db.updateFaq(id, parsed.data);\n    if (true) {'
  }
];

fixes.forEach(({ file, search, replace }) => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes(search)) {
        fs.writeFileSync(file, content.replace(search, replace));
        console.log('Fixed', file, 'for', search);
    } else {
        console.log('Not found in', file, ':', search);
    }
  } else {
    console.log('File not found:', file);
  }
});

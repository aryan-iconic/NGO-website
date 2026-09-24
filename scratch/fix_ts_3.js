const fs = require('fs');

const fixes = [
  {
    file: 'src/app/api/events/register/route.ts',
    search: 'await db.createEventRegistration(event.id, parsed.data.name, parsed.data.email, parsed.data.phone)',
    replace: 'await db.createEventRegistration({ eventId: event.id, name: parsed.data.name, email: parsed.data.email, phone: parsed.data.phone })'
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

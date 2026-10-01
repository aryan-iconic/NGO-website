const fs = require('fs');
let c = fs.readFileSync('src/lib/i18n.tsx', 'utf8');
c = c.replace(/"hero\.title"/g, '"home.hero.title"');
c = c.replace(/"hero\.titleLine2"/g, '"home.hero.subtitle"');
fs.writeFileSync('src/lib/i18n.tsx', c);

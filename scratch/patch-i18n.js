const fs = require('fs');
const dict = require('./static_dict.json');

let content = fs.readFileSync('src/lib/i18n.tsx', 'utf8');

Object.keys(dict).forEach(locale => {
  const localeStart = content.indexOf(`  ${locale}: {`);
  if (localeStart === -1) {
    console.error(`Could not find locale ${locale} in i18n.tsx`);
    return;
  }
  
  const insertIndex = content.indexOf('\n', localeStart) + 1;
  
  let newLines = '';
  for (const [k, v] of Object.entries(dict[locale])) {
    newLines += `    "${k}": ${JSON.stringify(v)},\n`;
  }
  
  content = content.slice(0, insertIndex) + newLines + content.slice(insertIndex);
});

fs.writeFileSync('src/lib/i18n.tsx', content);
console.log('Patched i18n.tsx with static dict');

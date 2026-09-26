const fs = require('fs');

const phrases = {
  "hero.titleLine2": "Shri Nityanikunj Ras Seva Sansthan Trust, Varanasi works towards a vision encompassing education, healthcare, humanitarian assistance, cultural preservation, environmental responsibility and service to society.",
  "home.giveOnce": "Give Once",
  "home.upcomingInitiatives": "Upcoming Initiatives",
  "home.followOurJourney": "Follow Our Journey",
  "home.watchOurVideos": "Watch Our Videos",
  "home.step1": "Discover",
  "home.step2": "Understand",
  "home.step3": "Choose",
  "home.step4": "Contribute",
  "home.step5": "See Impact",
  "footer.explore": "Explore",
  "footer.about": "About",
  "footer.legal": "Legal",
  "footer.ourStory": "Our Story",
  "footer.transparency": "Transparency",
  "footer.privacyPolicy": "Privacy Policy",
  "footer.terms": "Terms",
  "footer.donationPolicy": "Donation Policy",
  "footer.refundPolicy": "Refund Policy",
  "footer.copyright": "Registration and legal details appear here once provided by the Trust."
};

const locales = ["hi", "te", "ta"];

async function translateText(text, targetLocale) {
  if (targetLocale === 'en') return text;
  
  // Protect Brand Name manually
  let toTranslate = text.replace("Shri Nityanikunj Ras Seva Sansthan Trust, Varanasi", "__BRAND__");

  try {
    const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLocale}&dt=t&q=${encodeURIComponent(toTranslate)}`);
    const data = await response.json();
    let translated = data[0].map((item) => item[0]).join("");
    return translated.replace("__BRAND__", "Shri Nityanikunj Ras Seva Sansthan Trust, Varanasi");
  } catch (error) {
    return text;
  }
}

async function run() {
  const dict = { en: {}, hi: {}, te: {}, ta: {} };
  
  for (const [key, text] of Object.entries(phrases)) {
    dict.en[key] = text;
    for (const locale of locales) {
      dict[locale][key] = await translateText(text, locale);
    }
  }
  
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
  console.log('Patched i18n.tsx with more strings');
}

run();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ENABLED_LOCALES = ["hi", "te", "ta"];
const PROTECTED_TERMS = [
  "Shri Nityanikunj Ras Seva Sansthan Trust",
  "Shri Nityanikunj Trust",
  "Nityanikunj",
  "BrandName"
];

async function translateText(text, targetLocale) {
  if (!text || typeof text !== "string") return text;
  if (targetLocale === "en") return text;

  let processableText = text;
  const placeholders = {};
  
  PROTECTED_TERMS.forEach((term, index) => {
    const regex = new RegExp(term, "gi");
    processableText = processableText.replace(regex, (match) => {
      const ph = `__PRTCTD${index}__`;
      placeholders[ph] = match;
      return ph;
    });
  });

  try {
    const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLocale}&dt=t&q=${encodeURIComponent(processableText)}`);
    if (!response.ok) return text;
    const data = await response.json();
    let translated = data[0].map((item) => item[0]).join("");
    
    Object.keys(placeholders).forEach((ph) => {
      translated = translated.split(ph).join(placeholders[ph]);
    });
    return translated;
  } catch (error) {
    return text;
  }
}

async function backfillModel(model, fields) {
  console.log(`Backfilling ${model}...`);
  const records = await prisma[model].findMany();
  for (const record of records) {
    const translations = record.translations || {};
    let updated = false;

    for (const locale of ENABLED_LOCALES) {
      if (!translations[locale]) translations[locale] = {};

      for (const field of fields) {
        if (!record[field] || translations[locale][field]) continue;
        
        console.log(`Translating ${model} ID ${record.id} - ${field} to ${locale}`);
        const translated = await translateText(record[field], locale);
        translations[locale][field] = translated;
        if (!translations[locale]._meta) translations[locale]._meta = {};
        translations[locale]._meta[field] = { source: "auto", updated_at: new Date().toISOString() };
        updated = true;
      }
    }

    if (updated) {
      await prisma[model].update({
        where: { id: record.id },
        data: { translations }
      });
      console.log(`Updated translations for ${model} ID ${record.id}`);
    }
  }
}

async function run() {
  await backfillModel("campaign", ["title", "shortDescription", "story", "beneficiaryInfo", "impactDescription", "locationText"]);
  await backfillModel("sevaArea", ["name", "description", "objectives"]);
  await backfillModel("event", ["title", "description", "venue", "location", "organizer"]);
  await backfillModel("blogPost", ["title", "excerpt", "content"]);
  await backfillModel("faq", ["question", "answer", "category"]);
  await backfillModel("instagramPost", ["title", "caption"]);
  await backfillModel("youTubeVideo", ["title", "description"]);
  console.log("Backfill complete!");
  process.exit(0);
}

run();

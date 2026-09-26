const fs = require('fs');

const phrases = [
  "Home", "About", "Donate", "Shop", "Campaigns", "Seva", "Events", "Contact",
  "Read More", "Learn More", "Donate Now", "Buy Now", "Add to Cart", "Checkout", 
  "Search", "Login", "Register", "Submit", "Cancel", "Save", "Delete", "Loading...",
  "No results found", "Payment successful", "Payment failed", "Invalid email address", 
  "Please enter your name", "This field is required", "Please try again", 
  "Order placed successfully", "Donation successful", "Product added to cart", 
  "Your session has expired"
];

const locales = ["hi", "te", "ta"];

async function translateText(text, targetLocale) {
  try {
    const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLocale}&dt=t&q=${encodeURIComponent(text)}`);
    const data = await response.json();
    return data[0].map((item) => item[0]).join("");
  } catch (error) {
    return text;
  }
}

async function generate() {
  const dict = { en: {}, hi: {}, te: {}, ta: {} };
  
  for (const phrase of phrases) {
    const key = phrase.toLowerCase().replace(/[^a-z0-9]/g, '_');
    dict.en[key] = phrase;
    
    for (const locale of locales) {
      const t = await translateText(phrase, locale);
      dict[locale][key] = t;
    }
  }
  
  fs.writeFileSync('scratch/static_dict.json', JSON.stringify(dict, null, 2));
  console.log("Done translating static phrases!");
}

generate();

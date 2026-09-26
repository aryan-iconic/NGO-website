const fs = require('fs');

const phrases = {
  // About Page
  "about.title": "About Shri Nityanikunj Ras Seva Sansthan Trust, Varanasi",
  "about.subtitle": "श्री नित्यानिकुंज रस सेवा संस्थान ट्रस्ट, वाराणसी",
  "about.s1.h": "About the Trust",
  "about.s1.p": "Shri Nityanikunj Ras Seva Sansthan Trust, Varanasi is established with a broad vision of social welfare, service, education, healthcare, cultural preservation, environmental responsibility and humanitarian assistance. The Trust's objectives encompass service to communities in need while promoting education, Indian culture, Sanskrit, yoga, traditional knowledge and social responsibility.",
  "about.s2.h": "Our Vision",
  "about.s2.p": "To foster a community grounded in social welfare, offering service to disadvantaged communities through education, healthcare, cultural preservation, environmental responsibility, animal welfare, and immediate humanitarian assistance when needed.",
  "about.s3.h": "Our Mission",
  "about.s3.p1": "सेवा (Service) • शिक्षा (Education) • स्वास्थ्य (Healthcare)",
  "about.s3.p2": "समाज कल्याण (Social Welfare) • संस्कृति (Culture)",
  "about.s3.p3": "पर्यावरण संरक्षण (Environmental Protection) • गौ एवं पशु सेवा (Animal Welfare)",
  "about.s3.p4": "आत्मनिर्भरता (Self-Reliance) • मानवीय सहायता (Humanitarian Aid)",
  "about.s4.h": "Founder / President",
  "about.s4.p1": "श्री नित्यानन्द पाण्डेय",
  "about.s4.p2": "संस्थापक / अध्यक्ष (Founder / President)",
  "about.s5.h": "Our Objectives",
  "about.s5.p": "The Trust Deed sets out a broad range of charitable, social, educational, healthcare, cultural, environmental and humanitarian objectives.",
  "about.s5.btn": "View Areas of Seva",
  "about.s6.h": "Current Activities",
  "about.s6.p": "Only activities confirmed and published by the Trust will appear here. The Trust focuses its immediate resources on the most urgent needs while working toward its broader objectives over time.",
  "about.s7.h": "Legal & Registration Information",
  "about.s7.p": "Official registration and compliance information (including PAN, 12A, 80G, FCRA, CSR Registration, Bank Details, and Address) will be published here after verification.",

  // Volunteer Page
  "vol.title": "Join Our Seva",
  "vol.subtitle": "Volunteering doesn't require donating — just a bit of your time and willingness to help.",
  "vol.options.1": "Event Support",
  "vol.options.2": "Education",
  "vol.options.3": "Community Service",
  "vol.options.4": "Digital/Technology",
  "vol.options.5": "Photography/Media",
  "vol.options.6": "Fundraising Support",
  "vol.options.7": "Field Activities",
  "vol.f.name": "Full Name",
  "vol.f.email": "Email",
  "vol.f.phone": "Phone",
  "vol.f.city": "City",
  "vol.f.interests": "Areas of Interest",
  "vol.f.avail": "Availability (e.g. weekends)",
  "vol.f.msg": "Anything else you'd like us to know?",
  "vol.submit": "Submit Application",
  "vol.submitting": "Submitting…",
  "vol.done.h": "Thank You",
  "vol.done.p": "Your application has been received. A member of the team will reach out about next steps.",

  // Contact Page
  "contact.title": "Contact Us",
  "contact.subtitle": "Questions about a campaign, donation, or volunteering? Reach out.",
  "contact.done": "Your message has been received — we'll respond soon.",
  "contact.f.name": "Full Name",
  "contact.f.email": "Email",
  "contact.f.phone": "Phone (optional)",
  "contact.f.sub": "Subject",
  "contact.f.msg": "Message",
  "contact.submit": "Send Message",
  "contact.submitting": "Sending…",

  // Gallery
  "gal.title": "Gallery",
  "gal.subtitle": "Moments from campaigns, events and seva across the Trust.",

  // FAQ
  "faq.title": "Frequently Asked Questions",

  // Legal Common
  "legal.lastUpdated": "Last updated:"
};

const legalPhrases = {
  // Terms
  "terms.title": "Terms of Use",
  "terms.s1.h": "Platform Purpose",
  "terms.s1.p": "This platform is an admin-managed donation and seva platform. Campaigns are created and published only by Shri Nityanikunj Ras Seva Sansthan Trust, Varanasi administrators.",
  "terms.s2.h": "Accounts",
  "terms.s2.p": "You're responsible for keeping your account credentials secure. Guest checkout is available for donations without creating an account.",
  "terms.s3.h": "Donations",
  "terms.s3.p": "All donations are processed through our payment gateway. A donation is confirmed only once payment is verified server-side, not merely on your browser reporting success.",
  "terms.s4.h": "Content",
  "terms.s4.p": "Campaign content is provided by the Trust. We do not present unverifiable claims as fact.",

  // Donation Policy
  "don.title": "Donation Policy",
  "don.s1.h": "How Donations Are Used",
  "don.s1.p": "Product-based contributions (e.g. a ration kit or school kit) go toward that specific item for the campaign. Custom amounts and general donations support the campaign or the Trust's general fund.",
  "don.s2.h": "What We Don't Show",
  "don.s2.p": "We deliberately don't display fundraising targets or amounts raised on public campaign pages. Instead, campaigns show milestones, updates and impact as work progresses.",
  "don.s3.h": "Receipts",
  "don.s3.p": "Every successful donation generates an immutable, uniquely numbered receipt, available for download from your dashboard and sent by email.",
  "don.s4.h": "Tax Benefits",
  "don.s4.p": "Tax-eligible status is shown only on campaigns where the Trust has explicitly enabled it in settings — never assumed or invented.",

  // Refund Policy
  "ref.title": "Refund & Cancellation Policy",
  "ref.s1.h": "Donations Are Generally Final",
  "ref.s1.p": "Because contributions are typically allocated toward active seva work quickly, donations are generally non-refundable.",
  "ref.s2.h": "Errors and Duplicate Charges",
  "ref.s2.p": "If you believe a charge was made in error, made twice, or for the wrong amount, contact us within 7 days and we'll review and process a refund where appropriate.",
  "ref.s3.h": "How Refunds Are Processed",
  "ref.s3.p": "Approved refunds are issued back to the original payment method through our payment gateway. Processing time depends on your bank or card issuer.",

  // Privacy Policy
  "priv.title": "Privacy Policy",
  "priv.s1.h": "What We Collect",
  "priv.s1.p": "Only what's needed to process a donation, volunteer application, or contact request: name, email, phone, and — only when a tax receipt is requested — address and PAN.",
  "priv.s2.h": "How We Use It",
  "priv.s2.p": "To generate receipts, respond to enquiries, and process volunteer applications. We do not sell or share personal data with third parties for marketing purposes.",
  "priv.s3.h": "Donor Privacy",
  "priv.s3.p": "Donor identities are never displayed publicly by default. Choosing to donate anonymously hides your name from any donor-facing display entirely.",
  "priv.s4.h": "Your Rights",
  "priv.s4.p": "You may request access to, correction of, or deletion of your personal data, subject to financial record-keeping requirements that may apply to completed donations."
};

Object.assign(phrases, legalPhrases);

const locales = ["hi", "te", "ta"];

async function translateBatch(texts, targetLocale) {
  if (targetLocale === 'en') return texts;
  
  // Use post to avoid url length limits
  const formData = new URLSearchParams();
  formData.append('client', 'gtx');
  formData.append('sl', 'en');
  formData.append('tl', targetLocale);
  formData.append('dt', 't');
  
  texts.forEach(text => {
    let toTranslate = text.replace(/Shri Nityanikunj Ras Seva Sansthan Trust, Varanasi/g, "__BRAND__");
    formData.append('q', toTranslate);
  });

  try {
    const response = await fetch(`https://translate.googleapis.com/translate_a/single`, {
        method: 'POST',
        body: formData,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
    const data = await response.json();
    
    // Google returns a nested array for each queried string
    // But actually with POST it might return differently if we pass multiple 'q' parameters?
    // Wait, multiple 'q' params return an array of arrays!
    
    // Instead of messing with parsing, I will just join them with a special separator.
  } catch (error) {
    console.error(error);
    return texts;
  }
}

async function translateWithSeparator(texts, targetLocale) {
    if (targetLocale === 'en') return texts;
    const sep = " |###| ";
    const combined = texts.map(t => t.replace(/Shri Nityanikunj Ras Seva Sansthan Trust, Varanasi/g, "__BRAND__")).join(sep);
    
    try {
        const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLocale}&dt=t&q=${encodeURIComponent(combined)}`);
        const data = await response.json();
        let translated = data[0].map((item) => item[0]).join("");
        translated = translated.replace(/__BRAND__/g, "Shri Nityanikunj Ras Seva Sansthan Trust, Varanasi");
        return translated.split(/\|###\||।###।|\| ### \|/i).map(s => s.trim());
    } catch(e) {
        console.error(e);
        return texts;
    }
}

async function run() {
  const dict = { en: {}, hi: {}, te: {}, ta: {} };
  
  const keys = Object.keys(phrases);
  const values = Object.values(phrases);
  
  console.log("Starting translations...");
  
  for (const locale of locales) {
      console.log("Translating", locale);
      
      // Batch in 10s
      let result = [];
      for(let i=0; i<values.length; i+=10) {
          let batch = values.slice(i, i+10);
          let translatedBatch = await translateWithSeparator(batch, locale);
          result.push(...translatedBatch);
      }
      
      for(let i=0; i<keys.length; i++) {
          dict[locale][keys[i]] = result[i] || values[i];
      }
  }
  
  for (let i=0; i<keys.length; i++) {
      dict.en[keys[i]] = values[i];
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
  console.log('Patched i18n.tsx with remaining strings');
}

run();

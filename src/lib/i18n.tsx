"use client";

/**
 * Lightweight client-side i18n for static UI copy (nav, buttons, headings,
 * legal pages, footer). Admin-authored content (campaign stories, blogs) is
 * handled separately via `settings[key].translations`.
 *
 * Resolution order for t(key):
 *   1. settings[key] override (admin-editable, per-locale translations)
 *   2. dictionary[locale][key]
 *   3. dictionary.en[key]
 *   4. the key itself
 *
 * Any "{brand}" token is replaced with the Trust's name in the active language.
 *
 * Usage (server layout, avoids first-paint language flicker):
 *   const cookieStore = await cookies();
 *   const initialLocale = cookieStore.get("NEXT_LOCALE")?.value;
 *   <I18nProvider initialLocale={initialLocale} settings={settings}>…</I18nProvider>
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

export const LOCALES = ["en", "hi", "te", "ta"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_LABELS: Record<Locale, { native: string; english: string }> = {
  en: { native: "English", english: "English" },
  hi: { native: "हिन्दी", english: "Hindi" },
  te: { native: "తెలుగు", english: "Telugu" },
  ta: { native: "தமிழ்", english: "Tamil" },
};

const STORAGE_KEY = "snt_locale";
const COOKIE_NAME = "NEXT_LOCALE";

const BRAND: Record<Locale, string> = {
  en: "Shri Nityanikunj Ras Seva Sansthan Trust, Varanasi",
  hi: "श्री नित्यानिकुंज रस सेवा संस्थान ट्रस्ट, वाराणसी",
  te: "శ్రీ నిత్యానికుంజ్ రస్ సేవా సంస్థాన్ ట్రస్ట్, వారణాసి",
  ta: "ஸ்ரீ நித்யானிகுஞ்ச் ரஸ் சேவா சன்ஸ்தான் அறக்கட்டளை, வாரணாசி",
};

/* ------------------------------------------------------------------ */
/* English (source of truth — every key must exist here)               */
/* ------------------------------------------------------------------ */
const en = {
  "about.title": "About {brand}",
  "about.subtitle": "{brand}",
  "about.s1.h": "About the Trust",
  "about.s1.p": "{brand} is established with a broad vision of social welfare, service, education, healthcare, cultural preservation, environmental responsibility and humanitarian assistance. The Trust's objectives encompass service to communities in need while promoting education, Indian culture, Sanskrit, yoga, traditional knowledge and social responsibility.",
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
  "about.team.title": "Our Team",

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

  "gal.title": "Gallery",
  "gal.subtitle": "Moments from campaigns, events and seva across the Trust.",
  "faq.title": "Frequently Asked Questions",
  "legal.lastUpdated": "Last updated:",

  "terms.title": "Terms of Use",
  "terms.s1.h": "Platform Purpose",
  "terms.s1.p": "This platform is an admin-managed donation and seva platform. Campaigns are created and published only by {brand} administrators.",
  "terms.s2.h": "Accounts",
  "terms.s2.p": "You're responsible for keeping your account credentials secure. Guest checkout is available for donations without creating an account.",
  "terms.s3.h": "Donations",
  "terms.s3.p": "All donations are processed through our payment gateway. A donation is confirmed only once payment is verified server-side, not merely on your browser reporting success.",
  "terms.s4.h": "Content",
  "terms.s4.p": "Campaign content is provided by the Trust. We do not present unverifiable claims as fact.",

  "don.title": "Donation Policy",
  "don.s1.h": "How Donations Are Used",
  "don.s1.p": "Product-based contributions (e.g. a ration kit or school kit) go toward that specific item for the campaign. Custom amounts and general donations support the campaign or the Trust's general fund.",
  "don.s2.h": "What We Don't Show",
  "don.s2.p": "We deliberately don't display fundraising targets or amounts raised on public campaign pages. Instead, campaigns show milestones, updates and impact as work progresses.",
  "don.s3.h": "Receipts",
  "don.s3.p": "Every successful donation generates an immutable, uniquely numbered receipt, available for download from your dashboard and sent by email.",
  "don.s4.h": "Tax Benefits",
  "don.s4.p": "Tax-eligible status is shown only on campaigns where the Trust has explicitly enabled it in settings — never assumed or invented.",

  "ref.title": "Refund & Cancellation Policy",
  "ref.s1.h": "Donations Are Generally Final",
  "ref.s1.p": "Because contributions are typically allocated toward active seva work quickly, donations are generally non-refundable.",
  "ref.s2.h": "Errors and Duplicate Charges",
  "ref.s2.p": "If you believe a charge was made in error, made twice, or for the wrong amount, contact us within 7 days and we'll review and process a refund where appropriate.",
  "ref.s3.h": "How Refunds Are Processed",
  "ref.s3.p": "Approved refunds are issued back to the original payment method through our payment gateway. Processing time depends on your bank or card issuer.",

  "priv.title": "Privacy Policy",
  "priv.s1.h": "What We Collect",
  "priv.s1.p": "Only what's needed to process a donation, volunteer application, or contact request: name, email, phone, and — only when a tax receipt is requested — address and PAN.",
  "priv.s2.h": "How We Use It",
  "priv.s2.p": "To generate receipts, respond to enquiries, and process volunteer applications. We do not sell or share personal data with third parties for marketing purposes.",
  "priv.s3.h": "Donor Privacy",
  "priv.s3.p": "Donor identities are never displayed publicly by default. Choosing to donate anonymously hides your name from any donor-facing display entirely.",
  "priv.s4.h": "Your Rights",
  "priv.s4.p": "You may request access to, correction of, or deletion of your personal data, subject to financial record-keeping requirements that may apply to completed donations.",

  "home.giveOnce": "Give Once",
  "home.upcomingInitiatives": "Upcoming Initiatives",
  "home.followOurJourney": "Follow Our Journey",
  "home.watchOurVideos": "Watch Our Videos",
  "home.step1": "Discover",
  "home.step2": "Understand",
  "home.step3": "Choose",
  "home.step4": "Contribute",
  "home.step5": "See Impact",
  "home.hero.title": "A commitment to Seva, Culture and Social Welfare",
  "home.hero.subtitle": "{brand} works towards a vision encompassing education, healthcare, humanitarian assistance, cultural preservation, environmental responsibility and service to society.",
  "home.seva": "Our Areas of Seva",
  "home.seva.subtitle": "Discover the diverse areas where we dedicate our efforts to uplift and support the community.",
  "home.featured": "Featured Campaigns",
  "home.viewAll": "View all",
  "home.howItWorks": "How It Works",
  "home.monthlyTitle": "Give Every Month",
  "home.monthlyBody": "A small recurring contribution provides steady, predictable support for ongoing seva work.",
  "home.monthlyCta": "Start Monthly Giving",
  "home.ctaTitle": "Every contribution carries someone forward.",
  "home.ctaBody": "Whether it's a meal, a school kit, or an hour of your time — there's a way to help today.",
  "hero.donateNow": "Donate Now",
  "hero.joinSeva": "Join Our Seva",

  "footer.explore": "Explore",
  "footer.about": "About",
  "footer.legal": "Legal",
  "footer.ourStory": "Our Story",
  "footer.transparency": "Transparency",
  "footer.privacyPolicy": "Privacy Policy",
  "footer.terms": "Terms",
  "footer.donationPolicy": "Donation Policy",
  "footer.refundPolicy": "Refund Policy",
  "footer.80g": "80G Tax Exemption",
  "footer.copyright": "Registration and legal details appear here once provided by the Trust.",
  "footer.tagline": "{brand}",

  "home": "Home",
  "about": "About",
  "donate": "Donate",
  "shop": "Shop",
  "campaigns": "Campaigns",
  "seva": "Seva",
  "events": "Events",
  "contact": "Contact",
  "people": "People",
  "newsletter": "Newsletter",
  "transparency": "Transparency",
  "80g": "80G Tax Exemption",
  "read_more": "Read More",
  "learn_more": "Learn More",
  "donate_now": "Donate Now",
  "buy_now": "Buy Now",
  "add_to_cart": "Add to Cart",
  "checkout": "Checkout",
  "search": "Search",
  "login": "Login",
  "register": "Register",
  "submit": "Submit",
  "cancel": "Cancel",
  "save": "Save",
  "delete": "Delete",
  "loading___": "Loading...",
  "no_results_found": "No results found",
  "payment_successful": "Payment successful",
  "payment_failed": "Payment failed",
  "invalid_email_address": "Invalid email address",
  "please_enter_your_name": "Please enter your name",
  "this_field_is_required": "This field is required",
  "please_try_again": "Please try again",
  "order_placed_successfully": "Order placed successfully",
  "donation_successful": "Donation successful",
  "product_added_to_cart": "Product added to cart",
  "your_session_has_expired": "Your session has expired",

  "nav.campaigns": "Campaigns",
  "nav.events": "Our Initiatives",
  "nav.gallery": "Gallery",
  "nav.blog": "Blog",
  "nav.volunteer": "Volunteer",
  "nav.contact": "Contact",
  "nav.login": "Login",
  "nav.donate": "Donate",

  "nl.title": "Receive a Little Divine Inspiration",
  "nl.body": "Stay Connected with Divine Seva. Receive our latest stories, seva updates, spiritual insights, campaigns, and meaningful ways to make a difference — directly in your inbox.",
  "nl.label": "Weekly Newsletter",
  "nl.f.name": "Full Name *",
  "nl.f.email": "Email Address *",
  "nl.f.city": "City / Location (Optional)",
  "nl.submit": "Subscribe Free",
  "nl.footer": "🛡️ 100% Free • No Spam • Unsubscribe at any time with one click.",
  "nl.submitting": "Subscribing...",
  "nl.success": "Thank you for subscribing!",
} as const;

export type TranslationKey = keyof typeof en;
type Dict = Partial<Record<TranslationKey, string>>;

/* ------------------------------------------------------------------ */
/* Hindi                                                               */
/* ------------------------------------------------------------------ */
const hi: Dict = {
  "about.title": "{brand} के बारे में",
  "about.subtitle": "{brand}",
  "about.s1.h": "ट्रस्ट के बारे में",
  "about.s1.p": "{brand} की स्थापना सामाजिक कल्याण, सेवा, शिक्षा, स्वास्थ्य सेवा, सांस्कृतिक संरक्षण, पर्यावरणीय उत्तरदायित्व और मानवीय सहायता के व्यापक दृष्टिकोण के साथ की गई है। ट्रस्ट के उद्देश्यों में शिक्षा, भारतीय संस्कृति, संस्कृत, योग, पारंपरिक ज्ञान और सामाजिक उत्तरदायित्व को बढ़ावा देते हुए ज़रूरतमंद समुदायों की सेवा करना शामिल है।",
  "about.s2.h": "हमारा दृष्टिकोण",
  "about.s2.p": "सामाजिक कल्याण पर आधारित समुदाय का निर्माण करना, तथा शिक्षा, स्वास्थ्य सेवा, सांस्कृतिक संरक्षण, पर्यावरणीय उत्तरदायित्व, पशु कल्याण और आवश्यकता पड़ने पर तत्काल मानवीय सहायता के माध्यम से वंचित समुदायों की सेवा करना।",
  "about.s3.h": "हमारा मिशन",
  "about.s3.p1": "सेवा • शिक्षा • स्वास्थ्य",
  "about.s3.p2": "समाज कल्याण • संस्कृति",
  "about.s3.p3": "पर्यावरण संरक्षण • गौ एवं पशु सेवा",
  "about.s3.p4": "आत्मनिर्भरता • मानवीय सहायता",
  "about.s4.h": "संस्थापक / अध्यक्ष",
  "about.s4.p1": "श्री नित्यानन्द पाण्डेय",
  "about.s4.p2": "संस्थापक / अध्यक्ष",
  "about.s5.h": "हमारे उद्देश्य",
  "about.s5.p": "ट्रस्ट डीड में धर्मार्थ, सामाजिक, शैक्षिक, स्वास्थ्य, सांस्कृतिक, पर्यावरणीय और मानवीय उद्देश्यों की एक व्यापक श्रृंखला निर्धारित की गई है।",
  "about.s5.btn": "सेवा के क्षेत्र देखें",
  "about.s6.h": "वर्तमान गतिविधियाँ",
  "about.s6.p": "यहाँ केवल वही गतिविधियाँ दिखाई जाएँगी जिनकी पुष्टि और प्रकाशन ट्रस्ट ने किया है। ट्रस्ट अपने तात्कालिक संसाधनों को सबसे ज़रूरी आवश्यकताओं पर केंद्रित करता है और साथ ही समय के साथ अपने व्यापक उद्देश्यों की ओर बढ़ता है।",
  "about.s7.h": "कानूनी एवं पंजीकरण जानकारी",
  "about.s7.p": "आधिकारिक पंजीकरण और अनुपालन संबंधी जानकारी (पैन, 12A, 80G, FCRA, CSR पंजीकरण, बैंक विवरण और पते सहित) सत्यापन के बाद यहाँ प्रकाशित की जाएगी।",
  "about.team.title": "हमारी टीम",

  "vol.title": "हमारी सेवा से जुड़ें",
  "vol.subtitle": "स्वयंसेवा के लिए दान ज़रूरी नहीं है — बस थोड़ा समय और मदद करने की इच्छा चाहिए।",
  "vol.options.1": "आयोजन सहयोग",
  "vol.options.2": "शिक्षा",
  "vol.options.3": "सामुदायिक सेवा",
  "vol.options.4": "डिजिटल / तकनीक",
  "vol.options.5": "फ़ोटोग्राफ़ी / मीडिया",
  "vol.options.6": "धन संग्रह में सहयोग",
  "vol.options.7": "क्षेत्रीय गतिविधियाँ",
  "vol.f.name": "पूरा नाम",
  "vol.f.email": "ईमेल",
  "vol.f.phone": "फ़ोन",
  "vol.f.city": "शहर",
  "vol.f.interests": "रुचि के क्षेत्र",
  "vol.f.avail": "उपलब्धता (जैसे सप्ताहांत)",
  "vol.f.msg": "क्या आप हमें कुछ और बताना चाहेंगे?",
  "vol.submit": "आवेदन जमा करें",
  "vol.submitting": "जमा किया जा रहा है…",
  "vol.done.h": "धन्यवाद",
  "vol.done.p": "आपका आवेदन प्राप्त हो गया है। टीम का कोई सदस्य अगले चरणों के बारे में आपसे संपर्क करेगा।",

  "contact.title": "हमसे संपर्क करें",
  "contact.subtitle": "किसी अभियान, दान या स्वयंसेवा के बारे में कोई प्रश्न है? हमसे संपर्क करें।",
  "contact.done": "आपका संदेश प्राप्त हो गया है — हम जल्द ही उत्तर देंगे।",
  "contact.f.name": "पूरा नाम",
  "contact.f.email": "ईमेल",
  "contact.f.phone": "फ़ोन (वैकल्पिक)",
  "contact.f.sub": "विषय",
  "contact.f.msg": "संदेश",
  "contact.submit": "संदेश भेजें",
  "contact.submitting": "भेजा जा रहा है…",

  "gal.title": "गैलरी",
  "gal.subtitle": "पूरे ट्रस्ट के अभियानों, आयोजनों और सेवा के यादगार क्षण।",
  "faq.title": "अक्सर पूछे जाने वाले प्रश्न",
  "legal.lastUpdated": "अंतिम अद्यतन:",

  "terms.title": "उपयोग की शर्तें",
  "terms.s1.h": "प्लेटफ़ॉर्म का उद्देश्य",
  "terms.s1.p": "यह प्लेटफ़ॉर्म व्यवस्थापकों द्वारा संचालित दान और सेवा मंच है। अभियान केवल {brand} के व्यवस्थापकों द्वारा बनाए और प्रकाशित किए जाते हैं।",
  "terms.s2.h": "खाते",
  "terms.s2.p": "अपने खाते की लॉगिन जानकारी को सुरक्षित रखना आपकी ज़िम्मेदारी है। खाता बनाए बिना दान करने के लिए अतिथि चेकआउट उपलब्ध है।",
  "terms.s3.h": "दान",
  "terms.s3.p": "सभी दान हमारे पेमेंट गेटवे के माध्यम से संसाधित किए जाते हैं। दान की पुष्टि तभी होती है जब भुगतान की सर्वर-स्तर पर जाँच हो जाए, केवल आपके ब्राउज़र में सफलता दिखने पर नहीं।",
  "terms.s4.h": "सामग्री",
  "terms.s4.p": "अभियान की सामग्री ट्रस्ट द्वारा उपलब्ध कराई जाती है। हम असत्यापित दावों को तथ्य के रूप में प्रस्तुत नहीं करते।",

  "don.title": "दान नीति",
  "don.s1.h": "दान का उपयोग कैसे किया जाता है",
  "don.s1.p": "उत्पाद-आधारित योगदान (जैसे राशन किट या स्कूल किट) अभियान के लिए उसी विशिष्ट वस्तु पर खर्च होते हैं। अपनी इच्छा से दी गई राशि और सामान्य दान अभियान या ट्रस्ट के सामान्य कोष में सहयोग करते हैं।",
  "don.s2.h": "हम क्या नहीं दिखाते",
  "don.s2.p": "हम जान-बूझकर सार्वजनिक अभियान पृष्ठों पर धन संग्रह के लक्ष्य या जुटाई गई राशि नहीं दिखाते। इसके बजाय, काम आगे बढ़ने के साथ अभियान उपलब्धियाँ, अपडेट और प्रभाव दिखाते हैं।",
  "don.s3.h": "रसीदें",
  "don.s3.p": "हर सफल दान पर एक अपरिवर्तनीय, विशिष्ट क्रमांक वाली रसीद बनती है, जो आपके डैशबोर्ड से डाउनलोड की जा सकती है और ईमेल पर भी भेजी जाती है।",
  "don.s4.h": "कर लाभ",
  "don.s4.p": "कर-छूट की स्थिति केवल उन अभियानों पर दिखाई जाती है जिनके लिए ट्रस्ट ने सेटिंग्स में इसे स्पष्ट रूप से सक्षम किया है — इसे कभी मान नहीं लिया जाता या गढ़ा नहीं जाता।",

  "ref.title": "धनवापसी एवं रद्दीकरण नीति",
  "ref.s1.h": "दान सामान्यतः अंतिम होते हैं",
  "ref.s1.p": "चूँकि योगदान आमतौर पर चल रहे सेवा कार्यों में शीघ्र लगा दिए जाते हैं, इसलिए दान सामान्यतः वापस नहीं किए जाते।",
  "ref.s2.h": "त्रुटियाँ और दोहरे शुल्क",
  "ref.s2.p": "यदि आपको लगता है कि शुल्क गलती से, दो बार या गलत राशि के लिए लिया गया है, तो 7 दिनों के भीतर हमसे संपर्क करें। हम समीक्षा करके उचित मामलों में धनवापसी करेंगे।",
  "ref.s3.h": "धनवापसी कैसे की जाती है",
  "ref.s3.p": "स्वीकृत धनवापसी हमारे पेमेंट गेटवे के माध्यम से मूल भुगतान विधि में लौटाई जाती है। समय आपके बैंक या कार्ड जारीकर्ता पर निर्भर करता है।",

  "priv.title": "गोपनीयता नीति",
  "priv.s1.h": "हम क्या जानकारी लेते हैं",
  "priv.s1.p": "केवल वही जो दान, स्वयंसेवी आवेदन या संपर्क अनुरोध को पूरा करने के लिए ज़रूरी है: नाम, ईमेल, फ़ोन और — केवल कर-रसीद माँगने पर — पता और पैन।",
  "priv.s2.h": "हम इसका उपयोग कैसे करते हैं",
  "priv.s2.p": "रसीदें बनाने, पूछताछ का उत्तर देने और स्वयंसेवी आवेदनों को संसाधित करने के लिए। हम विपणन के उद्देश्य से व्यक्तिगत डेटा किसी तीसरे पक्ष को न बेचते हैं, न साझा करते हैं।",
  "priv.s3.h": "दाताओं की गोपनीयता",
  "priv.s3.p": "दाताओं की पहचान डिफ़ॉल्ट रूप से सार्वजनिक रूप से नहीं दिखाई जाती। गुमनाम रूप से दान करने पर आपका नाम दाताओं की किसी भी सूची में नहीं दिखता।",
  "priv.s4.h": "आपके अधिकार",
  "priv.s4.p": "आप अपने व्यक्तिगत डेटा तक पहुँच, उसमें सुधार या उसे हटाने का अनुरोध कर सकते हैं। पूर्ण हो चुके दानों पर लागू वित्तीय रिकॉर्ड रखने की अनिवार्यताएँ इसके अधीन रहेंगी।",

  "home.giveOnce": "एक बार दान करें",
  "home.upcomingInitiatives": "आगामी पहल",
  "home.followOurJourney": "हमारी यात्रा से जुड़ें",
  "home.watchOurVideos": "हमारे वीडियो देखें",
  "home.step1": "जानें",
  "home.step2": "समझें",
  "home.step3": "चुनें",
  "home.step4": "योगदान दें",
  "home.step5": "प्रभाव देखें",
  "home.hero.title": "सेवा, संस्कार और समाज कल्याण के प्रति एक संकल्प",
  "home.hero.subtitle": "{brand} शिक्षा, स्वास्थ्य सेवा, मानवीय सहायता, सांस्कृतिक संरक्षण, पर्यावरणीय उत्तरदायित्व और समाज की सेवा के दृष्टिकोण की दिशा में कार्य करता है।",
  "home.seva": "हमारे सेवा क्षेत्र",
  "home.seva.subtitle": "उन विविध क्षेत्रों को जानें जहाँ हम समुदाय के उत्थान और सहयोग के लिए अपने प्रयास समर्पित करते हैं।",
  "home.featured": "प्रमुख अभियान",
  "home.viewAll": "सभी देखें",
  "home.howItWorks": "यह कैसे काम करता है",
  "home.monthlyTitle": "हर महीने दान करें",
  "home.monthlyBody": "थोड़ा-सा नियमित योगदान चल रहे सेवा कार्यों को निरंतर सहारा देता है।",
  "home.monthlyCta": "मासिक दान शुरू करें",
  "home.ctaTitle": "हर योगदान किसी को आगे बढ़ाता है।",
  "home.ctaBody": "चाहे एक वक़्त का भोजन हो, स्कूल किट हो या आपका एक घंटा — आज मदद करने का एक तरीका है।",
  "hero.donateNow": "अभी दान करें",
  "hero.joinSeva": "हमारी सेवा से जुड़ें",

  "footer.explore": "खोजें",
  "footer.about": "हमारे बारे में",
  "footer.legal": "कानूनी",
  "footer.ourStory": "हमारी कहानी",
  "footer.transparency": "पारदर्शिता",
  "footer.privacyPolicy": "गोपनीयता नीति",
  "footer.terms": "शर्तें",
  "footer.donationPolicy": "दान नीति",
  "footer.refundPolicy": "धनवापसी नीति",
  "footer.80g": "80G कर छूट",
  "footer.copyright": "ट्रस्ट द्वारा जानकारी उपलब्ध कराए जाने के बाद पंजीकरण और कानूनी विवरण यहाँ दिखाई देंगे।",
  "footer.tagline": "{brand}",

  "home": "होम",
  "about": "हमारे बारे में",
  "donate": "दान करें",
  "shop": "दुकान",
  "campaigns": "अभियान",
  "seva": "सेवा",
  "events": "कार्यक्रम",
  "contact": "संपर्क",
  "people": "लोग",
  "newsletter": "न्यूज़लेटर",
  "transparency": "पारदर्शिता",
  "80g": "80G कर छूट",
  "read_more": "और पढ़ें",
  "learn_more": "और जानें",
  "donate_now": "अभी दान करें",
  "buy_now": "अभी खरीदें",
  "add_to_cart": "कार्ट में जोड़ें",
  "checkout": "चेकआउट",
  "search": "खोजें",
  "login": "लॉग इन करें",
  "register": "रजिस्टर करें",
  "submit": "जमा करें",
  "cancel": "रद्द करें",
  "save": "सहेजें",
  "delete": "हटाएँ",
  "loading___": "लोड हो रहा है...",
  "no_results_found": "कोई परिणाम नहीं मिला",
  "payment_successful": "भुगतान सफल रहा",
  "payment_failed": "भुगतान विफल रहा",
  "invalid_email_address": "अमान्य ईमेल पता",
  "please_enter_your_name": "कृपया अपना नाम दर्ज करें",
  "this_field_is_required": "यह फ़ील्ड आवश्यक है",
  "please_try_again": "कृपया पुनः प्रयास करें",
  "order_placed_successfully": "ऑर्डर सफलतापूर्वक दिया गया",
  "donation_successful": "दान सफल रहा",
  "product_added_to_cart": "उत्पाद कार्ट में जोड़ा गया",
  "your_session_has_expired": "आपका सत्र समाप्त हो गया है",

  "nav.campaigns": "अभियान",
  "nav.events": "हमारी पहल",
  "nav.gallery": "गैलरी",
  "nav.blog": "ब्लॉग",
  "nav.volunteer": "स्वयंसेवक",
  "nav.contact": "संपर्क",
  "nav.login": "लॉगिन",
  "nav.donate": "दान करें",

  "nl.title": "थोड़ी दिव्य प्रेरणा पाएँ",
  "nl.body": "दिव्य सेवा से जुड़े रहें। हमारी ताज़ा कहानियाँ, सेवा अपडेट, आध्यात्मिक विचार, अभियान और बदलाव लाने के सार्थक तरीके सीधे अपने इनबॉक्स में पाएँ।",
  "nl.label": "साप्ताहिक न्यूज़लेटर",
  "nl.f.name": "पूरा नाम *",
  "nl.f.email": "ईमेल पता *",
  "nl.f.city": "शहर / स्थान (वैकल्पिक)",
  "nl.submit": "निःशुल्क सदस्यता लें",
  "nl.footer": "🛡️ 100% निःशुल्क • कोई स्पैम नहीं • किसी भी समय एक क्लिक में सदस्यता छोड़ें।",
  "nl.submitting": "सदस्यता ली जा रही है...",
  "nl.success": "सदस्यता लेने के लिए धन्यवाद!",
};

/* ------------------------------------------------------------------ */
/* Telugu                                                              */
/* ------------------------------------------------------------------ */
const te: Dict = {
  "about.title": "{brand} గురించి",
  "about.subtitle": "{brand}",
  "about.s1.h": "ట్రస్ట్ గురించి",
  "about.s1.p": "{brand} సామాజిక సంక్షేమం, సేవ, విద్య, ఆరోగ్య సంరక్షణ, సాంస్కృతిక పరిరక్షణ, పర్యావరణ బాధ్యత మరియు మానవతా సహాయం అనే విస్తృత దృష్టితో స్థాపించబడింది. విద్య, భారతీయ సంస్కృతి, సంస్కృతం, యోగా, సాంప్రదాయ జ్ఞానం మరియు సామాజిక బాధ్యతను ప్రోత్సహిస్తూ అవసరమైన సమాజాలకు సేవ చేయడం ట్రస్ట్ లక్ష్యాల్లో భాగం.",
  "about.s2.h": "మా దృష్టి",
  "about.s2.p": "సామాజిక సంక్షేమంపై ఆధారపడిన సమాజాన్ని పెంపొందించడం; విద్య, ఆరోగ్య సంరక్షణ, సాంస్కృతిక పరిరక్షణ, పర్యావరణ బాధ్యత, జంతు సంక్షేమం మరియు అవసరమైనప్పుడు తక్షణ మానవతా సహాయం ద్వారా వెనుకబడిన వర్గాలకు సేవ చేయడం.",
  "about.s3.h": "మా లక్ష్యం",
  "about.s3.p1": "సేవ • విద్య • ఆరోగ్య సంరక్షణ",
  "about.s3.p2": "సామాజిక సంక్షేమం • సంస్కృతి",
  "about.s3.p3": "పర్యావరణ పరిరక్షణ • గో మరియు జంతు సేవ",
  "about.s3.p4": "ఆత్మనిర్భరత • మానవతా సహాయం",
  "about.s4.h": "వ్యవస్థాపకుడు / అధ్యక్షుడు",
  "about.s4.p1": "శ్రీ నిత్యానంద్ పాండే",
  "about.s4.p2": "వ్యవస్థాపకుడు / అధ్యక్షుడు",
  "about.s5.h": "మా లక్ష్యాలు",
  "about.s5.p": "ట్రస్ట్ డీడ్ విస్తృతమైన స్వచ్ఛంద, సామాజిక, విద్య, ఆరోగ్య, సాంస్కృతిక, పర్యావరణ మరియు మానవతా లక్ష్యాలను నిర్దేశిస్తుంది.",
  "about.s5.btn": "సేవా రంగాలను చూడండి",
  "about.s6.h": "ప్రస్తుత కార్యకలాపాలు",
  "about.s6.p": "ట్రస్ట్ ధృవీకరించి ప్రచురించిన కార్యకలాపాలు మాత్రమే ఇక్కడ కనిపిస్తాయి. కాలక్రమేణా విస్తృత లక్ష్యాల వైపు పనిచేస్తూనే, ట్రస్ట్ తన తక్షణ వనరులను అత్యంత అత్యవసర అవసరాలపై కేంద్రీకరిస్తుంది.",
  "about.s7.h": "చట్టపరమైన & నమోదు సమాచారం",
  "about.s7.p": "అధికారిక నమోదు మరియు సమ్మతి సమాచారం (PAN, 12A, 80G, FCRA, CSR నమోదు, బ్యాంక్ వివరాలు మరియు చిరునామాతో సహా) ధృవీకరణ తర్వాత ఇక్కడ ప్రచురించబడుతుంది.",
  "about.team.title": "మా బృందం",

  "vol.title": "మా సేవలో చేరండి",
  "vol.subtitle": "స్వచ్ఛంద సేవకు విరాళం ఇవ్వాల్సిన అవసరం లేదు — మీ కొంత సమయం మరియు సహాయం చేయాలనే మనసు చాలు.",
  "vol.options.1": "ఈవెంట్ సహాయం",
  "vol.options.2": "విద్య",
  "vol.options.3": "సమాజ సేవ",
  "vol.options.4": "డిజిటల్ / సాంకేతికత",
  "vol.options.5": "ఫోటోగ్రఫీ / మీడియా",
  "vol.options.6": "నిధుల సేకరణ సహాయం",
  "vol.options.7": "క్షేత్ర కార్యకలాపాలు",
  "vol.f.name": "పూర్తి పేరు",
  "vol.f.email": "ఇమెయిల్",
  "vol.f.phone": "ఫోన్",
  "vol.f.city": "నగరం",
  "vol.f.interests": "ఆసక్తి ఉన్న రంగాలు",
  "vol.f.avail": "అందుబాటు (ఉదా. వారాంతాల్లో)",
  "vol.f.msg": "మేము తెలుసుకోవాల్సిన మరేదైనా ఉందా?",
  "vol.submit": "దరఖాస్తు సమర్పించండి",
  "vol.submitting": "సమర్పిస్తోంది…",
  "vol.done.h": "ధన్యవాదాలు",
  "vol.done.p": "మీ దరఖాస్తు అందింది. తదుపరి దశల గురించి బృంద సభ్యుడు మిమ్మల్ని సంప్రదిస్తారు.",

  "contact.title": "మమ్మల్ని సంప్రదించండి",
  "contact.subtitle": "ప్రచారం, విరాళం లేదా స్వచ్ఛంద సేవ గురించి ప్రశ్నలు ఉన్నాయా? మమ్మల్ని సంప్రదించండి.",
  "contact.done": "మీ సందేశం అందింది — త్వరలో స్పందిస్తాము.",
  "contact.f.name": "పూర్తి పేరు",
  "contact.f.email": "ఇమెయిల్",
  "contact.f.phone": "ఫోన్ (ఐచ్ఛికం)",
  "contact.f.sub": "విషయం",
  "contact.f.msg": "సందేశం",
  "contact.submit": "సందేశం పంపండి",
  "contact.submitting": "పంపుతోంది…",

  "gal.title": "గ్యాలరీ",
  "gal.subtitle": "ట్రస్ట్ ప్రచారాలు, కార్యక్రమాలు మరియు సేవలోని మధుర క్షణాలు.",
  "faq.title": "తరచుగా అడిగే ప్రశ్నలు",
  "legal.lastUpdated": "చివరి నవీకరణ:",

  "terms.title": "వినియోగ నిబంధనలు",
  "terms.s1.h": "వేదిక ఉద్దేశ్యం",
  "terms.s1.p": "ఇది నిర్వాహకులచే నిర్వహించబడే విరాళం మరియు సేవా వేదిక. ప్రచారాలు {brand} నిర్వాహకులచే మాత్రమే సృష్టించబడి ప్రచురించబడతాయి.",
  "terms.s2.h": "ఖాతాలు",
  "terms.s2.p": "మీ ఖాతా వివరాలను సురక్షితంగా ఉంచుకోవడం మీ బాధ్యత. ఖాతా సృష్టించకుండానే విరాళాల కోసం గెస్ట్ చెక్అవుట్ అందుబాటులో ఉంది.",
  "terms.s3.h": "విరాళాలు",
  "terms.s3.p": "అన్ని విరాళాలు మా పేమెంట్ గేట్‌వే ద్వారా ప్రాసెస్ చేయబడతాయి. మీ బ్రౌజర్ విజయాన్ని చూపించడం వల్ల కాదు, సర్వర్ వైపు చెల్లింపు ధృవీకరించబడిన తర్వాతే విరాళం నిర్ధారించబడుతుంది.",
  "terms.s4.h": "కంటెంట్",
  "terms.s4.p": "ప్రచార కంటెంట్‌ను ట్రస్ట్ అందిస్తుంది. ధృవీకరించలేని వాదనలను మేము వాస్తవాలుగా చూపించము.",

  "don.title": "విరాళం విధానం",
  "don.s1.h": "విరాళాలు ఎలా ఉపయోగించబడతాయి",
  "don.s1.p": "ఉత్పత్తి ఆధారిత విరాళాలు (ఉదా. రేషన్ కిట్ లేదా స్కూల్ కిట్) ప్రచారం కోసం ఆ నిర్దిష్ట వస్తువుకే ఉపయోగించబడతాయి. మీరు ఇచ్చే ఇతర మొత్తాలు మరియు సాధారణ విరాళాలు ప్రచారానికి లేదా ట్రస్ట్ సాధారణ నిధికి మద్దతు ఇస్తాయి.",
  "don.s2.h": "మేము చూపించనివి",
  "don.s2.p": "ప్రజలకు కనిపించే ప్రచార పేజీలలో నిధుల లక్ష్యాలను లేదా సేకరించిన మొత్తాలను మేము ఉద్దేశపూర్వకంగా చూపించము. బదులుగా, పని పురోగమిస్తున్న కొద్దీ మైలురాళ్లు, అప్‌డేట్‌లు మరియు ప్రభావాన్ని చూపుతాము.",
  "don.s3.h": "రసీదులు",
  "don.s3.p": "ప్రతి విజయవంతమైన విరాళానికి మార్చలేని, ప్రత్యేక సంఖ్యతో కూడిన రసీదు ఉత్పత్తి అవుతుంది; దీన్ని మీ డ్యాష్‌బోర్డ్ నుండి డౌన్‌లోడ్ చేసుకోవచ్చు మరియు ఇమెయిల్ ద్వారా కూడా పంపబడుతుంది.",
  "don.s4.h": "పన్ను ప్రయోజనాలు",
  "don.s4.p": "ట్రస్ట్ సెట్టింగ్‌లలో స్పష్టంగా ప్రారంభించిన ప్రచారాలలో మాత్రమే పన్ను మినహాయింపు స్థితి చూపబడుతుంది — దీనిని ఎప్పుడూ ఊహించము లేదా కల్పించము.",

  "ref.title": "వాపసు & రద్దు విధానం",
  "ref.s1.h": "విరాళాలు సాధారణంగా అంతిమమైనవి",
  "ref.s1.p": "విరాళాలు సాధారణంగా కొనసాగుతున్న సేవా పనులకు త్వరగా కేటాయించబడతాయి కాబట్టి, అవి సాధారణంగా తిరిగి చెల్లించబడవు.",
  "ref.s2.h": "పొరపాట్లు మరియు రెండుసార్లు చార్జీలు",
  "ref.s2.p": "పొరపాటున, రెండుసార్లు లేదా తప్పు మొత్తానికి చార్జ్ చేయబడిందని మీరు భావిస్తే, 7 రోజులలోపు మమ్మల్ని సంప్రదించండి. మేము సమీక్షించి, తగిన సందర్భాలలో వాపసు ఇస్తాము.",
  "ref.s3.h": "వాపసు ఎలా ప్రాసెస్ చేయబడుతుంది",
  "ref.s3.p": "ఆమోదించబడిన వాపసులు మా పేమెంట్ గేట్‌వే ద్వారా అసలు చెల్లింపు పద్ధతికే తిరిగి జమ చేయబడతాయి. సమయం మీ బ్యాంక్ లేదా కార్డ్ జారీదారుపై ఆధారపడి ఉంటుంది.",

  "priv.title": "గోప్యతా విధానం",
  "priv.s1.h": "మేము ఏమి సేకరిస్తాము",
  "priv.s1.p": "విరాళం, వాలంటీర్ దరఖాస్తు లేదా సంప్రదింపు అభ్యర్థనను ప్రాసెస్ చేయడానికి అవసరమైనవి మాత్రమే: పేరు, ఇమెయిల్, ఫోన్ మరియు — పన్ను రసీదు కోరినప్పుడు మాత్రమే — చిరునామా మరియు పాన్.",
  "priv.s2.h": "మేము దీన్ని ఎలా ఉపయోగిస్తాము",
  "priv.s2.p": "రసీదులు రూపొందించడానికి, విచారణలకు స్పందించడానికి మరియు వాలంటీర్ దరఖాస్తులను ప్రాసెస్ చేయడానికి. మార్కెటింగ్ కోసం వ్యక్తిగత డేటాను మేము మూడవ పక్షాలకు అమ్మము లేదా పంచుకోము.",
  "priv.s3.h": "దాతల గోప్యత",
  "priv.s3.p": "దాతల గుర్తింపు డిఫాల్ట్‌గా బహిరంగంగా చూపబడదు. అనామకంగా విరాళం ఇస్తే, దాతల జాబితాలో మీ పేరు పూర్తిగా కనిపించదు.",
  "priv.s4.h": "మీ హక్కులు",
  "priv.s4.p": "మీ వ్యక్తిగత డేటాను చూడటానికి, సరిచేయడానికి లేదా తొలగించడానికి మీరు అభ్యర్థించవచ్చు; పూర్తయిన విరాళాలకు వర్తించే ఆర్థిక రికార్డుల నిర్వహణ అవసరాలకు ఇది లోబడి ఉంటుంది.",

  "home.giveOnce": "ఒకసారి విరాళం ఇవ్వండి",
  "home.upcomingInitiatives": "రాబోయే కార్యక్రమాలు",
  "home.followOurJourney": "మా ప్రయాణాన్ని అనుసరించండి",
  "home.watchOurVideos": "మా వీడియోలు చూడండి",
  "home.step1": "తెలుసుకోండి",
  "home.step2": "అర్థం చేసుకోండి",
  "home.step3": "ఎంచుకోండి",
  "home.step4": "సహకరించండి",
  "home.step5": "ప్రభావం చూడండి",
  "home.hero.title": "సేవ, సంస్కృతి మరియు సామాజిక సంక్షేమానికి ఒక నిబద్ధత",
  "home.hero.subtitle": "{brand} విద్య, ఆరోగ్య సంరక్షణ, మానవతా సహాయం, సాంస్కృతిక పరిరక్షణ, పర్యావరణ బాధ్యత మరియు సమాజ సేవతో కూడిన దృష్టి కోసం కృషి చేస్తుంది.",
  "home.seva": "మా సేవా రంగాలు",
  "home.seva.subtitle": "సమాజ అభ్యున్నతికి మరియు మద్దతుకు మేము కృషి చేసే విభిన్న రంగాలను తెలుసుకోండి.",
  "home.featured": "ప్రముఖ ప్రచారాలు",
  "home.viewAll": "అన్నీ చూడండి",
  "home.howItWorks": "ఇది ఎలా పనిచేస్తుంది",
  "home.monthlyTitle": "ప్రతి నెలా విరాళం ఇవ్వండి",
  "home.monthlyBody": "క్రమం తప్పని చిన్న విరాళం కొనసాగుతున్న సేవా కార్యక్రమాలకు స్థిరమైన మద్దతునిస్తుంది.",
  "home.monthlyCta": "నెలవారీ విరాళం ప్రారంభించండి",
  "home.ctaTitle": "ప్రతి విరాళం ఒకరిని ముందుకు నడిపిస్తుంది.",
  "home.ctaBody": "ఒక పూట భోజనమైనా, స్కూల్ కిట్ అయినా, లేదా మీ ఒక గంట సమయమైనా — ఈరోజే సహాయం చేసే మార్గం ఉంది.",
  "hero.donateNow": "ఇప్పుడే విరాళం ఇవ్వండి",
  "hero.joinSeva": "మా సేవలో చేరండి",

  "footer.explore": "అన్వేషించండి",
  "footer.about": "మా గురించి",
  "footer.legal": "చట్టపరమైన",
  "footer.ourStory": "మా కథ",
  "footer.transparency": "పారదర్శకత",
  "footer.privacyPolicy": "గోప్యతా విధానం",
  "footer.terms": "నిబంధనలు",
  "footer.donationPolicy": "విరాళం విధానం",
  "footer.refundPolicy": "వాపసు విధానం",
  "footer.80g": "80G పన్ను మినహాయింపు",
  "footer.copyright": "ట్రస్ట్ వివరాలు అందించిన తర్వాత నమోదు మరియు చట్టపరమైన వివరాలు ఇక్కడ కనిపిస్తాయి.",
  "footer.tagline": "{brand}",

  "home": "హోమ్",
  "about": "మా గురించి",
  "donate": "విరాళం ఇవ్వండి",
  "shop": "షాప్",
  "campaigns": "ప్రచారాలు",
  "seva": "సేవ",
  "events": "కార్యక్రమాలు",
  "contact": "సంప్రదించండి",
  "people": "ప్రజలు",
  "newsletter": "న్యూస్‌లెటర్",
  "transparency": "పారదర్శకత",
  "80g": "80G పన్ను మినహాయింపు",
  "read_more": "మరింత చదవండి",
  "learn_more": "మరింత తెలుసుకోండి",
  "donate_now": "ఇప్పుడే విరాళం ఇవ్వండి",
  "buy_now": "ఇప్పుడే కొనండి",
  "add_to_cart": "కార్ట్‌కు జోడించండి",
  "checkout": "చెక్అవుట్",
  "search": "వెతకండి",
  "login": "లాగిన్",
  "register": "నమోదు చేసుకోండి",
  "submit": "సమర్పించండి",
  "cancel": "రద్దు చేయండి",
  "save": "సేవ్ చేయండి",
  "delete": "తొలగించండి",
  "loading___": "లోడ్ అవుతోంది...",
  "no_results_found": "ఫలితాలు కనబడలేదు",
  "payment_successful": "చెల్లింపు విజయవంతమైంది",
  "payment_failed": "చెల్లింపు విఫలమైంది",
  "invalid_email_address": "చెల్లని ఇమెయిల్ చిరునామా",
  "please_enter_your_name": "దయచేసి మీ పేరు నమోదు చేయండి",
  "this_field_is_required": "ఈ ఫీల్డ్ తప్పనిసరి",
  "please_try_again": "దయచేసి మళ్లీ ప్రయత్నించండి",
  "order_placed_successfully": "ఆర్డర్ విజయవంతంగా ఇవ్వబడింది",
  "donation_successful": "విరాళం విజయవంతమైంది",
  "product_added_to_cart": "ఉత్పత్తి కార్ట్‌కు జోడించబడింది",
  "your_session_has_expired": "మీ సెషన్ గడువు ముగిసింది",

  "nav.campaigns": "ప్రచారాలు",
  "nav.events": "మా కార్యక్రమాలు",
  "nav.gallery": "గ్యాలరీ",
  "nav.blog": "బ్లాగ్",
  "nav.volunteer": "వాలంటీర్",
  "nav.contact": "సంప్రదించండి",
  "nav.login": "లాగిన్",
  "nav.donate": "విరాళం",

  "nl.title": "కొంచెం దివ్య స్ఫూర్తిని పొందండి",
  "nl.body": "దివ్య సేవతో అనుసంధానమై ఉండండి. మా తాజా కథనాలు, సేవా అప్‌డేట్‌లు, ఆధ్యాత్మిక విశేషాలు, ప్రచారాలు మరియు మార్పు తెచ్చే మార్గాలను నేరుగా మీ ఇన్‌బాక్స్‌లో పొందండి.",
  "nl.label": "వారపు న్యూస్‌లెటర్",
  "nl.f.name": "పూర్తి పేరు *",
  "nl.f.email": "ఇమెయిల్ చిరునామా *",
  "nl.f.city": "నగరం / ప్రదేశం (ఐచ్ఛికం)",
  "nl.submit": "ఉచితంగా సబ్‌స్క్రైబ్ అవ్వండి",
  "nl.footer": "🛡️ 100% ఉచితం • స్పామ్ లేదు • ఎప్పుడైనా ఒక్క క్లిక్‌తో అన్‌సబ్‌స్క్రైబ్ అవ్వండి.",
  "nl.submitting": "సబ్‌స్క్రైబ్ అవుతోంది...",
  "nl.success": "సబ్‌స్క్రైబ్ చేసినందుకు ధన్యవాదాలు!",
};

/* ------------------------------------------------------------------ */
/* Tamil                                                               */
/* ------------------------------------------------------------------ */
const ta: Dict = {
  "about.title": "{brand} பற்றி",
  "about.subtitle": "{brand}",
  "about.s1.h": "அறக்கட்டளை பற்றி",
  "about.s1.p": "{brand} சமூக நலன், சேவை, கல்வி, சுகாதாரம், கலாச்சாரப் பாதுகாப்பு, சுற்றுச்சூழல் பொறுப்பு மற்றும் மனிதாபிமான உதவி என்ற பரந்த நோக்குடன் நிறுவப்பட்டது. கல்வி, இந்தியக் கலாச்சாரம், சமஸ்கிருதம், யோகா, பாரம்பரிய அறிவு மற்றும் சமூகப் பொறுப்பை ஊக்குவித்தவாறே, தேவையுள்ள சமூகங்களுக்குச் சேவை செய்வது அறக்கட்டளையின் நோக்கங்களில் அடங்கும்.",
  "about.s2.h": "எங்கள் தொலைநோக்கு",
  "about.s2.p": "சமூக நலனை அடிப்படையாகக் கொண்ட சமூகத்தை உருவாக்குவது; கல்வி, சுகாதாரம், கலாச்சாரப் பாதுகாப்பு, சுற்றுச்சூழல் பொறுப்பு, விலங்கு நலன் மற்றும் தேவைப்படும்போது உடனடி மனிதாபிமான உதவி மூலம் பின்தங்கிய சமூகங்களுக்குச் சேவை செய்வது.",
  "about.s3.h": "எங்கள் பணி",
  "about.s3.p1": "சேவை • கல்வி • சுகாதாரம்",
  "about.s3.p2": "சமூக நலன் • கலாச்சாரம்",
  "about.s3.p3": "சுற்றுச்சூழல் பாதுகாப்பு • பசு மற்றும் விலங்கு சேவை",
  "about.s3.p4": "தற்சார்பு • மனிதாபிமான உதவி",
  "about.s4.h": "நிறுவனர் / தலைவர்",
  "about.s4.p1": "ஸ்ரீ நித்யானந்த் பாண்டே",
  "about.s4.p2": "நிறுவனர் / தலைவர்",
  "about.s5.h": "எங்கள் நோக்கங்கள்",
  "about.s5.p": "அறக்கட்டளைப் பத்திரம் பரந்த அளவிலான தொண்டு, சமூக, கல்வி, சுகாதார, கலாச்சார, சுற்றுச்சூழல் மற்றும் மனிதாபிமான நோக்கங்களை வகுக்கிறது.",
  "about.s5.btn": "சேவைப் பகுதிகளைக் காண்க",
  "about.s6.h": "தற்போதைய செயல்பாடுகள்",
  "about.s6.p": "அறக்கட்டளை உறுதிப்படுத்தி வெளியிட்ட செயல்பாடுகள் மட்டுமே இங்கே தோன்றும். காலப்போக்கில் தனது பரந்த நோக்கங்களை நோக்கிச் செயல்படும் அதே நேரத்தில், அறக்கட்டளை தனது உடனடி வளங்களை மிக அவசரத் தேவைகளில் செலுத்துகிறது.",
  "about.s7.h": "சட்ட & பதிவுத் தகவல்",
  "about.s7.p": "அதிகாரப்பூர்வ பதிவு மற்றும் இணக்கத் தகவல்கள் (PAN, 12A, 80G, FCRA, CSR பதிவு, வங்கி விவரங்கள் மற்றும் முகவரி உட்பட) சரிபார்ப்புக்குப் பிறகு இங்கே வெளியிடப்படும்.",
  "about.team.title": "எங்கள் குழு",

  "vol.title": "எங்கள் சேவையில் இணையுங்கள்",
  "vol.subtitle": "தன்னார்வத் தொண்டுக்கு நன்கொடை தேவையில்லை — உங்கள் சிறிது நேரமும் உதவ வேண்டும் என்ற மனமும் போதும்.",
  "vol.options.1": "நிகழ்வு ஆதரவு",
  "vol.options.2": "கல்வி",
  "vol.options.3": "சமூக சேவை",
  "vol.options.4": "டிஜிட்டல் / தொழில்நுட்பம்",
  "vol.options.5": "புகைப்படம் / ஊடகம்",
  "vol.options.6": "நிதி திரட்ட உதவி",
  "vol.options.7": "களப் பணிகள்",
  "vol.f.name": "முழுப் பெயர்",
  "vol.f.email": "மின்னஞ்சல்",
  "vol.f.phone": "தொலைபேசி",
  "vol.f.city": "நகரம்",
  "vol.f.interests": "ஆர்வமுள்ள துறைகள்",
  "vol.f.avail": "கிடைக்கும் நேரம் (எ.கா. வார இறுதி)",
  "vol.f.msg": "நாங்கள் தெரிந்துகொள்ள வேண்டிய வேறு ஏதேனும் உள்ளதா?",
  "vol.submit": "விண்ணப்பத்தைச் சமர்ப்பிக்கவும்",
  "vol.submitting": "சமர்ப்பிக்கப்படுகிறது…",
  "vol.done.h": "நன்றி",
  "vol.done.p": "உங்கள் விண்ணப்பம் பெறப்பட்டது. அடுத்த படிகள் குறித்துக் குழு உறுப்பினர் ஒருவர் உங்களைத் தொடர்புகொள்வார்.",

  "contact.title": "எங்களைத் தொடர்புகொள்ளுங்கள்",
  "contact.subtitle": "பிரச்சாரம், நன்கொடை அல்லது தன்னார்வத் தொண்டு குறித்துக் கேள்விகள் உள்ளனவா? எங்களைத் தொடர்புகொள்ளுங்கள்.",
  "contact.done": "உங்கள் செய்தி பெறப்பட்டது — விரைவில் பதிலளிப்போம்.",
  "contact.f.name": "முழுப் பெயர்",
  "contact.f.email": "மின்னஞ்சல்",
  "contact.f.phone": "தொலைபேசி (விருப்பத்திற்குரியது)",
  "contact.f.sub": "பொருள்",
  "contact.f.msg": "செய்தி",
  "contact.submit": "செய்தி அனுப்பு",
  "contact.submitting": "அனுப்பப்படுகிறது…",

  "gal.title": "படத்தொகுப்பு",
  "gal.subtitle": "அறக்கட்டளையின் பிரச்சாரங்கள், நிகழ்வுகள் மற்றும் சேவையின் நினைவுகள்.",
  "faq.title": "அடிக்கடி கேட்கப்படும் கேள்விகள்",
  "legal.lastUpdated": "கடைசியாகப் புதுப்பிக்கப்பட்டது:",

  "terms.title": "பயன்பாட்டு விதிமுறைகள்",
  "terms.s1.h": "தளத்தின் நோக்கம்",
  "terms.s1.p": "இது நிர்வாகிகளால் நிர்வகிக்கப்படும் நன்கொடை மற்றும் சேவைத் தளம். பிரச்சாரங்கள் {brand} நிர்வாகிகளால் மட்டுமே உருவாக்கப்பட்டு வெளியிடப்படுகின்றன.",
  "terms.s2.h": "கணக்குகள்",
  "terms.s2.p": "உங்கள் கணக்கு விவரங்களைப் பாதுகாப்பாக வைத்திருப்பது உங்கள் பொறுப்பு. கணக்கு உருவாக்காமலேயே நன்கொடை அளிக்க விருந்தினர் செக்அவுட் உள்ளது.",
  "terms.s3.h": "நன்கொடைகள்",
  "terms.s3.p": "அனைத்து நன்கொடைகளும் எங்கள் பேமெண்ட் கேட்வே மூலம் செயலாக்கப்படுகின்றன. உங்கள் உலாவியில் வெற்றி எனக் காட்டப்படுவதால் அல்ல, சர்வர் தரப்பில் பணம் சரிபார்க்கப்பட்ட பின்பே நன்கொடை உறுதிசெய்யப்படும்.",
  "terms.s4.h": "உள்ளடக்கம்",
  "terms.s4.p": "பிரச்சார உள்ளடக்கத்தை அறக்கட்டளை வழங்குகிறது. சரிபார்க்க முடியாத கூற்றுகளை நாங்கள் உண்மையாக முன்வைப்பதில்லை.",

  "don.title": "நன்கொடைக் கொள்கை",
  "don.s1.h": "நன்கொடைகள் எவ்வாறு பயன்படுத்தப்படுகின்றன",
  "don.s1.p": "பொருள் சார்ந்த பங்களிப்புகள் (எ.கா. ரேஷன் கிட் அல்லது பள்ளி கிட்) பிரச்சாரத்தில் அந்தக் குறிப்பிட்ட பொருளுக்கே செலவிடப்படும். நீங்கள் விரும்பும் தொகைகளும் பொது நன்கொடைகளும் பிரச்சாரத்தையோ அறக்கட்டளையின் பொது நிதியையோ ஆதரிக்கும்.",
  "don.s2.h": "நாங்கள் காட்டாதவை",
  "don.s2.p": "பொதுப் பிரச்சாரப் பக்கங்களில் நிதி திரட்டும் இலக்குகளையோ திரட்டிய தொகையையோ நாங்கள் வேண்டுமென்றே காட்டுவதில்லை. அதற்குப் பதிலாக, பணி முன்னேறும்போது மைல்கற்கள், புதுப்பிப்புகள் மற்றும் தாக்கத்தைக் காட்டுகிறோம்.",
  "don.s3.h": "ரசீதுகள்",
  "don.s3.p": "ஒவ்வொரு வெற்றிகரமான நன்கொடைக்கும் மாற்ற முடியாத, தனித்துவமான எண் கொண்ட ரசீது உருவாக்கப்படும்; அதை உங்கள் டாஷ்போர்டிலிருந்து பதிவிறக்கலாம், மின்னஞ்சலிலும் அனுப்பப்படும்.",
  "don.s4.h": "வரிச் சலுகைகள்",
  "don.s4.p": "அறக்கட்டளை அமைப்புகளில் வெளிப்படையாக இயக்கிய பிரச்சாரங்களில் மட்டுமே வரி விலக்கு நிலை காட்டப்படும் — அது ஒருபோதும் ஊகிக்கப்படவோ கற்பனை செய்யப்படவோ மாட்டாது.",

  "ref.title": "பணத்திருப்பம் & ரத்துக் கொள்கை",
  "ref.s1.h": "நன்கொடைகள் பொதுவாக இறுதியானவை",
  "ref.s1.p": "பங்களிப்புகள் பொதுவாக நடைபெறும் சேவைப் பணிகளுக்கு விரைவாக ஒதுக்கப்படுவதால், நன்கொடைகள் பொதுவாகத் திருப்பித் தரப்படுவதில்லை.",
  "ref.s2.h": "பிழைகள் மற்றும் இரட்டைக் கட்டணங்கள்",
  "ref.s2.p": "தவறுதலாக, இருமுறை அல்லது தவறான தொகைக்குக் கட்டணம் பிடிக்கப்பட்டதாக நீங்கள் கருதினால், 7 நாட்களுக்குள் எங்களைத் தொடர்புகொள்ளுங்கள். மதிப்பாய்வு செய்து, பொருத்தமான இடங்களில் பணத்தைத் திருப்பித் தருவோம்.",
  "ref.s3.h": "பணத்திருப்பம் எவ்வாறு செயலாக்கப்படுகிறது",
  "ref.s3.p": "அங்கீகரிக்கப்பட்ட பணத்திருப்பங்கள் எங்கள் பேமெண்ட் கேட்வே மூலம் அசல் பணம் செலுத்திய முறைக்கே திருப்பி அனுப்பப்படும். நேரம் உங்கள் வங்கி அல்லது கார்டு வழங்குநரைப் பொறுத்தது.",

  "priv.title": "தனியுரிமைக் கொள்கை",
  "priv.s1.h": "நாங்கள் எதைச் சேகரிக்கிறோம்",
  "priv.s1.p": "நன்கொடை, தன்னார்வ விண்ணப்பம் அல்லது தொடர்புக் கோரிக்கையைச் செயலாக்கத் தேவையானவை மட்டும்: பெயர், மின்னஞ்சல், தொலைபேசி, மற்றும் — வரி ரசீது கோரினால் மட்டும் — முகவரி மற்றும் பான்.",
  "priv.s2.h": "இதை எவ்வாறு பயன்படுத்துகிறோம்",
  "priv.s2.p": "ரசீதுகளை உருவாக்க, விசாரணைகளுக்குப் பதிலளிக்க மற்றும் தன்னார்வ விண்ணப்பங்களைச் செயலாக்க. சந்தைப்படுத்தும் நோக்கத்திற்காக தனிப்பட்ட தரவை மூன்றாம் தரப்பினருக்கு நாங்கள் விற்கவோ பகிரவோ மாட்டோம்.",
  "priv.s3.h": "நன்கொடையாளர் தனியுரிமை",
  "priv.s3.p": "நன்கொடையாளர்களின் அடையாளங்கள் இயல்பாகப் பொதுவில் காட்டப்படுவதில்லை. அநாமதேயமாக நன்கொடை அளித்தால், நன்கொடையாளர் பட்டியலில் உங்கள் பெயர் முழுமையாக மறைக்கப்படும்.",
  "priv.s4.h": "உங்கள் உரிமைகள்",
  "priv.s4.p": "உங்கள் தனிப்பட்ட தரவை அணுக, திருத்த அல்லது நீக்கக் கோரலாம்; நிறைவடைந்த நன்கொடைகளுக்குப் பொருந்தும் நிதிப் பதிவு பராமரிப்புத் தேவைகளுக்கு இது உட்பட்டது.",

  "home.giveOnce": "ஒருமுறை வழங்குங்கள்",
  "home.upcomingInitiatives": "வரவிருக்கும் முயற்சிகள்",
  "home.followOurJourney": "எங்கள் பயணத்தைப் பின்தொடருங்கள்",
  "home.watchOurVideos": "எங்கள் காணொளிகளைப் பாருங்கள்",
  "home.step1": "அறியுங்கள்",
  "home.step2": "புரிந்துகொள்ளுங்கள்",
  "home.step3": "தேர்ந்தெடுங்கள்",
  "home.step4": "பங்களியுங்கள்",
  "home.step5": "தாக்கத்தைப் பாருங்கள்",
  "home.hero.title": "சேவை, கலாச்சாரம் மற்றும் சமூக நலனுக்கான உறுதிப்பாடு",
  "home.hero.subtitle": "{brand} கல்வி, சுகாதாரம், மனிதாபிமான உதவி, கலாச்சாரப் பாதுகாப்பு, சுற்றுச்சூழல் பொறுப்பு மற்றும் சமூகச் சேவை ஆகியவற்றை உள்ளடக்கிய நோக்கத்தை நோக்கிச் செயல்படுகிறது.",
  "home.seva": "எங்கள் சேவைப் பகுதிகள்",
  "home.seva.subtitle": "சமூகத்தை உயர்த்தவும் ஆதரிக்கவும் நாங்கள் எங்கள் முயற்சிகளை அர்ப்பணிக்கும் பல்வேறு துறைகளை அறியுங்கள்.",
  "home.featured": "சிறப்புப் பிரச்சாரங்கள்",
  "home.viewAll": "அனைத்தையும் காண்க",
  "home.howItWorks": "இது எவ்வாறு செயல்படுகிறது",
  "home.monthlyTitle": "ஒவ்வொரு மாதமும் வழங்குங்கள்",
  "home.monthlyBody": "ஒரு சிறிய தொடர் பங்களிப்பு, நடைபெறும் சேவைப் பணிகளுக்கு நிலையான ஆதரவை அளிக்கிறது.",
  "home.monthlyCta": "மாதாந்திர நன்கொடையைத் தொடங்குங்கள்",
  "home.ctaTitle": "ஒவ்வொரு பங்களிப்பும் ஒருவரை முன்னேற்றுகிறது.",
  "home.ctaBody": "ஒரு வேளை உணவோ, பள்ளி கிட்டோ, அல்லது உங்கள் ஒரு மணி நேரமோ — இன்றே உதவ ஒரு வழி உள்ளது.",
  "hero.donateNow": "இப்போதே நன்கொடை அளியுங்கள்",
  "hero.joinSeva": "எங்கள் சேவையில் இணையுங்கள்",

  "footer.explore": "ஆராயுங்கள்",
  "footer.about": "எங்களைப் பற்றி",
  "footer.legal": "சட்டம்",
  "footer.ourStory": "எங்கள் கதை",
  "footer.transparency": "வெளிப்படைத்தன்மை",
  "footer.privacyPolicy": "தனியுரிமைக் கொள்கை",
  "footer.terms": "விதிமுறைகள்",
  "footer.donationPolicy": "நன்கொடைக் கொள்கை",
  "footer.refundPolicy": "பணத்திருப்பக் கொள்கை",
  "footer.80g": "80G வரி விலக்கு",
  "footer.copyright": "அறக்கட்டளை விவரங்களை வழங்கிய பின் பதிவு மற்றும் சட்ட விவரங்கள் இங்கே தோன்றும்.",
  "footer.tagline": "{brand}",

  "home": "முகப்பு",
  "about": "எங்களைப் பற்றி",
  "donate": "நன்கொடை அளிக்கவும்",
  "shop": "கடை",
  "campaigns": "பிரச்சாரங்கள்",
  "seva": "சேவை",
  "events": "நிகழ்வுகள்",
  "contact": "தொடர்புக்கு",
  "people": "மக்கள்",
  "newsletter": "செய்திமடல்",
  "transparency": "வெளிப்படைத்தன்மை",
  "80g": "80G வரி விலக்கு",
  "read_more": "மேலும் படிக்க",
  "learn_more": "மேலும் அறிக",
  "donate_now": "இப்போதே நன்கொடை அளியுங்கள்",
  "buy_now": "இப்போதே வாங்குங்கள்",
  "add_to_cart": "கூடையில் சேர்",
  "checkout": "பணம் செலுத்து",
  "search": "தேடு",
  "login": "உள்நுழை",
  "register": "பதிவு செய்",
  "submit": "சமர்ப்பி",
  "cancel": "ரத்து செய்",
  "save": "சேமி",
  "delete": "நீக்கு",
  "loading___": "ஏற்றப்படுகிறது...",
  "no_results_found": "முடிவுகள் எதுவும் இல்லை",
  "payment_successful": "பணம் செலுத்துதல் வெற்றி",
  "payment_failed": "பணம் செலுத்துதல் தோல்வி",
  "invalid_email_address": "தவறான மின்னஞ்சல் முகவரி",
  "please_enter_your_name": "உங்கள் பெயரை உள்ளிடுக",
  "this_field_is_required": "இந்தப் புலம் அவசியம்",
  "please_try_again": "மீண்டும் முயலுங்கள்",
  "order_placed_successfully": "ஆர்டர் வெற்றிகரமாகப் பதிவானது",
  "donation_successful": "நன்கொடை வெற்றிகரமாக முடிந்தது",
  "product_added_to_cart": "பொருள் கூடையில் சேர்க்கப்பட்டது",
  "your_session_has_expired": "உங்கள் அமர்வு காலாவதியாகிவிட்டது",

  "nav.campaigns": "பிரச்சாரங்கள்",
  "nav.events": "எங்கள் முயற்சிகள்",
  "nav.gallery": "படத்தொகுப்பு",
  "nav.blog": "வலைப்பதிவு",
  "nav.volunteer": "தன்னார்வலர்",
  "nav.contact": "தொடர்புக்கு",
  "nav.login": "உள்நுழை",
  "nav.donate": "நன்கொடை",

  "nl.title": "சிறிது தெய்வீக ஊக்கத்தைப் பெறுங்கள்",
  "nl.body": "தெய்வீகச் சேவையுடன் இணைந்திருங்கள். எங்கள் புதிய கதைகள், சேவைப் புதுப்பிப்புகள், ஆன்மிகச் சிந்தனைகள், பிரச்சாரங்கள் மற்றும் மாற்றத்தை ஏற்படுத்தும் வழிகளை நேரடியாக உங்கள் இன்பாக்ஸில் பெறுங்கள்.",
  "nl.label": "வாராந்திரச் செய்திமடல்",
  "nl.f.name": "முழுப் பெயர் *",
  "nl.f.email": "மின்னஞ்சல் முகவரி *",
  "nl.f.city": "நகரம் / இடம் (விருப்பத்திற்குரியது)",
  "nl.submit": "இலவசமாகச் சந்தா செலுத்துங்கள்",
  "nl.footer": "🛡️ 100% இலவசம் • ஸ்பேம் இல்லை • எப்போது வேண்டுமானாலும் ஒரே கிளிக்கில் விலகலாம்.",
  "nl.submitting": "சந்தா பதிவாகிறது...",
  "nl.success": "சந்தா செலுத்தியதற்கு நன்றி!",
};

const dictionary: Record<Locale, Dict> = { en, hi, te, ta };

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

function readCookie(name: string): string | null {
  try {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

function safeStorageGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeStorageSet(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* private mode / blocked storage — cookie still persists the choice */
  }
}

function applyBrand(text: string, locale: Locale): string {
  return text.includes("{brand}") ? text.replaceAll("{brand}", BRAND[locale]) : text;
}

/* ------------------------------------------------------------------ */
/* Context                                                             */
/* ------------------------------------------------------------------ */
type SettingsMap = Record<string, { value?: string; translations?: Partial<Record<Locale, string>> } | undefined>;

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TranslationKey) => string;
  isPending: boolean;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  children,
  settings = {},
  initialLocale,
}: {
  children: ReactNode;
  settings?: SettingsMap;
  /** Pass the NEXT_LOCALE cookie from the server layout to avoid a flash of English. */
  initialLocale?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [locale, setLocaleState] = useState<Locale>(isLocale(initialLocale) ? initialLocale : "en");

  // Client fallback when the server didn't supply a locale.
  useEffect(() => {
    if (isLocale(initialLocale)) return;
    const saved = readCookie(COOKIE_NAME) ?? safeStorageGet(STORAGE_KEY);
    if (isLocale(saved)) setLocaleState(saved);
  }, [initialLocale]);

  // Keep <html lang> in sync (screen readers, browser translation, SEO).
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback(
    (l: Locale) => {
      if (!isLocale(l)) return;
      safeStorageSet(STORAGE_KEY, l);
      document.cookie = `${COOKIE_NAME}=${l}; path=/; max-age=31536000; SameSite=Lax`;
      startTransition(() => {
        setLocaleState(l);
        router.refresh(); // re-render server components in the new language
      });
    },
    [router],
  );

  const t = useCallback(
    (key: TranslationKey): string => {
      const setting = settings[key];
      if (setting) {
        const override = locale === "en" ? setting.value : setting.translations?.[locale];
        if (override) return applyBrand(override, locale);
      }
      const text = dictionary[locale][key] ?? dictionary.en[key];
      if (text === undefined) {
        if (process.env.NODE_ENV !== "production") console.warn(`[i18n] Missing key: ${key}`);
        return key;
      }
      return applyBrand(text, locale);
    },
    [locale, settings],
  );

  const value = useMemo(() => ({ locale, setLocale, t, isPending }), [locale, setLocale, t, isPending]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
const fs = require('fs');

const replacements = {
  'src/app/about/page.tsx': [
    ['<h1 className="text-4xl">About Shri Nityanikunj Ras Seva Sansthan Trust, Varanasi</h1>', '<h1 className="text-4xl"><T k="about.title" /></h1>'],
    ['<p className="text-muted mt-3 text-lg font-serif">श्री नित्यानिकुंज रस सेवा संस्थान ट्रस्ट, वाराणसी</p>', '<p className="text-muted mt-3 text-lg font-serif"><T k="about.subtitle" /></p>'],
    ['<h2 className="text-2xl font-serif text-maroon">About the Trust</h2>', '<h2 className="text-2xl font-serif text-maroon"><T k="about.s1.h" /></h2>'],
    ['Shri Nityanikunj Ras Seva Sansthan Trust, Varanasi is established with a broad vision of social welfare, service, education, healthcare, cultural preservation, environmental responsibility and humanitarian assistance. The Trust&apos;s objectives encompass service to communities in need while promoting education, Indian culture, Sanskrit, yoga, traditional knowledge and social responsibility.', '<T k="about.s1.p" />'],
    ['<h2 className="text-2xl font-serif text-maroon">Our Vision</h2>', '<h2 className="text-2xl font-serif text-maroon"><T k="about.s2.h" /></h2>'],
    ['To foster a community grounded in social welfare, offering service to disadvantaged communities through education, healthcare, cultural preservation, environmental responsibility, animal welfare, and immediate humanitarian assistance when needed.', '<T k="about.s2.p" />'],
    ['<h2 className="text-2xl font-serif text-maroon">Our Mission</h2>', '<h2 className="text-2xl font-serif text-maroon"><T k="about.s3.h" /></h2>'],
    ['<p>सेवा (Service) • शिक्षा (Education) • स्वास्थ्य (Healthcare)</p>', '<p><T k="about.s3.p1" /></p>'],
    ['<p>समाज कल्याण (Social Welfare) • संस्कृति (Culture)</p>', '<p><T k="about.s3.p2" /></p>'],
    ['<p>पर्यावरण संरक्षण (Environmental Protection) • गौ एवं पशु सेवा (Animal Welfare)</p>', '<p><T k="about.s3.p3" /></p>'],
    ['<p>आत्मनिर्भरता (Self-Reliance) • मानवीय सहायता (Humanitarian Aid)</p>', '<p><T k="about.s3.p4" /></p>'],
    ['<h2 className="text-2xl font-serif text-maroon">Founder / President</h2>', '<h2 className="text-2xl font-serif text-maroon"><T k="about.s4.h" /></h2>'],
    ['<p className="mt-4 text-lg font-medium text-text">श्री नित्यानन्द पाण्डेय</p>', '<p className="mt-4 text-lg font-medium text-text"><T k="about.s4.p1" /></p>'],
    ['<p className="text-muted">संस्थापक / अध्यक्ष (Founder / President)</p>', '<p className="text-muted"><T k="about.s4.p2" /></p>'],
    ['<h2 className="text-2xl font-serif text-maroon">Our Objectives</h2>', '<h2 className="text-2xl font-serif text-maroon"><T k="about.s5.h" /></h2>'],
    ['The Trust Deed sets out a broad range of charitable, social, educational, healthcare, cultural, environmental and humanitarian objectives.', '<T k="about.s5.p" />'],
    ['View Areas of Seva', '<T k="about.s5.btn" />'],
    ['<h3 className="text-xl font-serif text-maroon">Current Activities</h3>', '<h3 className="text-xl font-serif text-maroon"><T k="about.s6.h" /></h3>'],
    ['Only activities confirmed and published by the Trust will appear here. The Trust focuses its immediate resources on the most urgent needs while working toward its broader objectives over time.', '<T k="about.s6.p" />'],
    ['<h2 className="text-xl font-serif text-maroon">Legal & Registration Information</h2>', '<h2 className="text-xl font-serif text-maroon"><T k="about.s7.h" /></h2>'],
    ['Official registration and compliance information (including PAN, 12A, 80G, FCRA, CSR Registration, Bank Details, and Address) will be published here after verification.', '<T k="about.s7.p" />'],
    ['import { LinkButton } from "@/components/ui/button";', 'import { LinkButton } from "@/components/ui/button";\nimport { T } from "@/components/i18n/t";']
  ],
  'src/app/volunteer/page.tsx': [
    ['<h1 className="text-4xl">Join Our Seva</h1>', '<h1 className="text-4xl"><T k="vol.title" /></h1>'],
    ['Volunteering doesn&apos;t require donating — just a bit of your time and willingness to help.', '<T k="vol.subtitle" />'],
    ['placeholder="Full Name"', 'placeholder={"Full Name" as any} // Requires placeholder localization logic, ignoring for now'],
    ['<p className="text-sm text-muted mb-2">Areas of Interest</p>', '<p className="text-sm text-muted mb-2"><T k="vol.f.interests" /></p>'],
    ['{status === "loading" ? "Submitting…" : "Submit Application"}', '{status === "loading" ? <T k="vol.submitting" /> : <T k="vol.submit" />}'],
    ['<h1 className="text-3xl">Thank You</h1>', '<h1 className="text-3xl"><T k="vol.done.h" /></h1>'],
    ['Your application has been received. A member of the team will reach out about next steps.', '<T k="vol.done.p" />'],
    ['import { Button } from "@/components/ui/button";', 'import { Button } from "@/components/ui/button";\nimport { T } from "@/components/i18n/t";']
  ],
  'src/app/contact/page.tsx': [
    ['<h1 className="text-4xl">Contact Us</h1>', '<h1 className="text-4xl"><T k="contact.title" /></h1>'],
    ['Questions about a campaign, donation, or volunteering? Reach out.', '<T k="contact.subtitle" />'],
    ['Your message has been received — we&apos;ll respond soon.', '<T k="contact.done" />'],
    ['{status === "loading" ? "Sending…" : "Send Message"}', '{status === "loading" ? <T k="contact.submitting" /> : <T k="contact.submit" />}'],
    ['import { Button } from "@/components/ui/button";', 'import { Button } from "@/components/ui/button";\nimport { T } from "@/components/i18n/t";']
  ],
  'src/app/gallery/page.tsx': [
    ['<h1 className="text-4xl">Gallery</h1>', '<h1 className="text-4xl"><T k="gal.title" /></h1>'],
    ['Moments from campaigns, events and seva across the Trust.', '<T k="gal.subtitle" />'],
    ['import { X } from "lucide-react";', 'import { X } from "lucide-react";\nimport { T } from "@/components/i18n/t";']
  ],
  'src/app/faq/page.tsx': [
    ['<h1 className="text-4xl">Frequently Asked Questions</h1>', '<h1 className="text-4xl"><T k="faq.title" /></h1>'],
    ['import { db } from "@/lib/db";', 'import { db } from "@/lib/db";\nimport { T } from "@/components/i18n/t";']
  ],
  'src/components/legal/legal-page.tsx': [
    ['<h1 className="text-4xl">{title}</h1>', '<h1 className="text-4xl"><T k={title as any} /></h1>'],
    ['<p className="text-sm text-muted mt-2">Last updated: {updated}</p>', '<p className="text-sm text-muted mt-2"><T k="legal.lastUpdated" /> {updated}</p>'],
    ['<h2 className="text-xl text-maroon">{s.heading}</h2>', '<h2 className="text-xl text-maroon"><T k={s.heading as any} /></h2>'],
    ['<p className="mt-2 text-muted leading-relaxed">{s.body}</p>', '<p className="mt-2 text-muted leading-relaxed"><T k={s.body as any} /></p>'],
    ['export function LegalPage({', 'import { T } from "@/components/i18n/t";\n\nexport function LegalPage({']
  ],
  'src/app/terms/page.tsx': [
    ['title="Terms of Use"', 'title="terms.title"'],
    ['heading: "Platform Purpose"', 'heading: "terms.s1.h"'],
    ['body: "This platform is an admin-managed donation and seva platform. Campaigns are created and published only by Shri Nityanikunj Ras Seva Sansthan Trust, Varanasi administrators."', 'body: "terms.s1.p"'],
    ['heading: "Accounts"', 'heading: "terms.s2.h"'],
    ['body: "You\'re responsible for keeping your account credentials secure. Guest checkout is available for donations without creating an account."', 'body: "terms.s2.p"'],
    ['heading: "Donations"', 'heading: "terms.s3.h"'],
    ['body: "All donations are processed through our payment gateway. A donation is confirmed only once payment is verified server-side, not merely on your browser reporting success."', 'body: "terms.s3.p"'],
    ['heading: "Content"', 'heading: "terms.s4.h"'],
    ['body: "Campaign content is provided by the Trust. We do not present unverifiable claims as fact."', 'body: "terms.s4.p"']
  ],
  'src/app/donation-policy/page.tsx': [
    ['title="Donation Policy"', 'title="don.title"'],
    ['heading: "How Donations Are Used"', 'heading: "don.s1.h"'],
    ['body: "Product-based contributions (e.g. a ration kit or school kit) go toward that specific item for the campaign. Custom amounts and general donations support the campaign or the Trust\'s general fund."', 'body: "don.s1.p"'],
    ['heading: "What We Don\'t Show"', 'heading: "don.s2.h"'],
    ['body: "We deliberately don\'t display fundraising targets or amounts raised on public campaign pages. Instead, campaigns show milestones, updates and impact as work progresses."', 'body: "don.s2.p"'],
    ['heading: "Receipts"', 'heading: "don.s3.h"'],
    ['body: "Every successful donation generates an immutable, uniquely numbered receipt, available for download from your dashboard and sent by email."', 'body: "don.s3.p"'],
    ['heading: "Tax Benefits"', 'heading: "don.s4.h"'],
    ['body: "Tax-eligible status is shown only on campaigns where the Trust has explicitly enabled it in settings — never assumed or invented."', 'body: "don.s4.p"']
  ],
  'src/app/refund-policy/page.tsx': [
    ['title="Refund & Cancellation Policy"', 'title="ref.title"'],
    ['heading: "Donations Are Generally Final"', 'heading: "ref.s1.h"'],
    ['body: "Because contributions are typically allocated toward active seva work quickly, donations are generally non-refundable."', 'body: "ref.s1.p"'],
    ['heading: "Errors and Duplicate Charges"', 'heading: "ref.s2.h"'],
    ['body: "If you believe a charge was made in error, made twice, or for the wrong amount, contact us within 7 days and we\'ll review and process a refund where appropriate."', 'body: "ref.s2.p"'],
    ['heading: "How Refunds Are Processed"', 'heading: "ref.s3.h"'],
    ['body: "Approved refunds are issued back to the original payment method through our payment gateway. Processing time depends on your bank or card issuer."', 'body: "ref.s3.p"']
  ],
  'src/app/privacy-policy/page.tsx': [
    ['title="Privacy Policy"', 'title="priv.title"'],
    ['heading: "What We Collect"', 'heading: "priv.s1.h"'],
    ['body: "Only what\'s needed to process a donation, volunteer application, or contact request: name, email, phone, and — only when a tax receipt is requested — address and PAN."', 'body: "priv.s1.p"'],
    ['heading: "How We Use It"', 'heading: "priv.s2.h"'],
    ['body: "To generate receipts, respond to enquiries, and process volunteer applications. We do not sell or share personal data with third parties for marketing purposes."', 'body: "priv.s2.p"'],
    ['heading: "Donor Privacy"', 'heading: "priv.s3.h"'],
    ['body: "Donor identities are never displayed publicly by default. Choosing to donate anonymously hides your name from any donor-facing display entirely."', 'body: "priv.s3.p"'],
    ['heading: "Your Rights"', 'heading: "priv.s4.h"'],
    ['body: "You may request access to, correction of, or deletion of your personal data, subject to financial record-keeping requirements that may apply to completed donations."', 'body: "priv.s4.p"']
  ]
};

for (const [file, items] of Object.entries(replacements)) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    for (const [search, replace] of items) {
      if (content.includes(search)) {
        content = content.replace(search, replace);
      } else {
        console.warn(`Could not find "${search}" in ${file}`);
        
        // Handle dash encoding mismatch
        if (search.includes(" — ")) {
            const altSearch = search.replace(" — ", " ? ");
            if (content.includes(altSearch)) {
                content = content.replace(altSearch, replace);
                continue;
            }
        }
      }
    }
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  } else {
    console.warn(`File not found: ${file}`);
  }
}

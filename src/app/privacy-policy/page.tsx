import { LegalPage } from "@/components/legal/legal-page";

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="21 September 2026"
      sections={[
        {
          heading: "What We Collect",
          body: "Only what's needed to process a donation, volunteer application, or contact request: name, email, phone, and — only when a tax receipt is requested — address and PAN.",
        },
        {
          heading: "How We Use It",
          body: "To generate receipts, respond to enquiries, and process volunteer applications. We do not sell or share personal data with third parties for marketing purposes.",
        },
        {
          heading: "Donor Privacy",
          body: "Donor identities are never displayed publicly by default. Choosing to donate anonymously hides your name from any donor-facing display entirely.",
        },
        {
          heading: "Your Rights",
          body: "You may request access to, correction of, or deletion of your personal data, subject to financial record-keeping requirements that may apply to completed donations.",
        },
      ]}
    />
  );
}

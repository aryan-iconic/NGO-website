import { LegalPage } from "@/components/legal/legal-page";

export default function DonationPolicyPage() {
  return (
    <LegalPage
      title="Donation Policy"
      updated="21 September 2026"
      sections={[
        {
          heading: "How Donations Are Used",
          body: "Product-based contributions (e.g. a ration kit or school kit) go toward that specific item for the campaign. Custom amounts and general donations support the campaign or the Trust's general fund.",
        },
        {
          heading: "What We Don't Show",
          body: "We deliberately don't display fundraising targets or amounts raised on public campaign pages. Instead, campaigns show milestones, updates and impact as work progresses.",
        },
        {
          heading: "Receipts",
          body: "Every successful donation generates an immutable, uniquely numbered receipt, available for download from your dashboard and sent by email.",
        },
        {
          heading: "Tax Benefits",
          body: "Tax-eligible status is shown only on campaigns where the Trust has explicitly enabled it in settings — never assumed or invented.",
        },
      ]}
    />
  );
}

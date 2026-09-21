import { LegalPage } from "@/components/legal/legal-page";

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund & Cancellation Policy"
      updated="21 September 2026"
      sections={[
        {
          heading: "Donations Are Generally Final",
          body: "Because contributions are typically allocated toward active seva work quickly, donations are generally non-refundable.",
        },
        {
          heading: "Errors and Duplicate Charges",
          body: "If you believe a charge was made in error, made twice, or for the wrong amount, contact us within 7 days and we'll review and process a refund where appropriate.",
        },
        {
          heading: "How Refunds Are Processed",
          body: "Approved refunds are issued back to the original payment method through our payment gateway. Processing time depends on your bank or card issuer.",
        },
      ]}
    />
  );
}

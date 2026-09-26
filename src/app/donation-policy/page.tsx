import { LegalPage } from "@/components/legal/legal-page";

export default function DonationPolicyPage() {
  return (
    <LegalPage
      title="don.title"
      updated="21 September 2026"
      sections={[
        {
          heading: "don.s1.h",
          body: "don.s1.p",
        },
        {
          heading: "don.s2.h",
          body: "don.s2.p",
        },
        {
          heading: "don.s3.h",
          body: "don.s3.p",
        },
        {
          heading: "don.s4.h",
          body: "don.s4.p",
        },
      ]}
    />
  );
}

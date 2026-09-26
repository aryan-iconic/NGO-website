import { LegalPage } from "@/components/legal/legal-page";

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="ref.title"
      updated="21 September 2026"
      sections={[
        {
          heading: "ref.s1.h",
          body: "ref.s1.p",
        },
        {
          heading: "ref.s2.h",
          body: "ref.s2.p",
        },
        {
          heading: "ref.s3.h",
          body: "ref.s3.p",
        },
      ]}
    />
  );
}

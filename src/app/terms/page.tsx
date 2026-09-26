import { LegalPage } from "@/components/legal/legal-page";

export default function TermsPage() {
  return (
    <LegalPage
      title="terms.title"
      updated="21 September 2026"
      sections={[
        {
          heading: "terms.s1.h",
          body: "terms.s1.p",
        },
        {
          heading: "terms.s2.h",
          body: "terms.s2.p",
        },
        {
          heading: "terms.s3.h",
          body: "terms.s3.p",
        },
        {
          heading: "terms.s4.h",
          body: "terms.s4.p",
        },
      ]}
    />
  );
}

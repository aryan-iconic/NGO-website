import { LegalPage } from "@/components/legal/legal-page";

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="priv.title"
      updated="21 September 2026"
      sections={[
        {
          heading: "priv.s1.h",
          body: "priv.s1.p",
        },
        {
          heading: "priv.s2.h",
          body: "priv.s2.p",
        },
        {
          heading: "priv.s3.h",
          body: "priv.s3.p",
        },
        {
          heading: "priv.s4.h",
          body: "priv.s4.p",
        },
      ]}
    />
  );
}

import { LegalPage } from "@/components/legal/legal-page";

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      updated="21 September 2026"
      sections={[
        {
          heading: "Platform Purpose",
          body: "This platform is an admin-managed donation and seva platform. Campaigns are created and published only by Shri Nityanikunj Ras Seva Sansthan Trust, Varanasi administrators.",
        },
        {
          heading: "Accounts",
          body: "You're responsible for keeping your account credentials secure. Guest checkout is available for donations without creating an account.",
        },
        {
          heading: "Donations",
          body: "All donations are processed through our payment gateway. A donation is confirmed only once payment is verified server-side, not merely on your browser reporting success.",
        },
        {
          heading: "Content",
          body: "Campaign content is provided by the Trust. We do not present unverifiable claims as fact.",
        },
      ]}
    />
  );
}

import { LinkButton } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="container-app py-16 max-w-3xl">
      <h1 className="text-4xl">About Shri Nityanikunj Ras Seva Sansthan Trust, Varanasi</h1>
      <p className="text-muted mt-3 text-lg font-serif">श्री नित्यानिकुंज रस सेवा संस्थान ट्रस्ट, वाराणसी</p>

      <div className="mt-12 space-y-12">
        <section>
          <h2 className="text-2xl font-serif text-maroon">About the Trust</h2>
          <p className="mt-4 text-muted leading-relaxed">
            Shri Nityanikunj Ras Seva Sansthan Trust, Varanasi is established with a broad vision of social welfare, service, education, healthcare, cultural preservation, environmental responsibility and humanitarian assistance. The Trust&apos;s objectives encompass service to communities in need while promoting education, Indian culture, Sanskrit, yoga, traditional knowledge and social responsibility.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-maroon">Our Vision</h2>
          <p className="mt-4 text-muted leading-relaxed">
            To foster a community grounded in social welfare, offering service to disadvantaged communities through education, healthcare, cultural preservation, environmental responsibility, animal welfare, and immediate humanitarian assistance when needed.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-maroon">Our Mission</h2>
          <div className="mt-4 bg-cream border border-border p-6 rounded-lg text-center space-y-2 font-serif text-lg text-primary">
            <p>सेवा (Service) • शिक्षा (Education) • स्वास्थ्य (Healthcare)</p>
            <p>समाज कल्याण (Social Welfare) • संस्कृति (Culture)</p>
            <p>पर्यावरण संरक्षण (Environmental Protection) • गौ एवं पशु सेवा (Animal Welfare)</p>
            <p>आत्मनिर्भरता (Self-Reliance) • मानवीय सहायता (Humanitarian Aid)</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-maroon">Founder / President</h2>
          <p className="mt-4 text-lg font-medium text-text">श्री नित्यानन्द पाण्डेय</p>
          <p className="text-muted">संस्थापक / अध्यक्ष (Founder / President)</p>
        </section>

        <section className="bg-background-alt border border-border p-8 rounded-lg mt-10">
          <h2 className="text-2xl font-serif text-maroon">Our Objectives</h2>
          <p className="mt-4 text-muted leading-relaxed">
            The Trust Deed sets out a broad range of charitable, social, educational, healthcare, cultural, environmental and humanitarian objectives.
          </p>
          <div className="mt-4">
            <LinkButton href="/campaigns" variant="outline">
              View Areas of Seva
            </LinkButton>
          </div>

          <div className="mt-10 border-t border-border pt-8">
            <h3 className="text-xl font-serif text-maroon">Current Activities</h3>
            <p className="mt-3 text-muted text-sm bg-surface p-4 rounded-md italic">
              Only activities confirmed and published by the Trust will appear here. The Trust focuses its immediate resources on the most urgent needs while working toward its broader objectives over time.
            </p>
          </div>
        </section>
      </div>

      <section id="transparency" className="mt-14 p-6 rounded-lg bg-cream border border-border">
        <h2 className="text-xl font-serif text-maroon">Legal & Registration Information</h2>
        <p className="mt-3 text-sm text-muted">
          Official registration and compliance information (including PAN, 12A, 80G, FCRA, CSR Registration, Bank Details, and Address) will be published here after verification.
        </p>
      </section>
    </div>
  );
}

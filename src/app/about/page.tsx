import { LinkButton } from "@/components/ui/button";
import { T } from "@/components/i18n/t";
import { db } from "@/lib/db";

export default async function AboutPage() {
  const team = await db.listTeamMembers(false);
  return (
    <div className="container-app py-16 max-w-3xl">
      <h1 className="text-4xl"><T k="about.title" /></h1>
      <p className="text-muted mt-3 text-lg font-serif"><T k="about.subtitle" /></p>

      <div className="mt-12 space-y-12">
        <section>
          <h2 className="text-2xl font-serif text-maroon"><T k="about.s1.h" /></h2>
          <p className="mt-4 text-muted leading-relaxed">
            <T k="about.s1.p" />
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-maroon"><T k="about.s2.h" /></h2>
          <p className="mt-4 text-muted leading-relaxed">
            <T k="about.s2.p" />
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-maroon"><T k="about.s3.h" /></h2>
          <div className="mt-4 bg-cream border border-border p-6 rounded-lg text-center space-y-2 font-serif text-lg text-primary">
            <p><T k="about.s3.p1" /></p>
            <p><T k="about.s3.p2" /></p>
            <p><T k="about.s3.p3" /></p>
            <p><T k="about.s3.p4" /></p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-maroon"><T k="about.s4.h" /></h2>
          <p className="mt-4 text-lg font-medium text-text"><T k="about.s4.p1" /></p>
          <p className="text-muted"><T k="about.s4.p2" /></p>
        </section>

        <section className="bg-background-alt border border-border p-8 rounded-lg mt-10">
          <h2 className="text-2xl font-serif text-maroon"><T k="about.s5.h" /></h2>
          <p className="mt-4 text-muted leading-relaxed">
            <T k="about.s5.p" />
          </p>
          <div className="mt-4">
            <LinkButton href="/campaigns" variant="outline">
              <T k="about.s5.btn" />
            </LinkButton>
          </div>

          <div className="mt-10 border-t border-border pt-8">
            <h3 className="text-xl font-serif text-maroon"><T k="about.s6.h" /></h3>
            <p className="mt-3 text-muted text-sm bg-surface p-4 rounded-md italic">
              <T k="about.s6.p" />
            </p>
          </div>
        </section>
      </div>

      {team.length > 0 && (
        <section className="mt-14">
          <h2 className="text-3xl font-serif text-maroon text-center mb-8"><T k="about.team.title" /></h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {team.map((member: any) => (
              <div key={member.id} className="bg-surface rounded-lg border border-border p-6 text-center space-y-4">
                {member.imageUrl ? (
                  <img src={member.imageUrl} alt={member.name} className="w-24 h-24 mx-auto rounded-full object-cover shadow-sm" />
                ) : (
                  <div className="w-24 h-24 mx-auto rounded-full bg-cream flex items-center justify-center text-maroon text-2xl font-bold shadow-sm">
                    {member.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="font-medium text-lg text-text">{member.name}</h3>
                  <p className="text-primary text-sm font-medium">{member.role}</p>
                </div>
                {member.bio && (
                  <p className="text-sm text-muted">{member.bio}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <section id="transparency" className="mt-14 pt-10 border-t border-border">
        <div className="text-center mb-8">
          <p className="text-sm font-bold tracking-widest text-primary uppercase mb-2">✦ Statutory Transparency</p>
          <h2 className="text-3xl font-serif text-maroon">Registrations & Certifications</h2>
          <p className="mt-3 text-muted max-w-2xl mx-auto">
            At Charanvandan, transparency and trust are the pillars of our foundation. We are officially registered and recognized by the Government of India, ensuring your contributions are utilized responsibly and legally.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 mt-10">
          {(await db.listStatutoryRegistrations()).map((reg) => (
            <div key={reg.id} className="bg-surface border border-border p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-serif text-xl text-maroon">{reg.title}</h3>
              {reg.registrationNumber && (
                <p className="mt-2 text-sm text-text font-medium bg-cream inline-block px-2 py-1 rounded">
                  {reg.registrationNumber}
                </p>
              )}
              {reg.issuingAuthority && (
                <p className="mt-2 text-sm text-muted">Issued by: <span className="font-medium text-text">{reg.issuingAuthority}</span></p>
              )}
              {reg.description && (
                <p className="mt-3 text-sm text-muted">{reg.description}</p>
              )}
              
              {(reg.documentUrl || reg.verificationUrl) && (
                <div className="mt-4 pt-4 border-t border-border flex gap-3 flex-wrap">
                  {reg.documentUrl && (
                    <a href={reg.documentUrl} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline font-medium">
                      View Document →
                    </a>
                  )}
                  {reg.verificationUrl && (
                    <a href={reg.verificationUrl} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline font-medium">
                      Verify Online →
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

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

      <section id="transparency" className="mt-14 p-6 rounded-lg bg-cream border border-border">
        <h2 className="text-xl font-serif text-maroon"><T k="about.s7.h" /></h2>
        <p className="mt-3 text-sm text-muted">
          <T k="about.s7.p" />
        </p>
      </section>
    </div>
  );
}

import { LinkButton } from "@/components/ui/button";
import { T } from "@/components/i18n/t";
import { db } from "@/lib/db";
import { ShieldCheck, Target, Heart, Eye, FileText, CheckCircle2 } from "lucide-react";
import { getServerTranslator } from "@/lib/i18n-server";

export default async function AboutPage() {
  const team = await db.listTeamMembers(false);
  const registrations = await db.listStatutoryRegistrations();
  const { t } = await getServerTranslator();

  return (
    <div className="bg-background min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative bg-maroon text-white py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="container-app relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight drop-shadow-md">
            <T k="about.title" />
          </h1>
          <p className="mt-6 text-xl md:text-2xl text-cream/90 font-serif font-medium tracking-wide max-w-2xl mx-auto">
            <T k="about.subtitle" />
          </p>
        </div>
        {/* Decorative bottom curve */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-0">
          <svg className="relative block w-full h-[60px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" fill="var(--color-background)"></path>
          </svg>
        </div>
      </section>

      {/* Main Content */}
      <div className="container-app max-w-5xl mx-auto mt-8 md:-mt-8 relative z-20">
        
        {/* About Card */}
        <div className="bg-surface rounded-2xl shadow-xl border border-border/50 p-8 md:p-12 mb-16 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-cream rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="w-14 h-14 rounded-full bg-maroon/5 flex items-center justify-center text-maroon shadow-inner shrink-0">
              <Heart size={28} />
            </div>
            <h2 className="text-3xl font-serif text-maroon"><T k="about.s1.h" /></h2>
          </div>
          <p className="text-lg text-text leading-relaxed font-medium relative z-10">
            <T k="about.s1.p" />
          </p>
        </div>

        {/* Vision & Mission Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-gradient-to-br from-surface to-cream/30 rounded-2xl p-8 border border-border shadow-sm hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm border border-border">
                <Eye className="text-primary group-hover:scale-110 transition-transform duration-300" size={26} />
              </div>
              <h2 className="text-2xl font-serif text-maroon"><T k="about.s2.h" /></h2>
            </div>
            <p className="text-muted leading-relaxed text-lg">
              <T k="about.s2.p" />
            </p>
          </div>

          <div className="bg-gradient-to-br from-surface to-cream/30 rounded-2xl p-8 border border-border shadow-sm hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm border border-border">
                <Target className="text-primary group-hover:scale-110 transition-transform duration-300" size={26} />
              </div>
              <h2 className="text-2xl font-serif text-maroon"><T k="about.s3.h" /></h2>
            </div>
            <div className="space-y-4 font-serif text-[1.1rem] text-primary font-medium">
              <p className="flex items-start gap-3"><CheckCircle2 size={20} className="text-maroon shrink-0 mt-0.5"/> <span><T k="about.s3.p1" /></span></p>
              <p className="flex items-start gap-3"><CheckCircle2 size={20} className="text-maroon shrink-0 mt-0.5"/> <span><T k="about.s3.p2" /></span></p>
              <p className="flex items-start gap-3"><CheckCircle2 size={20} className="text-maroon shrink-0 mt-0.5"/> <span><T k="about.s3.p3" /></span></p>
              <p className="flex items-start gap-3"><CheckCircle2 size={20} className="text-maroon shrink-0 mt-0.5"/> <span><T k="about.s3.p4" /></span></p>
            </div>
          </div>
        </div>

        {/* Founder & Objectives */}
        <div className="grid md:grid-cols-[1fr_2fr] gap-8 mb-20">
          <div className="bg-maroon text-white rounded-2xl p-8 text-center shadow-lg relative overflow-hidden group flex flex-col items-center justify-center">
            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="w-24 h-24 rounded-full bg-cream flex items-center justify-center text-maroon text-4xl font-serif font-bold shadow-lg mb-6 relative z-10 border-4 border-white/20">
              श्री
            </div>
            <h2 className="text-xl font-serif relative z-10 text-white/80"><T k="about.s4.h" /></h2>
            <p className="mt-4 text-2xl font-bold text-cream relative z-10"><T k="about.s4.p1" /></p>
            <p className="text-sm mt-2 text-cream/70 relative z-10 uppercase tracking-widest font-semibold"><T k="about.s4.p2" /></p>
          </div>

          <div className="bg-surface rounded-2xl p-8 md:p-10 border border-border shadow-sm flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-10 -mt-10 blur-2xl pointer-events-none"></div>
            <h2 className="text-3xl font-serif text-maroon mb-5"><T k="about.s5.h" /></h2>
            <p className="text-text leading-relaxed mb-8 text-lg font-medium">
              <T k="about.s5.p" />
            </p>
            <div>
              <LinkButton href="/campaigns" variant="primary" className="shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <T k="about.s5.btn" />
              </LinkButton>
            </div>
          </div>
        </div>

        {/* Team Section */}
        {team.length > 0 && (
          <section className="mb-24">
            <div className="text-center mb-14">
              <h2 className="text-4xl font-serif text-maroon inline-block relative pb-4">
                <T k="about.team.title" />
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-primary rounded-full opacity-80"></span>
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {team.map((member: any) => (
                <div key={member.id} className="bg-surface rounded-2xl border border-border/80 p-8 text-center shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-maroon to-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative w-32 h-32 mx-auto mb-6">
                    {member.imageUrl ? (
                      <img src={member.imageUrl} alt={member.name} className="w-full h-full rounded-full object-cover shadow-md ring-4 ring-cream group-hover:ring-primary/20 transition-all duration-300" />
                    ) : (
                      <div className="w-full h-full rounded-full bg-cream flex items-center justify-center text-maroon text-4xl font-bold shadow-md ring-4 ring-transparent group-hover:ring-primary/20 transition-all duration-300">
                        {member.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <h3 className="font-serif font-bold text-2xl text-maroon mb-2">{member.name}</h3>
                  <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-4 bg-primary/5 inline-block px-3 py-1 rounded-full">{member.role}</p>
                  {member.bio && (
                    <p className="text-sm text-text/80 leading-relaxed group-hover:text-text transition-colors">{member.bio}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Transparency Section */}
        <section id="transparency" className="scroll-mt-24">
          <div className="bg-background-alt rounded-3xl p-8 md:p-12 border border-border shadow-inner relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cream/40 rounded-full blur-3xl -z-10 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

            <div className="text-center mb-14">
              <div className="inline-flex items-center justify-center gap-2 bg-white text-maroon px-5 py-2 rounded-full text-sm font-bold tracking-widest uppercase mb-6 shadow-sm border border-border">
                <ShieldCheck size={18} className="text-primary" />
                {t("Statutory Transparency")}
              </div>
              <h2 className="text-3xl md:text-4xl font-serif text-maroon">{t("Registrations & Certifications")}</h2>
              <p className="mt-5 text-text max-w-2xl mx-auto text-lg leading-relaxed">
                {t("At Shri Nityanikunj Trust, transparency and trust are the pillars of our foundation. We are officially registered and recognized by the Government of India, ensuring your contributions are utilized responsibly and legally.")}
              </p>
            </div>

            {registrations.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {registrations.map((reg: any) => (
                  <div key={reg.id} className="bg-surface border border-border p-6 md:p-8 rounded-2xl shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-cream to-transparent rounded-bl-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    
                    <div className="flex items-start gap-5 relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-border flex items-center justify-center text-maroon shrink-0 mt-0.5 group-hover:text-primary transition-colors">
                        <FileText size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-serif text-xl font-bold text-maroon leading-tight mb-3">{reg.title}</h3>
                        
                        <div className="flex flex-col gap-2.5 mb-5">
                          {reg.registrationNumber && (
                            <div className="inline-flex">
                              <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 shadow-sm">
                                {reg.registrationNumber}
                              </span>
                            </div>
                          )}
                          {reg.issuingAuthority && (
                            <p className="text-sm text-muted font-medium bg-white border border-border px-3 py-1.5 rounded-lg inline-block self-start">
                              {t("Issued by:", undefined, { isSensitive: true })} <span className="text-text font-bold">{reg.issuingAuthority}</span>
                            </p>
                          )}
                        </div>
                        
                        {reg.description && (
                          <p className="text-sm text-text/90 leading-relaxed mb-6 font-medium">{reg.description}</p>
                        )}
                        
                        {(reg.documentUrl || reg.verificationUrl) && (
                          <div className="flex gap-3 flex-wrap pt-2 border-t border-border/60">
                            {reg.documentUrl && (
                              <a href={reg.documentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 text-sm bg-maroon text-white px-4 py-2 rounded-full hover:bg-primary transition-colors font-medium shadow-sm">
                                {t("View Document")}
                              </a>
                            )}
                            {reg.verificationUrl && (
                              <a href={reg.verificationUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 text-sm bg-surface border-2 border-border px-4 py-1.5 rounded-full text-maroon hover:border-primary hover:text-primary transition-colors font-bold shadow-sm">
                                {t("Verify Online")}
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-border/80 shadow-sm">
                <div className="w-20 h-20 bg-cream rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck size={36} className="text-maroon/50" />
                </div>
                <h3 className="text-2xl font-serif text-maroon mb-3"><T k="about.s7.h" /></h3>
                <p className="mt-2 text-muted max-w-lg mx-auto text-lg leading-relaxed"><T k="about.s7.p" /></p>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}


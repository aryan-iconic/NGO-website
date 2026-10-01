import Link from "next/link";
import { UtensilsCrossed, GraduationCap, HeartPulse, Users, LifeBuoy, Flame, Calendar, ArrowRight, Sparkles } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { CampaignCard } from "@/components/campaign/campaign-card";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { db } from "@/lib/db";
import { toPublicCampaign } from "@/lib/view-models";
import { T } from "@/components/i18n/t";

const icons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  UtensilsCrossed,
  GraduationCap,
  HeartPulse,
  Users,
  LifeBuoy,
  Flame,
};

export default async function HomePage() {
  const sevaAreas = await db.listSevaAreas();
  const campaignsList = await db.listPublicCampaigns();
  const campaigns = await Promise.all(campaignsList.map(toPublicCampaign));
  const featured = campaigns.filter((c) => c.isFeatured);
  const events = (await db.listPublishedEvents()).slice(0, 2);
  const instagramPosts = (await db.listInstagramPosts()).filter((p: any) => p.isPublished);
  const youtubeVideos = (await db.listYouTubeVideos()).filter((p: any) => p.isPublished);

  const getYoutubeEmbedUrl = (url: string) => {
    let videoId = "";
    if (url.includes("youtu.be/")) videoId = url.split("youtu.be/")[1]?.split("?")[0];
    else if (url.includes("youtube.com/watch")) videoId = new URL(url).searchParams.get("v") || "";
    else if (url.includes("youtube.com/shorts/")) videoId = url.split("shorts/")[1]?.split("?")[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
  };

  const getInstagramEmbedUrl = (url: string) => {
    const clean = url.split("?")[0].replace(/\/$/, "");
    return `${clean}/embed`;
  };

  const heroImage = (await db.getSetting("home.hero.image")) || null;

  return (
    <div className="bg-background">
      {/* Premium Hero Section */}
      <section className="relative overflow-hidden bg-maroon text-white min-h-[90vh] flex items-center pt-20">
        <div className="absolute inset-0 z-0">
          {heroImage ? (
            <>
              <img src={heroImage} alt="Hero" className="w-full h-full object-cover scale-105 animate-[pulse_20s_ease-in-out_infinite_alternate]" />
              <div className="absolute inset-0 bg-gradient-to-r from-maroon via-maroon/90 to-maroon/40 backdrop-blur-[2px]"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80 h-32 bottom-0 top-auto"></div>
            </>
          ) : (
            <div className="w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/40 via-maroon to-[#2d0000]"></div>
          )}
        </div>
        
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 z-0 mix-blend-overlay"></div>

        <div className="container-app relative z-10 py-20 grid lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20 items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold tracking-widest text-cream uppercase mb-8 border border-white/20 shadow-lg">
              <Sparkles size={16} className="text-primary" /> Shri Nityanikunj Trust
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl leading-[1.1] font-serif font-bold text-white drop-shadow-lg">
              <T k="home.hero.title" />
            </h1>
            <p className="mt-6 text-cream/90 text-lg md:text-xl max-w-xl leading-relaxed font-medium">
              <T k="home.hero.subtitle" />
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <LinkButton href="/donate" variant="primary" size="lg" className="h-14 px-8 text-lg rounded-full shadow-[0_0_40px_rgba(var(--color-primary),0.5)] hover:shadow-[0_0_60px_rgba(var(--color-primary),0.8)] transition-all">
                <T k="home.giveOnce" /> <ArrowRight size={20} className="ml-2" />
              </LinkButton>
              <LinkButton href="/about" variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full border-white/30 bg-transparent text-white hover:bg-white/10 backdrop-blur-sm">
                Explore Our Work
              </LinkButton>
            </div>
          </div>
          
          <div className="hidden lg:block relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-[100px] -z-10"></div>
            {/* Optional abstract graphics or floating stats could go here */}
          </div>
        </div>
        
        {/* Decorative Bottom Wave */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10">
          <svg className="relative block w-full h-[80px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="var(--color-background)"></path>
          </svg>
        </div>
      </section>

      {/* Featured campaigns */}
      {featured.length > 0 && (
        <section className="py-24 relative">
          <div className="container-app">
            <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-4">
              <div>
                <p className="text-primary font-bold tracking-widest uppercase text-sm mb-2">Our Impact</p>
                <h2 className="text-4xl font-serif text-maroon"><T k="home.featured" /></h2>
              </div>
              <Link href="/campaigns" className="inline-flex items-center gap-2 text-sm font-bold bg-surface px-5 py-2.5 rounded-full border border-border shadow-sm hover:border-primary/50 text-maroon hover:text-primary transition-all group">
                <T k="home.viewAll" /> <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featured.map((c) => (
                <div key={c.id} className="transform hover:-translate-y-2 transition-transform duration-300">
                  <CampaignCard campaign={c} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Seva areas */}
      <section className="bg-background-alt py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-maroon/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
        
        <div className="container-app relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-primary font-bold tracking-widest uppercase text-sm mb-2">Our Work</p>
            <h2 className="text-4xl font-serif text-maroon"><T k="home.seva" /></h2>
            <p className="mt-4 text-text/80">Discover the diverse areas where we dedicate our efforts to uplift and support the community.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {sevaAreas.map((area: any) => {
              const Icon = icons[area.icon ?? ""] ?? Users;
              return (
                <Link
                  key={area.id}
                  href={`/campaigns?sevaArea=${area.slug}`}
                  className="group rounded-2xl border border-border bg-white shadow-sm hover:shadow-xl hover:border-primary/40 transition-all duration-500 overflow-hidden flex flex-col relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                  
                  {area.coverImage ? (
                    <div className="relative w-full aspect-[4/3] overflow-hidden">
                      <img src={area.coverImage} alt={area.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-maroon shadow-lg z-20 group-hover:text-primary transition-colors">
                        <Icon size={20} />
                      </div>
                    </div>
                  ) : (
                    <div className="pt-10 pb-4 px-8 bg-gradient-to-br from-surface to-cream/30">
                      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-border flex items-center justify-center text-maroon group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                        <Icon size={32} />
                      </div>
                    </div>
                  )}
                  <div className="p-8 pt-6 flex-1 bg-white relative z-20 group-hover:translate-y-[-20px] transition-transform duration-500">
                    <h3 className="text-xl font-serif font-bold text-maroon group-hover:text-primary transition-colors">{area.name}</h3>
                    <h4 className="mt-1 text-sm font-semibold text-primary uppercase tracking-widest bg-primary/5 inline-block px-3 py-1 rounded-full">{area.hindiName}</h4>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Upcoming Initiatives */}
      {events.length > 0 && (
        <section className="py-24">
          <div className="container-app max-w-5xl">
            <div className="text-center mb-16">
              <p className="text-primary font-bold tracking-widest uppercase text-sm mb-2">Join Us</p>
              <h2 className="text-4xl font-serif text-maroon"><T k="home.upcomingInitiatives" /></h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {events.map((e: any) => {
                const date = new Date(e.eventDate);
                return (
                  <Link
                    key={e.id}
                    href={`/events/${e.slug}`}
                    className="flex flex-col sm:flex-row gap-6 p-6 rounded-2xl border border-border bg-white shadow-sm hover:shadow-lg hover:border-primary/30 transition-all group"
                  >
                    <div className="flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 bg-cream rounded-xl border border-border/80 text-center group-hover:bg-primary group-hover:border-primary transition-colors">
                      <span className="text-sm font-bold uppercase text-primary group-hover:text-white/80">{date.toLocaleString('en-IN', { month: 'short' })}</span>
                      <span className="text-3xl font-serif font-bold text-maroon group-hover:text-white">{date.getDate()}</span>
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-widest mb-2">
                        <Calendar size={14} className="text-primary" /> {date.getFullYear()}
                      </div>
                      <h3 className="text-xl font-serif font-bold text-maroon group-hover:text-primary transition-colors line-clamp-2">{e.title}</h3>
                      <p className="mt-2 text-sm text-text/80 line-clamp-2 leading-relaxed">{e.description}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="py-24 bg-background relative overflow-hidden border-y border-border">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="container-app relative z-10">
          <div className="text-center mb-16">
            <p className="text-primary font-bold tracking-widest uppercase text-sm mb-2">The Process</p>
            <h2 className="text-4xl font-serif text-maroon"><T k="home.howItWorks" /></h2>
          </div>
          
          <div className="relative mt-16 max-w-5xl mx-auto">
            {/* Connecting line for desktop */}
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 z-0"></div>
            
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4 relative z-10 text-center">
              {["home.step1", "home.step2", "home.step3", "home.step4", "home.step5"].map((step, i) => (
                <div key={step} className="bg-white rounded-2xl p-6 shadow-sm border border-border hover:shadow-md hover:-translate-y-1 transition-all">
                  <div className="mx-auto w-12 h-12 rounded-full bg-cream text-maroon font-serif font-bold text-xl flex items-center justify-center mb-4 shadow-inner ring-4 ring-white border border-border/50">
                    {i + 1}
                  </div>
                  <p className="text-sm font-bold text-text uppercase tracking-wide"><T k={step as any} /></p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Media Sections Wrapper */}
      <div className="bg-surface relative">
        {/* Instagram Section */}
        {instagramPosts.length > 0 && (
          <section className="py-24">
            <div className="container-app">
              <div className="text-center mb-12">
                <p className="text-primary font-bold tracking-widest uppercase text-sm mb-2">Social</p>
                <h2 className="text-3xl md:text-4xl font-serif text-maroon"><T k="home.followOurJourney" /></h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {instagramPosts.map((post: any) => (
                  <div key={post.id} className="bg-white rounded-2xl overflow-hidden border border-border shadow-md hover:shadow-xl transition-shadow">
                    <iframe
                      src={getInstagramEmbedUrl(post.instagramUrl)}
                      width="100%"
                      height="450"
                      frameBorder="0"
                      scrolling="no"
                      allowTransparency={true}
                      className="w-full"
                      loading="lazy"
                    />
                    {(post.title || post.caption) && (
                      <div className="p-6">
                        {post.title && <h3 className="font-serif font-bold text-maroon text-xl mb-2">{post.title}</h3>}
                        {post.caption && <p className="text-sm text-text/80 leading-relaxed">{post.caption}</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* YouTube Section */}
        {youtubeVideos.length > 0 && (
          <section className="py-24 bg-background-alt border-t border-border">
            <div className="container-app">
              <div className="text-center mb-12">
                <p className="text-primary font-bold tracking-widest uppercase text-sm mb-2">Media</p>
                <h2 className="text-3xl md:text-4xl font-serif text-maroon"><T k="home.watchOurVideos" /></h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {youtubeVideos.map((video: any) => (
                  <div key={video.id} className="bg-white rounded-2xl overflow-hidden border border-border shadow-md hover:shadow-xl transition-shadow flex flex-col group">
                    <div className="aspect-video w-full bg-black relative">
                      <iframe
                        src={getYoutubeEmbedUrl(video.youtubeUrl)}
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                        className="absolute inset-0"
                      />
                    </div>
                    {(video.title || video.description) && (
                      <div className="p-6 flex-1 flex flex-col">
                        {video.title && <h3 className="font-serif font-bold text-maroon text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors">{video.title}</h3>}
                        {video.description && <p className="text-sm text-text/80 mt-auto line-clamp-3 leading-relaxed">{video.description}</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* CTA */}
      <section className="relative bg-maroon text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent opacity-60"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        
        <div className="container-app text-center relative z-10 max-w-3xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-serif font-bold drop-shadow-md"><T k="home.ctaTitle" /></h2>
          <p className="mt-6 text-xl text-cream/90 max-w-2xl mx-auto font-medium">
            <T k="home.ctaBody" />
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <LinkButton href="/donate" variant="primary" size="lg" className="h-14 px-8 text-lg rounded-full shadow-[0_0_30px_rgba(var(--color-primary),0.5)] hover:shadow-[0_0_50px_rgba(var(--color-primary),0.8)] transition-all">
              <T k="donate" />
            </LinkButton>
            <LinkButton
              href="/volunteer"
              variant="outline"
              size="lg"
              className="h-14 px-8 text-lg rounded-full border-white/40 bg-transparent text-white hover:bg-white/10 backdrop-blur-sm"
            >
              <T k="nav.volunteer" />
            </LinkButton>
          </div>
        </div>
      </section>

      <NewsletterSection />
    </div>
  );
}

import Link from "next/link";
import { UtensilsCrossed, GraduationCap, HeartPulse, Users, LifeBuoy, Flame } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { CampaignCard } from "@/components/campaign/campaign-card";
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

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-background-alt">
        <div className="container-app py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl leading-tight">
              <T k="hero.title" />
            </h1>
            <p className="mt-5 text-muted text-base md:text-lg max-w-md">
              Shri Nityanikunj Ras Seva Sansthan Trust, Varanasi works towards a vision encompassing education, healthcare, humanitarian assistance, cultural preservation, environmental responsibility and service to society.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/donate" variant="outline" size="lg">
                Give Once
              </LinkButton>
            </div>
          </div>
          <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-primary/20 via-gold/15 to-maroon/10 border border-border" />
        </div>
      </section>

      {/* Featured campaigns */}
      <section className="py-20">
        <div className="container-app">
          <div className="flex items-end justify-between mb-10">
            <h2 className="text-3xl"><T k="home.featured" /></h2>
            <Link href="/campaigns" className="text-sm text-primary hover:text-secondary">
              <T k="home.viewAll" /> →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </div>
        </div>
      </section>

      {/* Seva areas */}
      <section className="bg-background-alt py-20">
        <div className="container-app">
          <h2 className="text-3xl text-center"><T k="home.seva" /></h2>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sevaAreas.map((area: any) => {
              const Icon = icons[area.icon ?? ""] ?? Users;
              return (
                <Link
                  key={area.id}
                  href={`/campaigns?sevaArea=${area.slug}`}
                  className="p-6 rounded-lg border border-border bg-surface hover:shadow-[var(--shadow-soft)] hover:border-primary/40 transition-all duration-300"
                >
                  <Icon size={26} className="text-primary" />
                  <h3 className="mt-4 text-base font-semibold text-maroon">{area.name}</h3>
                  <h4 className="mt-1 text-sm font-medium text-maroon/70">{area.hindiName}</h4>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Upcoming Initiatives */}
      {events.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="text-3xl text-center">Upcoming Initiatives</h2>
          <div className="mt-10 grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {events.map((e: any) => (
              <Link
                key={e.id}
                href={`/events/${e.slug}`}
                className="p-6 rounded-lg border border-border bg-surface hover:shadow-[var(--shadow-soft)] transition-shadow"
              >
                <p className="text-xs text-primary font-medium">
                  {new Date(e.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </p>
                <h3 className="mt-1.5 text-lg font-serif text-maroon">{e.title}</h3>
                <p className="mt-2 text-sm text-muted line-clamp-2">{e.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}



      {/* Instagram Section */}
      {instagramPosts.length > 0 && (
        <section className="py-20">
          <div className="container-app">
            <h2 className="text-3xl text-center font-serif text-maroon mb-10">Follow Our Journey</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {instagramPosts.map((post: any) => (
                <div key={post.id} className="bg-surface rounded-lg overflow-hidden border border-border shadow-[var(--shadow-soft)]">
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
                    <div className="p-4 border-t border-border">
                      {post.title && <h3 className="font-semibold text-maroon text-lg">{post.title}</h3>}
                      {post.caption && <p className="text-sm text-muted mt-1">{post.caption}</p>}
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
        <section className="bg-background-alt py-20">
          <div className="container-app">
            <h2 className="text-3xl text-center font-serif text-maroon mb-10">Watch Our Videos</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {youtubeVideos.map((video: any) => (
                <div key={video.id} className="bg-surface rounded-lg overflow-hidden border border-border shadow-[var(--shadow-soft)] flex flex-col">
                  <div className="aspect-video w-full bg-black">
                    <iframe
                      src={getYoutubeEmbedUrl(video.youtubeUrl)}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                  {(video.title || video.description) && (
                    <div className="p-4 flex-1">
                      {video.title && <h3 className="font-semibold text-maroon text-lg line-clamp-2">{video.title}</h3>}
                      {video.description && <p className="text-sm text-muted mt-2 line-clamp-3">{video.description}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="bg-background-alt py-20">
        <div className="container-app">
          <h2 className="text-3xl text-center"><T k="home.howItWorks" /></h2>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-5 gap-6 text-center">
            {["Discover", "Understand", "Choose", "Contribute", "See Impact"].map((step, i) => (
              <div key={step}>
                <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 text-primary font-serif flex items-center justify-center">
                  {i + 1}
                </div>
                <p className="mt-3 text-sm font-medium text-maroon">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-maroon text-white py-16">
        <div className="container-app text-center">
          <h2 className="!text-[#ffffff] text-3xl"><T k="home.ctaTitle" /></h2>
          <p className="mt-3 text-[#ffffff]/80 max-w-lg mx-auto">
            <T k="home.ctaBody" />
          </p>
          <div className="mt-7 flex justify-center gap-3">
            <LinkButton href="/donate" variant="primary" size="lg">
              Donate
            </LinkButton>
            <LinkButton
              href="/volunteer"
              variant="outline"
              size="lg"
              className="border-white/40 text-white hover:bg-white/10"
            >
              Volunteer
            </LinkButton>
          </div>
        </div>
      </section>
    </>
  );
}

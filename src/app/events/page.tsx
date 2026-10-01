import Link from "next/link";
import { MapPin, Calendar, Clock, ArrowRight, CalendarDays, Ticket } from "lucide-react";
import { db } from "@/lib/db";
import { getServerTranslator } from "@/lib/i18n-server";

export default async function EventsPage() {
  const events = await db.listPublishedEvents();
  const { t } = await getServerTranslator();

  return (
    <div className="bg-background min-h-screen pb-24">
      {/* Header Section */}
      <section className="relative bg-maroon text-white pt-20 pb-24 md:pt-28 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="container-app relative z-10 text-center max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-2 rounded-full text-sm font-bold tracking-widest uppercase mb-6 border border-white/20">
            <CalendarDays size={16} /> {t("Community")}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight drop-shadow-md">
            {t("Our Initiatives & Events")}
          </h1>
          <p className="mt-6 text-xl text-cream/90 font-medium tracking-wide max-w-2xl mx-auto">
            {t("Join us in our upcoming community service activities, cultural events, and on-ground initiatives.")}
          </p>
        </div>
        {/* Decorative bottom curve */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-0">
          <svg className="relative block w-full h-[60px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" fill="var(--color-background)"></path>
          </svg>
        </div>
      </section>

      <div className="container-app max-w-5xl mx-auto relative z-20 mt-8">
        {events.length === 0 ? (
          <div className="text-center py-24 bg-surface rounded-3xl border border-dashed border-border/80 shadow-sm">
            <div className="w-20 h-20 bg-cream rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar size={36} className="text-maroon/50" />
            </div>
            <h3 className="text-2xl font-serif text-maroon mb-3">{t("No upcoming initiatives")}</h3>
            <p className="mt-2 text-muted max-w-md mx-auto text-lg leading-relaxed">
              {t("We are currently planning our next events. Please check back soon or join our newsletter to stay updated.")}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
            {events.map((e: any) => {
              const eventDate = new Date(e.eventDate);
              return (
                <Link
                  key={e.id}
                  href={`/events/${e.slug}`}
                  className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-border shadow-sm hover:shadow-xl hover:border-primary/40 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-cream">
                    {e.coverImage ? (
                      <img 
                        src={e.coverImage} 
                        alt={e.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-surface to-cream/50">
                        <Calendar size={48} className="text-primary/20" />
                      </div>
                    )}
                    
                    {/* Date Badge */}
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md rounded-xl p-3 text-center shadow-lg border border-white/50 min-w-[70px]">
                      <span className="block text-xs font-bold uppercase text-primary tracking-wider leading-none mb-1">
                        {eventDate.toLocaleString('en-IN', { month: 'short' })}
                      </span>
                      <span className="block text-2xl font-serif font-bold text-maroon leading-none">
                        {eventDate.getDate()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-8 flex-1 flex flex-col">
                    <h2 className="text-2xl font-serif font-bold text-maroon mb-4 group-hover:text-primary transition-colors line-clamp-2">
                      {t(e.title)}
                    </h2>
                    
                    <div className="space-y-3 mb-6">
                      <p className="flex items-center gap-3 text-sm text-text/80 font-medium">
                        <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <Calendar size={16} />
                        </span>
                        {eventDate.toLocaleString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                      </p>
                      
                      {e.location && (
                        <p className="flex items-center gap-3 text-sm text-text/80 font-medium">
                          <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <MapPin size={16} />
                          </span>
                          <span className="line-clamp-1">{e.venue ? `${t(e.venue)}, ` : ""}{t(e.location)}</span>
                        </p>
                      )}
                    </div>
                    
                    <p className="text-text/70 line-clamp-3 leading-relaxed mb-8">
                      {t(e.description)}
                    </p>
                    
                    <div className="mt-auto pt-6 border-t border-border flex items-center justify-between">
                      <span className="text-sm font-bold text-primary flex items-center gap-2 group-hover:gap-3 transition-all">
                        {t("View Details")} <ArrowRight size={16} />
                      </span>
                      <span className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-maroon group-hover:bg-primary group-hover:text-white transition-colors">
                        <Ticket size={18} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

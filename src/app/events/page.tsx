import Link from "next/link";
import { MapPin, Calendar } from "lucide-react";
import { db } from "@/lib/db";

export default async function EventsPage() {
  const events = await db.listPublishedEvents();

  return (
    <div className="container-app py-14">
      <div className="flex items-center justify-between mt-12 mb-8">
        <h1 className="text-4xl">Our Initiatives</h1>
      </div>

      {events.length === 0 ? (
        <p className="mt-16 text-center text-muted">No upcoming initiatives at the moment.</p>
      ) : (
        <div className="mt-10 grid sm:grid-cols-2 gap-6">
          {events.map((e: any) => (
            <Link
              key={e.id}
              href={`/events/${e.slug}`}
              className="p-6 rounded-lg border border-border bg-surface hover:shadow-[var(--shadow-soft)] transition-shadow"
            >
              <p className="flex items-center gap-1.5 text-xs text-primary font-medium">
                <Calendar size={13} />
                {new Date(e.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </p>
              <h2 className="mt-2 text-xl font-serif text-maroon">{e.title}</h2>
              {e.location && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                  <MapPin size={13} /> {e.venue ? `${e.venue}, ` : ""}{e.location}
                </p>
              )}
              <p className="mt-3 text-sm text-muted line-clamp-2">{e.description}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

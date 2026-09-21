import { notFound } from "next/navigation";
import { MapPin, Calendar } from "lucide-react";
import { db } from "@/lib/db";
import { EventRegisterForm } from "@/components/events/register-form";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await db.getEventBySlug(slug);
  if (!event || event.status !== "PUBLISHED") notFound();

  return (
    <div className="container-app py-14 grid lg:grid-cols-[2fr_1fr] gap-12">
      <div>
        <p className="flex items-center gap-1.5 text-sm text-primary font-medium">
          <Calendar size={14} />
          {new Date(event.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        </p>
        <h1 className="mt-2 text-4xl">{event.title}</h1>
        {(event.venue || event.location) && (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-muted">
            <MapPin size={14} /> {event.venue ? `${event.venue}, ` : ""}{event.location}
          </p>
        )}
        <p className="mt-6 text-text leading-relaxed">{event.description}</p>
      </div>

      <aside>
        {event.registrationEnabled ? (
          <div className="p-6 rounded-lg border border-border bg-cream">
            <h2 className="font-semibold text-maroon mb-4">Register</h2>
            <EventRegisterForm eventSlug={event.slug} />
          </div>
        ) : (
          <p className="text-muted">Registration is not open for this event.</p>
        )}
      </aside>
    </div>
  );
}

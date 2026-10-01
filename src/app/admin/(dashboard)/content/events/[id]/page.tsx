import { notFound } from "next/navigation";
import { Eye } from "lucide-react";
import { db } from "@/lib/db";
import { EventForm } from "@/components/admin/event-form";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await db.getEventById(id);
  if (!event) notFound();

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-serif text-maroon">Edit Event</h1>
        <a
          href={`/api/admin/preview?type=event&slug=${event.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm font-medium text-maroon hover:underline"
        >
          <Eye size={16} /> Preview
        </a>
      </div>
      <EventForm
        mode="edit"
        eventId={event.id}
        initial={{
          title: event.title,
          description: event.description,
          eventDate: event.eventDate,
          venue: event.venue ?? "",
          location: event.location ?? "",
          registrationEnabled: event.registrationEnabled,
          status: event.status as "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED",
        }}
      />
    </div>
  );
}

import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { EventForm } from "@/components/admin/event-form";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = db.getEventById(id);
  if (!event) notFound();

  return (
    <div>
      <h1 className="text-2xl font-serif text-maroon mb-6">Edit Event</h1>
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

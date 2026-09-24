import { EventForm } from "@/components/admin/event-form";

export default function NewEventPage() {
  return (
    <div>
      <h1 className="text-2xl font-serif text-maroon mb-6">New Event</h1>
      <EventForm mode="create" />
    </div>
  );
}

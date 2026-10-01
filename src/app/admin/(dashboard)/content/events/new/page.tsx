import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EventForm } from "@/components/admin/event-form";

export default function NewEventPage() {
  return (
    <div>
      <div className="mb-4">
        <Link href="/admin/content/events" className="text-sm text-muted hover:text-maroon flex items-center gap-1.5 w-fit">
          <ArrowLeft size={16} /> Back to Events
        </Link>
      </div>
      <h1 className="text-2xl font-serif text-maroon mb-6">New Event</h1>
      <EventForm mode="create" />
    </div>
  );
}

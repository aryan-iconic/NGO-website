import Link from "next/link";
import { db } from "@/lib/db";
import { LinkButton } from "@/components/ui/button";
import { DeleteButton } from "@/components/admin/delete-button";
import { BackToContent } from "@/components/admin/back-to-content";

type EventListItem = { id: string; title: string; eventDate: string | Date; status: string };

export default async function AdminEventsListPage() {
  const events = await db.listEvents() as EventListItem[];

  return (
    <div>
      <BackToContent />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif text-maroon">Events</h1>
        <LinkButton href="/admin/content/events/new" size="sm">New Event</LinkButton>
      </div>

      <div className="mt-6 bg-surface border border-border rounded-lg divide-y divide-border">
        {events.map((e) => (
          <div key={e.id} className="p-4 flex justify-between items-center hover:bg-cream/40">
            <div>
              <Link href={`/admin/content/events/${e.id}`} className="font-medium hover:text-primary">{e.title}</Link>
              <p className="text-xs text-muted">{new Date(e.eventDate).toLocaleDateString("en-IN")}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs px-2 py-0.5 rounded-full bg-cream text-maroon">{e.status}</span>
              <DeleteButton endpoint={`/api/admin/events/${e.id}`} title="" />
            </div>
          </div>
        ))}
        {events.length === 0 && <p className="p-8 text-center text-muted">No events yet.</p>}
      </div>
    </div>
  );
}

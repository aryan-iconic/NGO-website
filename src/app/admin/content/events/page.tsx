import Link from "next/link";
import { db } from "@/lib/db";
import { LinkButton } from "@/components/ui/button";

export default function AdminEventsListPage() {
  const events = db.listAllEvents();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif text-maroon">Events</h1>
        <LinkButton href="/admin/content/events/new" size="sm">New Event</LinkButton>
      </div>

      <div className="mt-6 bg-surface border border-border rounded-lg divide-y divide-border">
        {events.map((e) => (
          <Link key={e.id} href={`/admin/content/events/${e.id}`} className="p-4 flex justify-between items-center hover:bg-cream/40">
            <div>
              <p className="font-medium">{e.title}</p>
              <p className="text-xs text-muted">{new Date(e.eventDate).toLocaleDateString("en-IN")}</p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cream text-maroon">{e.status}</span>
          </Link>
        ))}
        {events.length === 0 && <p className="p-8 text-center text-muted">No events yet.</p>}
      </div>
    </div>
  );
}

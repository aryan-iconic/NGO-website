import Link from "next/link";
import { FileText, Calendar, HelpCircle, Image as ImageIcon } from "lucide-react";
import { db } from "@/lib/db";

export default function AdminContentPage() {
  const posts = db.listAllPosts();
  const events = db.listAllEvents();
  const faqs = db.listFaqs();

  const cards = [
    { href: "/admin/content/blog", icon: FileText, label: "Blog Posts", count: posts.length },
    { href: "/admin/content/events", icon: Calendar, label: "Events", count: events.length },
    { href: "/admin/content/faqs", icon: HelpCircle, label: "FAQs", count: faqs.length },
    { href: "/gallery", icon: ImageIcon, label: "Gallery (view only)", count: null },
  ];

  return (
    <div>
      <h1 className="text-2xl font-serif text-maroon">Content</h1>
      <p className="text-sm text-muted mt-1">Manage blog posts, events, and FAQs.</p>

      <div className="mt-6 grid sm:grid-cols-2 gap-4">
        {cards.map(({ href, icon: Icon, label, count }) => (
          <Link
            key={href}
            href={href}
            className="p-5 rounded-lg border border-border bg-surface hover:border-primary/40 hover:shadow-[var(--shadow-soft)] transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Icon size={20} className="text-primary" />
              <span className="font-medium text-maroon">{label}</span>
            </div>
            {count !== null && <span className="text-sm text-muted">{count}</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}

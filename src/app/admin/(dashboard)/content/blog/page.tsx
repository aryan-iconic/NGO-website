import Link from "next/link";
import { db } from "@/lib/db";
import { LinkButton } from "@/components/ui/button";
import { DeleteButton } from "@/components/admin/delete-button";

export default async function AdminBlogListPage() {
  const posts = await db.listBlogPosts();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif text-maroon">Blog Posts</h1>
        <LinkButton href="/admin/content/blog/new" size="sm">New Post</LinkButton>
      </div>

      <div className="mt-6 bg-surface border border-border rounded-lg divide-y divide-border">
        {posts.map((p: any) => (
          <div key={p.id} className="p-4 flex justify-between items-center hover:bg-cream/40">
            <div>
              <Link href={`/admin/content/blog/${p.id}`} className="font-medium hover:text-primary">{p.title}</Link>
              <p className="text-xs text-muted">/blog/{p.slug}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs px-2 py-0.5 rounded-full bg-cream text-maroon">{p.status}</span>
              <DeleteButton endpoint={`/api/admin/blog/${p.id}`} title="" />
            </div>
          </div>
        ))}
        {posts.length === 0 && <p className="p-8 text-center text-muted">No posts yet.</p>}
      </div>
    </div>
  );
}

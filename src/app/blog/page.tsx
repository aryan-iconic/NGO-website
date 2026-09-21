import Link from "next/link";
import { db } from "@/lib/db";

export default async function BlogPage() {
  const posts = await db.listBlogPosts();

  return (
    <div className="container-app py-14 max-w-3xl">
      <h1 className="text-4xl">Blog</h1>
      <p className="text-muted mt-2">Stories and updates from the field.</p>

      <div className="mt-10 space-y-8">
        {posts.map((p: any) => (
          <Link key={p.id} href={`/blog/${p.slug}`} className="block group">
            <p className="text-xs text-muted">
              {p.publishedAt && new Date(p.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              {p.author ? ` · ${p.author}` : ""}
            </p>
            <h2 className="mt-1 text-2xl font-serif text-maroon group-hover:text-primary transition-colors">
              {p.title}
            </h2>
            <p className="mt-2 text-muted">{p.excerpt}</p>
          </Link>
        ))}
        {posts.length === 0 && <p className="text-muted">No posts published yet.</p>}
      </div>
    </div>
  );
}

import Link from "next/link";
import { db } from "@/lib/db";
import { getServerTranslator } from "@/lib/i18n-server";

export default async function BlogPage() {
  const posts = (await db.listBlogPosts()).filter((p: any) => p.status === "PUBLISHED");
  const { t } = await getServerTranslator();

  return (
    <div className="container-app py-14 max-w-3xl">
      <h1 className="text-4xl">{t("Blog")}</h1>
      <p className="text-muted mt-2">{t("Stories and updates from the field.")}</p>

      <div className="mt-10 space-y-8">
        {posts.map((p: any) => (
          <Link key={p.id} href={`/blog/${p.slug}`} className="block group">
            {p.coverImage && (
              <div className="mb-4">
                <img src={p.coverImage} alt={p.title} className="w-full aspect-video object-cover rounded-lg border border-border" />
              </div>
            )}
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
        {posts.length === 0 && <p className="text-muted">{t("No posts published yet.")}</p>}
      </div>
    </div>
  );
}

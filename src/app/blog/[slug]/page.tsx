import { notFound } from "next/navigation";
import { db } from "@/lib/db";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = db.getPostBySlug(slug);
  if (!post || post.status !== "PUBLISHED") notFound();

  return (
    <article className="container-app py-14 max-w-2xl">
      <p className="text-xs text-muted">
        {post.publishedAt && new Date(post.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        {post.author ? ` · ${post.author}` : ""}
      </p>
      <h1 className="mt-2 text-4xl">{post.title}</h1>
      <div className="mt-8 text-text leading-relaxed whitespace-pre-line">{post.content}</div>
    </article>
  );
}

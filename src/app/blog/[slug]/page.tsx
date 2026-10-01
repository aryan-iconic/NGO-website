import { notFound } from "next/navigation";
import { draftMode } from "next/headers";
import { db } from "@/lib/db";
import { ShareButtons } from "@/components/ui/share-buttons";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await db.getBlogPostBySlug(slug);
  const isDraftMode = (await draftMode()).isEnabled;
  if (!post || (!isDraftMode && post.status !== "PUBLISHED")) notFound();

  return (
    <article className="container-app py-14 max-w-2xl">
      <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
        <p className="text-xs text-muted">
          {post.publishedAt && new Date(post.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          {post.author ? ` · ${post.author}` : ""}
        </p>
        <ShareButtons title={post.title} text={post.shortDescription || post.title} />
      </div>
      <h1 className="text-4xl">{post.title}</h1>
      {post.coverImage && (
        <img src={post.coverImage} alt={post.title} className="mt-8 w-full aspect-[2/1] rounded-lg object-cover border border-border" />
      )}
      <div className="mt-8 text-text leading-relaxed whitespace-pre-line">{post.content}</div>
    </article>
  );
}

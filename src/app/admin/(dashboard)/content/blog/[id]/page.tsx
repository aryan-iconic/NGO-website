import { notFound } from "next/navigation";
import Link from "next/link";
import { Eye, ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { BlogForm } from "@/components/admin/blog-form";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await db.getBlogPostById(id);
  if (!post) notFound();

  return (
    <div>
      <div className="mb-4">
        <Link href="/admin/content/blog" className="text-sm text-muted hover:text-maroon flex items-center gap-1.5 w-fit">
          <ArrowLeft size={16} /> Back to Blog
        </Link>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-serif text-maroon">Edit Blog Post</h1>
        <a
          href={`/api/admin/preview?type=blog&slug=${post.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm font-medium text-maroon hover:underline"
        >
          <Eye size={16} /> Preview
        </a>
      </div>
      <BlogForm
        mode="edit"
        postId={post.id}
        initial={{
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          author: post.author ?? "",
          status: post.status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
        }}
      />
    </div>
  );
}

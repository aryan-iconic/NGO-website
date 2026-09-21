import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { BlogForm } from "@/components/admin/blog-form";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = db.getPostById(id);
  if (!post) notFound();

  return (
    <div>
      <h1 className="text-2xl font-serif text-maroon mb-6">Edit Blog Post</h1>
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

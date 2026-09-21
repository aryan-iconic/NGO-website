import { BlogForm } from "@/components/admin/blog-form";

export default function NewBlogPostPage() {
  return (
    <div>
      <h1 className="text-2xl font-serif text-maroon mb-6">New Blog Post</h1>
      <BlogForm mode="create" />
    </div>
  );
}

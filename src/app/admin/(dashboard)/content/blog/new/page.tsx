import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BlogForm } from "@/components/admin/blog-form";

export default function NewBlogPostPage() {
  return (
    <div>
      <div className="mb-4">
        <Link href="/admin/content/blog" className="text-sm text-muted hover:text-maroon flex items-center gap-1.5 w-fit">
          <ArrowLeft size={16} /> Back to Blog
        </Link>
      </div>
      <h1 className="text-2xl font-serif text-maroon mb-6">New Blog Post</h1>
      <BlogForm mode="create" />
    </div>
  );
}

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function BackToContent() {
  return (
    <Link
      href="/admin/content"
      className="mb-4 flex w-fit items-center gap-1.5 text-sm text-muted hover:text-maroon"
    >
      <ArrowLeft size={16} aria-hidden="true" />
      Back to Content
    </Link>
  );
}

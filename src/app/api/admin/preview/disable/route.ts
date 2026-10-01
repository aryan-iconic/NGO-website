import { draftMode } from "next/headers";
import { requireAdmin } from "@/lib/require-admin";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const slug = searchParams.get("slug");

  const draft = await draftMode();
  draft.disable();

  if (type && slug) {
    switch (type) {
      case "campaign":
        redirect(`/campaigns/${slug}`);
      case "event":
        redirect(`/events/${slug}`);
      case "blog":
        redirect(`/blog/${slug}`);
      case "gallery":
        redirect(`/gallery`);
      default:
        redirect(`/admin`);
    }
  }

  redirect(`/admin`);
}

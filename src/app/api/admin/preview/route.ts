import { draftMode } from "next/headers";
import { requireAdmin } from "@/lib/require-admin";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const slug = searchParams.get("slug");
  
  if (!type || !slug) {
    return new Response("Missing type or slug", { status: 400 });
  }

  const draft = await draftMode();
  draft.enable();

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
      return new Response("Invalid type", { status: 400 });
  }
}

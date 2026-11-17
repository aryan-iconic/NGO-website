import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUserId } from "@/lib/auth";
import { RecurringList } from "@/components/user/recurring-list";

export default async function UserSubscriptionsPage() {
  if (!await getCurrentUserId()) redirect("/login");
  return <main className="container-app min-h-[60vh] py-12 sm:py-16">
    <Link href="/user/dashboard" className="text-sm text-primary hover:underline">← Back to your account</Link>
    <h1 className="mt-4 text-3xl font-serif text-maroon">Monthly subscriptions</h1>
    <p className="mt-2 mb-8 text-muted">View your monthly giving status and upcoming billing details.</p>
    <div className="max-w-3xl"><RecurringList /></div>
  </main>;
}

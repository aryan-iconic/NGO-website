import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { LinkButton } from "@/components/ui/button";

export default function MonthlyGivingPage() {
  return <main className="container-app min-h-[60vh] py-20 max-w-2xl text-center">
    <RefreshCw size={48} className="mx-auto text-primary" />
    <h1 className="mt-6 text-3xl font-serif text-maroon">Monthly Giving</h1>
    <p className="mt-4 text-muted">Recurring payment setup is temporarily unavailable. No monthly payment will be scheduled from this page. You can make a secure one-time donation now.</p>
    <div className="mt-8"><LinkButton href="/donate">Make a One-Time Donation</LinkButton></div>
    <p className="mt-4 text-sm text-muted">Already have a monthly contribution? <Link className="text-primary underline" href="/user/dashboard">Sign in to view your account.</Link></p>
  </main>;
}

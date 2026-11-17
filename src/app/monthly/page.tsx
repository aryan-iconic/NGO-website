import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { MonthlyPlans } from "@/components/user/monthly-plans";

export default function MonthlyGivingPage() {
  return <main className="container-app min-h-[60vh] max-w-4xl py-14 text-center sm:py-20">
    <RefreshCw size={44} className="mx-auto text-primary" />
    <h1 className="mt-5 text-3xl font-serif text-maroon">Monthly Giving</h1>
    <p className="mx-auto mt-3 max-w-2xl text-muted">Choose a monthly plan to support the Trust’s ongoing seva. You will authorize the recurring mandate securely through Razorpay.</p>
    <MonthlyPlans />
    <p className="mt-8 text-sm text-muted">Already giving monthly? <Link className="text-primary underline" href="/user/subscriptions">View or manage your subscriptions</Link></p>
  </main>;
}

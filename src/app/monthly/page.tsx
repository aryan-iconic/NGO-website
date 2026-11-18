import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { MonthlyPlans } from "@/components/user/monthly-plans";
import { T } from "@/components/i18n/t";

export default function MonthlyGivingPage() {
  return <main className="container-app min-h-[60vh] max-w-4xl py-14 text-center sm:py-20">
    <RefreshCw size={44} className="mx-auto text-primary" />
    <h1 className="mt-5 text-3xl font-serif text-maroon"><T k="monthly.title" /></h1>
    <p className="mx-auto mt-3 max-w-2xl text-muted"><T k="monthly.intro" /></p>
    <MonthlyPlans />
    <p className="mt-8 text-sm text-muted"><T k="monthly.already" /> <Link className="text-primary underline" href="/user/subscriptions"><T k="monthly.manage" /></Link></p>
  </main>;
}

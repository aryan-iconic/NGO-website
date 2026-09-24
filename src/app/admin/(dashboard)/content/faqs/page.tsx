import { db } from "@/lib/db";
import { FaqManager } from "@/components/admin/faq-manager";

export default async function AdminFaqsPage() {
  const faqs = await db.listFaqs();
  return (
    <div>
      <h1 className="text-2xl font-serif text-maroon mb-6">FAQs</h1>
      <FaqManager initial={faqs} />
    </div>
  );
}

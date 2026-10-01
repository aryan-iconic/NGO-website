import { db } from "@/lib/db";
import { T } from "@/components/i18n/t";
import { getServerTranslator } from "@/lib/i18n-server";

export default async function FaqPage() {
  const faqs = await db.listFaqs();
  const categories = Array.from(new Set(faqs.map((f: any) => f.category ?? "General")));
  const { t } = await getServerTranslator();

  return (
    <div className="container-app py-14 max-w-2xl">
      <h1 className="text-4xl"><T k="faq.title" /></h1>

      <div className="mt-10 space-y-10">
        {categories.map((cat: any) => (
          <section key={cat}>
            <h2 className="text-xl text-maroon">{t(cat)}</h2>
            <div className="mt-4 divide-y divide-border border border-border rounded-lg">
              {faqs
                .filter((f: any) => (f.category ?? "General") === cat)
                .map((f: any) => (
                  <details key={f.id} className="p-4 group">
                    <summary className="cursor-pointer font-medium text-maroon list-none flex justify-between">
                      {t(f.question)}
                      <span className="text-muted group-open:rotate-45 transition-transform">+</span>
                    </summary>
                    <p className="mt-2 text-sm text-muted">{t(f.answer)}</p>
                  </details>
                ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

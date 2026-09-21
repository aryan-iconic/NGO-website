import { db } from "@/lib/db";

export default function FaqPage() {
  const faqs = db.listFaqs();
  const categories = Array.from(new Set(faqs.map((f) => f.category ?? "General")));

  return (
    <div className="container-app py-14 max-w-2xl">
      <h1 className="text-4xl">Frequently Asked Questions</h1>

      <div className="mt-10 space-y-10">
        {categories.map((cat) => (
          <section key={cat}>
            <h2 className="text-xl text-maroon">{cat}</h2>
            <div className="mt-4 divide-y divide-border border border-border rounded-lg">
              {faqs
                .filter((f) => (f.category ?? "General") === cat)
                .map((f) => (
                  <details key={f.id} className="p-4 group">
                    <summary className="cursor-pointer font-medium text-maroon list-none flex justify-between">
                      {f.question}
                      <span className="text-muted group-open:rotate-45 transition-transform">+</span>
                    </summary>
                    <p className="mt-2 text-sm text-muted">{f.answer}</p>
                  </details>
                ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Faq {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export function FaqManager({ initial }: { initial: Faq[] }) {
  const [faqs, setFaqs] = useState<Faq[]>(initial);
  const [form, setForm] = useState({ question: "", answer: "", category: "" });
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    const res = await fetch("/api/admin/faqs");
    const data = await res.json();
    if (data.success) setFaqs(data.faqs);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/admin/faqs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ question: "", answer: "", category: "" });
    setLoading(false);
    refresh();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/faqs/${id}`, { method: "DELETE" });
    setFaqs((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleAdd} className="p-5 rounded-lg border border-border bg-cream space-y-3">
        <p className="font-medium text-maroon">Add FAQ</p>
        <input
          required
          placeholder="Question"
          value={form.question}
          onChange={(e) => setForm({ ...form, question: e.target.value })}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-surface"
        />
        <textarea
          required
          rows={2}
          placeholder="Answer"
          value={form.answer}
          onChange={(e) => setForm({ ...form, answer: e.target.value })}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-surface"
        />
        <input
          placeholder="Category (optional)"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-surface"
        />
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? "Adding…" : "Add FAQ"}
        </Button>
      </form>

      <div className="mt-6 divide-y divide-border border border-border rounded-lg">
        {faqs.map((f) => (
          <div key={f.id} className="p-4 flex justify-between gap-4">
            <div>
              <p className="font-medium text-maroon">{f.question}</p>
              <p className="text-sm text-muted mt-1">{f.answer}</p>
              {f.category && <p className="text-xs text-muted mt-1">{f.category}</p>}
            </div>
            <button
              aria-label={`Delete FAQ: ${f.question}`}
              onClick={() => handleDelete(f.id)}
              className="text-muted hover:text-red shrink-0"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {faqs.length === 0 && <p className="p-8 text-center text-muted">No FAQs yet.</p>}
      </div>
    </div>
  );
}

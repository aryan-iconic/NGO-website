"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

type SearchResult = { type: string; title: string; description: string; href: string };

export function SearchPageClient() {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (query.trim().length < 2) { setMessage(t("Enter at least two characters.")); return; }
    setStatus("loading"); setMessage("");
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
      const data = await response.json();
      if (!response.ok) throw new Error(t(data.error || "Search is unavailable. Try again."));
      setResults(data.results || []); setStatus("done");
    } catch (error) { setStatus("error"); setMessage(t(error instanceof Error ? error.message : "Search failed. Try again.")); }
  };
  return <main className="container-app min-h-[60vh] max-w-3xl py-16">
    <h1 className="text-3xl font-serif text-maroon">{t("Search the website")}</h1>
    <form onSubmit={submit} className="mt-6 flex gap-3">
      <label className="sr-only" htmlFor="site-search">{t("Search campaigns, events, and blog posts")}</label>
      <input id="site-search" autoFocus value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 rounded-lg border border-border bg-white px-4 py-3" placeholder={t("Search campaigns, events, and blog posts")} />
      <button className="rounded-lg bg-primary px-5 py-3 font-semibold text-white">{status === "loading" ? t("Searching…") : t("Search")}</button>
    </form>
    {message && <p role="alert" className="mt-4 text-red">{message}</p>}
    {status === "done" && <section aria-live="polite" className="mt-8 space-y-4">
      {results.length ? results.map((result) => <article key={`${result.type}-${result.href}`} className="rounded-lg border border-border bg-white p-4"><p className="text-xs font-semibold uppercase text-primary">{t(result.type)}</p><h2 className="mt-1 text-lg"><Link className="text-maroon hover:underline" href={result.href}>{result.title}</Link></h2><p className="mt-1 text-sm text-muted line-clamp-2">{result.description}</p></article>) : <p className="text-muted">{t("No results found for “{query}”.", { query })}</p>}
    </section>}
  </main>;
}

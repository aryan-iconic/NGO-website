export function LegalPage({
  title,
  updated,
  sections,
}: {
  title: string;
  updated: string;
  sections: { heading: string; body: string }[];
}) {
  return (
    <div className="container-app py-14 max-w-2xl">
      <h1 className="text-4xl">{title}</h1>
      <p className="text-sm text-muted mt-2">Last updated: {updated}</p>
      <div className="mt-10 space-y-8">
        {sections.map((s) => (
          <section key={s.heading}>
            <h2 className="text-xl text-maroon">{s.heading}</h2>
            <p className="mt-2 text-muted leading-relaxed">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}

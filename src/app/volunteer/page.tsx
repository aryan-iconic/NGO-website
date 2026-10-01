"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { T } from "@/components/i18n/t";
import { useI18n } from "@/lib/i18n";
import { HeartHandshake, CheckCircle2, Sparkles, Send } from "lucide-react";

const interestOptions = [
  "Event Support",
  "Education",
  "Community Service",
  "Digital/Technology",
  "Photography/Media",
  "Fundraising Support",
  "Field Activities",
];

export default function VolunteerPage() {
  const { t } = useI18n();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    availability: "",
    message: "",
  });
  const [interests, setInterests] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const toggleInterest = (i: string) =>
    setInterests((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (interests.length === 0) {
      setError("Please select at least one area of interest.");
      return;
    }
    setStatus("loading");
    setError(null);
    const res = await fetch("/api/volunteers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, interests }),
    });
    const data = await res.json();
    if (!data.success) {
      setStatus("error");
      setError(data.error?.message ?? "Something went wrong.");
      return;
    }
    setStatus("done");
  };

  if (status === "done") {
    return (
      <div className="bg-background min-h-[80vh] flex items-center justify-center py-20 px-4">
        <div className="max-w-lg w-full bg-white rounded-3xl p-10 md:p-14 text-center shadow-xl border border-border relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-success/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-success/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
          
          <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-8 relative">
            <HeartHandshake size={40} className="text-success relative z-10" />
            <div className="absolute inset-0 border-2 border-success/30 rounded-full animate-ping opacity-20"></div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-serif text-maroon mb-4"><T k="vol.done.h" /></h1>
          <p className="text-lg text-text/80 leading-relaxed font-medium">
            <T k="vol.done.p" />
          </p>
          
          <Button onClick={() => window.location.href = '/'} variant="outline" className="mt-10 rounded-full">
            {t("Return to Home")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative bg-maroon text-white pt-24 pb-32 md:pt-32 md:pb-40 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="container-app relative z-10 text-center max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-2 rounded-full text-sm font-bold tracking-widest uppercase mb-6 border border-white/20">
            <Sparkles size={16} /> {t("Be The Change")}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight drop-shadow-md">
            <T k="vol.title" />
          </h1>
          <p className="mt-6 text-xl text-cream/90 font-medium tracking-wide max-w-xl mx-auto">
            <T k="vol.subtitle" />
          </p>
        </div>
        {/* Decorative bottom curve */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-0">
          <svg className="relative block w-full h-[80px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" fill="var(--color-background)"></path>
          </svg>
        </div>
      </section>

      <div className="container-app max-w-5xl mx-auto -mt-20 md:-mt-24 relative z-20">
        <div className="bg-white rounded-3xl p-8 md:p-12 lg:p-14 border border-border shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-maroon/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
          
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
            
            <div className="lg:col-span-5 space-y-8">
              <div>
                <h2 className="text-3xl font-serif text-maroon mb-4">{t("Why Volunteer?")}</h2>
                <p className="text-text leading-relaxed text-lg">
                  {t("Volunteering with Shri Nityanikunj Trust is an opportunity to make a tangible difference in the lives of those who need it most. Whether you can offer a few hours a month or regular support, your time is invaluable.")}
                </p>
              </div>
              
              <div className="space-y-5">
                {[
                  "Gain hands-on experience in social work",
                  "Connect with like-minded individuals",
                  "Receive an official certificate of appreciation",
                  "Directly impact your community"
                ].map((benefit, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="text-primary shrink-0 mt-0.5" size={20} />
                    <span className="font-medium text-text">{t(benefit)}</span>
                  </div>
                ))}
              </div>
              
              <div className="bg-cream/50 border border-border/80 rounded-2xl p-6 mt-8">
                <p className="font-serif italic text-maroon text-lg text-center">
                  "{t("The best way to find yourself is to lose yourself in the service of others.")}"
                </p>
              </div>
            </div>

            <div className="lg:col-span-7">
              <form onSubmit={handleSubmit} className="space-y-6 bg-surface/50 p-6 md:p-8 rounded-2xl border border-border shadow-sm">
                
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text ml-1"><T k="vol.f.name" /> *</label>
                    <input
                      required
                      placeholder="John Doe"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full rounded-xl border border-border px-4 py-3 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text ml-1"><T k="vol.f.email" /> *</label>
                    <input
                      required
                      type="email"
                      placeholder="john@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full rounded-xl border border-border px-4 py-3 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    />
                  </div>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text ml-1"><T k="vol.f.phone" /> *</label>
                    <input
                      required
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full rounded-xl border border-border px-4 py-3 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text ml-1"><T k="vol.f.city" /> *</label>
                    <input
                      required
                      placeholder="Varanasi"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="w-full rounded-xl border border-border px-4 py-3 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="text-sm font-medium text-text ml-1 flex items-center justify-between">
                    <span><T k="vol.f.interests" /> *</span>
                    <span className="text-xs text-muted font-normal">{t("Select multiple")}</span>
                  </label>
                  <div className="flex flex-wrap gap-2.5 p-4 bg-white rounded-xl border border-border">
                    {interestOptions.map((i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => toggleInterest(i)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border shadow-sm ${
                          interests.includes(i)
                            ? "bg-primary text-white border-primary ring-2 ring-primary/20 ring-offset-1"
                            : "bg-surface border-border text-text hover:border-primary/50 hover:bg-cream"
                        }`}
                      >
                        {t(i)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text ml-1"><T k="vol.f.avail" /> *</label>
                  <input
                    required
                    placeholder="Weekends, Tuesday evenings, etc."
                    value={form.availability}
                    onChange={(e) => setForm({ ...form, availability: e.target.value })}
                    className="w-full rounded-xl border border-border px-4 py-3 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text ml-1"><T k="vol.f.msg" /></label>
                  <textarea
                    rows={4}
                    placeholder="Any relevant skills or previous experience? Let us know!"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full rounded-xl border border-border px-4 py-3 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none"
                  />
                </div>

                {error && (
                  <div className="p-4 bg-red/10 text-red text-sm rounded-xl border border-red/20 font-medium">
                    {error}
                  </div>
                )}
                
                <Button type="submit" size="lg" className="w-full py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 mt-4" disabled={status === "loading"}>
                  {status === "loading" ? <T k="vol.submitting" /> : <span className="flex items-center gap-2"><HeartHandshake size={20} /> <T k="vol.submit" /></span>}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { T } from "@/components/i18n/t";
import { useI18n } from "@/lib/i18n";

export default function ContactPage() {
  const { t, getSetting } = useI18n();
  const contactEmail = getSetting("contact.email", "shrinitynikunj@gmail.com");
  const contactPhone = getSetting("contact.phone", "+91 94508 81090");
  const contactAddress = getSetting("contact.address", "Shri Nityanikunj Trust, Vrindavan, Susuwahi, Varanasi - 221011, Uttar Pradesh, India");
  const mapEmbedUrl = getSetting("contact.map_embed_url", "https://maps.google.com/maps?q=Shri+Nityanikunj+Trust,+Vrindavan,+Susuwahi,+Varanasi,+Kandwa,+Uttar+Pradesh+221011&t=&z=15&ie=UTF8&iwloc=&output=embed");
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!data.success) {
      setStatus("error");
      setError(data.error?.message ?? "Something went wrong.");
      return;
    }
    setStatus("done");
  };

  return (
    <div className="bg-background min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative bg-maroon text-white pt-24 pb-32 md:pt-32 md:pb-40 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="container-app relative z-10 text-center max-w-3xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight drop-shadow-md">
            <T k="contact.title" />
          </h1>
          <p className="mt-6 text-xl text-cream/90 font-medium tracking-wide max-w-xl mx-auto">
            <T k="contact.subtitle" />
          </p>
        </div>
        {/* Decorative bottom curve */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-0">
          <svg className="relative block w-full h-[80px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" fill="var(--color-background)"></path>
          </svg>
        </div>
      </section>

      <div className="container-app max-w-6xl mx-auto -mt-20 md:-mt-24 relative z-20">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Contact Info Cards */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface rounded-2xl p-8 border border-border shadow-xl backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-cream rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 pointer-events-none"></div>
              
              <h2 className="text-2xl font-serif text-maroon mb-8 relative z-10">{t("Get in Touch")}</h2>
              
              <div className="space-y-8 relative z-10">
                <a href={`mailto:${contactEmail}`} className="flex items-start gap-5 group/item">
                  <div className="w-12 h-12 rounded-full bg-cream flex items-center justify-center text-maroon shadow-inner shrink-0 group-hover/item:bg-primary group-hover/item:text-white transition-colors duration-300">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold tracking-widest text-primary uppercase mb-1">{t("Email Us")}</p>
                    <p className="text-text font-medium group-hover/item:text-primary transition-colors">{contactEmail}</p>
                  </div>
                </a>
                
                <a href={`tel:${contactPhone.replace(/[^\d+]/g, "")}`} className="flex items-start gap-5 group/item">
                  <div className="w-12 h-12 rounded-full bg-cream flex items-center justify-center text-maroon shadow-inner shrink-0 group-hover/item:bg-primary group-hover/item:text-white transition-colors duration-300">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold tracking-widest text-primary uppercase mb-1">{t("Call Us")}</p>
                    <p className="text-text font-medium group-hover/item:text-primary transition-colors">{contactPhone}</p>
                  </div>
                </a>
                
                <div className="flex items-start gap-5 group/item">
                  <div className="w-12 h-12 rounded-full bg-cream flex items-center justify-center text-maroon shadow-inner shrink-0 group-hover/item:bg-primary group-hover/item:text-white transition-colors duration-300">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold tracking-widest text-primary uppercase mb-1">{t("Visit Us")}</p>
                    <p className="text-text font-medium leading-relaxed">{contactAddress}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl p-8 md:p-10 border border-border shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
              
              <div className="flex items-center gap-3 mb-8">
                <MessageSquare className="text-primary" size={28} />
                <h2 className="text-2xl font-serif text-maroon">{t("Send a Message")}</h2>
              </div>

              {status === "done" ? (
                <div className="py-12 text-center bg-success/5 rounded-xl border border-success/20">
                  <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Send size={32} className="text-success" />
                  </div>
                  <h3 className="text-2xl font-serif text-success mb-2">{t("Message Sent!")}</h3>
                  <p className="text-success/80 max-w-md mx-auto"><T k="contact.done" /></p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-text ml-1"><T k="contact.f.name" /> *</label>
                      <input
                        required
                        placeholder="John Doe"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full rounded-xl border border-border px-4 py-3 bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-text ml-1"><T k="contact.f.email" /> *</label>
                      <input
                        required
                        type="email"
                        placeholder="john@example.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full rounded-xl border border-border px-4 py-3 bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text ml-1"><T k="contact.f.phone" /></label>
                    <div className="flex gap-2">
                      <select 
                        className="w-28 rounded-xl border border-border px-3 py-3 bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm font-medium"
                        defaultValue="+91"
                      >
                        <option value="+91">🇮🇳 +91</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+971">🇦🇪 +971</option>
                        <option value="+61">🇦🇺 +61</option>
                      </select>
                      <input
                        required
                        placeholder="98765 43210"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="flex-1 rounded-xl border border-border px-4 py-3 bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text ml-1"><T k="contact.f.sub" /> *</label>
                    <input
                      required
                      placeholder="How can we help?"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full rounded-xl border border-border px-4 py-3 bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text ml-1"><T k="contact.f.msg" /> *</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Write your message here..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full rounded-xl border border-border px-4 py-3 bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none"
                    />
                  </div>

                  {error && (
                    <div className="p-4 bg-red/10 text-red text-sm rounded-xl border border-red/20 font-medium">
                      {error}
                    </div>
                  )}

                  <Button type="submit" size="lg" className="w-full py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5" disabled={status === "loading"}>
                    {status === "loading" ? <T k="contact.submitting" /> : <span className="flex items-center gap-2"><Send size={18} /> <T k="contact.submit" /></span>}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Map Embed */}
        <div className="mt-16 rounded-2xl overflow-hidden border border-border shadow-lg h-[500px] relative">
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md font-serif text-maroon font-bold z-10 border border-white">
            {t("Our Location")}
          </div>
          <iframe
            src={mapEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Shri Nityanikunj Ras Seva Sansthan Trust Location"
            className="filter contrast-100"
          />
        </div>
      </div>
    </div>
  );
}

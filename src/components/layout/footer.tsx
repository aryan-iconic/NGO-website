import Link from "next/link";
import { Logo } from "./logo";
import { T } from "@/components/i18n/t";

const columns = [
  {
    title: "Explore",
    titleKey: "footer.explore",
    links: [
      { href: "/campaigns", label: "footer.campaigns" },
      { href: "/donate", label: "donate" },
      { href: "/gallery", label: "footer.gallery" },
      { href: "/blog", label: "footer.blog" },
    ],
  },
  {
    title: "About",
    titleKey: "footer.about",
    links: [
      { href: "/about", label: "footer.ourStory" },
      { href: "/about#transparency", label: "footer.transparency" },
      { href: "/volunteer", label: "nav.volunteer" },
      { href: "/contact", label: "nav.contact" },
    ],
  },
  {
    title: "Legal",
    titleKey: "footer.legal",
    links: [
      { href: "/privacy-policy", label: "footer.privacyPolicy" },
      { href: "/terms", label: "footer.terms" },
      { href: "/donation-policy", label: "footer.donationPolicy" },
      { href: "/refund-policy", label: "footer.refundPolicy" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-background-alt border-t border-border mt-24">
      <div className="container-app py-14 grid gap-10 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="text-sm text-muted mt-4 max-w-xs">
            <T k="footer.tagline" />
          </p>
          <div className="flex gap-4 mt-6">
            <a href="https://www.facebook.com/share/18Zpv6VC14/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-9 h-9 rounded-full bg-cream flex items-center justify-center text-maroon hover:bg-primary hover:text-white transition-colors">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            <a href="https://x.com/ShriNitynikunj" target="_blank" rel="noopener noreferrer" aria-label="Twitter X" className="w-9 h-9 rounded-full bg-cream flex items-center justify-center text-maroon hover:bg-primary hover:text-white transition-colors">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4l11.733 16h4.267l-11.733-16z" />
                <path d="M4 20l6.768-6.768m2.46-2.46l6.772-6.772" />
              </svg>
            </a>
            <a href="https://www.instagram.com/shri_nitynikunj_trust?stkn=MWM3cDdhZ3I4MXJieQ==" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-9 h-9 rounded-full bg-cream flex items-center justify-center text-maroon hover:bg-primary hover:text-white transition-colors">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
              </svg>
            </a>
            <a href="https://youtube.com/@shrinityanikunjtrust?si=i-z2jCj2_6BysH5H" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="w-9 h-9 rounded-full bg-cream flex items-center justify-center text-maroon hover:bg-primary hover:text-white transition-colors">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z" />
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
              </svg>
            </a>
          </div>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold text-maroon mb-3"><T k={col.titleKey as any} /></h4>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted hover:text-primary transition-colors">
                    <T k={l.label as any} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      
      {/* Map Embed in Footer */}
      <div className="container-app pb-14">
        <div className="w-full h-[250px] rounded-lg overflow-hidden border border-border">
          <iframe
            src="https://maps.google.com/maps?q=Shri+Nityanikunj+Trust,+Vrindavan,+Susuwahi,+Varanasi,+Kandwa,+Uttar+Pradesh+221011&t=&z=15&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Shri Nityanikunj Ras Seva Sansthan Trust Location"
          />
        </div>
      </div>

      <div className="border-t border-border py-5">
        <p className="container-app text-xs text-muted">
          © {new Date().getFullYear()} Shri Nityanikunj Ras Seva Sansthan Trust, Varanasi. <T k="footer.copyright" />
        </p>
      </div>
    </footer>
  );
}

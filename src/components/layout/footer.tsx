import Link from "next/link";
import { Logo } from "./logo";
import { T } from "@/components/i18n/t";

const columns = [
  {
    title: "Explore",
    links: [
      { href: "/campaigns", label: "Campaigns" },
      { href: "/donate", label: "Donate" },
      { href: "/gallery", label: "Gallery" },
      { href: "/blog", label: "Blog" },
    ],
  },
  {
    title: "About",
    links: [
      { href: "/about", label: "Our Story" },
      { href: "/about#transparency", label: "Transparency" },
      { href: "/volunteer", label: "Volunteer" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy-policy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms" },
      { href: "/donation-policy", label: "Donation Policy" },
      { href: "/refund-policy", label: "Refund Policy" },
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
            <a href="#" aria-label="Facebook" className="w-9 h-9 rounded-full bg-cream flex items-center justify-center text-maroon hover:bg-primary hover:text-white transition-colors">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            <a href="#" aria-label="Twitter" className="w-9 h-9 rounded-full bg-cream flex items-center justify-center text-maroon hover:bg-primary hover:text-white transition-colors">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </svg>
            </a>
            <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-full bg-cream flex items-center justify-center text-maroon hover:bg-primary hover:text-white transition-colors">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
              </svg>
            </a>
          </div>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold text-maroon mb-3">{col.title}</h4>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted hover:text-primary transition-colors">
                    {l.label}
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
          © {new Date().getFullYear()} Shri Nityanikunj Ras Seva Sansthan Trust, Varanasi. Registration and legal details
          appear here once provided by the Trust.
        </p>
      </div>
    </footer>
  );
}

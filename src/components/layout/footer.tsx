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
      <div className="border-t border-border py-5">
        <p className="container-app text-xs text-muted">
          © {new Date().getFullYear()} Shri Nityanikunj Ras Seva Sansthan Trust, Varanasi. Registration and legal details
          appear here once provided by the Trust.
        </p>
      </div>
    </footer>
  );
}

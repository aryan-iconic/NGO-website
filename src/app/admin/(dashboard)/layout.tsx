import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import {
  LayoutDashboard,
  Megaphone,
  HandCoins,
  RefreshCw,
  Users,
  Image as ImageIcon,
  Settings,
  ScrollText,
} from "lucide-react";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/admin/seva-areas", label: "Seva Areas", icon: LayoutDashboard },
  { href: "/admin/donations", label: "Donations", icon: HandCoins },
  { href: "/admin/recurring", label: "Monthly Giving", icon: RefreshCw },
  { href: "/admin/people", label: "People", icon: Users },
  { href: "/admin/content", label: "Content", icon: ImageIcon },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-background-alt">
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-surface p-5">
        <div className="mb-8">
          <Logo />
        </div>
        <nav className="flex flex-col gap-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text hover:bg-cream hover:text-maroon transition-colors"
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 min-w-0">
        <header className="h-16 border-b border-border bg-surface flex items-center px-6 justify-between">
          <span className="text-sm text-muted">Admin</span>
          <span className="text-sm font-medium text-maroon">admin@nityanikunj.org</span>
        </header>
        <main className="p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}

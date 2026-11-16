"use client";

import { usePathname } from "next/navigation";

export function RouteConditional({
  children,
  navbar,
  footer,
  social,
  whatsapp,
}: {
  children: React.ReactNode;
  navbar: React.ReactNode;
  footer: React.ReactNode;
  social: React.ReactNode;
  whatsapp: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminDashboard = pathname?.startsWith("/admin") && pathname !== "/admin/login";

  if (isAdminDashboard) {
    return <main>{children}</main>;
  }

  return (
    <>
      {navbar}
      <main>{children}</main>
      {footer}
      {social}
      {whatsapp}
    </>
  );
}

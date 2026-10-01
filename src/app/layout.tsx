import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CartProvider } from "@/lib/cart-context";
import { I18nProvider } from "@/lib/i18n";

// Using next/font/google (Inter + Playfair Display) is recommended once the
// deployment environment has outbound internet access to fonts.googleapis.com —
// see the commented block below. Falling back to system fonts here since this
// sandbox has no external network access to verify the build.
const fontVars = "" as const;

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shri Nityanikunj Ras Seva Sansthan Trust, Varanasi | Seva, Education, Healthcare & Social Welfare",
  description: "A commitment to Seva, Culture and Social Welfare. Shri Nityanikunj Ras Seva Sansthan Trust, Varanasi focuses on education, healthcare, social welfare, environment and animal welfare.",
};

import { prisma } from "@/lib/prisma";
import { draftMode } from "next/headers";

import { RouteConditional } from "@/components/layout/route-conditional";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let settingsMap = {};
  try {
    const settings = await prisma.setting.findMany();
    settingsMap = settings.reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: { value: curr.value, translations: curr.translations } }), {});
  } catch (e) {
    console.error("Failed to load settings in layout:", e);
  }
  
  let isDraftMode = false;
  try {
    isDraftMode = (await draftMode()).isEnabled;
  } catch (e) {
    // ignore
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontVars} antialiased`} suppressHydrationWarning>
        <I18nProvider settings={settingsMap}>
          <CartProvider>
            {isDraftMode && (
              <div className="bg-maroon text-white text-sm text-center py-2 flex justify-center items-center gap-4 relative z-50">
                <span className="font-semibold">PREVIEW MODE ENABLED</span>
                <span>You are currently viewing draft and unpublished content.</span>
                <a href="/api/admin/preview/disable" className="bg-white text-maroon px-3 py-1 rounded-sm text-xs font-bold hover:bg-cream">
                  Disable Preview
                </a>
              </div>
            )}
            <RouteConditional navbar={<Navbar />} footer={<Footer />}>
              {children}
            </RouteConditional>
          </CartProvider>
        </I18nProvider>
      </body>
    </html>
  );
}

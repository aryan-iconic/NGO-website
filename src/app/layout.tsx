import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CartProvider } from "@/lib/cart-context";
import { I18nProvider } from "@/lib/i18n";

// next/font self-hosts the chosen brand fonts in the deployment output.
import { Inter, Playfair_Display } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.shrinityanikunjtrust.com"),
  applicationName: "Shri Nityanikunj Ras Seva Sansthan Trust",
  title: "Shri Nityanikunj Ras Seva Sansthan Trust",
  description: "A commitment to Seva, Culture and Social Welfare. Shri Nityanikunj Ras Seva Sansthan Trust, Varanasi focuses on education, healthcare, social welfare, environment and animal welfare.",
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon", sizes: "any" },
      { url: "/favicon.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/favicon.png", sizes: "512x512", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    title: "Shri Nityanikunj Ras Seva Sansthan Trust",
    siteName: "Shri Nityanikunj Ras Seva Sansthan Trust",
    description: "A commitment to Seva, Culture and Social Welfare. Shri Nityanikunj Ras Seva Sansthan Trust, Varanasi focuses on education, healthcare, social welfare, environment and animal welfare.",
  },
};

import { draftMode } from "next/headers";

import { RouteConditional } from "@/components/layout/route-conditional";
import { WhatsAppFloatingButton } from "@/components/layout/whatsapp-floating-button";
import { SocialFloatingButtons } from "@/components/layout/social-floating-buttons";
import { getWhatsAppHref } from "@/lib/whatsapp";
import { getServerSettings } from "@/lib/server-settings";
import { getCurrentUserSummary } from "@/lib/auth";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentUserSummary();
  let settingsMap: Record<string, { value: string; translations: unknown }> = {};
  let publicSettings: Record<string, string> = {};
  let whatsappHref: string | null = null;
  try {
    const settings = await getServerSettings();
    whatsappHref = getWhatsAppHref(settings.find((setting) => setting.key === "contact.whatsapp")?.value);
    const publicSetting = (key: string) => key.startsWith("contact.") || key.startsWith("social.") || key.startsWith("home.") || key.startsWith("about.") || key.startsWith("legal.");
    settingsMap = Object.fromEntries(settings.filter((setting) => publicSetting(setting.key)).map((setting) => [setting.key, { value: setting.value, translations: setting.translations }]));
    publicSettings = Object.fromEntries(settings.filter((setting) => publicSetting(setting.key)).map((setting) => [setting.key, setting.value]));
  } catch (error) {
    console.error("Failed to load settings in layout:", error);
  }
  
  let isDraftMode = false;
  try {
    isDraftMode = (await draftMode()).isEnabled;
  } catch {
    // ignore
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} antialiased`} suppressHydrationWarning>
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
            <RouteConditional navbar={<Navbar initialUser={currentUser} />} footer={<Footer settings={publicSettings} />} social={<SocialFloatingButtons settings={publicSettings} />} whatsapp={<WhatsAppFloatingButton href={whatsappHref} />}>
              {children}
            </RouteConditional>
          </CartProvider>
        </I18nProvider>
      </body>
    </html>
  );
}

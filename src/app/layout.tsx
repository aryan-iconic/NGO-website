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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${fontVars} antialiased`}>
        <I18nProvider>
          <CartProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
          </CartProvider>
        </I18nProvider>
      </body>
    </html>
  );
}

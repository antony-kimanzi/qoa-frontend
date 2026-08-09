import type { Metadata } from "next";
import "./globals.css";
import AppLayout from "@/components/layout/AppLayout";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { Analytics } from "@vercel/analytics/next";

// Import Inter from Google Fonts (built-in)
import { Inter, Cormorant_Garamond } from "next/font/google";

// Configure Inter font
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

// Configure Playfair Display from Google Fonts
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cormorant",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Queen of Aroma",
  description: "Queen of Aroma - Premium Fragrances",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <body>
        <NotificationProvider>
          <AppLayout>
            {children}
            {/* added analytics for vercel to check user interactions */}
            <Analytics />
          </AppLayout>
        </NotificationProvider>
      </body>
    </html>
  );
}

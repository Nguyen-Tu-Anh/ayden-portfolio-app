import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import "./globals.css";
import "@/components/sites/ayden/ayden.css";

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "Ayden — DJ & Producer | Official Site",
  description:
    "Ayden — open format DJ & producer. Live sets, portfolio and bookings.",
  icons: { icon: "/sites/ayden/favicon.png" },
  // keep the hero phone/email as plain text: stop iOS Safari auto-linking them
  formatDetection: { telephone: false, email: false, address: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${barlowCondensed.variable} ${inter.variable}`}>
      <body className="ayden">{children}</body>
    </html>
  );
}

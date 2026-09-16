import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import TabBar from "@/components/TabBar";
import Trees from "@/components/Trees";
import HelpBotMount from "@/components/HelpBotMount";
import { SITE_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: SITE_NAME,
  description:
    "Find local businesses in Harfield Village. Search, see their offers, message them on WhatsApp.",
  openGraph: {
    title: SITE_NAME,
    description: "Local businesses in Harfield Village, all in one place.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#14564F",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Instrument+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="pb-[74px] md:pb-0">
        <Trees />
        <Header />
        <main>{children}</main>
        <HelpBotMount />
        <TabBar />
      </body>
    </html>
  );
}

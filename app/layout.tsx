import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SandyChat from "@/components/SandyChat";
import PilotBanner from "@/components/system/PilotBanner";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Mallyard",
  description: "Trust-first African marketplace",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-background text-foreground">

        {/* ✅ Pilot Banner at the VERY TOP */}
        <PilotBanner />

        {/* Header */}
        <Header />

        {/* Main Content */}
        <main className="flex-1 container-page">
          {children}
        </main>

        {/* Footer */}
        <Footer />

        {/* Sandy Chat Widget – Global */}
        <SandyChat />

      </body>
    </html>
  );
}
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Farm Direct Marketplace - Fresh Organic Produce",
  description: "Connect directly with local organic farmers and get fresh produce delivered to your door. Support local agriculture and enjoy farm-fresh products.",
  keywords: ["farm direct", "organic produce", "local farms", "fresh vegetables", "farmers market", "sustainable agriculture"],
  authors: [{ name: "Farm Direct Team" }],
  openGraph: {
    title: "Farm Direct Marketplace",
    description: "Connect directly with local organic farmers and get fresh produce delivered to your door",
    url: "https://farmdirect.com",
    siteName: "Farm Direct",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Farm Direct Marketplace",
    description: "Connect directly with local organic farmers and get fresh produce delivered to your door",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

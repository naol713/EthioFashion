import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { HeaderWrapper } from "@/components/layout/header-wrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Fashion Store - Premium Fashion in Ethiopia",
    template: "%s | Fashion Store",
  },
  description:
    "Discover premium fashion for the modern Ethiopian shopper. Quality clothing and shoes delivered nationwide.",
  keywords: ["fashion", "clothing", "shoes", "Ethiopia", "online shopping"],
  authors: [{ name: "Fashion Store" }],
  creator: "Fashion Store",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_ET",
    url: "/",
    siteName: "Fashion Store",
    title: "Fashion Store - Premium Fashion in Ethiopia",
    description:
      "Discover premium fashion for the modern Ethiopian shopper. Quality clothing and shoes delivered nationwide.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Fashion Store",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fashion Store - Premium Fashion in Ethiopia",
    description:
      "Discover premium fashion for the modern Ethiopian shopper. Quality clothing and shoes delivered nationwide.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico?v=ethiofashion-ff" sizes="any" />
        <link rel="icon" href="/icon.png?v=ethiofashion-ff" type="image/png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <HeaderWrapper />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}

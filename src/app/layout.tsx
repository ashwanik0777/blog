import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientProviders from "./ClientProviders";
import VisitorTracker from "@/components/VisitorTracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteName = "TechUpdatesZone Blog";
const siteDescription =
  "TechUpdatesZone Blog is an AI-powered hub for the latest tech news, tutorials, and insights, powered by Google Gemini and Next.js.";

const baseUrl =
  typeof process.env.NEXT_PUBLIC_BASE_URL === "string"
    ? new URL(process.env.NEXT_PUBLIC_BASE_URL)
    : new URL("http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: baseUrl,
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: [
    "TechUpdatesZone",
    "tech blog",
    "AI blog",
    "Next.js 15",
    "Google Gemini",
    "web development",
    "programming tutorials",
  ],
  openGraph: {
    title: siteName,
    description: siteDescription,
    url: baseUrl,
    siteName,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientProviders>
          <VisitorTracker />
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}

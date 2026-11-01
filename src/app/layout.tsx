import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ClientProviders from "./ClientProviders";
import VisitorTracker from "@/components/VisitorTracker";
import { SITE_DESCRIPTION, SITE_KEYWORDS, SITE_NAME, SITE_TAGLINE, getSiteUrl } from "@/lib/site";

// Fonts are self-hosted (variable woff2 files from Fontsource, OFL-1.1) so the build
// never has to download anything from Google Fonts.
const inter = localFont({
  src: "./fonts/inter-latin-var.woff2",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
});

const jakarta = localFont({
  src: "./fonts/plus-jakarta-sans-latin-var.woff2",
  variable: "--font-jakarta",
  weight: "200 800",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/geist-mono-latin-var.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
  preload: false,
});

const siteUrl = getSiteUrl();
const defaultTitle = `${SITE_NAME} — ${SITE_TAGLINE}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: SITE_KEYWORDS,
  authors: [{ name: `${SITE_NAME} Team`, url: siteUrl }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "technology",
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    title: defaultTitle,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: SITE_DESCRIPTION,
  },
  // No canonical here: it would be inherited by every page. Each page sets its own.
  alternates: {
    types: { "application/rss+xml": [{ url: "/feed.xml", title: `${SITE_NAME} RSS feed` }] },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION } : undefined,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jakarta.variable} ${geistMono.variable}`}>
        <ClientProviders>
          <VisitorTracker />
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}

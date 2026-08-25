import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://spectr.subhashjha.me"),
  title: {
    default: "spectr | Know Your Traffic.",
    template: "%s | spectr",
  },
  description: "Real-time, privacy-first analytics for developers. Zero cookies, zero bloat, and GDPR/CCPA compliant.",
  keywords: [
    "analytics",
    "privacy-first",
    "developer tools",
    "real-time analytics",
    "privacy analytics",
    "cookieless analytics",
    "web analytics",
    "spectr",
  ],
  authors: [{ name: "Subhash Jha", url: "https://subhashjha.me" }],
  creator: "Subhash Jha",
  publisher: "Subhash Jha",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "spectr | Know Your Traffic.",
    description: "Real-time, privacy-first analytics for developers. Zero cookies, zero bloat, and GDPR/CCPA compliant.",
    url: "https://spectr.subhashjha.me",
    siteName: "spectr",
    images: [
      {
        url: "/preview.png",
        width: 1200,
        height: 630,
        alt: "spectr - Real-time privacy-first analytics",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "spectr | Know Your Traffic.",
    description: "Real-time, privacy-first analytics for developers. Zero cookies, zero bloat, and GDPR/CCPA compliant.",
    images: ["/preview.png"],
    creator: "@subhash_jh",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "spectr",
  "operatingSystem": "All",
  "applicationCategory": "DeveloperApplication",
  "description": "Real-time, privacy-first analytics for developers. Zero cookies, zero bloat, and GDPR/CCPA compliant.",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "category": "Free",
  },
  "author": {
    "@type": "Person",
    "name": "Subhash Jha",
    "url": "https://subhashjha.me",
    "sameAs": [
      "https://subhashjha.me",
      "https://x.com/subhash_jh",
      "https://github.com/subhash-jhaa"
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${dmSans.variable} ${jetbrainsMono.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ fontFamily: "var(--font-sans), sans-serif" }}
      >
        <Providers>
        {children}

        </Providers>
      </body>
    </html>
  );
}

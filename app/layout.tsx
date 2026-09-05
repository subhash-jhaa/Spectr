import type { Metadata } from "next";
import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";


const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const interTight = Inter_Tight({
  variable: "--font-roobert",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://spectr.subhashjha.me"),
  title: {
    default: "Spectr | Know Your Traffic.",
    template: "%s | Spectr",
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
    "Spectr",
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
    title: "Spectr | Know Your Traffic.",
    description: "Real-time, privacy-first analytics for developers. Zero cookies, zero bloat, and GDPR/CCPA compliant.",
    url: "https://spectr.subhashjha.me",
    siteName: "Spectr",
    images: [
      {
        url: "/preview.png",
        width: 1200,
        height: 630,
        alt: "Spectr | Know Your Traffic — Real-time privacy-first analytics",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Spectr | Know Your Traffic.",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${inter.variable} ${interTight.variable} ${jetbrainsMono.variable} antialiased bg-[#fafaf9] dark:bg-black text-[#0c0a09] dark:text-zinc-100 min-h-screen font-sans`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

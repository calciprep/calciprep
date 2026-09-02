import type { Metadata } from "next";
import { Oswald, EB_Garamond, Roboto_Mono } from "next/font/google";
import Script from 'next/script'; // Import the Script component
import { AuthProvider } from "@/contexts/AuthContext";
import Notification from "@/components/common/Notification";
import AuthModal from "@/components/common/AuthModal";
import LenisProvider from "@/components/common/LenisProvider"; // Import the new provider
import "./globals.css";
import "../auth-modal.css";

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
});

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-eb-garamond",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
});

export const metadata: Metadata = {
  title: "CalciPrep",
  description: "Gamified Learning for Competitive Exams",
  icons: {
    icon: [
      { url: '/media/favicon.svg', type: 'image/svg+xml' },
      { url: '/media/android-chrome-192x192.png', type: 'image/png', sizes: '192x192' },
      { url: '/media/android-chrome-512x512.png', type: 'image/png', sizes: '512x512' }
    ],
    apple: '/media/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  other: {
    "google-adsense-account": "ca-pub-2382040431534049",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* --- ADD ADSENSE SCRIPT SNIPPET HERE --- */}
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2382040431534049`}
          crossOrigin="anonymous"
          strategy="lazyOnload" // Or "afterInteractive" if needed sooner
        />
        {/* --- END ADSENSE SCRIPT SNIPPET --- */}
      </head>
      <body
        className={`${oswald.variable} ${ebGaramond.variable} ${robotoMono.variable}`}
      >
        <AuthProvider>
          <LenisProvider>
            {children}
          </LenisProvider>
          <Notification />
          <AuthModal />
        </AuthProvider>
      </body>
    </html>
  );
}


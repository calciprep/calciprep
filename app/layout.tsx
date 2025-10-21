import type { Metadata } from "next";
import { Oswald, EB_Garamond, Roboto_Mono } from "next/font/google";
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${oswald.variable} ${ebGaramond.variable} ${robotoMono.variable}`}
      >
        <AuthProvider>
          {/* LenisProvider now wraps the main content to enable global smooth scrolling */}
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


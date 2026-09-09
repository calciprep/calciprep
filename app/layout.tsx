import type { Metadata } from "next";
import { Oswald, EB_Garamond, Roboto_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import Notification from "@/components/common/Notification";
import AuthModal from "@/components/common/AuthModal";
import LenisProvider from "@/components/common/LenisProvider"; 
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
  title: "Calciprep | Smart Govt Exam Prep Platform",
  description:
    "Calciprep is a student-first exam preparation platform built for SSC, Railway, and Delhi Police aspirants. Practice automated rapid maths calculations, solve English PYQ quizzes, take official-pattern typing tests, and access free exam mock tests.",
  keywords: [
    "govt exam preparation",
    "delhi police hcm typing test",
    "delhi police hcm typing",
    "delhi police hcm pyq typing tests",
    "dp hcm typing test practice",
    "live dp hcm typing tests",
    "ssc cgl preparation",
    "ssc cgl mock tests",
    "railway exam mock test",
    "maths speed calculation practice",
    "english pyq quiz blackbook",
    "online typing test ssc cgl chsl",
    "delhi police hcm typing portal",
    "free mock tests ssc rrb",
    "calciprep"
  ],
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
        {/* Next.js manages Metadata automatically here. Leave this empty to prevent hydration errors. */}
      </head>
      <body
        className={`${oswald.variable} ${ebGaramond.variable} ${robotoMono.variable}`}
        suppressHydrationWarning
      >
        {/* --- FIXED: SCRIPTS MOVED TO BODY --- */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2382040431534049"
          crossOrigin="anonymous"
        ></script>
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Calciprep",
              "url": "https://calciprep.online/",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://calciprep.online/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        {/* --- END SCRIPTS --- */}

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
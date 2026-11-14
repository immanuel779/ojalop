import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import PWARegister from "@/components/PWARegister";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

// 1. Advanced SEO & Metadata
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "OjaLoop | Nigeria's Premier Trusted Marketplace",
    template: "%s | OjaLoop", 
  },
  description: "Buy and sell safely across Nigeria. Discover millions of products, verified stores, and secure Escrow payments on OjaLoop.",
  keywords: ["Nigeria marketplace", "buy and sell Nigeria", "online shop", "verified sellers", "OjaLoop", "Escrow"],
  authors: [{ name: "CodeCraft Technologies" }],
  manifest: "/manifest.json", 
  
  // ADDED ICONS BLOCK HERE
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },

  // OpenGraph for WhatsApp, Facebook, LinkedIn sharing
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "/",
    title: "OjaLoop | Nigeria's Premier Trusted Marketplace",
    description: "Buy and sell safely across Nigeria. Verified sellers, secure Escrow protection.",
    siteName: "OjaLoop",
    images: [
      {
        url: "/icon-512x512.png", 
        width: 512,
        height: 512,
        alt: "OjaLoop Logo",
      },
    ],
  },
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "OjaLoop | Buy & Sell Safely",
    description: "Nigeria's premier high-trust online marketplace.",
    images: ["/icon-512x512.png"],
  },
};

// 2. Explicit Mobile Viewport Settings
export const viewport: Viewport = {
  themeColor: "#ea580c", // OjaLoop Orange
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, 
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} scroll-smooth`} data-scroll-behavior="smooth">
      <body className={`${inter.className} antialiased bg-gray-50 text-gray-900 min-h-screen selection:bg-orange-500 selection:text-white`}>
        
        {/* PWA Service Worker Registration */}
        <PWARegister />

        {/* Main App Content */}
        {children}

        {/* Global Toast Notifications */}
        <Toaster 
          position="top-center" 
          richColors 
          closeButton
          toastOptions={{
            style: {
              borderRadius: '1rem',
              border: '1px solid #f3f4f6',
              boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)',
              fontWeight: '500',
            },
            className: "font-sans",
          }}
        />
        
      </body>
    </html>
  );
}
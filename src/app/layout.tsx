"use client";

import "./globals.css";
import Script from "next/script";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { ReactNode, Suspense } from "react";
import UserLocation from "@/components/common/userLocation";
import Live2DWidget from "@/components/Chatbot/Live2DWidget";
import ChatControls from "@/components/Chatbot/ChatControls";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <Script
          src="https://kit.fontawesome.com/3e8a49db6c.js"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#ffffff" />
      </head>

      <body className="min-h-screen bg-white text-gray-900 antialiased flex flex-col [--sat:env(safe-area-inset-top)] [--sab:env(safe-area-inset-bottom)]">
        <AuthProvider>
          <Navbar />
          <UserLocation />

          <div className="flex w-full flex-1">
            <main className="flex-1 min-w-0 bg-white">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Suspense fallback={null}>{children}</Suspense>
              </div>
            </main>
          </div>

          <Footer />

          <div
            className="pointer-events-none fixed right-4 md:right-6 -bottom-10 md:-bottom-15 md:scale-100 scale-75 z-50"
            aria-live="off"
            aria-label="Trợ lý ảo"
          >
            <div className="pointer-events-auto select-none rounded-2xl bg-transparent">
              <Live2DWidget />
            </div>
          </div>
          <ChatControls />
        </AuthProvider>
        <div className="h-[var(--sab)]" aria-hidden />
      </body>
    </html>
  );
}

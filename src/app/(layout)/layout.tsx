"use client";

import type { ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import UserLocation from "@/components/common/userLocation";
import Live2DWidget from "@/components/Chatbot/Live2DWidget";
import ChatControls from "@/components/Chatbot/ChatControls";

export default function Layout1({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-var(--sab))] bg-white text-gray-900 antialiased flex flex-col">
      <Navbar />
      <UserLocation />

      <main className="flex-1 min-w-0 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>

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
    </div>
  );
}

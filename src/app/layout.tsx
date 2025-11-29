import "./globals.css";
import Script from "next/script";
import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner"; // 👈 THÊM DÒNG NÀY

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://htq-nxt.space"),
  title: {
    default: "FoodMap – Tìm quán ngon gần bạn",
    template: "%s | FoodMap",
  },
  description:
    "FoodMap giúp bạn tìm quán ăn ngon gần đây, ưu đãi hot, gợi ý theo thời tiết, mở cửa khuya và nhiều bộ sưu tập ẩm thực cho mọi nhu cầu.",
  keywords: [
    "FoodMap",
    "tìm quán ăn gần tôi",
    "quán ngon gần đây",
    "nhà hàng Sài Gòn",
    "quán ăn TP.HCM",
    "ưu đãi món ăn",
    "review quán ăn",
    "đánh giá nhà hàng",
    "quán mở khuya",
    "món hợp thời tiết",
    "ẩm thực đường phố",
    "địa điểm ăn uống",
    "gợi ý món ngon",
    "blog ẩm thực",
    "bản đồ quán ăn",
  ],
  authors: [{ name: "FoodMap Team" }],
  creator: "FoodMap",
  publisher: "FoodMap",
  category: "Food & Drink",
  applicationName: "FoodMap",
  alternates: {
    canonical: "/",
    languages: {
      vi: "/",
      en: "/en",
    },
  },
  openGraph: {
    type: "website",
    url: "https://htq-nxt.space/",
    siteName: "FoodMap",
    title: "FoodMap – Tìm quán ngon gần bạn",
    description:
      "Khám phá quán ngon, ưu đãi hot và gợi ý theo thời tiết – tất cả trên FoodMap.",
    images: [
      {
        url: "https://simg.zalopay.com.vn/zlp-website/assets/quan_thai_6_88ca431418.jpg",
        width: 1200,
        height: 630,
        alt: "FoodMap – Tìm quán ngon gần bạn",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@foodmap",
    creator: "@foodmap",
    title: "FoodMap – Tìm quán ngon gần bạn",
    description:
      "Tìm quán ăn ngon gần đây, ưu đãi hot và gợi ý theo thời tiết trên FoodMap.",
    images: [
      "https://simg.zalopay.com.vn/zlp-website/assets/quan_thai_6_88ca431418.jpg",
    ],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  verification: {},
};

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
          {children}

          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              duration: 3000,
              classNames: {
                toast: "rounded-xl shadow-lg border border-gray-100",
              },
            }}
          />
        </AuthProvider>

        <div className="h-[var(--sab)]" aria-hidden />
      </body>
    </html>
  );
}

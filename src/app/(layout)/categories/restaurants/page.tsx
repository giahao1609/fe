"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import axios from "axios";
import { mockRestaurants } from "@/data/mock-restaurants";

interface Restaurant {
  _id: string;
  name: string;
  address: string;
  district?: string;
  priceRange?: string;
  banner?: string | string[];
}

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const USE_FAKE = 1;

  // 1) Lấy data (fake hoặc API)
  useEffect(() => {
    const run = async () => {
      try {
        if (USE_FAKE) {
          // Dùng mock
          setRestaurants(mockRestaurants as Restaurant[]);
        } else {
          const res = await axios.get(`${API_URL}/restaurants`);
          const list = Array.isArray(res.data) ? res.data : res.data?.data;
          setRestaurants(list || []);
        }
      } catch (err) {
        console.error("❌ Lỗi khi tải danh sách quán:", err);
        setError("Không thể tải danh sách quán ăn!");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [API_URL, USE_FAKE]);

  // 2) Refresh signed URL CHỈ khi không dùng fake và có banner dạng khóa (GCS key)
  useEffect(() => {
    if (USE_FAKE || restaurants.length === 0) return;

    const refreshSignedUrls = async () => {
      const urls: Record<string, string> = {};

      for (const r of restaurants) {
        // Lấy path từ banner
        let path: string | null = null;
        if (typeof r.banner === "string") path = r.banner;
        else if (Array.isArray(r.banner) && r.banner.length > 0) path = r.banner[0];
        if (!path) continue;

        try {
          let cleanPath = path.trim();

          // Nếu đã là signed URL thật (http) thì bỏ qua
          if (/^https?:\/\//i.test(cleanPath)) continue;

          // Hoặc nếu là URL GCS → cắt thành "restaurant/..."
          if (cleanPath.startsWith("https://storage.googleapis.com/")) {
            const match = cleanPath.match(/foodmap-secure\/(.+?)(?:\?|$)/);
            if (match) cleanPath = match[1];
          }

          const { data } = await axios.get(
            `${API_URL}/restaurants/refresh-link/${encodeURIComponent(cleanPath)}`
          );
          if (data?.url) urls[r._id] = data.url;
        } catch {
          // im lặng để không phá UI
        }
      }

      setSignedUrls(urls);
    };

    refreshSignedUrls();
  }, [restaurants, API_URL, USE_FAKE]);

  // 3) Render
  if (loading) {
    return <div className="p-8 text-center text-gray-500">Đang tải danh sách quán ăn...</div>;
  }
  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }
  if (restaurants.length === 0) {
    return <div className="p-8 text-center text-gray-500">Không có quán nào trong hệ thống.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-6 text-rose-600">Danh sách quán ăn</h1>

      {/* Lưới thẻ quán */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {restaurants.map((r, index) => {
          // Ưu tiên signed URL (nếu có), tiếp theo là banner string/array, cuối cùng là fallback
          const rawBanner =
            signedUrls[r._id] ||
            (typeof r.banner === "string"
              ? r.banner
              : Array.isArray(r.banner) && r.banner.length > 0
              ? r.banner[0]
              : "") ||
            "https://i0.wp.com/images.unsplash.com/photo-1544025162-519b0c8e3c31?w=1200&h=800&crop=1&auto=format&fit=crop&q=80&ssl=1";

          return (
            <Link
              href={`/categories/restaurants/${r._id}`}
              key={r._id}
              className="group rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-lg transition overflow-hidden"
            >
              {/* Ảnh */}
              <div className="relative w-full aspect-[4/3] bg-gray-100">
                <Image
                  src={rawBanner}
                  alt={r.name}
                  fill
                  className="object-cover group-hover:opacity-95 transition-opacity"
                  sizes="(max-width: 1024px) 100vw, 420px"
                  priority={index < 2}
                />
              </div>

              {/* Info */}
              <div className="p-4">
                <h2 className="font-semibold text-lg truncate">{r.name}</h2>
                <p className="text-sm text-gray-500 truncate">{r.address}</p>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-gray-600">{r.district || "TP.HCM"}</span>
                  {r.priceRange && (
                    <span className="rounded-full bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-100">
                      {r.priceRange}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

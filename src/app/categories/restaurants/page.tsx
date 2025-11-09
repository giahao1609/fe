"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import axios from "axios";

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

  /** 🟢 1️⃣ Lấy danh sách quán ăn từ API */
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await axios.get(`${API_URL}/restaurants`);
        const list = Array.isArray(res.data) ? res.data : res.data.data;
        setRestaurants(list || []);
      } catch (err) {
        console.error("❌ Lỗi khi tải danh sách quán:", err);
        setError("Không thể tải danh sách quán ăn.");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [API_URL]);

  /** 🟢 2️⃣ Refresh signed URL (giống admin) */
  useEffect(() => {
    const refreshSignedUrls = async () => {
      const urls: Record<string, string> = {};

      for (const r of restaurants) {
        // Lấy banner path
        let path: string | null = null;
        if (typeof r.banner === "string") path = r.banner;
        else if (Array.isArray(r.banner) && r.banner.length > 0)
          path = r.banner[0];
        if (!path) continue;

        try {
          let cleanPath = path.trim();

          // Nếu banner là URL GCS → cắt thành "restaurant/..."
          if (cleanPath.startsWith("https://storage.googleapis.com/")) {
            const match = cleanPath.match(/foodmap-secure\/(.+?)(?:\?|$)/);
            if (match) cleanPath = match[1];
          }

          // Gọi API refresh-link
          const { data } = await axios.get(
            `${API_URL}/restaurants/refresh-link/${encodeURIComponent(cleanPath)}`
          );

          if (data?.url) urls[r._id] = data.url;
        } catch (err) {
          console.warn(`⚠️ Không thể refresh URL cho: ${r.name}`);
        }
      }

      setSignedUrls(urls);
    };

    if (restaurants.length > 0) refreshSignedUrls();
  }, [restaurants, API_URL]);

  /** 🟢 3️⃣ Render UI */
  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">
        Đang tải danh sách quán ăn...
      </div>
    );

  if (error)
    return <div className="p-8 text-center text-red-500">{error}</div>;

  if (restaurants.length === 0)
    return (
      <div className="p-8 text-center text-gray-500">
        Không có quán nào trong hệ thống.
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-6 text-red-600">
        Danh sách quán ăn
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {restaurants.map((r, index) => {
          //  Ưu tiên signed URL, nếu không có thì fallback ảnh mặc định
          const bannerSrc = signedUrls[r._id] || "/default-restaurant.jpg";

          return (
            <Link
              //  Route đúng (vì bạn đang dùng categories/restaurants)
              href={`/categories/restaurants/${r._id}`}
              key={r._id}
              className="rounded-xl border border-gray-200 shadow hover:shadow-lg transition overflow-hidden bg-white"
            >
              {/* Ảnh banner */}
              <div className="relative w-full h-56 bg-gray-100">
                <Image
                  src={bannerSrc}
                  alt={r.name}
                  fill
                  className="object-cover"
                  unoptimized
                  priority={index === 0} // preload ảnh đầu tiên
                />
              </div>

              {/* Thông tin */}
              <div className="p-4">
                <h2 className="font-semibold text-lg mb-1">{r.name}</h2>
                <p className="text-sm text-gray-500">{r.address}</p>

                {r.priceRange && (
                  <p className="text-red-500 font-medium mt-2">
                    {r.priceRange}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

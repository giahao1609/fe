"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  RestaurantService,
  type Restaurant,
} from "@/services/restaurant.service";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1544025162-519b0c8e3c31?w=1200&h=800&crop=1&auto=format&fit=crop&q=80";

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // đúng với API yêu cầu
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ==== Load danh sách restaurants qua RestaurantService ====
  const loadRestaurants = async (pageArg: number) => {
    setLoading(true);
    setError(null);

    try {
      const res = await RestaurantService.listRestaurants({
        page: pageArg,
        limit,
      });

      // res: { page, limit, total, pages, items }
      setRestaurants(res.items ?? []);
      setPage(res.page ?? pageArg);
      setTotal(res.total ?? 0);
      setPages(res.pages ?? 1);
    } catch (err: any) {
      console.error("❌ Lỗi khi tải danh sách quán:", err);
      setError(err?.message || "Không thể tải danh sách quán ăn!");
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  // gọi lần đầu
  useEffect(() => {
    loadRestaurants(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePrev = () => {
    if (page <= 1) return;
    const newPage = page - 1;
    loadRestaurants(newPage);
  };

  const handleNext = () => {
    if (page >= pages) return;
    const newPage = page + 1;
    loadRestaurants(newPage);
  };

  // helper: địa chỉ ngắn
  const buildShortAddress = (r: Restaurant): string => {
    const street = r.address?.street ?? "";
    const ward = r.address?.ward ?? "";
    const district = r.address?.district ?? "";
    const city = r.address?.city ?? "";
    return [street, ward, district, city].filter(Boolean).join(", ");
  };

  // helper: chọn ảnh cover
  const getRestaurantImage = (r: Restaurant, index: number): string => {
    return (
      r.coverImageUrlSigned ||
      r.logoUrlSigned ||
      (r.gallerySigned && r.gallerySigned.length > 0
        ? r.gallerySigned[0]
        : "") ||
      FALLBACK_IMG
    );
  };

  // ==== Render ====
  if (loading && restaurants.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-6 text-rose-600">
          Danh sách quán ăn
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden"
            >
              <div className="relative w-full aspect-[4/3] bg-gray-100 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-2/3 rounded bg-gray-100 animate-pulse" />
                <div className="h-3 w-4/5 rounded bg-gray-100 animate-pulse" />
                <div className="h-3 w-1/3 rounded bg-gray-100 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        {error}
        <div className="mt-3">
          <button
            onClick={() => loadRestaurants(1)}
            className="inline-flex items-center rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
          >
            Thử tải lại
          </button>
        </div>
      </div>
    );
  }

  if (!loading && restaurants.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        Không có quán nào trong hệ thống.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold mb-1 text-rose-600">
            Danh sách quán ăn
          </h1>
          <p className="text-sm text-gray-600">
            Trang {page}/{pages} · Tổng {total} quán
          </p>
        </div>

        {/* Pagination controls */}
        <div className="flex items-center gap-2 text-sm">
          <button
            type="button"
            onClick={handlePrev}
            disabled={page <= 1}
            className={`inline-flex items-center rounded-lg px-3 py-1.5 border text-sm ${
              page <= 1
                ? "cursor-not-allowed border-gray-200 text-gray-400 bg-gray-50"
                : "border-gray-200 text-gray-700 bg-white hover:border-rose-300 hover:text-rose-700"
            }`}
          >
            ← Trước
          </button>
          <span className="text-gray-600">
            Trang <span className="font-semibold">{page}</span> / {pages}
          </span>
          <button
            type="button"
            onClick={handleNext}
            disabled={page >= pages}
            className={`inline-flex items-center rounded-lg px-3 py-1.5 border text-sm ${
              page >= pages
                ? "cursor-not-allowed border-gray-200 text-gray-400 bg-gray-50"
                : "border-gray-200 text-gray-700 bg-white hover:border-rose-300 hover:text-rose-700"
            }`}
          >
            Sau →
          </button>
        </div>
      </div>

      {/* Lưới thẻ quán */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {restaurants.map((r, index) => {
          const img = getRestaurantImage(r, index);
          const shortAddr = buildShortAddress(r);
          const district = r.address?.district || "TP.HCM";

          return (
            <Link
              // giữ path cũ của anh: /categories/restaurants/:id
              href={`/categories/restaurants/${r._id}`}
              key={r._id}
              className="group rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-lg transition overflow-hidden"
            >
              {/* Ảnh */}
              <div className="relative w-full aspect-[4/3] bg-gray-100">
                <Image
                  src={img}
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
                <p className="text-sm text-gray-500 truncate">
                  {shortAddr || "Địa chỉ đang cập nhật"}
                </p>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-gray-600">{district}</span>
                  {/* nếu sau này backend thêm priceRange thì show ở đây */}
                  {Boolean((r as any).priceRange) && (
                    <span className="rounded-full bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-100">
                      {(r as any).priceRange}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pagination dưới cùng (mobile) */}
      <div className="mt-6 flex items-center justify-center gap-2 text-sm">
        <button
          type="button"
          onClick={handlePrev}
          disabled={page <= 1}
          className={`inline-flex items-center rounded-lg px-3 py-1.5 border text-sm ${
            page <= 1
              ? "cursor-not-allowed border-gray-200 text-gray-400 bg-gray-50"
              : "border-gray-200 text-gray-700 bg-white hover:border-rose-300 hover:text-rose-700"
          }`}
        >
          ← Trước
        </button>
        <span className="text-gray-600">
          Trang <span className="font-semibold">{page}</span> / {pages}
        </span>
        <button
          type="button"
          onClick={handleNext}
          disabled={page >= pages}
          className={`inline-flex items-center rounded-lg px-3 py-1.5 border text-sm ${
            page >= pages
              ? "cursor-not-allowed border-gray-200 text-gray-400 bg-gray-50"
              : "border-gray-200 text-gray-700 bg-white hover:border-rose-300 hover:text-rose-700"
          }`}
        >
          Sau →
        </button>
      </div>
    </div>
  );
}

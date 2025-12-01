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
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRestaurants = async (pageArg: number) => {
    setLoading(true);
    setError(null);

    try {
      const res = await RestaurantService.listRestaurants({
        page: pageArg,
        limit,
      });

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

  const buildShortAddress = (r: Restaurant): string => {
    const street = r.address?.street ?? "";
    const ward = r.address?.ward ?? "";
    const district = r.address?.district ?? "";
    const city = r.address?.city ?? "";
    return [street, ward, district, city].filter(Boolean).join(", ");
  };

  const getRestaurantImage = (r: Restaurant, index: number): string => {
    return (
      r.coverImageUrl ||
      r.logoUrl ||
      (r as any).gallerySigned?.[0] ||
      FALLBACK_IMG
    );
  };

  if (loading && restaurants.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="mb-6 text-3xl font-bold text-rose-600">
          Danh sách quán ăn
        </h1>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
            >
              <div className="relative aspect-[4/3] w-full animate-pulse bg-gray-100" />
              <div className="space-y-2 p-4">
                <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
                <div className="h-3 w-4/5 animate-pulse rounded bg-gray-100" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-gray-100" />
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
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-10">
      {/* Header + pagination top */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="mb-1 text-3xl font-bold text-rose-600">
            Danh sách quán ăn
          </h1>
          <p className="text-sm text-gray-600">
            Trang {page}/{pages} · Tổng {total} quán
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <button
            type="button"
            onClick={handlePrev}
            disabled={page <= 1}
            className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-sm ${
              page <= 1
                ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
                : "border-gray-200 bg-white text-gray-700 hover:border-rose-300 hover:text-rose-700"
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
            className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-sm ${
              page >= pages
                ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
                : "border-gray-200 bg-white text-gray-700 hover:border-rose-300 hover:text-rose-700"
            }`}
          >
            Sau →
          </button>
        </div>
      </div>

      {/* Grid cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {restaurants.map((r, index) => {
          const img = getRestaurantImage(r, index);
          const shortAddr = buildShortAddress(r);

          const cat: any = (r as any).category || {};
          const categoryName = (r as any).categoryName ?? cat.name;
          const categorySlug = (r as any).categorySlug ?? cat.slug;
          const categoryIcon: string | undefined = cat.extra?.icon;
          const categoryColor: string | undefined = cat.extra?.color;

          const distanceKm: number | null =
            (r as any).distanceKm != null ? (r as any).distanceKm : null;
          const distanceText: string | null =
            (r as any).distanceText ??
            (distanceKm != null ? `${distanceKm.toFixed(2)} km` : null);

          return (
            <Link
              href={`/categories/restaurants/${r._id}`}
              key={r._id}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              {/* Image */}
              <div className="relative w-full bg-gray-100">
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src={img}
                    alt={r.name}
                    fill
                    className="object-cover transition duration-200 group-hover:scale-[1.02] group-hover:opacity-95"
                    sizes="(max-width: 1024px) 100vw, 420px"
                    priority={index < 2}
                  />
                </div>

                {categoryName && (
                  <span
                    className="absolute left-3 top-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-white shadow-sm"
                    style={{
                      backgroundColor: categoryColor || "rgba(15,23,42,0.85)",
                    }}
                  >
                    {categoryIcon && <span className="mr-1">{categoryIcon}</span>}
                    <span className="max-w-[140px] truncate">
                      {categoryName}
                    </span>
                  </span>
                )}

                {distanceText && (
                  <span className="absolute bottom-3 right-3 inline-flex items-center rounded-full bg-black/70 px-3 py-1 text-[11px] font-medium text-white">
                    Cách bạn: {distanceText}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-base font-semibold text-gray-900">
                      {r.name}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-xs text-gray-600">
                      {shortAddr || "Địa chỉ đang cập nhật"}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                      {categoryName && (
                        <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 font-medium text-indigo-700">
                          {categoryIcon && (
                            <span className="mr-1">{categoryIcon}</span>
                          )}
                          <span className="max-w-[120px] truncate">
                            {categoryName}
                          </span>
                        </span>
                      )}

                      {Boolean((r as any).priceRange) && (
                        <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-0.5 text-gray-600">
                          {(r as any).priceRange}
                        </span>
                      )}

                      {distanceText && (
                        <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-0.5 text-gray-500">
                          {distanceText}
                        </span>
                      )}
                    </div>
                  </div>

                  {typeof (r as any).rating === "number" && (
                    <div className="shrink-0">
                      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-800">
                        <span>★</span>
                        <span>{(r as any).rating.toFixed(1)}</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Nút xem chi tiết */}
                <div className="mt-3 flex items-center justify-end">
                  <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50/80 px-3 py-1 text-[11px] font-medium text-rose-600 ring-1 ring-rose-100 transition group-hover:bg-rose-600 group-hover:text-white group-hover:ring-rose-600">
                    Xem chi tiết
                    <span className="ml-1 text-xs">→</span>
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pagination bottom */}
      <div className="mt-6 flex items-center justify-center gap-2 text-sm">
        <button
          type="button"
          onClick={handlePrev}
          disabled={page <= 1}
          className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-sm ${
            page <= 1
              ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
              : "border-gray-200 bg-white text-gray-700 hover:border-rose-300 hover:text-rose-700"
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
          className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-sm ${
            page >= pages
              ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
              : "border-gray-200 bg-white text-gray-700 hover:border-rose-300 hover:text-rose-700"
          }`}
        >
          Sau →
        </button>
      </div>
    </div>
  );
}

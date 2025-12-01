// app/categories/restaurants/[id]/pre-order/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import {
  RestaurantService,
  type Restaurant,
} from "@/services/restaurant.service";
import {
  MenuService,
  type MenuItem as BackendMenuItem,
} from "@/services/menu.service";
import RestaurantPreOrderSection, {
  type MenuItem as PreOrderMenuItem,
} from "@/components/pre-order/RestaurantPreOrderSection";

const getImageUrl = (path?: string | null) => {
  if (!path) return "";
  const p = path.toString().trim();
  if (!p) return "";
  if (/^https?:\/\//i.test(p)) return p;
  return p;
};

export default function RestaurantPreOrderPage() {
  const { id } = useParams<{ id: string }>();

  const [restaurant, setRestaurant] = useState<any | null>(null);
  const [menuItems, setMenuItems] = useState<PreOrderMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // lấy detail
        const r = await RestaurantService.getRestaurantDetail(id);
        // lấy menu của quán
        const res = await MenuService.listByRestaurant(id);
        const list: BackendMenuItem[] = Array.isArray(res)
          ? (res as any)
          : ((res as any)?.items ?? []);

        if (cancelled) return;

        // map sang type của PreOrderSection
        const mapped: PreOrderMenuItem[] = list.map((item: any) => {
          const signedImg = item.imagesSigned?.[0];
          const imgRaw =
            (typeof signedImg === "string"
              ? signedImg
              : signedImg?.url || signedImg?.path) ||
            item.images?.[0] ||
            "";

          const price =
            item.basePrice?.amount != null ? item.basePrice.amount : 0;

          return {
            _id: item._id,
            name: item.name,
            description: item.description,
            price,
            imageUrl: imgRaw ? getImageUrl(imgRaw) : undefined,
          };
        });

        setRestaurant(r as any);
        setMenuItems(mapped);
      } catch (e: any) {
        console.error("[PreOrderPage] load error:", e);
        if (!cancelled) {
          setError(
            e?.message || "Không thể tải thông tin nhà hàng / thực đơn.",
          );
          setRestaurant(null);
          setMenuItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const addressText = useMemo(() => {
    if (!restaurant || !(restaurant as any).address) return "";
    const { street, ward, district, city } = (restaurant as any).address || {};
    return [street, ward, district, city].filter(Boolean).join(", ");
  }, [restaurant]);

  if (!id) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <p className="text-sm text-gray-600">Thiếu mã nhà hàng.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-amber-50">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <div className="space-y-5 animate-pulse">
            <div className="h-10 w-2/3 rounded-full bg-white/70" />
            <div className="h-20 rounded-2xl bg-white/80" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="h-40 rounded-2xl bg-white/80" />
              <div className="h-40 rounded-2xl bg-white/80" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-lg">
          <p className="mb-2 text-sm font-semibold text-red-600">
            {error || "Không tìm thấy nhà hàng."}
          </p>
          <Link
            href={`/categories/restaurants/${id}`}
            className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-700 hover:border-rose-300 hover:bg-rose-50"
          >
            ← Quay lại trang nhà hàng
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/60 via-white to-amber-50/40">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
        {/* breadcrumb nhỏ */}
        <div className="mb-3 text-[11px] text-gray-500 sm:text-xs">
          <Link
            href="/categories/restaurants"
            className="hover:text-rose-600"
          >
            Nhà hàng
          </Link>
          <span className="mx-1.5">/</span>
          <Link
            href={`/categories/restaurants/${id}`}
            className="hover:text-rose-600"
          >
            {restaurant.name}
          </Link>
          <span className="mx-1.5">/</span>
          <span className="font-medium text-gray-700">Đặt bàn trước</span>
        </div>

        {/* Header info quán */}
        <div className="mb-4 rounded-2xl border border-white/80 bg-white/95 p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                Đặt bàn tại {restaurant.name}
              </h1>
              {addressText && (
                <p className="flex items-center gap-1 text-xs text-gray-500 sm:text-sm">
                  <span className="text-rose-500">📍</span>
                  <span>{addressText}</span>
                </p>
              )}
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] sm:text-xs">
                {restaurant.categoryName && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-sky-700">
                    🍽 {restaurant.categoryName}
                  </span>
                )}
                {restaurant.priceRange && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-emerald-700">
                    💸 {restaurant.priceRange}
                  </span>
                )}
                {typeof restaurant.rating === "number" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-amber-700">
                    ⭐ {restaurant.rating.toFixed(1)} đánh giá
                  </span>
                )}
              </div>
            </div>

            <Link
              href={`/categories/restaurants/${id}`}
              className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-rose-200 hover:bg-rose-50 sm:text-sm"
            >
              ← Xem trang nhà hàng
            </Link>
          </div>
        </div>

        {/* Pre-order main section */}
        <RestaurantPreOrderSection
          restaurantId={(restaurant as any)._id}
          restaurantName={restaurant.name}
          menuItems={menuItems}
        />
      </div>
    </div>
  );
}

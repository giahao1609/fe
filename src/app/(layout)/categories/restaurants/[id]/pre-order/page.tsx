"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import {
  RestaurantService,
  type Restaurant,
} from "@/services/restaurant.service";
import { MenuService } from "@/services/menu.service";
import { RestaurantPreOrderSection } from "@/components/pre-order/RestaurantPreOrderSection";
import { getCookie } from "@/utils/function";

const isBrowser = typeof window !== "undefined";

const cartStorageKey = (restaurantId: string) =>
  `fm_cart_restaurant_${restaurantId}`;

// ====== TYPES ======
export type PreOrderMenuItem = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  itemType?: string;
  tags?: string[];
};

// ====== PAGE COMPONENT ======
export default function RestaurantPreOrderPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [restaurant, setRestaurant] = useState<any | null>(null);
  const [menuItems, setMenuItems] = useState<PreOrderMenuItem[] | null>(null);
  const [loadingRestaurant, setLoadingRestaurant] = useState(true);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login từ localStorage (ông thay bằng store của ông nếu có)
useEffect(() => {
  if (!isBrowser) return;

  // Ưu tiên cookie accessToken
  const cookieToken = getCookie("accessToken");



  const token = cookieToken;

  setIsLoggedIn(!!token);
}, []);

  // Load restaurant + menu
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const loadRestaurant = async () => {
      setLoadingRestaurant(true);
      setError(null);
      try {
        const data = await RestaurantService.getRestaurantDetail(id);
        if (!cancelled) {
          setRestaurant(data as any);
        }
      } catch (e: any) {
        console.error("[PreOrderPage] load restaurant error:", e);
        if (!cancelled) {
          setError("Không thể tải thông tin nhà hàng.");
          setRestaurant(null);
        }
      } finally {
        if (!cancelled) setLoadingRestaurant(false);
      }
    };

    const loadMenu = async () => {
      setLoadingMenu(true);
      try {
        const res = await MenuService.listByRestaurant(id);

        const listRaw = Array.isArray(res) ? res : (res as any)?.items ?? [];

        const mapped: PreOrderMenuItem[] = listRaw.map((m: any) => {
          const signedImg = m.imagesSigned?.[0]?.url;
          const rawImg = Array.isArray(m.images) ? m.images[0] : undefined;

          return {
            _id: m._id,
            name: m.name,
            description: m.description,
            price: m.basePrice?.amount ?? 0,
            imageUrl: signedImg || rawImg,
            itemType: m.itemType,
            tags: m.tags ?? [],
          };
        });

        if (!cancelled) {
          setMenuItems(mapped);
        }
      } catch (e: any) {
        console.error("[PreOrderPage] load menu error:", e);
        if (!cancelled) {
          setMenuItems([]);
        }
      } finally {
        if (!cancelled) setLoadingMenu(false);
      }
    };

    loadRestaurant();
    loadMenu();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // ====== UI STATES (NOTE: không có hook nào sau đoạn này) ======

  if (loadingRestaurant && !restaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-amber-50">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <div className="space-y-4 animate-pulse">
            <div className="h-8 w-40 rounded-full bg-gray-200" />
            <div className="h-10 w-64 rounded-xl bg-gray-200" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[2fr,1.5fr]">
              <div className="h-64 rounded-2xl bg-gray-100" />
              <div className="h-64 rounded-2xl bg-gray-100" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
            ⚠️
          </div>
          <p className="mb-2 font-semibold text-red-600">
            {error || "Không tìm thấy nhà hàng."}
          </p>
          <p className="mb-6 text-sm text-gray-500">
            Có thể nhà hàng đã bị ẩn hoặc đường dẫn không chính xác.
          </p>
          <button
            onClick={() => router.push("/categories/restaurants")}
            className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
          >
            ← Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  // ====== ADDRESS TEXT (không dùng hook) ======
  const addressText = (() => {
    if (!restaurant.address) return "";
    const { street, ward, district, city } = restaurant.address as any;
    return [street, ward, district, city].filter(Boolean).join(", ");
  })();

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/60 via-white to-amber-50/60">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
        {/* Breadcrumb */}
        <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
          <Link
            href="/categories/restaurants"
            className="rounded-full border border-transparent px-2 py-1 hover:border-gray-200 hover:bg-white"
          >
            Nhà hàng
          </Link>
          <span>›</span>
          <span className="truncate">{restaurant.name}</span>
          <span>›</span>
          <span className="font-medium text-gray-700">Đặt bàn trước</span>
        </div>

        {/* Header info */}
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 p-[1px] shadow-sm">
          <div className="flex flex-col justify-between gap-4 rounded-2xl bg-white/95 px-4 py-4 sm:px-5 sm:py-5 md:flex-row md:items-center">
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                Đặt bàn trước – {restaurant.name}
              </h1>
              {addressText && (
                <p className="flex items-center gap-1 text-xs text-gray-600 sm:text-sm">
                  <span className="text-rose-500">📍</span>
                  <span className="line-clamp-1">{addressText}</span>
                </p>
              )}
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] sm:text-xs">
                {restaurant.categoryName && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 font-medium text-indigo-700">
                    🍽 {restaurant.categoryName}
                  </span>
                )}
                {restaurant.priceRange && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2.5 py-0.5 text-gray-700">
                    💸 {restaurant.priceRange}
                  </span>
                )}
                {typeof restaurant.rating === "number" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-0.5 font-medium text-yellow-800">
                    ⭐ {restaurant.rating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 text-xs text-gray-600">
              <span className="rounded-full bg-rose-50 px-3 py-1 text-rose-700">
                Không cần thanh toán trước · Thanh toán tại quán
              </span>
              <span className="text-[11px] text-gray-500">
                Bạn có thể chọn món trước để quán chuẩn bị nhanh hơn.
              </span>
            </div>
          </div>
        </div>

        <RestaurantPreOrderSection
          restaurantId={restaurant._id as any}
          restaurantName={restaurant.name}
          menuItems={menuItems ?? []}
          loadingMenu={loadingMenu}
          isLoggedIn={isLoggedIn}
        />
      </div>
    </div>
  );
}

// app/(layout)/categories/deals/DealsPageClient.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";

import DealFilters, { FiltersState } from "@/components/deals/DealFilters";
import DealCard, { Deal } from "@/components/deals/DealCard";
import { resolveCDN as cdn } from "@/utils/cdn";

const PAGE_SIZE = 12;

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  "https://api.food-map.online/api/v1";

type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type FeaturedApiItem = {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  coverImageUrl?: string;
  rating?: number;

  district?: string;
  city?: string;
  cuisine?: string[];
  priceRange?: string;

  minPrice?: number;
  maxPrice?: number;
  avgPrice?: number;
  itemCount?: number;
  discountedItemCount?: number;

  imagesSigned?: { path: string; url: string }[];
};

type FeaturedApiResponse = {
  success: boolean;
  message: string;
  data: Paginated<FeaturedApiItem>;
};

export default function DealsPageClient() {
  const [mounted, setMounted] = useState(false); // 👈 chống hydration mismatch

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FiltersState>({
    q: "",
    district: "",
    category: "",
    minOff: 20,
    price: "",
    sort: "best",
  });

  const [deals, setDeals] = useState<Deal[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const firstLoadRef = useRef(true);

  // Đánh dấu đã mount client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset trang về 1 khi đổi filter
  useEffect(() => {
    if (firstLoadRef.current) {
      firstLoadRef.current = false;
      return;
    }
    setPage(1);
  }, [filters]);

  // Gọi API /menu-items/featured – chỉ chạy sau khi mounted
  useEffect(() => {
    if (!mounted) return;

    let cancelled = false;

    const run = async () => {
      try {
        setError(null);
        if (page === 1) setLoading(true);
        else setLoadingMore(true);

        // map filter price → minPrice / maxPrice
        let minPrice: number | undefined;
        let maxPrice: number | undefined;

        if (filters.price === "low") {
          maxPrice = 50000;
        } else if (filters.price === "mid") {
          minPrice = 50000;
          maxPrice = 100000;
        } else if (filters.price === "high") {
          minPrice = 100000;
        }

        const params: Record<string, any> = {
          page,
          limit: PAGE_SIZE,
        };

        if (filters.q) params.q = filters.q.trim();
        if (filters.district) params.district = filters.district.trim();
        if (minPrice !== undefined) params.minPrice = minPrice;
        if (maxPrice !== undefined) params.maxPrice = maxPrice;

        const res = await axios.get<FeaturedApiResponse>(
          `${API_BASE}/menu-items/featured`,
          { params },
        );

        const apiPage = res.data.data;
        const mapped: Deal[] = (apiPage.items ?? []).map(mapFeaturedToDeal);

        // Lọc client: category + minOff + sort
        const afterClientFilters = applyClientFilters(mapped, filters);

        if (cancelled) return;

        setTotal(apiPage.total ?? afterClientFilters.length);
        setDeals((prev) =>
          page === 1 ? afterClientFilters : [...prev, ...afterClientFilters],
        );
      } catch (e: any) {
        console.error("[Deals] fetch /menu-items/featured error:", e);
        if (!cancelled) {
          setError("Không tải được danh sách ưu đãi. Vui lòng thử lại.");
          if (page === 1) {
            setDeals([]);
            setTotal(0);
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [
    mounted,
    page,
    filters.q,
    filters.district,
    filters.price,
    filters.category,
    filters.minOff,
    filters.sort,
  ]);

  const canLoadMore = deals.length < total;

  // 🔒 LẦN RENDER ĐẦU (SSR + client hydration): KHÔNG render DealFilters / DealCard
  // → markup 100% tĩnh, không phụ thuộc data, không Date.now, không API
  if (!mounted) {
    return (
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ưu đãi hot</h1>
            <p className="text-gray-600">
              Danh sách quán ăn đang giảm giá mạnh, cập nhật liên tục — lọc theo
              khu vực, danh mục, mức giảm.
            </p>
          </div>
          <div className="text-sm text-gray-500">Đang tải…</div>
        </header>

        {/* Skeleton grid tĩnh */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <div className="aspect-[4/3] w-full rounded-xl bg-gray-100 animate-pulse" />
              <div className="mt-3 h-4 w-2/3 rounded bg-gray-100 animate-pulse" />
              <div className="mt-2 h-3 w-1/2 rounded bg-gray-100 animate-pulse" />
            </div>
          ))}
        </div>
      </main>
    );
  }

  // 🔓 Sau khi mounted: render bản đầy đủ, có filter + DealCard
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ưu đãi hot</h1>
          <p className="text-gray-600">
            Danh sách quán ăn đang giảm giá mạnh, cập nhật liên tục — lọc theo
            khu vực, danh mục, mức giảm.
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {loading && page === 1
            ? "Đang tải…"
            : total
            ? `${total} ưu đãi`
            : "Không có ưu đãi phù hợp"}
        </div>
      </header>

      <DealFilters value={filters} onChange={setFilters} />

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-700">
          {error}
        </div>
      )}

      {loading && page === 1 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <div className="aspect-[4/3] w-full rounded-xl bg-gray-100 animate-pulse" />
              <div className="mt-3 h-4 w-2/3 rounded bg-gray-100 animate-pulse" />
              <div className="mt-2 h-3 w-1/2 rounded bg-gray-100 animate-pulse" />
            </div>
          ))}
        </div>
      ) : deals.length ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {deals.map((d) => (
              <DealCard key={d._id} deal={d} />
            ))}
          </div>

          <div className="flex justify-center pt-4">
            <button
              disabled={!canLoadMore || loadingMore}
              onClick={() => setPage((p) => p + 1)}
              className={`rounded-xl px-4 py-2 text-sm font-medium border shadow-sm ${
                canLoadMore
                  ? "border-gray-200 bg-white text-gray-800 hover:border-rose-300 hover:text-rose-700"
                  : "pointer-events-none opacity-50 border-gray-200 bg-white text-gray-400"
              }`}
            >
              {loadingMore
                ? "Đang tải thêm…"
                : canLoadMore
                ? "Tải thêm"
                : "Đã hết"}
            </button>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-600">
          Không tìm thấy ưu đãi phù hợp. Hãy thử điều chỉnh bộ lọc nhé!
        </div>
      )}
    </main>
  );
}

/**
 * Map 1 item từ API /menu-items/featured → Deal (dùng cho DealCard)
 */
function mapFeaturedToDeal(item: FeaturedApiItem): Deal {
  const price = item.minPrice ?? item.avgPrice ?? 0;
  const priceBefore = item.maxPrice ?? price;

  const hasDiscount = (item.discountedItemCount ?? 0) > 0;

  let percentOff = 0;
  if (hasDiscount) {
    if (priceBefore > price) {
      percentOff = Math.round(((priceBefore - price) / priceBefore) * 100);
    } else {
      // fallback nếu BE chỉ báo "có món giảm" mà ko có chênh lệch rõ
      percentOff = 25;
    }
  }

  const bannerFromSigned = item.imagesSigned?.[0]?.url;
  const bannerFromCover = item.coverImageUrl
    ? cdn(item.coverImageUrl)
    : undefined;
  const bannerFromLogo = item.logoUrl ? cdn(item.logoUrl) : undefined;

  const address = [item.district, item.city].filter(Boolean).join(", ");

  return {
    _id: item.id,
    name: item.name,
    address,
    district: item.district ?? "",
    category: item.cuisine?.[0] ?? "",
    banner:
      bannerFromSigned ||
      bannerFromCover ||
      bannerFromLogo ||
      "/image/default-food.jpg",
    price,
    priceBefore,
    percentOff,
    endsAt: undefined, // hiện tại BE chưa trả
    rating: item.rating,
    ratingCount: undefined,
    distanceKm: undefined,
  };
}

/**
 * Lọc client cho các field BE chưa support: category, minOff, sort
 */
function applyClientFilters(data: Deal[], f: FiltersState): Deal[] {
  let list = data.slice();

  if (f.category) {
    list = list.filter((x) => x.category === f.category);
  }

  if (f.minOff) {
    list = list.filter((x) => (x.percentOff ?? 0) >= f.minOff);
  }

  switch (f.sort) {
    case "discount":
      list.sort((a, b) => (b.percentOff ?? 0) - (a.percentOff ?? 0));
      break;
    case "priceAsc":
      list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
      break;
    case "priceDesc":
      list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
      break;
    case "near":
      list.sort(
        (a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999),
      );
      break;
    case "new":
      list.sort(
        (a, b) => +new Date(b.endsAt ?? 0) - +new Date(a.endsAt ?? 0),
      );
      break;
    case "best":
    default:
      list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      break;
  }

  return list;
}

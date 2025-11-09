"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import DealFilters, { FiltersState } from "@/components/deals/DealFilters";
import DealCard, { Deal } from "@/components/deals/DealCard";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

const PAGE_SIZE = 12;

export default function DealsPage() {
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

  const queryParams = useMemo(() => {
    const sp = new URLSearchParams();
    if (filters.q) sp.set("q", filters.q);
    if (filters.district) sp.set("district", filters.district);
    if (filters.category) sp.set("category", filters.category);
    if (filters.minOff) sp.set("minOff", String(filters.minOff));
    if (filters.price) sp.set("price", filters.price); // low|mid|high
    if (filters.sort) sp.set("sort", filters.sort); // best|discount|near|priceAsc|priceDesc|new
    sp.set("page", String(page));
    sp.set("pageSize", String(PAGE_SIZE));
    return sp.toString();
  }, [filters, page]);

  useEffect(() => {
    // reset trang khi đổi filter
    if (firstLoadRef.current) {
      firstLoadRef.current = false;
      return;
    }
    setPage(1);
  }, [filters]);

  useEffect(() => {
    let ctrl: AbortController | null = new AbortController();
    const run = async () => {
      try {
        setError(null);
        if (page === 1) setLoading(true);
        else setLoadingMore(true);

        // Gọi API thật nếu có
        if (API_URL) {
          const res = await fetch(`${API_URL}/deals?${queryParams}`, {
            signal: ctrl.signal,
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json = await res.json();
          const list = (json?.items ?? json?.data ?? []) as Deal[];
          const count = (json?.total ?? list.length) as number;
          setTotal(count);
          setDeals((prev) => (page === 1 ? list : [...prev, ...list]));
        } else {
          // Fallback dữ liệu mẫu (khi chưa có backend)
          const sample = getSampleDeals();
          const filtered = applyLocalFilters(sample, filters);
          const paged = filtered.slice(
            (page - 1) * PAGE_SIZE,
            page * PAGE_SIZE
          );
          setTotal(filtered.length);
          setDeals((prev) => (page === 1 ? paged : [...prev, ...paged]));
        }
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          console.error("[Deals] fetch error:", e);
          setError("Không tải được danh sách ưu đãi. Thử lại nhé.");
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };
    run();
    return () => {
      ctrl?.abort();
      ctrl = null;
    };
  }, [queryParams, page]);

  const canLoadMore = deals.length < total;

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
          {loading
            ? "Đang tải…"
            : total
            ? `${total} ưu đãi`
            : "Không có ưu đãi phù hợp"}
        </div>
      </header>

      {/* Filters bar */}
      <DealFilters value={filters} onChange={setFilters} />

      {/* Grid list */}
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

          {/* Load more */}
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

/* ===================== SAMPLE & LOCAL FILTERS (fallback) ===================== */

export function getSampleDeals(): Deal[] {
  return [
    {
      _id: "d1",
      name: "Bò nướng XYZ",
      address: "12 Nguyễn Thị Minh Khai, Q1",
      district: "Q1",
      category: "Lẩu/Nướng",
      banner: "/image/deals/deal-1.jpg",
      price: 89000,
      priceBefore: 139000,
      percentOff: 36,
      endsAt: new Date(Date.now() + 3 * 86400000).toISOString(),
      rating: 4.5,
      ratingCount: 210,
      distanceKm: 1.2,
    },
    {
      _id: "d2",
      name: "Phở tái Bà Tám",
      address: "45 Lê Lợi, Q1",
      district: "Q1",
      category: "Bún/Phở",
      banner: "/image/deals/deal-2.jpg",
      price: 39000,
      priceBefore: 55000,
      percentOff: 29,
      endsAt: new Date(Date.now() + 1 * 86400000).toISOString(),
      rating: 4.2,
      ratingCount: 98,
      distanceKm: 2.0,
    },
    {
      _id: "d3",
      name: "Sushi Sora",
      address: "88 Nguyễn Gia Trí, Bình Thạnh",
      district: "Bình Thạnh",
      category: "Món Nhật",
      banner: "/image/deals/deal-3.jpg",
      price: 129000,
      priceBefore: 199000,
      percentOff: 35,
      endsAt: new Date(Date.now() + 5 * 86400000).toISOString(),
      rating: 4.7,
      ratingCount: 320,
      distanceKm: 3.8,
    },
    // … thêm ít mẫu nữa nếu cần
  ];
}

function applyLocalFilters(data: Deal[], f: FiltersState): Deal[] {
  let list = data.slice();
  if (f.q) {
    const q = f.q.toLowerCase();
    list = list.filter(
      (x) =>
        x.name.toLowerCase().includes(q) ||
        x.address.toLowerCase().includes(q) ||
        x.category?.toLowerCase().includes(q)
    );
  }
  if (f.district) list = list.filter((x) => x.district === f.district);
  if (f.category) list = list.filter((x) => x.category === f.category);
  if (f.minOff) list = list.filter((x) => (x.percentOff ?? 0) >= f.minOff);

  if (f.price === "low") list = list.filter((x) => (x.price ?? 0) < 50000);
  if (f.price === "mid")
    list = list.filter(
      (x) => (x.price ?? 0) >= 50000 && (x.price ?? 0) <= 100000
    );
  if (f.price === "high") list = list.filter((x) => (x.price ?? 0) > 100000);

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
      list.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
      break;
    case "new":
      list.sort((a, b) => +new Date(b.endsAt ?? 0) - +new Date(a.endsAt ?? 0));
      break;
    case "best":
    default:
      list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  }
  return list;
}

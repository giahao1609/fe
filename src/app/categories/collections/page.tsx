"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import CollectionFilters, {
  CollectionsFilterState,
} from "@/components/collections/CollectionFilters";
import CollectionCard, {
  Collection,
} from "@/components/collections/CollectionCard";
import { sampleCollections } from "@/data/collections";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";
const PAGE_SIZE = 12;

export default function CollectionsPage() {
  const [filters, setFilters] = useState<CollectionsFilterState>({
    q: "",
    district: "",
    category: "",
    tag: "",
    sort: "featured", // featured | newest | updated | size
  });
  const [page, setPage] = useState(1);

  const [items, setItems] = useState<Collection[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const firstLoadRef = useRef(true);

  // reset trang khi đổi filter
  useEffect(() => {
    if (firstLoadRef.current) {
      firstLoadRef.current = false;
      return;
    }
    setPage(1);
  }, [filters]);

  // tạo query string khi gọi API thật
  const qs = useMemo(() => {
    const sp = new URLSearchParams();
    if (filters.q) sp.set("q", filters.q);
    if (filters.district) sp.set("district", filters.district);
    if (filters.category) sp.set("category", filters.category);
    if (filters.tag) sp.set("tag", filters.tag);
    if (filters.sort) sp.set("sort", filters.sort);
    sp.set("page", String(page));
    sp.set("pageSize", String(PAGE_SIZE));
    return sp.toString();
  }, [filters, page]);

  useEffect(() => {
    let ctrl: AbortController | null = new AbortController();

    const fetchData = async () => {
      try {
        setError(null);
        if (page === 1) setLoading(true);
        else setLoadingMore(true);

        if (API_URL) {
          // 🚀 API thật
          const res = await fetch(`${API_URL}/collections?${qs}`, {
            signal: ctrl.signal,
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json = await res.json();
          const list = (json?.items ?? json?.data ?? []) as Collection[];
          const count = (json?.total ?? list.length) as number;
          setTotal(count);
          setItems((prev) => (page === 1 ? list : [...prev, ...list]));
        } else {
          // 🧪 fallback dữ liệu mẫu
          const filtered = applyLocalFilter(sampleCollections, filters);
          const sorted = applyLocalSort(filtered, filters.sort);
          const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
          setTotal(filtered.length);
          setItems((prev) => (page === 1 ? paged : [...prev, ...paged]));
        }
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          console.error("[Collections] fetch error:", e);
          setError("Không tải được danh sách bộ sưu tập. Thử lại nhé.");
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetchData();
    return () => {
      ctrl?.abort();
      ctrl = null;
    };
  }, [qs, page]);

  const canLoadMore = items.length < total;

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bộ sưu tập</h1>
          <p className="text-gray-600">
            Khám phá các bộ sưu tập quán ngon theo chủ đề: “Ăn vặt giờ tan tầm”,
            “Lẩu/nướng cuối tuần”, “Café view đẹp”,…
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {loading
            ? "Đang tải…"
            : total
            ? `${total} bộ sưu tập`
            : "Không có bộ sưu tập phù hợp"}
        </div>
      </header>

      <CollectionFilters value={filters} onChange={setFilters} />

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
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
      ) : items.length ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {items.map((c) => (
              <CollectionCard key={c._id} collection={c} />
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
          Không tìm thấy bộ sưu tập phù hợp. Hãy thử điều chỉnh bộ lọc nhé!
        </div>
      )}
    </main>
  );
}

/* ================= helpers (fallback mode) ================= */

function applyLocalFilter(data: Collection[], f: CollectionsFilterState) {
  let list = data.slice();
  if (f.q) {
    const q = f.q.toLowerCase();
    list = list.filter(
      (x) =>
        x.title.toLowerCase().includes(q) ||
        x.description?.toLowerCase().includes(q) ||
        x.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }
  if (f.district) list = list.filter((x) => x.district === f.district);
  if (f.category) list = list.filter((x) => x.category === f.category);
  if (f.tag)
    list = list.filter((x) =>
      x.tags?.some((t) => t.toLowerCase() === f.tag.toLowerCase())
    );
  return list;
}

function applyLocalSort(
  list: Collection[],
  sort: CollectionsFilterState["sort"]
) {
  const out = list.slice();
  switch (sort) {
    case "newest":
      out.sort(
        (a, b) => +new Date(b.createdAt ?? 0) - +new Date(a.createdAt ?? 0)
      );
      break;
    case "updated":
      out.sort(
        (a, b) => +new Date(b.updatedAt ?? 0) - +new Date(a.updatedAt ?? 0)
      );
      break;
    case "size":
      out.sort((a, b) => (b.itemsCount ?? 0) - (a.itemsCount ?? 0));
      break;
    case "featured":
    default:
      out.sort((a, b) => (b.featuredScore ?? 0) - (a.featuredScore ?? 0));
      break;
  }
  return out;
}

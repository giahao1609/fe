"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import CollectionFilters, { CollectionsFilterState } from "@/components/collections/CollectionFilters";
import CollectionCard, { Collection } from "@/components/collections/CollectionCard";
import { sampleCollections } from "@/data/collections";

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

  // debounce q để tránh re-filter quá dày
  const [qDebounced, setQDebounced] = useState(filters.q);
  useEffect(() => {
    const id = setTimeout(() => setQDebounced(filters.q), 250);
    return () => clearTimeout(id);
  }, [filters.q]);

  // reset page khi đổi filter khác (ngoài qDebounced)
  const firstLoadRef = useRef(true);
  useEffect(() => {
    if (firstLoadRef.current) {
      firstLoadRef.current = false;
      return;
    }
    setPage(1);
  }, [filters.district, filters.category, filters.tag, filters.sort, qDebounced]);

  // tính toán danh sách theo filter (fake data)
  const filteredSorted = useMemo(() => {
    const f: CollectionsFilterState = { ...filters, q: qDebounced };

    let list = sampleCollections.slice();

    // filter
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

    // sort
    const out = list.slice();
    switch (f.sort) {
      case "newest":
        out.sort((a, b) => +new Date(b.createdAt ?? 0) - +new Date(a.createdAt ?? 0));
        break;
      case "updated":
        out.sort((a, b) => +new Date(b.updatedAt ?? 0) - +new Date(a.updatedAt ?? 0));
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
  }, [filters, qDebounced]);

  // lấy data theo page
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        if (page === 1) setLoading(true);
        else setLoadingMore(true);

        const start = (page - 1) * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        const pageSlice = filteredSorted.slice(start, end);

        if (!mounted) return;
        setTotal(filteredSorted.length);
        setItems((prev) => (page === 1 ? pageSlice : [...prev, ...pageSlice]));
      } finally {
        if (mounted) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [page, filteredSorted]);

  // cuộn lên đầu khi đổi bộ lọc (và page quay về 1)
  useEffect(() => {
    if (page === 1) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [items.length === 0, page]);

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
          {loading && page === 1
            ? "Đang tải…"
            : total
            ? `${total} bộ sưu tập`
            : "Không có bộ sưu tập phù hợp"}
        </div>
      </header>

      <CollectionFilters value={{ ...filters, q: qDebounced }} onChange={setFilters} />

      {loading && page === 1 ? (
        // skeleton
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
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
              {loadingMore ? "Đang tải thêm…" : canLoadMore ? "Tải thêm" : "Đã hết"}
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

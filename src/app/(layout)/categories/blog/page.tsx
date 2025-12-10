"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import BlogList from "@/components/blog/BlogList";
import BlogSidebar from "@/components/blog/BlogSidebar";
import {
  BlogService,
  type BlogPost,
  type PaginatedBlogs,
} from "@/services/blog.service";

const PAGE_SIZE = 8;

type Search = {
  page?: string;
  q?: string;
  tag?: string;
  categories?: string;
};

function qs(params: Record<string, string | undefined>) {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") p.set(k, v);
  });
  return p.toString();
}

function uniq<T>(arr: T[]) {
  return [...new Set(arr)];
}

export default function BlogIndex() {
  // state giữ query từ URL
  const [search, setSearch] = useState<Search>({});
  const [data, setData] = useState<PaginatedBlogs | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // đọc query 1 lần khi mount (không dùng useSearchParams)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const sp = new URLSearchParams(window.location.search);

    setSearch({
      page: sp.get("page") ?? undefined,
      q: sp.get("q") ?? undefined,
      tag: sp.get("tag") ?? undefined,
      categories: sp.get("categories") ?? undefined,
    });
  }, []);

  // derive từ state search
  const page = Math.max(1, Number(search.page ?? 1) || 1);
  const q = (search.q ?? "").toString().trim();
  const tag = (search.tag ?? "").toString().trim();
  const categories = (search.categories ?? "").toString().trim();

  // call API
  useEffect(() => {
    let canceled = false;

    const fetchBlogs = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await BlogService.listFullBlogs({
          page,
          limit: PAGE_SIZE,
          q: q || undefined,
          tags: tag || undefined,
          categories: categories || undefined,
        });

        if (!canceled) {
          setData(res);
        }
      } catch (err) {
        console.error("BlogIndex list error:", err);
        if (!canceled) {
          setError("Không thể tải danh sách blog. Vui lòng thử lại sau.");
        }
      } finally {
        if (!canceled) {
          setLoading(false);
        }
      }
    };

    fetchBlogs();

    return () => {
      canceled = true;
    };
  }, [page, q, tag, categories]);

  const items: BlogPost[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const maxPage = data?.pages ?? Math.max(1, Math.ceil(total / PAGE_SIZE));

  const allTags = useMemo(
    () =>
      uniq(
        items.flatMap((p) => (Array.isArray(p.tags) ? p.tags : [])),
      ).slice(0, 12),
    [items],
  );

  // dùng id thay vì slug
  const popular = useMemo(
    () =>
      items
        .slice()
        .sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
        .slice(0, 5)
        .map((p) => ({ title: p.title, id: p._id })),
    [items],
  );

  const baseQuery = {
    ...(q ? { q } : undefined),
    ...(tag ? { tag } : undefined),
    ...(categories ? { categories } : undefined),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      {/* Header + quick filters */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-gray-900">
          Blog ẩm thực
        </h1>
        <p className="text-gray-600">
          Review quán, gợi ý món, mẹo đi FoodTour – cập nhật liên tục.
        </p>

        {allTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {allTags.map((t) => (
              <Link
                key={t}
                href={`/categories/blog?${qs({
                  ...baseQuery,
                  tag: t,
                  page: "1",
                })}`}
                className={`rounded-full border px-3 py-1 text-xs ${
                  t === tag
                    ? "border-rose-300 bg-rose-50 text-rose-700"
                    : "border-gray-200 text-gray-700 hover:border-rose-300 hover:text-rose-700"
                }`}
              >
                #{t}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* List */}
        <div className="lg:col-span-9">
          {loading && (
            <div className="mb-4 rounded-xl border border-gray-100 bg-white p-4 text-sm text-gray-600">
              Đang tải bài viết...
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <BlogList posts={items} />

          {!loading && !items.length && !error && (
            <div className="mt-6 rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
              Không tìm thấy bài viết phù hợp.
            </div>
          )}

          {maxPage > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Link
                href={`/categories/blog?${qs({
                  ...baseQuery,
                  page: String(Math.max(1, page - 1)),
                })}`}
                className={`rounded-xl border px-3 py-1.5 text-sm ${
                  page <= 1
                    ? "pointer-events-none opacity-40"
                    : "border-gray-200 text-gray-700 hover:border-rose-300 hover:text-rose-700"
                }`}
              >
                ← Trước
              </Link>
              <span className="text-sm text-gray-600">
                Trang {Math.min(page, maxPage)}/{maxPage}
              </span>
              <Link
                href={`/categories/blog?${qs({
                  ...baseQuery,
                  page: String(Math.min(maxPage, page + 1)),
                })}`}
                className={`rounded-xl border px-3 py-1.5 text-sm ${
                  page >= maxPage
                    ? "pointer-events-none opacity-40"
                    : "border-gray-200 text-gray-700 hover:border-rose-300 hover:text-rose-700"
                }`}
              >
                Sau →
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-3">
          {/* Nhớ sửa BlogSidebar để nhận { title, id } và link bằng id */}
          <BlogSidebar tags={allTags} popular={popular} />
        </div>
      </div>
    </div>
  );
}

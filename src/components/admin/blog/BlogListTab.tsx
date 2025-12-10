"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  BlogService,
  type BlogPost,
  type PaginatedBlogs,
} from "@/services/blog.service";

const PAGE_SIZE = 20;

type Search = {
  page?: string;
  q?: string;
};

function qs(params: Record<string, string | undefined>) {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") p.set(k, v);
  });
  return p.toString();
}

const formatDate = (value?: string | Date | null) => {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  return d.toLocaleString("vi-VN");
};

type BlogViewModalProps = {
  blog: BlogPost | null;
  onClose: () => void;
  onToggleHidden: (blog: BlogPost) => void;
  togglingId: string | null;
};

function BlogViewModal({
  blog,
  onClose,
  onToggleHidden,
  togglingId,
}: any) {
  if (!blog) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-2xl rounded-xl bg-white p-5 shadow-xl">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">{blog.title}</h2>
            <p className="text-xs text-gray-500">
              ID: {blog._id}
              {"slug" in blog && (blog as any).slug && (
                <>
                  <br />
                  Slug: {(blog as any).slug}
                </>
              )}
            </p>
          </div>
          <button
            type="button"
            className="rounded-full px-2 text-gray-500 hover:bg-gray-100"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">Trạng thái: </span>
            {blog.isHidden ? (
              <span className="text-gray-600">Đang ẩn</span>
            ) : (
              <span className="text-emerald-700">Đang hiển thị</span>
            )}
          </div>
          <div>
            <span className="font-medium">Lượt xem: </span>
            {blog.viewCount ?? 0}
          </div>
          <div>
            <span className="font-medium">Ngày tạo: </span>
            {formatDate((blog as any).createdAt)}
          </div>
          {Array.isArray(blog.tags) && blog.tags.length > 0 && (
            <div>
              <span className="font-medium">Tags: </span>
              <span className="text-gray-700">
                {blog.tags.join(", ")}
              </span>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Link
            href={`/categories/blog/${blog._id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm">
              Đi đến trang blog
            </Button>
          </Link>
          <Button
            size="sm"
            onClick={() => onToggleHidden(blog)}
            disabled={togglingId === blog._id}
          >
            {togglingId === blog._id
              ? "Đang lưu..."
              : blog.isHidden
              ? "Hiện bài viết"
              : "Ẩn bài viết"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminBlogIndex() {
  const [search, setSearch] = useState<Search>({});
  const [data, setData] = useState<PaginatedBlogs | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");

  // đọc query khi mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);

    const q = sp.get("q") ?? "";
    setSearch({
      page: sp.get("page") ?? undefined,
      q: q || undefined,
    });
    setKeyword(q);
  }, []);

  const page = Math.max(1, Number(search.page ?? 1) || 1);
  const q = (search.q ?? "").toString().trim();

  // load list blog (admin)
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
          status: "all" as any,
        });

        if (!canceled) {
          setData(res);
        }
      } catch (err) {
        console.error("AdminBlogIndex list error:", err);
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
  }, [page, q]);

  const items: any[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const maxPage = data?.pages ?? Math.max(1, Math.ceil(total / PAGE_SIZE));

  const baseQuery = {
    ...(q ? { q } : undefined),
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Search = {
      ...search,
      q: keyword || undefined,
      page: "1",
    };
    setSearch(next);

    if (typeof window !== "undefined") {
      const query = qs(next as Record<string, string | undefined>);
      const url = `${window.location.pathname}${query ? `?${query}` : ""}`;
      window.history.replaceState(null, "", url);
    }
  };

  const handleToggleHidden = async (blog: any) => {
    try {
      setTogglingId(blog._id);
      const nextHidden = !blog.isHidden;

      const updated = await BlogService.updateHiddenStatus(
        blog._id,
        nextHidden,
      );

      setData((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((b) =>
                b._id === blog._id ? { ...b, ...updated } : b,
              ),
            }
          : prev,
      );

      // nếu đang xem trong modal thì update luôn
      setSelectedBlog((prev) =>
        prev && prev._id === blog._id ? { ...prev, ...updated } : prev,
      );
    } catch (err) {
      console.error("Toggle hidden error:", err);
      alert("Không thể cập nhật trạng thái bài viết.");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-gray-900">
            Quản lý Blog
          </h1>
          <p className="text-gray-600">
            Xem, ẩn/hiện và điều hướng đến trang blog public.
          </p>
        </div>

        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            className="h-9 rounded-md border border-gray-200 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
            placeholder="Tìm theo tiêu đề..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <Button type="submit" size="sm">
            Lọc
          </Button>
        </form>
      </div>

      {loading && (
        <div className="mb-4 rounded-xl border border-gray-100 bg-white p-4 text-sm text-gray-600">
          Đang tải danh sách blog...
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Bảng quản lý */}
      <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Tiêu đề</TableHead>
              <TableHead>Slug / ID</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length ? (
              items.map((b) => (
                <TableRow key={b._id}>
                  <TableCell className="font-medium">
                    <div className="line-clamp-2">{b.title}</div>
                  </TableCell>
                  <TableCell className="text-xs text-gray-600">
                    {("slug" in b && (b as any).slug) ? (
                      <>
                        <div className="truncate">{(b as any).slug}</div>
                        <div className="text-[11px] text-gray-400">
                          ID: {b._id}
                        </div>
                      </>
                    ) : (
                      <span>{b._id}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {b.isHidden ? (
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                        Đang ẩn
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                        Đang hiển thị
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-700">
                    {b.viewCount ?? 0}
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">
                    {formatDate((b as any).createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedBlog(b)}
                      >
                        Xem
                      </Button>

                      <Link
                        href={`/categories/blog/${b._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm">
                          Đi đến
                        </Button>
                      </Link>

                      <Button
                        variant={b.isHidden ? "default" : "secondary"}
                        size="sm"
                        disabled={togglingId === b._id}
                        onClick={() => handleToggleHidden(b)}
                      >
                        {togglingId === b._id
                          ? "Đang lưu..."
                          : b.isHidden
                          ? "Hiện"
                          : "Ẩn"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-6 text-center text-sm text-gray-500"
                >
                  Không có bài viết nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {maxPage > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-700">
          <Link
            href={`?${qs({
              ...baseQuery,
              page: String(Math.max(1, page - 1)),
            })}`}
            className={`rounded-xl border px-3 py-1.5 ${
              page <= 1
                ? "pointer-events-none opacity-40"
                : "border-gray-200 hover:border-rose-300 hover:text-rose-700"
            }`}
          >
            ← Trước
          </Link>
          <span>
            Trang {Math.min(page, maxPage)}/{maxPage}
          </span>
          <Link
            href={`?${qs({
              ...baseQuery,
              page: String(Math.min(maxPage, page + 1)),
            })}`}
            className={`rounded-xl border px-3 py-1.5 ${
              page >= maxPage
                ? "pointer-events-none opacity-40"
                : "border-gray-200 hover:border-rose-300 hover:text-rose-700"
            }`}
          >
            Sau →
          </Link>
        </div>
      )}

      {/* Modal xem nhanh */}
      <BlogViewModal
        blog={selectedBlog}
        onClose={() => setSelectedBlog(null)}
        onToggleHidden={handleToggleHidden}
        togglingId={togglingId}
      />
    </div>
  );
}

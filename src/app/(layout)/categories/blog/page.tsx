import Link from "next/link";
import BlogList from "@/components/blog/BlogList";
import BlogSidebar from "@/components/blog/BlogSidebar";
import { BlogService, type BlogPost, type PaginatedBlogs } from "@/services/blog.service";

const PAGE_SIZE = 8;

type Search = {
  page?: string;
  q?: string;
  tag?: string;         // 1 tag (client có thể truyền nhiều, mình vẫn ưu tiên 1 param)
  categories?: string;  // "blog,review"
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

export default async function BlogIndex({
  searchParams,
}: {
  // Next 15: searchParams là Promise
  searchParams?: Promise<Search>;
}) {
  const sp = (await searchParams) ?? {};

  const page = Math.max(1, Number(sp.page ?? 1));
  const q = (sp.q ?? "").toString().trim();
  const tag = (sp.tag ?? "").toString().trim();
  const categories = (sp.categories ?? "").toString().trim();

  // Gọi API: chỉ lấy bài đã xuất bản
  let data: PaginatedBlogs | null = null;
  try {
    data = await BlogService.listMyBlogs({
      page,
      limit: PAGE_SIZE,
      q: q || undefined,
      tags: tag || undefined,           // backend: "tag1,tag2"
      categories: categories || undefined,
      status: "PUBLISHED",
    });
  } catch (err) {
    // Silent fallback (giữ data=null)
    console.error("BlogIndex list error:", err);
  }

  const items: BlogPost[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const maxPage = data?.pages ?? Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Sidebar: gom tag từ trang hiện tại (nếu muốn lấy tổng thể, tạo endpoint riêng)
  const allTags = uniq(
    items.flatMap((p) => Array.isArray(p.tags) ? p.tags : [])
  ).slice(0, 12);

  // Popular: ưu tiên theo viewCount trong page hiện tại (nếu backend có endpoint popular thì thay ở đây)
  const popular = items
    .slice()
    .sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
    .slice(0, 5)
    .map((p) => ({ title: p.title, slug: p.slug }));

  // Build query giữ nguyên filter khi phân trang
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

        {/* Khu filter (link nhanh với tag đang có) */}
        {allTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {allTags.map((t) => (
              <Link
                key={t}
                href={`/categories/blog?${qs({ ...baseQuery, tag: t, page: "1" })}`}
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
          <BlogList posts={items} />

          {/* Empty state */}
          {!items.length && (
            <div className="mt-6 rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
              Không tìm thấy bài viết phù hợp.
            </div>
          )}

          {/* Pagination */}
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
          <BlogSidebar tags={allTags} popular={popular} />
        </div>
      </div>
    </div>
  );
}

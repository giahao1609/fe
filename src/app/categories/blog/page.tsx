import Link from "next/link";
import BlogList from "@/components/blog/BlogList";
import BlogSidebar from "@/components/blog/BlogSidebar";
import { posts as allPosts } from "@/data/posts";

const PAGE_SIZE = 8;

function uniq<T>(arr: T[]) {
  return [...new Set(arr)];
}

export default async function BlogIndex({
  searchParams,
}: {
  // Next 15: searchParams là Promise
  searchParams?: Promise<{ page?: string; tag?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const page = Math.max(1, Number(sp.page ?? 1));
  const tag = (sp.tag ?? "").toString().toLowerCase();

  const filtered = tag
    ? allPosts.filter((p) => p.tags.some((t) => t.toLowerCase().includes(tag)))
    : allPosts;

  const total = filtered.length;
  const maxPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const slice = filtered
    .slice()
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
    .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const allTags = uniq(allPosts.flatMap((p) => p.tags)).slice(0, 12);
  const popular = allPosts
    .slice(0, 5)
    .map((p) => ({ title: p.title, slug: p.slug }));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-gray-900">
          Blog ẩm thực
        </h1>
        <p className="text-gray-600">
          Review quán, gợi ý món, mẹo đi FoodTour – cập nhật liên tục.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* List */}
        <div className="lg:col-span-9">
          <BlogList posts={slice} />

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <Link
              href={`/categories/blog?${new URLSearchParams({
                ...(tag ? { tag } : {}),
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
              Trang {page}/{maxPage}
            </span>
            <Link
              href={`/categories/blog?${new URLSearchParams({
                ...(tag ? { tag } : {}),
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
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-3">
          <BlogSidebar tags={allTags} popular={popular} />
        </div>
      </div>
    </div>
  );
}

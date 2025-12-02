// src/components/blog/BlogSidebar.tsx
"use client";

import Link from "next/link";

export default function BlogSidebar({
  tags,
  popular,
}: {
  tags: string[];
  popular: { title: string; id: string }[];
}) {
  return (
    <aside className="space-y-6">
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <h4 className="text-sm font-semibold text-gray-900">Chủ đề nổi bật</h4>
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((t) => (
            <Link
              key={t}
              href={`/categories/blog?tag=${encodeURIComponent(t)}`}
              className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700 hover:border-rose-300 hover:text-rose-700"
            >
              #{t}
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <h4 className="text-sm font-semibold text-gray-900">Đọc nhiều</h4>
        <ul className="mt-3 space-y-2 text-sm">
          {popular.map((p) => (
            <li key={p.id}>
              <Link
                href={`/categories/blog/${p.id}`}
                className="line-clamp-2 text-gray-700 hover:text-rose-700"
              >
                {p.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

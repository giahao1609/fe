"use client";

import Link from "next/link";

export default function TagPill({ tag }: { tag: string }) {
  return (
    <Link
      href={`/categories/blog?tag=${encodeURIComponent(tag)}`}
      className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 ring-1 ring-rose-100 hover:bg-rose-100"
    >
      #{tag}
    </Link>
  );
}

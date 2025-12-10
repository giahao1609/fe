"use client";

import BlogCard from "./BlogCard";
import type { BlogPost } from "@/services/blog.service";

export default function BlogList({ posts }: { posts: BlogPost[] }) {
  if (!posts.length) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-gray-500">
        Chưa có bài viết phù hợp. Bạn thử đổi bộ lọc nhé!
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:gap-6">
      {posts.map((p) => (
        <BlogCard key={p.slug} post={p} />
      ))}
    </div>
  );
}

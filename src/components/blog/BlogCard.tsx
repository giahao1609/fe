"use client";

import Link from "next/link";
import Image from "next/image";
import TagPill from "./TagPill";
import { formatDate, calcReadingTime } from "@/lib/format";
import type { BlogPost } from "@/services/blog.service";

const getImageUrl = (path?: string | null) => {
  if (!path) return "https://placehold.co/600x338?text=Blog";
  const p = path.toString().trim();
  if (!p) return "https://placehold.co/600x338?text=Blog";
  if (/^https?:\/\//i.test(p) || p.startsWith("/")) return p;
  return `/${p.replace(/^\/+/, "")}`;
};

type CardPost = BlogPost & {
  author?: {
    name?: string;
    avatar?: string | null;
  };
  authorName?: string;
};

export default function BlogCard({ post }: { post: CardPost }) {
  const reading =
    post.readingMinutes ??
    calcReadingTime(post.contentHtml || "");

  const cover = getImageUrl(
    post.heroImageUrlSigned || post.heroImageUrl || "https://i.pravatar.cc/64?img=11",
  );

  const authorName =
    post.author?.name || post.authorName || (post.authorId ? "Tác giả" : "FoodMap Blog");
  const authorAvatar = post.author?.avatar || null;
  const tags = Array.isArray(post.tags) ? post.tags : [];

  return (
    <article className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md">
      <Link href={`/categories/blog/${post._id}`} className="block">
        <div className="relative aspect-[16/9] w-full">
          <Image
            src={cover}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        </div>
      </Link>

      <div className="p-4">
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 3).map((t) => (
              <TagPill key={t} tag={t} />
            ))}
          </div>
        )}

        <Link href={`/categories/blog/${post._id}`}>
          <h3 className="mt-2 line-clamp-2 text-lg font-semibold text-gray-900 group-hover:text-rose-700">
            {post.title}
          </h3>
        </Link>

        {post.excerpt && (
          <p className="mt-1 line-clamp-2 text-sm text-gray-600">
            {post.excerpt}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 overflow-hidden rounded-full bg-gray-100 ring-1 ring-gray-200">
             <Image
                  src="https://i.pravatar.cc/64?img=11"
                  alt={authorName}
                  width={24}
                  height={24}
                />
            </div>
            <span>{authorName}</span>
          </div>

          <div className="flex items-center gap-2">
            {post.publishedAt && (
              <time dateTime={post.publishedAt}>
                {formatDate(post.publishedAt)}
              </time>
            )}
            {post.publishedAt && <span>·</span>}
            <span>{reading} phút đọc</span>
          </div>
        </div>
      </div>
    </article>
  );
}

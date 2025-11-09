// /components/blog/BlogCard.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import TagPill from "./TagPill";
import { formatDate, calcReadingTime } from "@/lib/format";
import type { Post } from "@/data/posts";

export default function BlogCard({ post }: { post: Post }) {
  const reading = post.readingTime ?? calcReadingTime(post.content);

  return (
    <article className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md">
      <Link href={`/categories/blog/${post.slug}`} className="block">
        <div className="relative aspect-[16/9] w-full">
          <Image
            src={post.cover}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            priority={false}
          />
        </div>
      </Link>

      <div className="p-4">
        <div className="flex flex-wrap gap-2">
          {post.tags.slice(0, 3).map((t) => (
            <TagPill key={t} tag={t} />
          ))}
        </div>

        <Link href={`/categories/blog/${post.slug}`}>
          <h3 className="mt-2 line-clamp-2 text-lg font-semibold text-gray-900 group-hover:text-rose-700">
            {post.title}
          </h3>
        </Link>

        <p className="mt-1 line-clamp-2 text-sm text-gray-600">
          {post.excerpt}
        </p>

        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 overflow-hidden rounded-full bg-gray-100 ring-1 ring-gray-200">
              {post.author.avatar ? (
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  width={24}
                  height={24}
                />
              ) : null}
            </div>
            <span>{post.author.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <time dateTime={post.publishedAt}>
              {formatDate(post.publishedAt)}
            </time>
            <span>·</span>
            <span>{reading} phút đọc</span>
          </div>
        </div>
      </div>
    </article>
  );
}

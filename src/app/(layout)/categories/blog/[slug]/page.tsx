"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import Prose from "@/components/blog/Prose";
import TagPill from "@/components/blog/TagPill";
import { BlogService, type BlogPost } from "@/services/blog.service";

const getImageUrl = (path?: string | null) => {
  if (!path) return "https://placehold.co/800x450?text=Blog";
  const p = path.toString().trim();
  if (!p) return "https://placehold.co/800x450?text=Blog";
  if (/^https?:\/\//i.test(p) || p.startsWith("/")) return p;
  return `/${p.replace(/^\/+/, "")}`;
};

export default function BlogDetailPage() {
  // 👈 nếu folder là [slug], param phải là slug
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const id = params?.slug; // dùng slug trong URL như là id để gọi API

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let canceled = false;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await BlogService.getById(id);
        console.log("Blog detail res:", res);

        if (canceled) return;

        if (!res) {
          router.replace("/404");
          return;
        }

        setPost(res);
      } catch (err) {
        console.error("BlogDetail error:", err);
        if (!canceled) {
          setError("Không thể tải bài viết. Vui lòng thử lại sau.");
        }
      } finally {
        if (!canceled) {
          setLoading(false);
        }
      }
    };

    fetchDetail();

    return () => {
      canceled = true;
    };
  }, [id, router]);

  if (loading && !post) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-0 py-6 lg:py-8">
        <div className="mb-3">
          <Link
            href="/categories/blog"
            className="text-sm text-rose-700 hover:underline"
          >
            ← Quay lại Blog
          </Link>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 text-sm text-gray-600">
          Đang tải bài viết...
        </div>
      </div>
    );
  }

  if (error && !post) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-0 py-6 lg:py-8">
        <div className="mb-3">
          <Link
            href="/categories/blog"
            className="text-sm text-rose-700 hover:underline"
          >
            ← Quay lại Blog
          </Link>
        </div>
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!post) return null;

  const reading =
    post.readingMinutes ??
    Math.max(1, Math.round((post.contentHtml?.length ?? 0) / 800));

  const hero = getImageUrl(post.heroImageUrlSigned || post.heroImageUrl);
  const tags = Array.isArray(post.tags) ? post.tags : [];

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-0 py-6 lg:py-8">
      <div className="mb-3">
        <Link
          href="/categories/blog"
          className="text-sm text-rose-700 hover:underline"
        >
          ← Quay lại Blog
        </Link>
      </div>

      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-gray-900">
        {post.title}
      </h1>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-600">
        <span>{post.authorId ? "Tác giả" : "FoodMap Blog"}</span>
        {post.publishedAt && (
          <>
            <span>·</span>
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString("vi-VN")}
            </time>
          </>
        )}
        <span>·</span>
        <span>{reading} phút đọc</span>
        {post.viewCount != null && (
          <>
            <span>·</span>
            <span>{post.viewCount} lượt xem</span>
          </>
        )}
      </div>

      <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 shadow-sm">
        <Image
          src={hero}
          alt={post.title}
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 768px, 100vw"
        />
      </div>

      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((t) => (
            <TagPill key={t} tag={t} />
          ))}
        </div>
      )}

      <div className="mt-6">
        <Prose>
          <div dangerouslySetInnerHTML={{ __html: post.contentHtml || "" }} />
        </Prose>
      </div>
    </div>
  );
}

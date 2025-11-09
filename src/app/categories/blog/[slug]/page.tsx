// /app/categories/blog/[slug]/page.tsx
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Prose from "@/components/blog/Prose";
import TagPill from "@/components/blog/TagPill";
import { posts } from "@/data/posts";
import { formatDate, calcReadingTime } from "@/lib/format";

export default function BlogDetail({ params }: { params: { slug: string } }) {
  const post = posts.find((p) => p.slug === params.slug);
  if (!post) return notFound();

  const reading = post.readingTime ?? calcReadingTime(post.content);

  const related = posts
    .filter(
      (p) => p.slug !== post.slug && p.tags.some((t) => post.tags.includes(t))
    )
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-0 py-6 lg:py-8">
      {/* Back */}
      <div className="mb-3">
        <Link
          href="/categories/blog"
          className="text-sm text-rose-700 hover:underline"
        >
          ← Quay lại Blog
        </Link>
      </div>

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-gray-900">
        {post.title}
      </h1>

      {/* Meta */}
      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          {post.author.avatar ? (
            <Image
              src={post.author.avatar}
              alt={post.author.name}
              width={28}
              height={28}
              className="rounded-full ring-1 ring-gray-200"
            />
          ) : (
            <div className="h-7 w-7 rounded-full bg-gray-100 ring-1 ring-gray-200" />
          )}
          <span>{post.author.name}</span>
        </div>
        <span>·</span>
        <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
        <span>·</span>
        <span>{reading} phút đọc</span>
      </div>

      {/* Cover */}
      <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 shadow-sm">
        <Image
          src={post.cover}
          alt={post.title}
          fill
          className="object-cover"
          priority={false}
          sizes="(min-width: 1024px) 768px, 100vw"
        />
      </div>

      {/* Tags */}
      <div className="mt-4 flex flex-wrap gap-2">
        {post.tags.map((t) => (
          <TagPill key={t} tag={t} />
        ))}
      </div>

      {/* Content */}
      <div className="mt-6">
        <Prose>
          {post.content.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </Prose>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-10">
          <h3 className="text-lg font-semibold text-gray-900">Bài liên quan</h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/categories/blog/${r.slug}`}
                className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition"
              >
                <div className="relative aspect-[16/9] w-full bg-gray-50">
                  <Image
                    src={r.cover}
                    alt={r.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-3">
                  <div className="line-clamp-2 font-semibold text-gray-900 hover:text-rose-700">
                    {r.title}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {formatDate(r.publishedAt)} · {calcReadingTime(r.content)}{" "}
                    phút đọc
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

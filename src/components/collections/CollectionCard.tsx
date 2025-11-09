"use client";

import Image from "next/image";
import Link from "next/link";

export type Collection = {
  _id: string;
  slug: string;
  title: string;
  cover?: string;
  description?: string;
  tags?: string[];
  district?: string;
  category?: string;
  itemsCount?: number;
  featuredScore?: number;
  createdAt?: string;
  updatedAt?: string;
};

export default function CollectionCard({
  collection,
}: {
  collection: Collection;
}) {
  const {
    _id,
    slug,
    title,
    cover = "/image/placeholders/collection.jpg",
    description,
    tags = [],
    itemsCount = 0,
    updatedAt,
    district,
  } = collection;

  const href = `/categories/collections/${slug}`;

  return (
    <article className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md">
      <Link href={href} className="block relative">
        <div className="relative aspect-[4/3] w-full">
          <Image
            src={cover}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            priority={false}
          />
          <span className="absolute left-3 top-3 rounded-full bg-rose-600/95 px-2 py-1 text-xs font-semibold text-white shadow">
            {itemsCount} quán
          </span>
        </div>
      </Link>

      <div className="p-4">
        <Link href={href}>
          <h3 className="line-clamp-1 font-semibold text-gray-900 group-hover:text-rose-700">
            {title}
          </h3>
        </Link>

        {description && (
          <p className="mt-1 line-clamp-2 text-sm text-gray-600">
            {description}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {district && (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
              {district}
            </span>
          )}
          {tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="rounded-full bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-700 ring-1 ring-gray-200"
            >
              #{t}
            </span>
          ))}
        </div>

        <div className="mt-3 text-xs text-gray-500">
          {updatedAt
            ? `Cập nhật: ${new Date(updatedAt).toLocaleDateString("vi-VN")}`
            : null}
        </div>
      </div>
    </article>
  );
}

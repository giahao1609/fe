import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { PageProps } from "next";
import { sampleCollections } from "@/data/collections";

// Nếu muốn rõ ràng kiểu params:
type Params = { slug: string };

export default async function CollectionDetail({
  params,
}: PageProps<Params>) {
  // Next 15: params là Promise
  const { slug } = await params;

  const col = sampleCollections.find((c) => c.slug === slug);
  if (!col) return notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-3">
        <Link href="/categories/collections" className="text-sm text-rose-700 hover:underline">
          ← Quay lại Bộ sưu tập
        </Link>
      </div>

      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-gray-900">
        {col.title}
      </h1>

      {/* Cover */}
      <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 shadow-sm">
        <Image
          src={col.cover}
          alt={col.title}
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 896px, 100vw"
          priority={false}
        />
      </div>

      {/* Meta */}
      <div className="mt-4 text-sm text-gray-600">
        <span>Quận/Huyện: {col.district}</span>
        <span className="mx-2">·</span>
        <span>Danh mục: {col.category}</span>
        <span className="mx-2">·</span>
        <span>{col.itemsCount} địa điểm</span>
      </div>

      {/* Mô tả */}
      {col.description && (
        <p className="mt-4 text-gray-700">{col.description}</p>
      )}

      {/* Tags */}
      {!!col.tags?.length && (
        <div className="mt-4 flex flex-wrap gap-2">
          {col.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 ring-1 ring-rose-100"
            >
              #{t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

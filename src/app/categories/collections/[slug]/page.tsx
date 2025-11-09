import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { sampleCollections } from "@/data/collections";

export default function CollectionDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const col = sampleCollections.find((c) => c.slug === params.slug);
  if (!col) return notFound();

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{col.title}</h1>
          <p className="text-gray-600">{col.description}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {col.tags?.map((t) => (
              <span
                key={t}
                className="rounded-full bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-700 ring-1 ring-gray-200"
              >
                #{t}
              </span>
            ))}
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {col.itemsCount} quán · Cập nhật:{" "}
          {new Date(
            col.updatedAt ?? col.createdAt ?? Date.now()
          ).toLocaleDateString("vi-VN")}
        </div>
      </header>

      <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <Image
          src={col.cover ?? "/image/placeholders/collection.jpg"}
          alt={col.title}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Danh sách quán thuộc bộ sưu tập — bạn thay bằng FoodList/RestaurantCard thực tế */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Quán trong bộ sưu tập
          </h2>
          <Link
            href="/categories/restaurants"
            className="text-sm text-rose-700 hover:underline"
          >
            Xem tất cả quán
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {Array.from({ length: Math.min(8, col.itemsCount ?? 0) }).map(
            (_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <div className="aspect-[4/3] w-full rounded-xl bg-gray-100" />
                <div className="mt-3 h-4 w-2/3 bg-gray-100 rounded" />
                <div className="mt-2 h-3 w-1/2 bg-gray-100 rounded" />
              </div>
            )
          )}
        </div>
      </section>
    </main>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";

export type Deal = {
  _id: string;
  name: string;
  address: string;
  district?: string;
  category?: string;
  banner?: string | string[];
  price?: number;
  priceBefore?: number;
  percentOff?: number; // ví dụ 20 = -20%
  endsAt?: string; // ISO datetime
  rating?: number;
  ratingCount?: number;
  distanceKm?: number;
};

export default function DealCard({ deal }: { deal: Deal }) {
  const img =
    (Array.isArray(deal.banner) ? deal.banner[0] : deal.banner) ??
    "/image/placeholder-food.jpg";

  const off = deal.percentOff ? `-${deal.percentOff}%` : null;

  return (
    <article className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md">
      <Link href={`/restaurants/${deal._id}`} className="block relative">
        <div className="relative aspect-[4/3] w-full">
          <Image
            src={img}
            alt={deal.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
          {off && (
            <span className="absolute left-3 top-3 rounded-full bg-rose-600/95 px-2 py-1 text-xs font-semibold text-white shadow">
              {off}
            </span>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/restaurants/${deal._id}`}>
          <h3 className="line-clamp-1 font-semibold text-gray-900 group-hover:text-rose-700">
            {deal.name}
          </h3>
        </Link>

        <div className="mt-1 line-clamp-1 text-sm text-gray-600">
          {deal.address}
          {deal.distanceKm != null && (
            <span className="ml-1 text-gray-500">
              · {deal.distanceKm.toFixed(1)} km
            </span>
          )}
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          {deal.price != null && (
            <div className="text-base font-bold text-gray-900">
              {formatCurrency(deal.price)}
            </div>
          )}
          {deal.priceBefore != null && (
            <div className="text-sm text-gray-500 line-through">
              {formatCurrency(deal.priceBefore)}
            </div>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 fill-current text-amber-500"
            >
              <path d="M12 .587l3.668 7.431L24 9.748l-6 5.851L19.336 24 12 19.897 4.664 24 6 15.599 0 9.748l8.332-1.73z" />
            </svg>
            <span className="font-medium">{deal.rating ?? "—"}</span>
            {deal.ratingCount ? <span>({deal.ratingCount})</span> : null}
          </div>

          {deal.endsAt && (
            <div className="text-gray-500">
              Hết hạn: {new Date(deal.endsAt).toLocaleDateString("vi-VN")}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function formatCurrency(v?: number) {
  if (v == null) return "—";
  return v.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });
}

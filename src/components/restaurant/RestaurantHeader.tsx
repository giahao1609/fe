"use client";

import Image from "next/image";
import { MapPin, Star } from "lucide-react";
import type { Restaurant } from "@/services/restaurant.service";

interface Props {
  restaurant: Restaurant;
  getImageUrl: (path?: string | null) => string;
}

function buildFullAddress(r: Restaurant): string {
  const addr = r.address;
  if (!addr) return "";
  const parts = [addr.street, addr.ward, addr.district, addr.city];
  return parts.filter(Boolean).join(", ");
}

export default function RestaurantHeader({ restaurant, getImageUrl }: Props) {
  const rawCover =
    restaurant.coverImageUrlSigned ||
    restaurant.coverImageUrl ||
    restaurant.logoUrlSigned ||
    restaurant.logoUrl ||
    "";

  const bannerUrl =
    getImageUrl(rawCover) ||
    "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1600&q=80";

  const rating = restaurant.rating ?? 0;
  const reviewsCount = (restaurant as any).reviewsCount ?? 0;
  const fullAddress = buildFullAddress(restaurant);

  return (
    <div className="relative w-full">
      {/* Banner */}
      <div className="relative w-full h-[260px] md:h-[360px] overflow-hidden rounded-none md:rounded-b-xl">
        <Image
          src={bannerUrl}
          alt={restaurant.name}
          fill
          priority
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 className="text-2xl md:text-4xl font-bold mb-2 drop-shadow-lg">
            {restaurant.name}
          </h1>

          {fullAddress && (
            <div className="flex flex-wrap items-center gap-2 text-sm md:text-base opacity-90">
              <MapPin size={18} className="text-red-400" />
              <span>{fullAddress}</span>
            </div>
          )}

          <div className="flex items-center gap-2 mt-3">
            <Star className="text-yellow-400" size={18} />
            {rating ? (
              <>
                <span className="font-medium">{rating.toFixed(1)}</span>
                {!!reviewsCount && (
                  <span className="text-sm text-gray-200">
                    ({reviewsCount} đánh giá)
                  </span>
                )}
              </>
            ) : (
              <span className="text-sm text-gray-200">
                Chưa có đánh giá
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card trắng overlay dưới (nếu muốn thêm action / info nhanh) */}
      <div className="relative z-10 bg-white shadow-md rounded-xl p-6 -mt-8 max-w-4xl mx-auto hidden md:block" />
    </div>
  );
}

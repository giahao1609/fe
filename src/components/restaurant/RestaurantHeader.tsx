"use client";

import Image from "next/image";
import { MapPin, Star } from "lucide-react";

interface Props {
  restaurant: any;
  getImageUrl: (path?: string) => string;
}

export default function RestaurantHeader({ restaurant, getImageUrl }: Props) {
  const bannerUrl = getImageUrl(
    Array.isArray(restaurant.banner) ? restaurant.banner[0] : restaurant.banner
  );

  const rating = restaurant.rating ?? 0;
  const reviewsCount = restaurant.reviewsCount ?? 0;

  return (
    <div className="relative w-full">
      {/* 🖼️ Banner hình */}
      <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden rounded-xl shadow-lg">
        <Image
          src={bannerUrl}
          alt={restaurant.name}
          fill
          priority
          className="object-cover"
          unoptimized
        />
        {/* 🌄 Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* 📋 Thông tin hiển thị trong ảnh */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 className="text-2xl md:text-4xl font-bold mb-2 drop-shadow-lg">
            {restaurant.name}
          </h1>

          {/* 🏠 Địa chỉ */}
          <div className="flex flex-wrap items-center gap-2 text-sm md:text-base opacity-90">
            <MapPin size={18} className="text-red-400" />
            <span>
              {restaurant.address}
              {restaurant.district ? `, ${restaurant.district}` : ""}
            </span>
          </div>

          {/* ⭐ Đánh giá */}
          <div className="flex items-center gap-2 mt-3">
            <Star className="text-yellow-400" size={18} />
            <span className="font-medium">{rating.toFixed(1)}</span>
            <span className="text-sm text-gray-200">
              ({reviewsCount} đánh giá)
            </span>
          </div>
        </div>
      </div>

      {/* 🧾 Hộp thông tin chi tiết nằm tách bên dưới ảnh */}
      <div className="relative z-10 bg-white shadow-md rounded-xl p-6 -mt-10 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {restaurant.name}
        </h2>
        <p className="text-gray-600">
          {restaurant.address}
          {restaurant.district ? `, ${restaurant.district}` : ""}
        </p>
        <p className="text-gray-500 text-sm mt-1">
          {restaurant.category && `Loại hình: ${restaurant.category}`}{" "}
          {restaurant.priceRange && ` • ${restaurant.priceRange}`}
        </p>
        {restaurant.scheduleText && (
          <p className="text-gray-500 text-sm mt-1">
            Giờ mở cửa: {restaurant.scheduleText}
          </p>
        )}
      </div>
    </div>
  );
}

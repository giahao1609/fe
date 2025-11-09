"use client";
import { MapPin } from "lucide-react";

export default function RestaurantInfo({ restaurant }: { restaurant: any }) {
  return (
    <div className="max-w-5xl mx-auto mt-[-80px] bg-white rounded-xl shadow-lg p-6 relative z-10">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{restaurant.name}</h1>
      <p className="text-gray-700 flex items-start gap-2 mb-3">
        <MapPin size={18} className="mt-1 text-red-500 flex-shrink-0" />
        <span>
          {restaurant.address}
          {restaurant.district ? `, ${restaurant.district}` : ""}
        </span>
      </p>

      <div className="flex flex-wrap items-center gap-4 text-gray-700 text-sm mb-4">
        {restaurant.category && (
          <p>
            <span className="font-semibold">Loại hình:</span> {restaurant.category}
          </p>
        )}
        {restaurant.priceRange && (
          <p>
            <span className="font-semibold">Khoảng giá:</span> {restaurant.priceRange}
          </p>
        )}
        {restaurant.scheduleText && (
          <p>
            <span className="font-semibold">Giờ mở cửa:</span> {restaurant.scheduleText}
          </p>
        )}
      </div>
    </div>
  );
}

"use client";

import { MapPin, Clock, DollarSign } from "lucide-react";
import type { Restaurant } from "@/services/restaurant.service";

function buildFullAddress(r: Restaurant): string {
  const addr = r.address;
  if (!addr) return "";
  const parts = [
    addr.street,
    addr.ward,
    addr.district,
    addr.city,
    addr.country,
  ];
  return parts.filter(Boolean).join(", ");
}

function buildScheduleText(restaurant: Restaurant): string | null {
  const hours = restaurant.openingHours;
  if (!hours || !hours.length) return null;

  const activeDays = hours.filter(
    (h) => !h.closed && h.periods && h.periods.length > 0,
  );
  if (!activeDays.length) return "Chưa có thông tin giờ mở cửa";

  const firstPeriod = activeDays[0].periods[0];

  const sameForAll =
    activeDays.every(
      (h) =>
        h.periods.length > 0 &&
        h.periods[0].opens === firstPeriod.opens &&
        h.periods[0].closes === firstPeriod.closes,
    ) && hours.length >= 7;

  if (sameForAll) {
    return `${firstPeriod.opens} - ${firstPeriod.closes} (mở cửa mỗi ngày)`;
  }

  return `${firstPeriod.opens} - ${firstPeriod.closes} (xem chi tiết theo từng ngày)`;
}

export default function RestaurantInfo({ restaurant }: { restaurant: Restaurant }) {
  const fullAddress = buildFullAddress(restaurant);
  const scheduleText = buildScheduleText(restaurant);

  return (
    <div className="max-w-5xl mx-auto mt-[-80px] bg-white rounded-xl shadow-lg p-6 z-10">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
        {restaurant.name}
      </h1>

      {/* Địa chỉ */}
      {fullAddress && (
        <p className="text-gray-700 flex items-start gap-2 mb-3">
          <MapPin size={18} className="mt-1 text-red-500 flex-shrink-0" />
          <span>{fullAddress}</span>
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4 text-gray-700 text-sm mb-2">
        {restaurant.priceRange && (
          <p className="flex items-center gap-1">
            <DollarSign size={14} className="text-emerald-500" />
            <span>
              <span className="font-semibold">Khoảng giá:</span>{" "}
              {restaurant.priceRange}
            </span>
          </p>
        )}

        {scheduleText && (
          <p className="flex items-center gap-1">
            <Clock size={14} className="text-sky-500" />
            <span>
              <span className="font-semibold">Giờ mở cửa:</span>{" "}
              {scheduleText}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import mapboxgl, { Map } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import RestaurantHeader from "@/components/restaurant/RestaurantHeader";
import RestaurantGallery from "@/components/restaurant/RestaurantGallery";
import RestaurantReviews from "@/components/restaurant/RestaurantReviews";
import RestaurantLightbox from "@/components/restaurant/RestaurantLightbox";
import { useLocationStore } from "@/stores/locationStore";

import {
  RestaurantService,
  type Restaurant,
} from "@/services/restaurant.service";
import { MenuService, type MenuItem } from "@/services/menu.service";
import {
  DAY_LABELS,
  formatDistanceText,
  getRestaurantCoordsFromData,
  haversineDistanceKm,
} from "@/utils/function";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY || "";

const getImageUrl = (path?: string | null) => {
  if (!path) return "";
  const p = path.toString().trim();
  if (!p) return "";
  if (/^https?:\/\//i.test(p)) return p;
  return p;
};

const formatAddress = (r: Restaurant | null) => {
  if (!r || !r.address) return "";
  const { street, ward, district, city } = r.address as any;
  return [street, ward, district, city].filter(Boolean).join(", ");
};

type ActiveTab = "about" | "menu" | "reviews";

export default function RestaurantDetailClient() {
  const { id } = useParams<{ id: string }>();
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const { lat, lng } = useLocationStore();
  const [restaurant, setRestaurant] = useState<any | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [loadingRestaurant, setLoadingRestaurant] = useState(true);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuError, setMenuError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<ActiveTab>("menu");

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  const galleryImages = useMemo(
    () =>
      (restaurant?.gallerySigned && restaurant.gallerySigned.length > 0
        ? restaurant.gallerySigned
        : restaurant?.gallery) ?? [],
    [restaurant]
  );

  const addressText = useMemo(() => formatAddress(restaurant), [restaurant]);

  const coords = useMemo(
    () =>
      restaurant ? getRestaurantCoordsFromData(restaurant as Restaurant) : null,
    [restaurant]
  );

  const directionsUrl = useMemo(
    () => (coords ? buildDirectionsUrl(coords.lat, coords.lng) : undefined),
    [coords]
  );
  const userLat =
    typeof lat === "number" && Number.isFinite(lat) ? lat : undefined;
  const userLng =
    typeof lng === "number" && Number.isFinite(lng) ? lng : undefined;
  const restaurantCoords = useMemo(() => {
    if (!restaurant) return null;
    return getRestaurantCoordsFromData(restaurant as Restaurant);
  }, [restaurant]);
  // khoảng cách FE
  const distanceKm = useMemo(() => {
    if (!restaurantCoords || userLat == null || userLng == null) return null;
    return haversineDistanceKm(
      userLat,
      userLng,
      restaurantCoords.lat,
      restaurantCoords.lng
    );
  }, [restaurantCoords, userLat, userLng]);

  const distanceText = useMemo(
    () => formatDistanceText(distanceKm),
    [distanceKm]
  );

  // INIT / UPDATE MAP
  useEffect(() => {
    // chỉ render map khi đang ở tab "about"
    if (activeTab !== "about") return;
    if (!coords) return;
    if (!mapContainerRef.current) return;
    if (!mapboxgl.accessToken) {
      console.warn("Missing NEXT_PUBLIC_MAPBOX_API_KEY, mapbox will not load");
      return;
    }

    let map = mapRef.current;

    if (!map) {
      map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [coords.lng, coords.lat],
        zoom: 15,
        cooperativeGestures: true,
        attributionControl: true,
      });

      map.addControl(
        new mapboxgl.NavigationControl({ visualizePitch: true }),
        "top-right"
      );
      map.addControl(new mapboxgl.FullscreenControl(), "top-right");

      mapRef.current = map;
    }

    // đảm bảo map tính lại size sau khi tab hiện ra
    const resizeId = window.setTimeout(() => {
      map!.resize();
    }, 100);

    map.flyTo({
      center: [coords.lng, coords.lat],
      zoom: Math.max(map.getZoom(), 15),
      speed: 0.9,
      curve: 1.4,
    });

    if (!markerRef.current) {
      markerRef.current = new mapboxgl.Marker({ color: "#22c55e" })
        .setLngLat([coords.lng, coords.lat])
        .addTo(map);
    } else {
      markerRef.current.setLngLat([coords.lng, coords.lat]);
    }

    return () => {
      window.clearTimeout(resizeId);
      // khi tab "about" bị tắt mình không remove map,
      // chỉ remove khi component unmount (effect bên dưới)
    };
  }, [coords, activeTab]);

  // cleanup khi unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markerRef.current = null;
    };
  }, []);

  const handleViewOnMap = () => {
    if (!coords || !mapRef.current) return;
    mapRef.current.flyTo({
      center: [coords.lng, coords.lat],
      zoom: 16,
      speed: 0.9,
      curve: 1.4,
    });
  };

  // LOAD DATA
  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    const loadRestaurant = async () => {
      setLoadingRestaurant(true);
      setError(null);
      try {
        console.log({
          lat: typeof lat === "number" ? lat : undefined,
          lng: typeof lng === "number" ? lng : undefined,
        });
        const data = await RestaurantService.getRestaurantDetail(id, {
          lat: typeof lat === "number" ? lat : undefined,
          lng: typeof lng === "number" ? lng : undefined,
        });
        console.log("data", data);
        if (!cancelled) setRestaurant(data as any);
      } catch (e: any) {
        console.error("[RestaurantDetail] load restaurant error:", e);
        if (!cancelled) {
          setError("Không thể tải thông tin nhà hàng.");
          setRestaurant(null);
        }
      } finally {
        if (!cancelled) setLoadingRestaurant(false);
      }
    };

    const loadMenu = async () => {
      setLoadingMenu(true);
      setMenuError(null);
      try {
        const res = await MenuService.listByRestaurant(id);
        const list = Array.isArray(res) ? res : (res as any)?.items ?? [];
        console.log("list", list);
        if (!cancelled) setMenuItems(list);
      } catch (e: any) {
        console.error("[RestaurantDetail] load menu error:", e);
        if (!cancelled) {
          setMenuError("Không thể tải thực đơn.");
          setMenuItems([]);
        }
      } finally {
        if (!cancelled) setLoadingMenu(false);
      }
    };

    const loadReviews = async () => {
      if (!API_URL) return;
      try {
        const rv = await axios.get(`${API_URL}/review/restaurant/${id}`);
        const dataReviews = rv.data?.data ?? rv.data;
        if (!cancelled) {
          setReviews(Array.isArray(dataReviews) ? dataReviews : []);
        }
      } catch (e) {
        console.warn("[RestaurantDetail] load reviews error:", e);
        if (!cancelled) setReviews([]);
      }
    };

    loadRestaurant();
    loadMenu();
    loadReviews();

    return () => {
      cancelled = true;
    };
  }, [id, API_URL, lat, lng]);

  // ====== UI states ======
  if (loadingRestaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-amber-50">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <div className="space-y-6 animate-pulse">
            <div className="h-40 rounded-2xl bg-gray-200/70" />
            <div className="mt-4 flex gap-4">
              <div className="h-24 w-24 rounded-xl bg-gray-200/80" />
              <div className="flex-1 space-y-3">
                <div className="h-5 w-1/3 rounded bg-gray-200/80" />
                <div className="h-4 w-1/4 rounded bg-gray-200/70" />
                <div className="h-4 w-1/2 rounded bg-gray-200/60" />
              </div>
            </div>
            <div className="h-8 w-1/2 rounded-full bg-gray-200/70" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="h-32 rounded-xl bg-gray-200/70" />
              <div className="h-32 rounded-xl bg-gray-200/70" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
            ⚠️
          </div>
          <p className="mb-2 font-semibold text-red-600">
            {error || "Không tìm thấy nhà hàng."}
          </p>
          <p className="mb-6 text-sm text-gray-500">
            Có thể nhà hàng đã bị ẩn hoặc đường dẫn không chính xác.
          </p>
          <Link
            href="/categories/restaurants"
            className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
          >
            ← Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  // ====== main ======
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/60 via-white to-amber-50/40">
      {/* Hero + info */}
      <div className="relative pb-4 sm:pb-6">
        <RestaurantHeader restaurant={restaurant} getImageUrl={getImageUrl} />

        {/* Floating card */}
        <div className="relative z-10 -mt-10 px-4 sm:-mt-12">
          <div className="mx-auto max-w-5xl">
            <div className="rounded-2xl border border-white/80 bg-white/95 p-4 shadow-xl backdrop-blur-sm sm:p-5">
              {/* <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
                    {restaurant.name}
                  </h1>

                  {addressText && (
                    <p className="flex flex-wrap items-center gap-2 text-xs text-gray-500 sm:text-sm">
                      <span className="inline-flex items-center gap-1">
                        <span className="text-rose-500">📍</span>
                        <span>{addressText}</span>
                      </span>
                    </p>
                  )}

                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    {restaurant.rating && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-100 bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700">
                        ⭐ {restaurant.rating.toFixed(1)}
                      </span>
                    )}
                    {restaurant.priceRange && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
                        💸 {restaurant.priceRange}
                      </span>
                    )}
                    {restaurant.categoryName && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-sky-100 bg-sky-50 px-2.5 py-0.5 text-[11px] font-medium text-sky-700">
                        🍽 {restaurant.categoryName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <button
                    onClick={() => setActiveTab("menu")}
                    className="inline-flex items-center justify-center rounded-full bg-rose-500 px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-rose-600 sm:text-sm"
                  >
                    Xem thực đơn
                  </button>
                  <button
                    onClick={() => setActiveTab("reviews")}
                    className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 sm:text-sm"
                  >
                    Đánh giá ({reviews.length})
                  </button>
                </div>
              </div> */}
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                {/* Left: title + meta */}
                <div className="space-y-2">
                  {/* Name + category */}
                  <div className="flex flex-wrap items-center gap-2">
                    {restaurant.categoryName && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-medium text-sky-700 border border-sky-100">
                        <span>🍽</span>
                        <span className="truncate max-w-[160px] sm:max-w-[200px]">
                          {restaurant.categoryName}
                        </span>
                      </span>
                    )}
                    <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl md:text-3xl">
                      {restaurant.name}
                    </h1>
                  </div>

                  {/* Address + distance */}
                  {addressText && (
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500 sm:text-xs">
                      {addressText && (
                        <p className="flex items-center gap-1">
                          <span className="text-rose-500">📍</span>
                          <span className="line-clamp-1 sm:line-clamp-none">
                            {addressText}
                          </span>
                        </p>
                      )}

                      {distanceText && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-700">
                          <span>📏</span>
                          <span>Cách bạn ~ {distanceText}</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Chips: rating, price, ... */}
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    {typeof restaurant.rating === "number" && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-100 bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700">
                        ⭐ {restaurant.rating.toFixed(1)}
                      </span>
                    )}

                    {restaurant.priceRange && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
                        💸 {restaurant.priceRange}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: actions */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <button
                    onClick={() => setActiveTab("menu")}
                    className="inline-flex items-center justify-center rounded-full bg-rose-500 px-4 py-2 text-xs font-medium text-white shadow-sm shadow-rose-200 transition hover:bg-rose-600 sm:text-sm"
                  >
                    🍱 Xem thực đơn
                  </button>

                  <Link
                    href={`/categories/restaurants/${
                      (restaurant as any)._id
                    }/pre-order`}
                    className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-800 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-100 sm:text-sm"
                  >
                    🪑 Đặt bàn trước
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs + content */}
      <div className="mx-auto mt-4 max-w-5xl px-4 pb-10 sm:mt-6">
        {/* Tabs */}
        <div className="overflow-hidden rounded-2xl border border-rose-50 bg-white/90 shadow-sm">
          <div className="border-b border-gray-100 px-3 sm:px-4">
            <div className="flex items-center gap-4 overflow-x-auto text-xs text-gray-600 sm:text-sm">
              {(
                [
                  { key: "menu", label: "Thực đơn" },
                  { key: "about", label: "Giới thiệu" },
                  { key: "reviews", label: `Đánh giá (${reviews.length})` },
                ] as { key: ActiveTab; label: string }[]
              ).map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    type="button"
                    className={`relative flex-shrink-0 px-1 py-3 sm:px-2 transition ${
                      isActive
                        ? "font-medium text-rose-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab.label}
                    {isActive && (
                      <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-gradient-to-r from-rose-400 to-amber-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6 p-4 sm:space-y-8 sm:p-6">
            {/* TAB: Giới thiệu */}
            {activeTab === "about" && (
              <div className="space-y-6">
                {/* Vị trí & Giờ mở cửa theo ngày */}
                <section className="rounded-2xl border border-gray-100 bg-white/90 px-4 py-4 shadow-sm sm:px-5 sm:py-5">
                  <div className="flex flex-col gap-4 lg:flex-row">
                    {/* Map + toạ độ + địa chỉ + action */}
                    <div className="space-y-3 lg:w-2/3">
                      <div className="flex items-center justify-between text-[11px] text-gray-500 sm:text-xs">
                        <span className="font-medium text-gray-700">
                          Vị trí trên bản đồ
                        </span>
                        <span>Mapbox · chỉ xem vị trí quán</span>
                      </div>
                      <div
                        ref={mapContainerRef}
                        className="h-52 w-full overflow-hidden rounded-xl border border-gray-100 bg-gray-50"
                      />
                      <div className="grid grid-cols-1 gap-2 text-xs text-gray-600 sm:grid-cols-2">
                        {/* <div className="rounded-lg bg-gray-50 px-3 py-2">
                          <p className="text-[11px] uppercase tracking-wide text-gray-400">
                            Vĩ độ (lat)
                          </p>
                          <p className="mt-0.5 font-mono text-[13px] text-gray-800">
                            {coords?.lat ?? "—"}
                          </p>
                        </div>
                        <div className="rounded-lg bg-gray-50 px-3 py-2">
                          <p className="text-[11px] uppercase tracking-wide text-gray-400">
                            Kinh độ (lng)
                          </p>
                          <p className="mt-0.5 font-mono text-[13px] text-gray-800">
                            {coords?.lng ?? "—"}
                          </p>
                        </div> */}
                        {distanceText && (
                          <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-100 shadow-sm">
                            <span className="text-xs">📏</span>
                            <span className="whitespace-nowrap">
                              Cách bạn khoảng{" "}
                              <span className="font-semibold text-emerald-900">
                                {distanceText}
                              </span>
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Địa chỉ + nút xem map / chỉ đường */}
                      <div className="flex flex-col gap-2 rounded-2xl bg-gray-50 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                        <div className="text-xs text-gray-700 sm:text-sm">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                            Địa chỉ quán
                          </p>
                          <p className="mt-0.5 leading-snug">
                            {addressText || "Địa chỉ đang cập nhật"}
                          </p>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2 sm:mt-0">
                          <button
                            type="button"
                            onClick={handleViewOnMap}
                            className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-medium text-gray-700 hover:border-emerald-300 hover:text-emerald-700"
                          >
                            Xem trên bản đồ
                          </button>
                          {directionsUrl ? (
                            <a
                              href={directionsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-emerald-600"
                            >
                              Chỉ đường
                            </a>
                          ) : (
                            <button
                              disabled
                              className="inline-flex items-center justify-center rounded-full bg-gray-100 px-3 py-1.5 text-[11px] font-medium text-gray-400"
                            >
                              Chỉ đường
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Giờ mở cửa theo ngày */}
                    <div className="lg:w-1/3 rounded-xl border border-emerald-100/70 bg-gradient-to-b from-emerald-50/80 to-sky-50/60 px-3 py-3 sm:px-4 sm:py-4">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                        04 · Giờ mở cửa theo ngày
                      </h3>
                      <p className="mt-1 text-[11px] text-gray-600">
                        Chọn các ngày mở cửa và thời gian áp dụng chung.
                      </p>

                      {/* Dãy các ngày trong tuần */}
                      <div className="mt-3 grid grid-cols-3 gap-2 text-xs sm:text-[13px]">
                        {DAY_LABELS.map((d) => {
                          const dayInfo =
                            restaurant.openingHours?.find(
                              (h: any) => h.day === d.key && !h.closed
                            ) ?? null;
                          const isActive =
                            !!dayInfo &&
                            Array.isArray(dayInfo.periods) &&
                            dayInfo.periods.length > 0;

                          return (
                            <div
                              key={d.key}
                              className={`flex items-center justify-center rounded-full px-2 py-1.5 transition ${
                                isActive
                                  ? "bg-emerald-100 text-emerald-700 shadow-xs shadow-emerald-200"
                                  : "bg-gray-50 text-gray-400 border border-dashed border-gray-200"
                              }`}
                            >
                              {d.label}
                            </div>
                          );
                        })}
                      </div>

                      {/* Giờ áp dụng chung */}
                      {(() => {
                        const active =
                          restaurant.openingHours?.find(
                            (h: any) =>
                              !h.closed && h.periods && h.periods.length > 0
                          ) ?? null;
                        const period = active?.periods?.[0];

                        return (
                          <div className="mt-4 rounded-xl border border-white/80 bg-white/80 px-3 py-3 text-xs text-gray-700 shadow-inner">
                            <p className="text-[11px] font-semibold text-gray-900">
                              Giờ áp dụng
                            </p>
                            {period ? (
                              <p className="mt-1">
                                <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-800">
                                  {period.opens}
                                  <span className="mx-1">đến</span>
                                  {period.closes}
                                </span>
                                <span className="ml-1 text-[11px] text-gray-500">
                                  (áp dụng cho các ngày đang bật)
                                </span>
                              </p>
                            ) : (
                              <p className="mt-1 text-[11px] text-gray-500">
                                Chưa có thông tin giờ mở cửa.
                              </p>
                            )}
                            <p className="mt-2 text-[10px] text-gray-400">
                              Sau này có thể cấu hình giờ riêng cho từng ngày /
                              ca trong ngày ở màn hình quản lý.
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </section>

                {/* Card giới thiệu */}
                <section className="rounded-2xl border border-gray-100 bg-white/90 px-4 py-4 shadow-sm sm:px-5 sm:py-5">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div>
                      <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
                        Giới thiệu về nhà hàng
                      </h2>
                      <p className="mt-1 text-[11px] text-gray-500 sm:text-xs">
                        Thông tin mô tả do chủ quán cung cấp (nếu có)
                      </p>
                    </div>

                    {restaurant.updatedAt && (
                      <p className="text-right text-[11px] text-gray-400">
                        Cập nhật gần nhất:{" "}
                        {new Date(restaurant.updatedAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </p>
                    )}
                  </div>

                  {restaurant.metaTitle && (
                    <p className="mb-1 text-sm font-semibold text-gray-900 sm:text-base">
                      {restaurant.metaTitle}
                    </p>
                  )}

                  {restaurant.metaDescription && (
                    <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700 sm:text-base">
                      {restaurant.metaDescription}
                    </p>
                  )}

                  {!restaurant.metaTitle && !restaurant.metaDescription && (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-500 sm:px-4">
                      Nhà hàng chưa có nội dung giới thiệu chi tiết.
                      <br />
                      <span className="text-xs text-gray-400">
                        (Chủ quán có thể bổ sung mô tả, câu chuyện, phong cách
                        phục vụ…)
                      </span>
                    </div>
                  )}
                </section>

                {/* Gallery hình ảnh quán */}
                {galleryImages.length > 0 && (
                  <section className="rounded-2xl border border-gray-100 bg-white/90 px-3 py-3 sm:px-4 sm:py-4">
                    <RestaurantGallery
                      title="Hình ảnh quán"
                      images={galleryImages}
                      getImageUrl={getImageUrl}
                      onPreview={setPreviewImage}
                    />
                  </section>
                )}
              </div>
            )}

            {/* TAB: Thực đơn */}
            {activeTab === "menu" && (
              <section className="space-y-3">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
                      Thực đơn
                    </h2>
                    {!loadingMenu && menuItems.length > 0 && (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] text-gray-600">
                        {menuItems.length} món
                      </span>
                    )}
                  </div>
                  {loadingMenu && (
                    <span className="text-xs text-gray-500">Đang tải...</span>
                  )}
                </div>

                {menuError && (
                  <p className="mb-2 text-sm text-red-500">{menuError}</p>
                )}

                {!loadingMenu && menuItems.length === 0 && !menuError && (
                  <p className="text-sm text-gray-500">
                    Nhà hàng chưa có món nào trong hệ thống.
                  </p>
                )}

                {!loadingMenu && menuItems.length > 0 && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {menuItems.map((item) => {
                      // Lấy ảnh: ưu tiên imagesSigned.url, fallback sang images
                      const signedImg = (item as any).imagesSigned?.[0];
                      const rawImg =
                        (typeof signedImg === "string"
                          ? signedImg
                          : signedImg?.url || signedImg?.path) ||
                        (item as any).images?.[0] ||
                        "";

                      const price =
                        item.basePrice?.amount != null
                          ? `${item.basePrice.amount.toLocaleString("vi-VN")} ${
                              item.basePrice.currency || "VND"
                            }`
                          : "-";

                      const typeLabelMap: Record<string, string> = {
                        drink: "Đồ uống",
                        food: "Món ăn",
                        dessert: "Tráng miệng",
                        snack: "Ăn vặt",
                      };
                      const itemTypeLabel =
                        (item.itemType && typeLabelMap[item.itemType]) ||
                        item.itemType;

                      const spicyLevel = item.spicyLevel ?? 0;
                      const spicyLabel =
                        spicyLevel <= 0
                          ? "Không cay"
                          : spicyLevel === 1
                          ? "Hơi cay"
                          : spicyLevel === 2
                          ? "Cay vừa"
                          : "Rất cay";

                      const hasDietFlag =
                        item.vegetarian ||
                        item.vegan ||
                        item.halal ||
                        item.glutenFree;

                      return (
                        <div
                          key={item._id}
                          className="group flex gap-3 rounded-2xl border border-gray-100 bg-white/90 p-3 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md sm:p-4"
                        >
                          {/* Ảnh món */}
                          {rawImg ? (
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewImage(getImageUrl(rawImg))
                              }
                              className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50 transition group-hover:border-rose-200 sm:h-28 sm:w-28"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={getImageUrl(rawImg)}
                                alt={item.name}
                                className="h-full w-full object-cover transition group-hover:scale-[1.03]"
                              />
                              <span className="absolute bottom-1 right-1 rounded-full bg-black/55 px-1.5 py-[1px] text-[9px] text-white">
                                Xem ảnh
                              </span>
                            </button>
                          ) : (
                            <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-[11px] text-gray-400 sm:h-28 sm:w-28">
                              Chưa có ảnh
                            </div>
                          )}

                          {/* Nội dung món */}
                          <div className="flex flex-1 flex-col">
                            {/* Tên + giá + trạng thái */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <h3 className="truncate text-sm font-semibold text-gray-900 sm:text-[15px]">
                                  {item.name}
                                </h3>

                                {itemTypeLabel && (
                                  <p className="mt-0.5 text-[11px] text-gray-500">
                                    {itemTypeLabel}
                                  </p>
                                )}
                              </div>

                              <div className="flex flex-col items-end gap-1">
                                <span className="whitespace-nowrap font-mono text-xs font-semibold text-rose-700 sm:text-[13px]">
                                  {price}
                                </span>
                                {item.isAvailable === false ? (
                                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                                    Hết món
                                  </span>
                                ) : (
                                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                                    Đang phục vụ
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Mô tả */}
                            {item.description && (
                              <p className="mt-1 line-clamp-2 text-xs text-gray-600">
                                {item.description}
                              </p>
                            )}

                            {/* Cuisines + tags + diet + spicy */}
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {/* cuisines */}
                              {Array.isArray(item.cuisines) &&
                                item.cuisines.slice(0, 2).map((c) => (
                                  <span
                                    key={c}
                                    className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] text-indigo-700"
                                  >
                                    #{c}
                                  </span>
                                ))}

                              {/* tags */}
                              {Array.isArray(item.tags) &&
                                item.tags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag}
                                    className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] text-rose-700"
                                  >
                                    {tag}
                                  </span>
                                ))}

                              {/* spicy */}
                              <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] text-orange-700">
                                🌶 {spicyLabel}
                              </span>

                              {/* diet flags */}
                              {hasDietFlag && (
                                <>
                                  {item.vegetarian && (
                                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700">
                                      🥦 Chay
                                    </span>
                                  )}
                                  {item.vegan && (
                                    <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] text-green-700">
                                      🌱 Thuần chay
                                    </span>
                                  )}
                                  {item.halal && (
                                    <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] text-sky-700">
                                      🕌 Halal
                                    </span>
                                  )}
                                  {item.glutenFree && (
                                    <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] text-purple-700">
                                      🚫🌾 Không gluten
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {/* TAB: Đánh giá */}
            {activeTab === "reviews" && (
              <section className="space-y-4">
                <RestaurantReviews
                  id={(restaurant as any)._id}
                  API_URL={API_URL}
                  reviews={reviews}
                  setReviews={setReviews}
                  getImageUrl={getImageUrl}
                />
              </section>
            )}
          </div>
        </div>
      </div>

      <RestaurantLightbox
        previewImage={previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </div>
  );
}

/* helpers */

function buildDirectionsUrl(lat: number, lng: number): string {
  const dest = `${lat},${lng}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    dest
  )}`;
}

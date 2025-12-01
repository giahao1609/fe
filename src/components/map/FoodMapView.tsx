"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl, { Map, MapLayerMouseEvent } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { useLocationStore } from "@/stores/locationStore";
import {
  RestaurantService,
  type Restaurant,
} from "@/services/restaurant.service";
import {
  formatPriceRange,
  getCategoryLabel,
  getCategoryMeta,
  getMainImage,
} from "@/utils/function";
import Link from "next/link";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY || "";

const HCM_CENTER = { lng: 106.70098, lat: 10.77653 }; // Bưu điện TP
const HCM_BBOX: [number, number, number, number] = [
  106.55, 10.68, 106.85, 10.9,
];

export default function FoodMapView() {
  const token = process.env.NEXT_PUBLIC_MAPBOX_API_KEY || "";

  const { lat, lng, mode, autoDetect } = useLocationStore();

  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const geocoderRef = useRef<any>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);

  const [loading, setLoading] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [error, setError] = useState<string | null>(null);

  // filter
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(5); // default 5km
  const [limit, setLimit] = useState<number>(20);

  // dùng ref để giữ center ban đầu: khi lat/lng có trước khi map init thì vẫn dùng được
  const initialCenterRef = useRef<{ lng: number; lat: number }>(HCM_CENTER);
  const createRestaurantPopup = () =>
    new mapboxgl.Popup({
      closeButton: true,
      closeOnClick: true,
      offset: 16,
      maxWidth: "280px",
      className: "restaurant-popup", // dùng CSS custom
    });
  useEffect(() => {
    if (typeof lat === "number" && typeof lng === "number") {
      initialCenterRef.current = { lng, lat };
    }
  }, [lat, lng]);

  // auto detect vị trí nếu chưa có
  useEffect(() => {
    if (mode === "prompt") autoDetect();
  }, [mode, autoDetect]);

  // ===================== INIT MAP (chỉ chạy 1 lần) =====================
  useEffect(() => {
    if (!token) {
      setError("Thiếu NEXT_PUBLIC_MAPBOX_API_KEY trong .env.local");
      return;
    }
    if (!mapElRef.current || mapRef.current) return;

    const center = initialCenterRef.current;

    const map = new mapboxgl.Map({
      container: mapElRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [center.lng, center.lat],
      zoom: 14,
      cooperativeGestures: true,
      attributionControl: true,
    });

    // const map = new mapboxgl.Map({
    //   container: mapElRef.current,
    //   style: "mapbox://styles/mapbox/light-v11", // nền sáng, ít rối hơn
    //   center: [center.lng, center.lat],
    //   zoom: 14,
    //   cooperativeGestures: true,
    //   attributionControl: true,
    // });

    map.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: true }),
      "top-right"
    );
    map.addControl(new mapboxgl.FullscreenControl(), "top-right");
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showAccuracyCircle: false,
        fitBoundsOptions: { maxZoom: 16 },
      }),
      "top-right"
    );

    // load geocoder
    (async () => {
      try {
        const mod = await import("@mapbox/mapbox-gl-geocoder");
        const MapboxGeocoder = (mod as any).default ?? (mod as any);
        const geocoder = new MapboxGeocoder({
          accessToken: token,
          mapboxgl,
          placeholder: "Tìm địa chỉ trong TP.HCM...",
          marker: false,
          zoom: 14,
          bbox: HCM_BBOX,
          proximity: {
            longitude: HCM_CENTER.lng,
            latitude: HCM_CENTER.lat,
          },
          countries: "VN",
        });
        geocoderRef.current = geocoder;
        map.addControl(geocoder, "top-left");
        geocoder.on("result", (e: any) => {
          const [lon, la] = e.result.center;
          map.flyTo({ center: [lon, la], zoom: 15, speed: 0.9, curve: 1.4 });
        });
      } catch (e) {
        console.warn("[Geocoder] load fail, skip control:", e);
      }
    })();

    const onLoad = async () => {
      // user point
      if (!map.getSource("user-point")) {
        map.addSource("user-point", {
          type: "geojson",
          data: pointFeature(center.lng, center.lat),
        });
        map.addLayer({
          id: "user-point",
          type: "circle",
          source: "user-point",
          paint: {
            "circle-radius": 7,
            "circle-color": "#2563eb",
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
          },
        });
      }

      // icon
      try {
        if (!map.hasImage("restaurant-icon")) {
          const img = await loadMapImage(map, "/icons/restaurant.png");
          map.addImage("restaurant-icon", img, { sdf: false });
        }
      } catch {
        if (!map.hasImage("restaurant-icon")) {
          map.addImage(
            "restaurant-icon",
            await generateDotIcon(32, "#e11d48"),
            { sdf: false }
          );
        }
      }

      // layer restaurants
      if (!map.getSource("restaurants")) {
        map.addSource("restaurants", {
          type: "geojson",
          data: emptyFC(),
        });
        // map.addLayer({
        //   id: "restaurants-symbol",
        //   type: "symbol",
        //   source: "restaurants",
        //   layout: {
        //     "icon-image": "restaurant-icon",
        //     "icon-size": 0.8,
        //     "icon-allow-overlap": true,
        //     "icon-anchor": "bottom",
        //     "text-field": ["get", "name"],
        //     "text-offset": [0, 1.2],
        //     "text-size": 11,
        //     "text-optional": true,
        //   },
        //   paint: {
        //     "text-color": "#111827",
        //     "text-halo-width": 1,
        //     "text-halo-color": "#ffffff",
        //   },
        // });
        map.addLayer({
          id: "restaurants-symbol",
          type: "symbol",
          source: "restaurants",
          layout: {
            "icon-image": "restaurant-icon",
            "icon-size": 0.8,
            "icon-allow-overlap": true,
            "icon-anchor": "bottom",
            "text-field": [
              "concat",
              ["coalesce", ["get", "categoryIcon"], ""],
              " ",
              ["get", "name"],
            ],
            "text-offset": [0, 1.2],
            "text-size": 11,
            "text-optional": true,
          },
          paint: {
            "text-color": "#111827",
            "text-halo-width": 1,
            "text-halo-color": "#ffffff",
          },
        });

        // map.on("click", "restaurants-symbol", (e: MapLayerMouseEvent) => {
        //   const feature = e.features?.[0];
        //   if (!feature) return;
        //   const coords = (feature.geometry as any).coordinates as [
        //     number,
        //     number
        //   ];
        //   const props = feature.properties as any;

        //   const name = props.name;
        //   const address = props.address;
        //   const distanceText = props.distanceText;
        //   const priceRange = props.priceRange;

        //   const directionsUrl = buildDirectionsUrlFromCoords(
        //     coords,
        //     typeof lat === "number" ? lat : undefined,
        //     typeof lng === "number" ? lng : undefined
        //   );

        //   // if (!popupRef.current) {
        //   //   popupRef.current = new mapboxgl.Popup({
        //   //     closeButton: true,
        //   //     closeOnClick: true,
        //   //   });
        //   // }

        //   if (!popupRef.current) {
        //     popupRef.current = createRestaurantPopup();
        //   }

        //   popupRef.current
        //     .setLngLat(coords)
        //     .setHTML(
        //       popupHtml({
        //         name,
        //         address,
        //         distanceText,
        //         priceRange,
        //         directionsUrl,
        //       })
        //     )
        //     .addTo(map);
        // });

        map.on("click", "restaurants-symbol", (e: MapLayerMouseEvent) => {
          const feature = e.features?.[0];
          if (!feature) return;
          const coords = (feature.geometry as any).coordinates as [
            number,
            number
          ];
          const props = feature.properties as any;

          const name = props.name;
          const address = props.address;
          const distanceText = props.distanceText;
          const priceRange = props.priceRange;
          const categoryName = props.categoryName;
          const categoryIcon = props.categoryIcon;

          const directionsUrl = buildDirectionsUrlFromCoords(
            coords,
            typeof lat === "number" ? lat : undefined,
            typeof lng === "number" ? lng : undefined
          );

          if (!popupRef.current) {
            popupRef.current = createRestaurantPopup();
          }

          popupRef.current
            .setLngLat(coords)
            .setHTML(
              popupHtml({
                name,
                address,
                distanceText,
                priceRange,
                categoryName,
                categoryIcon,
                directionsUrl,
              })
            )
            .addTo(map);
        });

        map.on("mouseenter", "restaurants-symbol", () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "restaurants-symbol", () => {
          map.getCanvas().style.cursor = "";
        });
      }
    };

    map.on("load", onLoad);
    mapRef.current = map;

    return () => {
      try {
        if (geocoderRef.current) {
          map.removeControl(geocoderRef.current);
          geocoderRef.current = null;
        }
      } catch {}
      map.off("load", onLoad);
      map.remove();
      mapRef.current = null;
    };
  }, [token]);

  // ===================== SYNC USER POINT (nhẹ, chỉ setData) =====================
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const center =
      typeof lat === "number" && typeof lng === "number"
        ? { lng, lat }
        : HCM_CENTER;
    const src = map.getSource("user-point") as
      | mapboxgl.GeoJSONSource
      | undefined;
    src?.setData(pointFeature(center.lng, center.lat));
  }, [lat, lng]);

  // ===================== DEBOUNCE PARAMS GỌI API =====================
  const [debouncedParams, setDebouncedParams] = useState<{
    lat: number;
    lng: number;
    maxDistanceKm: number;
    limit: number;
  }>({
    lat: HCM_CENTER.lat,
    lng: HCM_CENTER.lng,
    maxDistanceKm,
    limit,
  });

  useEffect(() => {
    const baseLat = typeof lat === "number" ? lat : HCM_CENTER.lat;
    const baseLng = typeof lng === "number" ? lng : HCM_CENTER.lng;

    const handle = window.setTimeout(() => {
      setDebouncedParams({
        lat: baseLat,
        lng: baseLng,
        maxDistanceKm,
        limit,
      });
    }, 300); // debounce 300ms

    return () => window.clearTimeout(handle);
  }, [lat, lng, maxDistanceKm, limit]);

  // ===================== FETCH NEARBY (theo debouncedParams) =====================
  useEffect(() => {
    let cancelled = false;
    const fetchNearby = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await RestaurantService.getNearbyRestaurants({
          lat: debouncedParams.lat,
          lng: debouncedParams.lng,
          maxDistanceKm: debouncedParams.maxDistanceKm,
          limit: debouncedParams.limit,
        });
        if (!cancelled) {
          console.log(res.items);
          setRestaurants(res.items);
        }
      } catch (e: any) {
        console.error(e);
        if (!cancelled) {
          setError(e?.message ?? "Không thể tải danh sách quán gần bạn");
          setRestaurants([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchNearby();
    return () => {
      cancelled = true;
    };
  }, [debouncedParams]);

  // ===================== GEOJSON CHO MAP (memo hoá) =====================
  // const restaurantsFeatureCollection =
  //   useMemo<GeoJSON.FeatureCollection>(() => {
  //     return {
  //       type: "FeatureCollection",
  //       features: restaurants
  //         .map((r) => {
  //           const coords = getRestaurantCoords(r);
  //           if (!coords) return null;

  //           return {
  //             type: "Feature",
  //             geometry: {
  //               type: "Point",
  //               coordinates: [coords.lng, coords.lat],
  //             },
  //             properties: {
  //               _id: r._id,
  //               name: r.name,
  //               address: buildShortAddress(r),
  //               distanceText: r.distanceText ?? formatDistance(r.distanceKm),
  //               priceRange: r.priceRange,
  //             },
  //           } as GeoJSON.Feature;
  //         })
  //         .filter(Boolean) as GeoJSON.Feature[],
  //     };
  //   }, [restaurants]);

  const restaurantsFeatureCollection =
    useMemo<GeoJSON.FeatureCollection>(() => {
      return {
        type: "FeatureCollection",
        features: restaurants
          .map((r) => {
            const coords = getRestaurantCoords(r);
            if (!coords) return null;

            const {
              name: categoryName,
              slug: categorySlug,
              icon: categoryIcon,
            } = getCategoryMeta(r);

            return {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [coords.lng, coords.lat],
              },
              properties: {
                _id: r._id,
                name: r.name,
                address: buildShortAddress(r),
                distanceText: r.distanceText ?? formatDistance(r.distanceKm),
                priceRange: r.priceRange,
                categoryName,
                categorySlug,
                categoryIcon,
              },
            } as GeoJSON.Feature;
          })
          .filter(Boolean) as GeoJSON.Feature[],
      };
    }, [restaurants]);

  // ===================== ĐỔ GEOJSON VÀO MAP SOURCE =====================
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const src = map.getSource("restaurants") as
      | mapboxgl.GeoJSONSource
      | undefined;
    if (!src) return;

    // dùng requestAnimationFrame để tránh block UI nếu dataset lớn
    const id = window.requestAnimationFrame(() => {
      src.setData(restaurantsFeatureCollection);
    });

    return () => window.cancelAnimationFrame(id);
  }, [restaurantsFeatureCollection]);

  const recenter = () => {
    const map = mapRef.current;
    if (!map) return;
    if (typeof lat === "number" && typeof lng === "number") {
      map.flyTo({
        center: [lng, lat],
        zoom: Math.max(map.getZoom(), 14),
        speed: 0.9,
        curve: 1.4,
      });
    } else {
      map.flyTo({ center: [HCM_CENTER.lng, HCM_CENTER.lat], zoom: 14 });
    }
  };

  // const handleRestaurantClick = (r: Restaurant) => {
  //   const map = mapRef.current;
  //   if (!map) return;

  //   const coords = getRestaurantCoords(r);
  //   if (!coords) return;

  //   const center: [number, number] = [coords.lng, coords.lat];
  //   map.flyTo({
  //     center,
  //     zoom: 16,
  //     speed: 0.9,
  //     curve: 1.4,
  //   });

  //   const directionsUrl = buildDirectionsUrlFromCoords(
  //     center,
  //     typeof lat === "number" ? lat : undefined,
  //     typeof lng === "number" ? lng : undefined
  //   );

  //   // if (!popupRef.current) {
  //   //   popupRef.current = new mapboxgl.Popup({
  //   //     closeButton: true,
  //   //     closeOnClick: true,
  //   //   });
  //   // }

  //   if (!popupRef.current) {
  //     popupRef.current = createRestaurantPopup();
  //   }

  //   popupRef.current
  //     .setLngLat(center)
  //     .setHTML(
  //       popupHtml({
  //         name: r.name,
  //         address: buildShortAddress(r),
  //         distanceText: r.distanceText ?? formatDistance(r.distanceKm),
  //         priceRange: r.priceRange,
  //         directionsUrl,
  //       })
  //     )
  //     .addTo(map);
  // };

  const handleRestaurantClick = (r: Restaurant) => {
    const map = mapRef.current;
    if (!map) return;

    const coords = getRestaurantCoords(r);
    if (!coords) return;

    const center: [number, number] = [coords.lng, coords.lat];
    map.flyTo({
      center,
      zoom: 16,
      speed: 0.9,
      curve: 1.4,
    });

    const directionsUrl = buildDirectionsUrlFromCoords(
      center,
      typeof lat === "number" ? lat : undefined,
      typeof lng === "number" ? lng : undefined
    );

    const { name: categoryName, icon: categoryIcon } = getCategoryMeta(r);

    if (!popupRef.current) {
      popupRef.current = createRestaurantPopup();
    }

    popupRef.current
      .setLngLat(center)
      .setHTML(
        popupHtml({
          name: r.name,
          address: buildShortAddress(r),
          distanceText: r.distanceText ?? formatDistance(r.distanceKm),
          priceRange: r.priceRange,
          categoryName,
          categoryIcon,
          directionsUrl,
        })
      )
      .addTo(map);
  };

  const countLabel = useMemo(() => {
    if (loading) return "Đang tải...";
    return restaurants.length > 0
      ? `${restaurants.length} quán gần đây`
      : "Không tìm thấy quán nào trong bán kính";
  }, [restaurants.length, loading]);

  return (
    <section className="space-y-4">
      {/* top bar + filter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-gray-600">
          <span className="font-medium text-gray-800">Quanh bạn</span> ·{" "}
          {countLabel}
          {error ? <span className="ml-2 text-rose-600">{error}</span> : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1 text-xs text-gray-600">
            <span>Bán kính</span>
            <select
              className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs"
              value={maxDistanceKm}
              onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
            >
              <option value={2}>2 km</option>
              <option value={5}>5 km</option>
              <option value={10}>10 km</option>
              <option value={20}>20 km</option>
              <option value={50}>50 km</option>
              <option value={115}>115 km</option>
            </select>
          </label>

          <label className="flex items-center gap-1 text-xs text-gray-600">
            <span>Số kết quả</span>
            <select
              className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </label>

          <button
            onClick={recenter}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm hover:border-rose-300 hover:text-rose-700"
          >
            Về vị trí của tôi
          </button>
        </div>
      </div>

      {!token && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Thiếu <code>NEXT_PUBLIC_MAPBOX_API_KEY</code> trong{" "}
          <code>.env.local</code>.
        </div>
      )}

      {/* Map */}
      <div
        ref={mapElRef}
        className="h-[500px] w-full rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-white"
      />

      {/* Skeleton khi loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-100 p-4 bg-white"
            >
              <div className="h-32 rounded-lg bg-gray-100 animate-pulse" />
              <div className="mt-3 h-4 w-2/3 rounded bg-gray-100 animate-pulse" />
              <div className="mt-2 h-3 w-1/2 rounded bg-gray-100 animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {/* Danh sách quán dưới bản đồ */}
      <h1 className="text-2xl font-bold text-gray-900">Danh sách quán ăn</h1>
      {!loading && restaurants.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {restaurants.map((r) => {
            const coords = getRestaurantCoords(r);
            const distanceText = r.distanceText ?? formatDistance(r.distanceKm);
            const directionsUrl = coords
              ? buildDirectionsUrlForRestaurant(
                  r,
                  typeof lat === "number" ? lat : undefined,
                  typeof lng === "number" ? lng : undefined
                )
              : undefined;

            const mainImage = getMainImage(r);
            const priceLabel = formatPriceRange(r.priceRange);

            // ---- category meta (từ data mới) ----
            const cat: any = (r as any).category || {};
            const categoryName = (r as any).categoryName ?? cat.name;
            const categorySlug = (r as any).categorySlug ?? cat.slug;
            const categoryIcon: string | undefined = cat.extra?.icon;

            return (
              <article
                key={r._id}
                className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* Ảnh */}
                <button
                  type="button"
                  onClick={() => handleRestaurantClick(r)}
                  className="relative aspect-[16/9] w-full overflow-hidden"
                >
                  {mainImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mainImage}
                      alt={r.name}
                      className="h-full w-full object-cover transition-transform duration-200 hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-50 text-xs text-gray-400">
                      Không có hình ảnh
                    </div>
                  )}

                  {distanceText && (
                    <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-[10px] font-medium text-white">
                      Cách bạn: {distanceText}
                    </span>
                  )}
                </button>

                {/* Nội dung */}
                <div className="flex flex-1 flex-col px-4 pb-3 pt-3">
                  {/* Tên + rating */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold text-gray-900">
                        {r.name}
                      </h3>

                      <p className="mt-0.5 line-clamp-2 text-[11px] text-gray-600">
                        {buildShortAddress(r) || "Địa chỉ đang cập nhật"}
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        {/* category pill */}
                        {categoryName && (
                          <Link
                            href={`/categories/${
                              categorySlug || "restaurants"
                            }`}
                            className="inline-flex max-w-full items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700 hover:bg-indigo-100"
                          >
                            {categoryIcon && <span>{categoryIcon}</span>}
                            <span className="truncate">{categoryName}</span>
                          </Link>
                        )}

                        {/* price pill */}
                        {priceLabel && (
                          <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-0.5 text-[10px] text-gray-600">
                            {priceLabel}
                          </span>
                        )}
                      </div>
                    </div>

                    {typeof r.rating === "number" && (
                      <div className="flex items-center">
                        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-0.5 text-[11px] font-medium text-yellow-800">
                          <span>★</span>
                          <span>{r.rating.toFixed(1)}</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Distance / tags */}
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
                    {r.distanceKm != null && (
                      <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-0.5">
                        ~{r.distanceKm.toFixed(1)} km
                      </span>
                    )}

                    {Array.isArray(r.tags) && r.tags.length > 0 && (
                      <span className="line-clamp-1">
                        {r.tags.slice(0, 3).join(" · ")}
                        {r.tags.length > 3 && "…"}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <Link
                      href={`/categories/restaurants/${r._id}`}
                      className="inline-flex items-center justify-center rounded-full border border-gray-200 px-2 py-1.5 text-[11px] font-medium text-gray-700 hover:border-blue-300 hover:text-blue-700"
                    >
                      Chi tiết
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleRestaurantClick(r)}
                      className="inline-flex items-center justify-center rounded-full border border-gray-200 px-2 py-1.5 text-[11px] font-medium text-gray-700 hover:border-blue-300 hover:text-blue-700"
                    >
                      Xem trên bản đồ
                    </button>

                    {directionsUrl ? (
                      <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-full bg-blue-600 px-2 py-1.5 text-[11px] font-medium text-white hover:bg-blue-700"
                      >
                        Chỉ đường
                      </a>
                    ) : (
                      <button
                        disabled
                        className="inline-flex items-center justify-center rounded-full bg-gray-100 px-2 py-1.5 text-[11px] font-medium text-gray-400"
                      >
                        Chỉ đường
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {!loading && restaurants.length === 0 && !error && (
        <p className="mt-3 text-xs text-gray-500">
          Không tìm thấy quán nào trong bán kính hiện tại. Thử tăng bán kính
          hoặc kiểm tra lại vị trí của bạn.
        </p>
      )}
    </section>
  );
}

/* ============ helpers ============ */

function emptyFC(): GeoJSON.FeatureCollection {
  return { type: "FeatureCollection", features: [] };
}

function pointFeature(lon: number, lat: number): GeoJSON.Feature {
  return {
    type: "Feature",
    geometry: { type: "Point", coordinates: [lon, lat] },
    properties: {},
  };
}

function loadMapImage(
  map: Map,
  url: string
): Promise<HTMLImageElement | ImageBitmap> {
  return new Promise((resolve, reject) => {
    map.loadImage(url, (err, img) => {
      if (err || !img) return reject(err || new Error("Cannot load image"));
      resolve(img as any);
    });
  });
}

async function generateDotIcon(size = 32, color = "#e11d48") {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.4, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  return await createImageBitmap(c);
}

function buildShortAddress(r: Restaurant): string {
  const street = r.address?.street ?? "";
  const ward = r.address?.ward ?? "";
  const district = r.address?.district ?? "";
  const city = r.address?.city ?? "";
  return [street, ward, district, city].filter(Boolean).join(", ");
}

function formatDistance(km?: number): string | undefined {
  if (km == null || !Number.isFinite(km)) return undefined;
  if (km < 1) return `${(km * 1000).toFixed(0)} m`;
  return `${km.toFixed(2)} km`;
}

function getRestaurantCoords(
  r: Restaurant
): { lng: number; lat: number } | null {
  const lat =
    (r as any).coordinates?.lat ??
    (r as any).location?.coordinates?.[1] ??
    r.address?.coordinates?.[1];
  const lng =
    (r as any).coordinates?.lng ??
    (r as any).location?.coordinates?.[0] ??
    r.address?.coordinates?.[0];

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lng: lng as number, lat: lat as number };
}

function buildDirectionsUrlFromCoords(
  coords: [number, number],
  userLat?: number,
  userLng?: number
): string {
  const [lng, lat] = coords;
  const dest = `${lat},${lng}`;
  if (typeof userLat === "number" && typeof userLng === "number") {
    const origin = `${userLat},${userLng}`;
    return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
      origin
    )}&destination=${encodeURIComponent(dest)}`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    dest
  )}`;
}

function buildDirectionsUrlForRestaurant(
  r: Restaurant,
  userLat?: number,
  userLng?: number
): string | undefined {
  const coords = getRestaurantCoords(r);
  if (!coords) return undefined;
  return buildDirectionsUrlFromCoords(
    [coords.lng, coords.lat],
    userLat,
    userLng
  );
}

// function popupHtml(args: {
//   name: string;
//   address: string;
//   distanceText?: string;
//   priceRange?: string;
//   directionsUrl?: string;
// }) {
//   const { name, address, distanceText, priceRange, directionsUrl } = args;

//   const priceLabel = priceRange ? formatPriceRange(priceRange) : "";

//   return `
//     <div class="text-[13px] leading-snug text-gray-800">
//       <div class="mb-1 flex items-start justify-between gap-2">
//         <div class="font-semibold text-[14px] text-gray-900 line-clamp-2">
//           ${name}
//         </div>
//       </div>

//       <div class="text-[11px] text-gray-600">
//         ${address || "Địa chỉ đang cập nhật"}
//       </div>

//       ${
//         distanceText
//           ? `<div class="mt-1 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-700">
//                Cách bạn: ${distanceText}
//              </div>`
//           : ""
//       }

//       ${
//         priceLabel
//           ? `<div class="mt-1 inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700">
//                ${priceLabel}
//              </div>`
//           : ""
//       }

//       ${
//         directionsUrl
//           ? `<div class="mt-3">
//                <a
//                  href="${directionsUrl}"
//                  target="_blank"
//                  rel="noopener noreferrer"
//                  class="inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-blue-700"
//                >
//                  Chỉ đường
//                </a>
//              </div>`
//           : ""
//       }
//     </div>
//   `;
// }

function popupHtml(args: {
  name: string;
  address: string;
  distanceText?: string;
  priceRange?: string;
  categoryName?: string;
  categoryIcon?: string;
  directionsUrl?: string;
}) {
  const {
    name,
    address,
    distanceText,
    priceRange,
    categoryName,
    categoryIcon,
    directionsUrl,
  } = args;

  const priceLabel = priceRange ? formatPriceRange(priceRange) : "";

  const categoryChip = categoryName
    ? `<div class="mb-1 inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700">
           ${categoryIcon ? `<span class="mr-1">${categoryIcon}</span>` : ""}
           <span>${categoryName}</span>
         </div>`
    : "";

  return `
    <div class="text-[13px] leading-snug">
      ${categoryChip}
      <div class="font-semibold text-[14px] mb-1">${name}</div>
      <div class="text-[11px] text-gray-600">
        ${address || "Địa chỉ đang cập nhật"}
      </div>

      ${
        distanceText
          ? `<div class="mt-1 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-700">
               Cách bạn: ${distanceText}
             </div>`
          : ""
      }

      ${
        priceLabel
          ? `<div class="mt-1 inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
               ${priceLabel}
             </div>`
          : ""
      }

      ${
        directionsUrl
          ? `<div class="mt-3">
               <a
                 href="${directionsUrl}"
                 target="_blank"
                 rel="noopener noreferrer"
                 class="inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-3 py-1.5 text-[11px] font-medium text-white"
               >
                 Chỉ đường
               </a>
             </div>`
          : ""
      }
    </div>
  `;
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl, { Map, MapLayerMouseEvent } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { useRouter } from "next/navigation";
import { useLocationStore } from "@/stores/locationStore";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY || "";

type Restaurant = {
  _id: string;
  name: string;
  address: string;
  lat: number;
  lon: number;
  district?: string;
  category?: string;
  priceRange?: string;
};

// ✅ Bật dữ liệu giả
const USE_FAKE_NEARBY = true;

const HCM_CENTER = { lng: 106.70098, lat: 10.77653 }; // Bưu điện TP
const HCM_BBOX: [number, number, number, number] = [106.55, 10.68, 106.85, 10.9];

export default function FoodMapView() {
  const token = process.env.NEXT_PUBLIC_MAPBOX_API_KEY || "";
  const router = useRouter();
  const { lat, lng, mode, autoDetect } = useLocationStore();

  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const geocoderRef = useRef<any>(null);

  const [loading, setLoading] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [error, setError] = useState<string | null>(null);

  // auto detect vị trí nếu chưa có
  useEffect(() => {
    if (mode === "prompt") autoDetect();
  }, [mode, autoDetect]);

  // init map
  useEffect(() => {
    if (!token) {
      setError("Thiếu NEXT_PUBLIC_MAPBOX_API_KEY trong .env.local");
      return;
    }
    const center = (lat && lng) ? { lng, lat } : HCM_CENTER;
    if (!mapElRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapElRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [center.lng, center.lat],
      zoom: 14,
      cooperativeGestures: true,
      attributionControl: true,
    });

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");
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
          proximity: { longitude: HCM_CENTER.lng, latitude: HCM_CENTER.lat },
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
      if (!map.getSource("user-point")) {
        map.addSource("user-point", { type: "geojson", data: pointFeature(center.lng, center.lat) });
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
          map.addImage("restaurant-icon", await generateDotIcon(32, "#e11d48"), { sdf: false });
        }
      }

      // layer
      if (!map.getSource("restaurants")) {
        map.addSource("restaurants", { type: "geojson", data: emptyFC() });
        map.addLayer({
          id: "restaurants-symbol",
          type: "symbol",
          source: "restaurants",
          layout: {
            "icon-image": "restaurant-icon",
            "icon-size": 0.8,
            "icon-allow-overlap": true,
            "icon-anchor": "bottom",
            "text-field": ["get", "name"],
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

        map.on("click", "restaurants-symbol", (e: MapLayerMouseEvent) => {
          const id = e.features?.[0]?.properties?._id as string | undefined;
          if (id) router.push(`/restaurants/${id}`);
        });
        map.on("mouseenter", "restaurants-symbol", () => (map.getCanvas().style.cursor = "pointer"));
        map.on("mouseleave", "restaurants-symbol", () => (map.getCanvas().style.cursor = ""));
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
  }, [token, lat, lng, router]);

  // update user point khi lat/lng đổi
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !lat || !lng) return;
    const src = map.getSource("user-point") as mapboxgl.GeoJSONSource | undefined;
    src?.setData(pointFeature(lng, lat));
  }, [lat, lng]);

  // ✅ Lấy quán giả quanh vị trí (thay cho gọi API)
  useEffect(() => {
    const center = (lat && lng) ? { lng, lat } : HCM_CENTER;
    setLoading(true);
    setError(null);
    // tạo 24 điểm giả đa dạng
    const fake = getSampleNearby(center.lng, center.lat, 24);
    setRestaurants(fake);
    setLoading(false);
  }, [lat, lng]);

  // đổ restaurants vào source
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const src = map.getSource("restaurants") as mapboxgl.GeoJSONSource | undefined;
    if (!src) return;
    src.setData({
      type: "FeatureCollection",
      features: restaurants.map((r) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [r.lon, r.lat] },
        properties: {
          _id: r._id,
          name: r.name,
          address: r.address,
          district: r.district || "",
          category: r.category || "",
          priceRange: r.priceRange || "",
        },
      })),
    } as GeoJSON.FeatureCollection);
  }, [restaurants]);

  const recenter = () => {
    const map = mapRef.current;
    if (map && (lat && lng)) {
      map.flyTo({ center: [lng, lat], zoom: Math.max(map.getZoom(), 14), speed: 0.9, curve: 1.4 });
    } else if (map) {
      map.flyTo({ center: [HCM_CENTER.lng, HCM_CENTER.lat], zoom: 14 });
    }
  };

  const countLabel = useMemo(() => {
    if (loading) return "Đang tải...";
    return restaurants.length > 0 ? `${restaurants.length} kết quả gần đây` : "Không có kết quả gần đây";
  }, [restaurants.length, loading]);

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-gray-600">
          <span className="font-medium text-gray-800">Quanh bạn</span> · {countLabel}
          {error ? <span className="ml-2 text-rose-600">{error}</span> : null}
        </div>
        <div className="flex items-center gap-2">
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
          Thiếu <code>NEXT_PUBLIC_MAPBOX_API_KEY</code> trong <code>.env.local</code>.
        </div>
      )}

      <div ref={mapElRef} className="h-[600px] w-full rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-white" />

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-100 p-4 bg-white">
              <div className="h-36 rounded-lg bg-gray-100 animate-pulse" />
              <div className="mt-3 h-4 w-2/3 rounded bg-gray-100 animate-pulse" />
              <div className="mt-2 h-3 w-1/2 rounded bg-gray-100 animate-pulse" />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ============ helpers ============ */

function emptyFC(): GeoJSON.FeatureCollection {
  return { type: "FeatureCollection", features: [] };
}

function pointFeature(lon: number, lat: number): GeoJSON.Feature {
  return { type: "Feature", geometry: { type: "Point", coordinates: [lon, lat] }, properties: {} };
}

function loadMapImage(map: Map, url: string): Promise<HTMLImageElement | ImageBitmap> {
  return new Promise((resolve, reject) => {
    map.loadImage(url, (err, img) => {
      if (err || !img) return reject(err || new Error("Cannot load image"));
      resolve(img);
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

// ✅ Sinh dữ liệu giả quanh center (lng/lat). Có danh mục + quận phổ biến.
function getSampleNearby(centerLng: number, centerLat: number, count = 20): Restaurant[] {
  const districts = ["Q1", "Q3", "Q5", "Q10", "Q11", "Phú Nhuận", "Bình Thạnh", "Thủ Đức", "Q4", "Q7"];
  const categories = ["Lẩu/Nướng", "Bún/Phở", "Cà phê", "Ăn vặt", "Món Nhật", "Món Hàn", "Món Ý", "Hải sản"];
  const priceRanges = ["50k-80k", "80k-120k", "120k-180k", "180k+"];

  const namesA = ["Phở", "Bún", "Cơm", "Lẩu", "Cafe", "Sushi", "Gà rán", "Pizza", "Ốc", "Bánh mì", "Bánh xèo", "Gỏi cuốn"];
  const namesB = ["Nhà", "Phố", "Quê", "88", "Corner", "Station", "Express", "Garden", "Xưa", "Modern"];

  const out: Restaurant[] = [];
  for (let i = 0; i < count; i++) {
    // jitter ~ 800m x 800m quanh center
    const jitterLng = (Math.random() - 0.5) * 0.015;
    const jitterLat = (Math.random() - 0.5) * 0.015;
    const lon = clamp(centerLng + jitterLng, HCM_BBOX[0], HCM_BBOX[2]);
    const lat = clamp(centerLat + jitterLat, HCM_BBOX[1], HCM_BBOX[3]);

    const name = `${pick(namesA)} ${pick(namesB)}`;
    const district = pick(districts);
    const cat = pick(categories);
    const price = pick(priceRanges);

    out.push({
      _id: `r-${i + 1}`,
      name,
      address: `Số ${Math.floor(Math.random() * 200) + 10} Đường Demo, ${district}`,
      lat,
      lon,
      district,
      category: cat,
      priceRange: price,
    });
  }
  return out;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl, { Map, MapLayerMouseEvent } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import axios from "axios";
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
  banner?: string | string[];
};

const HCM_BBOX: [number, number, number, number] = [
  106.55, 10.68, 106.85, 10.9,
];

export default function FoodMapView() {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";
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

  // init map (1 lần khi có lat/lng)
  useEffect(() => {
    if (!token) {
      setError("Thiếu NEXT_PUBLIC_MAPBOX_API_KEY trong .env.local");
      return;
    }
    if (!lat || !lng) return;
    if (!mapElRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapElRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: 14,
      cooperativeGestures: true,
      attributionControl: true,
    });

    // controls
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

    // load geocoder **sau khi map có**
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
          proximity: { longitude: 106.7, latitude: 10.78 },
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
      // add user point
      if (!map.getSource("user-point")) {
        map.addSource("user-point", {
          type: "geojson",
          data: pointFeature(lng, lat),
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

      // restaurants source + layer
      if (!map.getSource("restaurants")) {
        map.addSource("restaurants", {
          type: "geojson",
          data: emptyFC(),
        });
        map.addLayer({
          id: "restaurants-symbol",
          type: "symbol",
          source: "restaurants",
          layout: {
            "icon-image": "restaurant-icon",
            "icon-size": 0.8,
            "icon-allow-overlap": true,
            "icon-anchor": "bottom",
          },
        });

        map.on("click", "restaurants-symbol", (e: MapLayerMouseEvent) => {
          const id = e.features?.[0]?.properties?._id as string | undefined;
          if (id) router.push(`/restaurants/${id}`);
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
  }, [token, lat, lng, router]);

  // update user point khi lat/lng đổi
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !lat || !lng) return;
    const src = map.getSource("user-point") as
      | mapboxgl.GeoJSONSource
      | undefined;
    src?.setData(pointFeature(lng, lat));
  }, [lat, lng]);

  // fetch nearby (debounce + abort)
  useEffect(() => {
    if (!lat || !lng || !API_URL) return;
    let ctrl: AbortController | null = new AbortController();
    const t = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get<Restaurant[]>(
          `${API_URL}/restaurants/nearby`,
          {
            params: { lat, lng },
            signal: ctrl?.signal,
          }
        );
        setRestaurants(res.data || []);
      } catch (e: any) {
        if (e?.name !== "CanceledError" && e?.message !== "canceled") {
          console.error("[Nearby] fetch error:", e);
          setError("Không lấy được danh sách quán. Thử lại nhé.");
        }
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      clearTimeout(t);
      ctrl?.abort();
      ctrl = null;
    };
  }, [lat, lng, API_URL]);

  // đổ restaurants vào source (layer symbol)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const src = map.getSource("restaurants") as
      | mapboxgl.GeoJSONSource
      | undefined;
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
    if (map && lat && lng) {
      map.flyTo({
        center: [lng, lat],
        zoom: Math.max(map.getZoom(), 14),
        speed: 0.9,
        curve: 1.4,
      });
    }
  };

  const countLabel = useMemo(() => {
    if (loading) return "Đang tải...";
    return restaurants.length > 0
      ? `${restaurants.length} kết quả gần đây`
      : "Không có kết quả gần đây";
  }, [restaurants.length, loading]);

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-gray-600">
          <span className="font-medium text-gray-800">Quanh bạn</span> ·{" "}
          {countLabel}
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
          Thiếu <code>NEXT_PUBLIC_MAPBOX_API_KEY</code> trong{" "}
          <code>.env.local</code>.
        </div>
      )}

      <div
        ref={mapElRef}
        className="h-[600px] w-full rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-white"
      />

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-100 p-4 bg-white"
            >
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

/* helpers */

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

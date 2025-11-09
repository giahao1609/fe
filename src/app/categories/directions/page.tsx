"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useSearchParams } from "next/navigation";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY || "";

type Profile = "mapbox/driving" | "mapbox/walking" | "mapbox/cycling";

export default function DirectionsPage() {
  const searchParams = useSearchParams();
  const destLat = parseFloat(searchParams.get("lat") || "0");
  const destLng = parseFloat(searchParams.get("lng") || "0");
  const destName = (searchParams.get("name") || "Quán ăn").slice(0, 80);

  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const directionsRef = useRef<any>(null);

  const [profile, setProfile] = useState<Profile>("mapbox/driving");
  const [origin, setOrigin] = useState<[number, number] | null>(null);
  const [eta, setEta] = useState<{
    distanceKm: number;
    durationMin: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);

  const hasDest = useMemo(
    () =>
      Number.isFinite(destLat) &&
      Number.isFinite(destLng) &&
      destLat !== 0 &&
      destLng !== 0,
    [destLat, destLng]
  );
  const token = mapboxgl.accessToken;

  // Lấy vị trí hiện tại
  useEffect(() => {
    if (!("geolocation" in navigator))
      return setError("Trình duyệt không hỗ trợ định vị.");
    navigator.geolocation.getCurrentPosition(
      (pos) => setOrigin([pos.coords.longitude, pos.coords.latitude]),
      () =>
        setError(
          "Không thể lấy vị trí của bạn. Bạn vẫn có thể xem đường đi đến đích."
        ),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  // Khởi tạo map + Directions
  useEffect(() => {
    let removed = false;
    let cleanupCss = false;

    const init = async () => {
      if (!token) {
        setError("Thiếu NEXT_PUBLIC_MAPBOX_API_KEY trong .env.local");
        return;
      }
      if (!mapContainer.current) return;

      // Import Directions sau khi client mount (tránh SSR issues)
      const { default: MapboxDirections } = await import(
        "@mapbox/mapbox-gl-directions"
      );
      await import(
        "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css"
      ).then(() => {
        cleanupCss = true; // (Mapbox tự inject link; không cần tự cleanup)
      });

      if (removed) return;

      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: hasDest ? [destLng, destLat] : [106.7009, 10.7769], // fallback HCM
        zoom: hasDest ? 13 : 12,
        attributionControl: true,
        cooperativeGestures: true,
      });

      map.addControl(
        new mapboxgl.NavigationControl({ visualizePitch: true }),
        "top-right"
      );
      map.addControl(new mapboxgl.FullscreenControl(), "top-right");

      const dir = new MapboxDirections({
        accessToken: token,
        unit: "metric",
        profile,
        // Để điều khiển UI bằng nút custom, ẩn input mặc định:
        controls: { inputs: false, instructions: true },
        interactive: false,
        congestion: true,
        geometries: "geojson",
        alternatives: false,
      });

      // Lưu tham chiếu
      mapRef.current = map;
      directionsRef.current = dir;

      // thêm control
      map.addControl(dir, "top-left");

      // Origin/Destination ban đầu
      if (origin) dir.setOrigin(origin);
      if (hasDest) dir.setDestination([destLng, destLat]);

      // Sự kiện khi có route
      dir.on("route", (e: any) => {
        const r = e?.route?.[0];
        if (!r) {
          setEta(null);
          return;
        }
        const distanceKm = (r.distance ?? 0) / 1000;
        const durationMin = Math.round((r.duration ?? 0) / 60);
        setEta({ distanceKm, durationMin });
        setLoadingRoute(false);
      });

      dir.on("error", () => {
        setEta(null);
        setLoadingRoute(false);
      });

      // Nếu chưa có origin lúc init, khi origin update → set lại
      // (được xử lý ở effect khác)
    };

    init();

    return () => {
      removed = true;
      const map = mapRef.current;
      const dir = directionsRef.current;
      try {
        if (map && dir) map.removeControl(dir);
      } catch {}
      try {
        map?.remove();
      } catch {}
      mapRef.current = null;
      directionsRef.current = null;
      // css của directions là <link> global — Mapbox xử lý; không cần cleanup thủ công
    };
  }, [token, hasDest, destLat, destLng]);

  // Cập nhật origin khi lấy được GPS
  useEffect(() => {
    if (!origin || !directionsRef.current) return;
    directionsRef.current.setOrigin(origin);
    if (hasDest) {
      setLoadingRoute(true);
      directionsRef.current.setDestination([destLng, destLat]);
    }
  }, [origin, hasDest, destLat, destLng]);

  // Đổi profile (ô tô/đi bộ/xe đạp)
  useEffect(() => {
    const dir = directionsRef.current;
    if (!dir) return;
    dir.setProfile(profile);
    if (origin && hasDest) {
      setLoadingRoute(true);
      dir.setOrigin(origin);
      dir.setDestination([destLng, destLat]);
    }
  }, [profile, origin, hasDest, destLat, destLng]);

  const recenterToOrigin = () => {
    const map = mapRef.current;
    if (!map || !origin) return;
    map.flyTo({
      center: origin,
      zoom: Math.max(map.getZoom(), 14),
      speed: 0.9,
      curve: 1.4,
    });
  };

  const recenterToDest = () => {
    const map = mapRef.current;
    if (!map || !hasDest) return;
    map.flyTo({
      center: [destLng, destLat],
      zoom: Math.max(map.getZoom(), 14),
      speed: 0.9,
      curve: 1.4,
    });
  };

  const swapOD = () => {
    const dir = directionsRef.current;
    if (!dir || !hasDest) return;
    const curOrigin = origin;
    const curDest: [number, number] = [destLng, destLat];
    if (!curOrigin) return;
    // Hoán đổi
    setOrigin(curDest);
    // Không đổi query param; chỉ đổi trong directions
    dir.setOrigin(curDest);
    dir.setDestination(curOrigin);
    setLoadingRoute(true);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Chỉ đường đến {destName}
          </h1>
          {!hasDest && (
            <p className="text-sm text-rose-600">
              Thiếu toạ độ đích (lat/lng). Hãy truy cập từ trang quán với nút
              “Chỉ đường”.
            </p>
          )}
          {eta && (
            <p className="text-sm text-gray-600">
              Ước tính:{" "}
              <span className="font-medium">{eta.durationMin} phút</span> ·{" "}
              <span className="font-medium">
                {eta.distanceKm.toFixed(1)} km
              </span>
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <button
              onClick={() => setProfile("mapbox/driving")}
              className={`px-3 py-1.5 text-sm ${
                profile === "mapbox/driving"
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
              title="Ô tô"
            >
              🚗 Ô tô
            </button>
            <button
              onClick={() => setProfile("mapbox/walking")}
              className={`px-3 py-1.5 text-sm ${
                profile === "mapbox/walking"
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
              title="Đi bộ"
            >
              🚶 Đi bộ
            </button>
            <button
              onClick={() => setProfile("mapbox/cycling")}
              className={`px-3 py-1.5 text-sm ${
                profile === "mapbox/cycling"
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
              title="Xe đạp"
            >
              🚴 Xe đạp
            </button>
          </div>

          <button
            onClick={recenterToOrigin}
            className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm hover:border-rose-300 hover:text-rose-700"
            title="Về vị trí của tôi"
          >
            📍 Về vị trí của tôi
          </button>

          <button
            onClick={recenterToDest}
            className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm hover:border-rose-300 hover:text-rose-700"
            title="Xem đích"
          >
            🎯 Xem đích
          </button>

          <button
            onClick={swapOD}
            className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm hover:border-rose-300 hover:text-rose-700"
            title="Đổi điểm đi/đến"
            disabled={!origin || !hasDest}
          >
            🔁 Đổi đầu–cuối
          </button>
        </div>
      </div>

      {/* Thông báo lỗi chung */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Bản đồ + khung chỉ dẫn (Mapbox Directions sẽ render panel ở bên trái/top-left) */}
      <div className="relative grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Panel chỉ dẫn: Mapbox Directions sẽ render ở "top-left" trên map.
            Nếu muốn custom panel riêng, có thể đọc e.route và render step ở đây. */}

        <div className="lg:col-span-12">
          <div
            ref={mapContainer}
            className="h-[520px] w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
          />
        </div>

        {/* Loading route indicator */}
        {loadingRoute && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="rounded-xl bg-white/90 px-4 py-2 text-sm text-gray-700 shadow">
              Đang tính đường đi…
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

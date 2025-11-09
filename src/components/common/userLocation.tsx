"use client";

import { useEffect, useRef, useState } from "react";
import { useLocationStore } from "@/stores/locationStore";

export default function UserLocation() {
  const { setGPS } = useLocationStore();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const watchRef = useRef<number | null>(null);

  // —————————————————— effects ——————————————————
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // If browser supports permission API, check it first
        // to avoid flashing the modal unnecessarily
        const perm = await (navigator.permissions?.query as any)?.({
          name: "geolocation",
        });

        if (!perm) {
          setShow(true);
          return;
        }

        if (perm.state === "granted") {
          startWatching(true);
        } else if (perm.state === "prompt") {
          setShow(true);
        } else {
          setError(
            "Bạn đã tắt quyền định vị. Hãy bật lại trong phần cài đặt trình duyệt để hiển thị vị trí chính xác."
          );
          setShow(true);
        }

        // React to later permission changes
        // @ts-ignore — older TS lib may not declare onchange
        perm.onchange = () => {
          if (cancelled) return;
          if (perm.state === "granted") startWatching(true);
        };
      } catch {
        setShow(true);
      }
    })();

    return () => {
      cancelled = true;
      if (watchRef.current != null)
        navigator.geolocation.clearWatch(watchRef.current);
    };
  }, []);

  // —————————————————— logic ——————————————————
  const startWatching = (silent = false) => {
    if (!("geolocation" in navigator)) {
      setError("Trình duyệt của bạn không hỗ trợ định vị.");
      return;
    }

    if (watchRef.current != null)
      navigator.geolocation.clearWatch(watchRef.current);

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setGPS(latitude, longitude);
        setError(null);
        setLoading(false);
        if (!silent) setShow(false);
        if (accuracy > 1000) {
          console.warn(
            "⚠️ Vị trí ước lượng (Wi‑Fi hoặc IP, không phải GPS thật)"
          );
        }
      },
      (err) => {
        setLoading(false);
        if (err.code === 1)
          setError(
            "Bạn đã từ chối quyền truy cập vị trí. Hãy bật lại trong phần cài đặt trình duyệt."
          );
        else if (err.code === 2)
          setError(
            "Không xác định được vị trí. Hãy thử lại hoặc kiểm tra kết nối mạng."
          );
        else if (err.code === 3)
          setError("Hết thời gian chờ. Vui lòng thử lại.");
        else setError("Không thể lấy vị trí. Vui lòng thử lại.");
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );

    watchRef.current = id;
  };

  const handleAllow = () => {
    setLoading(true);
    startWatching();
  };

  if (!show) return null;

  // —————————————————— UI ——————————————————
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      aria-modal
      role="dialog"
      aria-labelledby="foodmap-loc-title"
    >
      {/* Ambient gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-b from-rose-600/20 via-rose-500/10 to-rose-600/20 backdrop-blur-[2px]" />

      {/* Noise & vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.25)_100%)]" />

      {/* Card */}
      <div className="relative w-full max-w-[420px]">
        {/* shimmering border */}
        <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-b from-white/60 via-rose-300/60 to-white/60 opacity-80 blur-[6px]" />

        <div className="relative rounded-3xl border border-white/30 bg-white/80 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="px-6 pt-6">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-lg">
              {/* Map pin + radar */}
              <div className="relative">
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 22s7-4.35 7-11a7 7 0 1 0-14 0c0 6.65 7 11 7 11z" />
                  <circle cx="12" cy="11" r="3" />
                </svg>
                <span className="absolute -inset-3 animate-ping rounded-full bg-white/30" />
              </div>
            </div>

            <h2
              id="foodmap-loc-title"
              className="text-center text-xl font-semibold tracking-tight text-gray-900"
            >
              Cho phép FoodMap dùng vị trí của bạn
            </h2>
            <p className="mt-1 text-center text-sm text-gray-600">
              Để gợi ý{" "}
              <span className="font-medium text-rose-700">quán ăn gần bạn</span>
              , chúng tôi cần truy cập vị trí hiện tại.
            </p>
          </div>

          {/* Error / Tips */}
          {error ? (
            <div className="mx-6 mt-4 rounded-2xl border border-rose-200 bg-rose-50/80 p-3 text-rose-700">
              <div className="flex items-start gap-2">
                <svg
                  viewBox="0 0 24 24"
                  className="mt-0.5 h-5 w-5 flex-none"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                </svg>
                <div className="text-sm leading-relaxed">
                  <div className="font-medium">{error}</div>
                  <details className="mt-2 text-gray-700 open:animate-fadeIn">
                    <summary className="cursor-pointer text-rose-700 underline underline-offset-4">
                      Hướng dẫn bật lại quyền vị trí
                    </summary>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      <li>
                        <b>Chrome</b>: Bấm 🔒 → Quyền trang web → Vị trí → Cho
                        phép.
                      </li>
                      <li>
                        <b>Android</b>: Bật GPS → Cho phép vị trí chính xác.
                      </li>
                      <li>
                        <b>iPhone</b>: Cài đặt → Safari → Vị trí → Luôn cho
                        phép.
                      </li>
                    </ul>
                  </details>
                </div>
              </div>
            </div>
          ) : (
            <div className="mx-6 mt-4 rounded-2xl bg-gray-50/70 p-3 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 flex-none"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 12h6m-3-3v6M12 3a9 9 0 1 0 9 9" />
                </svg>
                <span>
                  Chúng tôi chỉ dùng vị trí để hiển thị gợi ý gần bạn. Bạn có
                  thể tắt bất cứ lúc nào.
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="px-6 pb-6 pt-4">
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShow(false)}
                className="rounded-xl border border-gray-300/80 bg-white/80 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm backdrop-blur transition hover:bg-white hover:shadow"
                disabled={loading}
              >
                Để sau
              </button>

              <button
                onClick={handleAllow}
                className="group relative min-w-[120px] rounded-xl bg-rose-600 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-rose-700 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
                disabled={loading}
              >
                <span className="inline-flex items-center justify-center gap-2">
                  {loading ? (
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                  ) : (
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 21l-8-8 3-3 5 5 8-8 3 3-11 11z" />
                    </svg>
                  )}
                  {loading ? "Đang lấy..." : "Cho phép"}
                </span>

                {/* light sweep */}
                <span className="pointer-events-none absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-white/0 via-white/30 to-white/0 opacity-0 blur transition group-hover:opacity-100" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Corner close */}
      <button
        aria-label="Đóng"
        onClick={() => setShow(false)}
        className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/30 bg-white/70 text-gray-700 shadow backdrop-blur transition hover:bg-white"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 6l12 12M6 18L18 6" />
        </svg>
      </button>
    </div>
  );
}

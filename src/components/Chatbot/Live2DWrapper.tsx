"use client";

import { useEffect, useRef, useState } from "react";
import { useLive2D } from "./useLive2D";

let __booted = false;

export default function Live2DWrapper() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);

  const { ready } = useLive2D("live2dCanvas", containerRef);

  useEffect(() => {
    setMounted(true);
    __booted = true;
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden rounded-2xl bg-transparent"
    >
      {!mounted && (
        <div className="absolute inset-0 animate-pulse rounded-2xl bg-transparent ring-1 ring-black/5" />
      )}
      {!ready && mounted && (
        <div className="absolute inset-0 grid place-items-center rounded-2xl bg-transparent">
          <div className="text-xs text-gray-600">Đang tải model…</div>
        </div>
      )}
      <canvas
        id="live2dCanvas"
        className="absolute inset-0 h-full w-full pointer-events-none"
        aria-hidden
      />
    </div>
  );
}

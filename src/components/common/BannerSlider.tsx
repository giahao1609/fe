"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

export type Slide = {
  id: string | number;
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
  image: string; // url ảnh
  align?: "left" | "center" | "right"; // căn text
};

type Props = {
  slides: Slide[];
  autoplayMs?: number; // default 4000
  className?: string;
};

export default function BannerSlider({
  slides,
  autoplayMs = 4000,
  className = "",
}: Props) {
  const [idx, setIdx] = useState(0);
  const total = slides.length;
  const timerRef = useRef<number | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const hoveringRef = useRef(false);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  const go = useCallback(
    (to: number) => {
      setIdx((prev) => {
        const next = (to + total) % total;
        return next;
      });
    },
    [total]
  );

  const next = useCallback(() => go(idx + 1), [idx, go]);
  const prev = useCallback(() => go(idx - 1), [idx, go]);

  // autoplay
  useEffect(() => {
    if (hoveringRef.current) return;
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setIdx((i) => (i + 1) % total);
    }, Math.max(2000, autoplayMs)) as unknown as number;
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [autoplayMs, total, idx]);

  // pause on hover
  const onMouseEnter = () => {
    hoveringRef.current = true;
    if (timerRef.current) window.clearInterval(timerRef.current);
  };
  const onMouseLeave = () => {
    hoveringRef.current = false;
  };

  // keyboard (left/right)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!wrapperRef.current) return;
      // chỉ khi slider đang ở trong viewport focusable
      if (
        document.activeElement &&
        !wrapperRef.current.contains(document.activeElement)
      )
        return;
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  // touch swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };
  const onTouchEnd = () => {
    if (Math.abs(touchDeltaX.current) > 50) {
      if (touchDeltaX.current < 0) next();
      else prev();
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  const current = slides[idx];

  const alignClass = useMemo(() => {
    switch (current.align) {
      case "right":
        return "items-end text-right";
      case "center":
        return "items-center text-center";
      default:
        return "items-start text-left";
    }
  }, [current.align]);

  return (
    <div
      ref={wrapperRef}
      className={`relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow ${className}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      role="region"
      aria-roledescription="carousel"
      aria-label="Banner ưu đãi"
      tabIndex={0}
    >
      {/* Track */}
      <div className="relative aspect-[16/7] w-full">
        {/* current slide bg */}
        <div
          className="absolute inset-0 bg-gray-100"
          style={{
            backgroundImage: `url(${current.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          aria-hidden
        />

        {/* gradient overlay để chữ nổi */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* content */}
        <div
          className={`absolute inset-0 flex ${alignClass} px-6 sm:px-10 lg:px-14 py-8 lg:py-12`}
        >
          <div className="max-w-xl">
            <h3 className="text-white text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight drop-shadow">
              {current.title}
            </h3>
            {current.subtitle && (
              <p className="mt-2 text-white/85 text-sm sm:text-base lg:text-lg">
                {current.subtitle}
              </p>
            )}
            {current.ctaHref && current.ctaText && (
              <Link
                href={current.ctaHref}
                className="mt-5 inline-flex rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg ring-1 ring-rose-500/20 transition hover:bg-rose-700"
              >
                {current.ctaText}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* dots */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => go(i)}
            aria-label={`Chuyển tới banner ${i + 1}`}
            className={`h-2.5 rounded-full transition-all ${
              i === idx ? "w-6 bg-white" : "w-2.5 bg-white/60 hover:bg-white/80"
            }`}
          />
        ))}
      </div>

      {/* arrows */}
      <button
        aria-label="Slide trước"
        onClick={prev}
        className="group absolute left-3 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-black/30 text-white ring-1 ring-white/20 backdrop-blur transition hover:bg-black/40"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5">
          <path
            d="M15 19l-7-7 7-7"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      </button>
      <button
        aria-label="Slide sau"
        onClick={next}
        className="group absolute right-3 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-black/30 text-white ring-1 ring-white/20 backdrop-blur transition hover:bg-black/40"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5">
          <path
            d="M9 5l7 7-7 7"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      </button>
    </div>
  );
}

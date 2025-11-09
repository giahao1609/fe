"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";

const Live2DCore = dynamic(() => import("./Live2DWrapper"), {
  ssr: false,
  loading: () => (
    <div className="w-[240px] h-[300px] md:w-[280px] md:h-[340px]">
      <div className="h-full w-full animate-pulse rounded-2xl bg-transparent ring-1 ring-black/5" />
    </div>
  ),
});

function useIdleVisibleReady(timeout = 1500) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const schedule = () => {
      const cb = () => !cancelled && setReady(true);
      if ("requestIdleCallback" in window) {
        (window as any).requestIdleCallback(cb, { timeout });
      } else {
        setTimeout(cb, Math.min(800, timeout));
      }
    };

    const go = () => {
      if (cancelled) return;
      if (document.visibilityState !== "visible") {
        const onVisible = () => {
          if (document.visibilityState === "visible") {
            document.removeEventListener("visibilitychange", onVisible);
            schedule();
          }
        };
        document.addEventListener("visibilitychange", onVisible);
        return;
      }
      schedule();
    };

    if (
      document.readyState === "interactive" ||
      document.readyState === "complete"
    ) {
      go();
    } else {
      const onDom = () => {
        document.removeEventListener("DOMContentLoaded", onDom);
        go();
      };
      document.addEventListener("DOMContentLoaded", onDom);
    }

    return () => {
      cancelled = true;
    };
  }, [timeout]);

  return ready;
}

function ErrorBoundary({
  onError,
  children,
}: {
  onError?: (err: unknown) => void;
  children: React.ReactNode;
}) {
  const [err, setErr] = useState<unknown>(null);
  if (err) {
    onError?.(err);
    return null;
  }
  try {
    return <>{children}</>;
  } catch (e) {
    setErr(e);
    return null;
  }
}

export default function Live2DWidget() {
  const ready = useIdleVisibleReady();
  const [attempt, setAttempt] = useState(0);
  const [key, setKey] = useState(0);
  const timerRef = useRef<number | null>(null);

  const delay = useMemo(() => {
    const steps = [0, 300, 800, 1500, 2500];
    return steps[Math.min(attempt, steps.length - 1)];
  }, [attempt]);

  useEffect(() => {
    if (!ready) return;
    if (attempt > 0) {
      timerRef.current = window.setTimeout(
        () => setKey((k) => k + 1),
        delay
      ) as unknown as number;
      return () => {
        if (timerRef.current != null) window.clearTimeout(timerRef.current);
      };
    }
  }, [ready, attempt, delay]);

  return (
    <div className="w-[240px] h-[300px] md:w-[280px] md:h-[340px]">
      {!ready ? (
        <div className="h-full w-full animate-pulse rounded-2xl bg-transparent ring-1 ring-black/5" />
      ) : (
        <ErrorBoundary onError={() => setAttempt((n) => n + 1)}>
          <Live2DCore key={key} />
        </ErrorBoundary>
      )}
    </div>
  );
}

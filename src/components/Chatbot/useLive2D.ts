"use client";

import { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";
import type { Live2DModel as L2DModel } from "pixi-live2d-display/cubism4";

// cache trạng thái load Core
let coreLoaded: Promise<void> | null = null;
let Live2DModelClass: any = null;

async function ensureCoreLoaded() {
  if ((window as any).Live2DCubismCore) return;
  if (!coreLoaded) {
    coreLoaded = new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "/live2d-sdk/Core/live2dcubismcore.js";
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Không tải được live2dcubismcore.js"));
      document.head.appendChild(s);
    });
  }
  await coreLoaded;
}

export function setupAudioMouthSync(
  audio: HTMLAudioElement,
  model: L2DModel,
  onStart?: () => void,
  onEnd?: () => void
) {
  const Ctx = window.AudioContext || (window as any).webkitAudioContext;
  const ctx = new Ctx();

  const resume = () => {
    if (ctx.state === "suspended") ctx.resume();
    document.removeEventListener("click", resume);
  };
  document.addEventListener("click", resume);

  const src = ctx.createMediaElementSource(audio);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 2048;
  src.connect(analyser);
  analyser.connect(ctx.destination);

  const data = new Uint8Array(analyser.frequencyBinCount);
  let raf = 0;

  function update() {
    analyser.getByteFrequencyData(data);
    const volume = data.reduce((a, b) => a + b, 0) / data.length;
    const mouth = Math.min(1, volume / 60);
    (model.internalModel as any)?.coreModel?.setParameterValueById(
      "ParamMouthOpenY",
      mouth
    );
    raf = requestAnimationFrame(update);
  }

  audio.addEventListener("play", () => {
    onStart?.();
    update();
  });
  const stop = () => {
    cancelAnimationFrame(raf);
    onEnd?.();
  };
  audio.addEventListener("pause", stop);
  audio.addEventListener("ended", () => {
    stop();
    ctx.close();
  });
}

export function useLive2D(
  canvasId: string,
  wrapperRef: React.RefObject<HTMLDivElement | null>,
  modelUrl = "/model/Pichu/Pichu.model3.json"
) {
  const [ready, setReady] = useState(false);
  const modelRef = useRef<L2DModel | null>(null);
  const appRef = useRef<PIXI.Application | null>(null);

  useEffect(() => {
    let destroyed = false;
    let ro: ResizeObserver | null = null;

    (async () => {
      try {
        const test = document.createElement("canvas");
        const gl =
          test.getContext("webgl") || test.getContext("experimental-webgl");
        if (!gl) {
          console.warn("WebGL không hỗ trợ.");
          return;
        }

        await ensureCoreLoaded();

        if (!Live2DModelClass) {
          const mod = await import("pixi-live2d-display/cubism4");
          Live2DModelClass = mod.Live2DModel;
          Live2DModelClass.registerTicker(PIXI.Ticker as any);
        }

        const wrapper = wrapperRef.current;
        const view = document.getElementById(
          canvasId
        ) as HTMLCanvasElement | null;
        if (!wrapper || !view) return;

        const app = new PIXI.Application({
          view,
          resizeTo: wrapper,
          autoDensity: true,
          resolution: Math.max(1, Math.min(window.devicePixelRatio || 1, 2)),
          antialias: true,
          backgroundAlpha: 0,
        });
        appRef.current = app;

        const model: L2DModel = await Live2DModelClass.from(modelUrl);
        if (destroyed) return;

        app.stage.addChild(model as any);
        modelRef.current = model;

        // layout fit
        const layout = () => {
          if (!wrapper || !modelRef.current) return;
          const sw = wrapper.clientWidth || 300;
          const sh = wrapper.clientHeight || 400;
          const bounds = (modelRef.current as any).getLocalBounds();
          const mw = bounds.width || 1;
          const mh = bounds.height || 1;
          const scale = Math.min(sw / mw, sh / mh);
          (modelRef.current as any).scale.set(scale);
          (modelRef.current as any).pivot.set(mw / 2, mh / 2);
          (modelRef.current as any).position.set(sw / 2, sh / 2);
        };
        layout();

        // handle resize + viewport
        window.addEventListener("resize", layout, { passive: true });
        if (window.visualViewport) {
          const vv = () => layout();
          window.visualViewport.addEventListener("resize", vv, {
            passive: true,
          });
          window.visualViewport.addEventListener("scroll", vv, {
            passive: true,
          });
          // cleanup in return
        }
        ro = new ResizeObserver(layout);
        ro.observe(wrapper);

        // WebGL context lost / restore
        const glCanvas = app.view as HTMLCanvasElement;
        const onLost = (e: any) => {
          e.preventDefault();
        };
        const onRestore = () => {
          app.renderer.reset();
        };
        glCanvas.addEventListener("webglcontextlost", onLost, false);
        glCanvas.addEventListener("webglcontextrestored", onRestore, false);

        setReady(true);

        // cleanup
        return () => {
          glCanvas.removeEventListener("webglcontextlost", onLost);
          glCanvas.removeEventListener("webglcontextrestored", onRestore);
        };
      } catch (err) {
        console.error("Live2D init error:", err);
      }
    })();

    return () => {
      destroyed = true;
      try {
        appRef.current?.destroy(true, { children: true });
      } catch {}
      appRef.current = null;
      modelRef.current = null;
      ro?.disconnect();
      window.removeEventListener("resize", () => {});
    };
  }, [canvasId, wrapperRef, modelUrl]);

  return { ready, modelRef, setupAudioMouthSync };
}

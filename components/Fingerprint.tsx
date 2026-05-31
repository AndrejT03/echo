"use client";

import { useEffect, useRef } from "react";
import { createRenderer, type FingerprintRenderer } from "@/lib/fingerprintGL";
import type { FingerprintParams } from "@/lib/fingerprint";

interface Props {
  params: FingerprintParams;
  className?: string;
  animate?: boolean;
}


export default function Fingerprint({ params, className, animate = true }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paramsRef = useRef(params);
  paramsRef.current = params;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: FingerprintRenderer | null = null;
    let raf = 0;
    let visible = true;
    let disposed = false;
    let retry = 0;
    const start = performance.now();
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    const fit = () => {
      const r = canvas.getBoundingClientRect();
      if (r.width && r.height && renderer) {
        renderer.resize(r.width * dpr, r.height * dpr);
      }
    };

    const setup = (): boolean => {
      try {

        renderer = createRenderer(canvas, { preserveDrawingBuffer: true });
      } catch {
        renderer = null;
      }
      if (!renderer) return false;
      fit();

      renderer.render(paramsRef.current, 8.0);
      return true;
    };

    const trySetup = () => {
      if (disposed) return;
      if (setup()) {
        if (animate) {
          const loop = () => {
            if (disposed) return;
            const t = (performance.now() - start) / 1000;
            if (visible && renderer) renderer.render(paramsRef.current, t);
            raf = requestAnimationFrame(loop);
          };
          raf = requestAnimationFrame(loop);
        }
      } else if (retry < 5) {
        retry += 1;
        setTimeout(trySetup, 250 * retry);
      } else {
        console.warn("[echo] WebGL отпечатокот не може да се исцрта (нема контекст).");
      }
    };

    const ro = new ResizeObserver(fit);
    ro.observe(canvas);

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.01 },
    );
    io.observe(canvas);

    const onLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
      renderer = null;
    };
    const onRestored = () => {
      retry = 0;
      trySetup();
    };
    canvas.addEventListener("webglcontextlost", onLost as EventListener);
    canvas.addEventListener("webglcontextrestored", onRestored);

    trySetup();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("webglcontextlost", onLost as EventListener);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      renderer?.dispose();
    };
  }, [animate]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}

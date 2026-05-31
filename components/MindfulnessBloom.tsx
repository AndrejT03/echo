"use client";

import { useEffect, useRef } from "react";

export interface MindfulnessBloomProps {

  size?: number;

  active?: boolean;

  hueShift?: number;

  intensity?: number;

  ellipse?: boolean;
  className?: string;
}


export default function MindfulnessBloom({
  size = 340,
  active = false,
  hueShift = 0,
  intensity = 1,
  ellipse = false,
  className,
}: MindfulnessBloomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const dyn = useRef({ active, intensity });
  dyn.current = { active, intensity };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cv = canvas;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;


    const SPRITE_PX = 128;
    const BANDS = 6;
    const HUE_IN = 190;
    const HUE_OUT = 214;
    const sprites: HTMLCanvasElement[] = [];
    for (let b = 0; b < BANDS; b++) {
      const t = b / (BANDS - 1);

      const hue = HUE_IN + (HUE_OUT - HUE_IN) * Math.pow(t, 1.5) + hueShift;
      const s = document.createElement("canvas");
      s.width = s.height = SPRITE_PX;
      const sc = s.getContext("2d")!;
      const c = SPRITE_PX / 2;
      const g = sc.createRadialGradient(c, c, 0, c, c, c);
      g.addColorStop(0.0, `hsla(${hue}, 100%, 88%, 1)`);
      g.addColorStop(0.16, `hsla(${hue}, 100%, 72%, 0.92)`);
      g.addColorStop(0.42, `hsla(${hue}, 100%, 60%, 0.4)`);
      g.addColorStop(1.0, `hsla(${hue}, 95%, 54%, 0)`);
      sc.fillStyle = g;
      sc.fillRect(0, 0, SPRITE_PX, SPRITE_PX);
      sprites.push(s);
    }

    const glow = document.createElement("canvas");
    glow.width = glow.height = SPRITE_PX;
    {
      const gc = glow.getContext("2d")!;
      const c = SPRITE_PX / 2;
      const g = gc.createRadialGradient(c, c, 0, c, c, c);
      g.addColorStop(0, `hsla(195, 100%, 86%, 0.95)`);
      g.addColorStop(0.4, `hsla(206, 100%, 64%, 0.28)`);
      g.addColorStop(1, `hsla(212, 100%, 56%, 0)`);
      gc.fillStyle = g;
      gc.fillRect(0, 0, SPRITE_PX, SPRITE_PX);
    }


    type Dot = {
      radius: number;
      angle: number;
      dotR: number;
      band: number;
      alpha: number;
      rNorm: number;
      seed: number;
      sizeJit: number;
    };
    let dots: Dot[] = [];
    let unitX = size / 2;
    let unitY = size / 2;
    let cssW = size;
    let cssH = size;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const easeInOut = (x: number) =>
      x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);

    function buildDots() {
      dots = [];
      const RINGS = 8;
      const RING_GAP = 0.094;
      const DOT_PITCH = 0.088;

      dots.push({
        radius: 0,
        angle: 0,
        dotR: 0.034,
        band: 0,
        alpha: 0.5,
        rNorm: 0,
        seed: Math.random() * 6.28,
        sizeJit: 1,
      });
      for (let i = 1; i < RINGS; i++) {
        const radius = i * RING_GAP;
        const rNorm = i / (RINGS - 1);
        const count = Math.max(
          6,
          Math.round((2 * Math.PI * radius) / DOT_PITCH),
        );
        const dotR = lerp(0.03, 0.082, easeInOut(rNorm));
        const band = Math.min(BANDS - 1, Math.round(rNorm * (BANDS - 1)));
        const alpha = 0.42 + 0.5 * rNorm;
        const phase = i * 0.5 + (i % 2) * (Math.PI / count);
        for (let k = 0; k < count; k++) {
          dots.push({
            radius,
            angle: phase + (k / count) * Math.PI * 2,
            dotR,
            band,
            alpha,
            rNorm,
            seed: Math.random() * 6.28,
            sizeJit: 0.9 + Math.random() * 0.2,
          });
        }
      }


      const PETALS = 16;
      const petalRadius = (RINGS - 1) * RING_GAP * 1.06;
      for (let k = 0; k < PETALS; k++) {
        dots.push({
          radius: petalRadius,
          angle: (k / PETALS) * Math.PI * 2 + 0.1,
          dotR: 0.205,
          band: BANDS - 1,
          alpha: 0.82,
          rNorm: 1,
          seed: Math.random() * 6.28,
          sizeJit: 0.95 + Math.random() * 0.1,
        });
      }

      const petalRadius2 = petalRadius * 0.8;
      for (let k = 0; k < PETALS; k++) {
        dots.push({
          radius: petalRadius2,
          angle: (k / PETALS) * Math.PI * 2 + 0.1 + Math.PI / PETALS,
          dotR: 0.15,
          band: BANDS - 2,
          alpha: 0.62,
          rNorm: 0.92,
          seed: Math.random() * 6.28,
          sizeJit: 0.92 + Math.random() * 0.14,
        });
      }
    }

    function resize() {
      const w = cv.clientWidth || cssW;
      const h = cv.clientHeight || cssH;
      if (ellipse) {

        cssW = Math.max(1, w);
        cssH = Math.max(1, h);
        unitX = (cssW / 2) * 1.18;
        unitY = (cssH / 2) * 1.18;
      } else {
        const side = Math.max(1, Math.min(w, h));
        cssW = cssH = side;
        unitX = unitY = (side / 2) * 0.78;
      }
      cv.width = Math.round(cssW * dpr);
      cv.height = Math.round(cssH * dpr);
      buildDots();
      draw(elapsed);
    }


    function draw(tSec: number) {
      const { active: act, intensity: inten } = dyn.current;
      const cx = cssW / 2;
      const cy = cssH / 2;
      const unitMin = Math.min(unitX, unitY);

      const amp = act ? 0.1 : 0.055;
      const period = act ? 4 : 6.5;
      const breathe = 1 + amp * Math.sin((tSec * 2 * Math.PI) / period);
      const baseSpin = act ? 0.1 : 0.045;
      const rot = tSec * baseSpin;
      const bright = (act ? 0.92 : 0.76) * (0.6 + 0.4 * inten);

      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, cssW, cssH);
      ctx!.globalCompositeOperation = "lighter";


      const gW = unitX * 1.1 * breathe;
      const gH = unitY * 1.1 * breathe;
      ctx!.globalAlpha = (act ? 0.5 : 0.34) * (0.6 + 0.4 * inten);
      ctx!.drawImage(glow, cx - gW / 2, cy - gH / 2, gW, gH);

      for (const d of dots) {
        const ang = d.angle + rot + d.rNorm * 0.05 * Math.sin(tSec * 0.25);
        const x = cx + Math.cos(ang) * d.radius * unitX * breathe;
        const y = cy + Math.sin(ang) * d.radius * unitY * breathe;
        const twinkle = 0.85 + 0.15 * Math.sin(tSec * 1.5 + d.seed);
        ctx!.globalAlpha = clamp01(bright * d.alpha * twinkle);
        const sz = d.dotR * unitMin * 2 * breathe * d.sizeJit;
        ctx!.drawImage(sprites[d.band], x - sz / 2, y - sz / 2, sz, sz);
      }
      ctx!.globalAlpha = 1;
    }


    let raf = 0;
    let elapsed = 0;
    let last = 0;
    let running = false;
    let visible = true;

    const frame = (now: number) => {
      if (!running) return;
      if (!last) last = now;
      elapsed += (now - last) / 1000;
      last = now;
      draw(elapsed);
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (running || reduce) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const sync = () => {
      if (visible && !document.hidden) start();
      else stop();
    };

    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e?.isIntersecting ?? true;
        sync();
      },
      { threshold: 0.01 },
    );
    io.observe(canvas);
    document.addEventListener("visibilitychange", sync);

    sync();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [size, hueShift, ellipse]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%", display: "block" }}
      aria-hidden="true"
    />
  );
}

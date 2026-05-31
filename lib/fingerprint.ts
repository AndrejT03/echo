

import { type Analysis, type ThemeKey, THEME_META, dominantTheme } from "./analysis";

export type RGB = [number, number, number];

export interface FingerprintParams {
  form: number;
  hue: number;
  warmth: number;
  brightness: number;
  amplitude: number;
  speed: number;
  complexity: number;
  seed: number;
  colA: RGB;
  colB: RGB;
  colC: RGB;
}


export const THEME_PALETTE: Record<ThemeKey, { a: RGB; b: RGB; c: RGB }> = {
  school: { a: [0.05, 0.13, 0.5], b: [0.2, 0.45, 1.0], c: [0.92, 0.25, 0.66] },
  anxiety: { a: [0.16, 0.05, 0.42], b: [0.45, 0.22, 0.98], c: [0.3, 0.8, 1.0] },
  anger: { a: [0.36, 0.03, 0.1], b: [0.96, 0.16, 0.24], c: [1.0, 0.55, 0.15] },
  sleep: { a: [0.03, 0.06, 0.26], b: [0.13, 0.2, 0.55], c: [0.52, 0.38, 0.92] },
  sadness: { a: [0.05, 0.08, 0.3], b: [0.18, 0.3, 0.64], c: [0.46, 0.62, 0.86] },
  calm: { a: [0.0, 0.24, 0.4], b: [0.0, 0.72, 0.76], c: [0.56, 0.95, 0.95] },
  loneliness: { a: [0.07, 0.12, 0.24], b: [0.24, 0.4, 0.56], c: [0.66, 0.88, 0.98] },
  joy: { a: [0.0, 0.38, 0.32], b: [0.1, 0.86, 0.48], c: [0.86, 0.96, 0.3] },
  relationships: { a: [0.45, 0.12, 0.32], b: [1.0, 0.45, 0.42], c: [1.0, 0.82, 0.45] },
  body:          { a: [0.38, 0.05, 0.14], b: [0.84, 0.14, 0.28], c: [0.56, 0.12, 0.62] },

  pride:         { a: [0.36, 0.14, 0.01], b: [0.94, 0.52, 0.06], c: [1.00, 0.86, 0.22] },
  shame:         { a: [0.13, 0.07, 0.20], b: [0.40, 0.26, 0.56], c: [0.70, 0.60, 0.80] },
  overwhelmed:   { a: [0.07, 0.09, 0.20], b: [0.26, 0.34, 0.52], c: [0.54, 0.62, 0.80] },
  excitement:    { a: [0.38, 0.16, 0.00], b: [0.98, 0.58, 0.00], c: [1.00, 0.94, 0.18] },
  disappointment:{ a: [0.09, 0.09, 0.13], b: [0.28, 0.30, 0.38], c: [0.50, 0.52, 0.60] },
  gratitude:     { a: [0.10, 0.26, 0.04], b: [0.34, 0.70, 0.14], c: [0.84, 0.90, 0.24] },
  jealousy:      { a: [0.06, 0.16, 0.00], b: [0.46, 0.64, 0.02], c: [0.90, 0.94, 0.04] },
};


const THEME_SPEED: Record<ThemeKey, number> = {
  anger: 1.9,
  excitement: 1.85,
  anxiety: 1.7,
  overwhelmed: 1.5,
  joy: 1.3,
  pride: 1.2,
  school: 1.15,
  body: 1.0,
  jealousy: 0.95,
  relationships: 0.9,
  gratitude: 0.65,
  loneliness: 0.55,
  sadness: 0.5,
  shame: 0.45,
  sleep: 0.4,
  disappointment: 0.35,
  calm: 0.3,
};


const THEME_TURB: Record<ThemeKey, number> = {
  anger: 1.0,
  anxiety: 1.0,
  overwhelmed: 0.95,
  excitement: 0.88,
  school: 0.8,
  body: 0.7,
  joy: 0.7,
  jealousy: 0.68,
  pride: 0.62,
  relationships: 0.6,
  shame: 0.52,
  loneliness: 0.5,
  sadness: 0.45,
  sleep: 0.4,
  gratitude: 0.38,
  disappointment: 0.33,
  calm: 0.3,
};


export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

export function toFingerprintParams(a: Analysis, seedKey = ""): FingerprintParams {
  const dom = dominantTheme(a);
  const form = THEME_META[dom].form;

  const s01 = (a.sentiment + 1) / 2;

  const hueDeg = 230 - a.sentiment * 20;
  const hue = hueDeg / 360;

  const i01 = a.intensity / 100;
  const warmth = a.temperature / 100;
  const brightness = 0.4 + s01 * 0.45;


  const energyMult = a.energy === "low" ? 0.85 : a.energy === "high" ? 1.15 : 1;
  const speed = THEME_SPEED[dom] * (0.85 + i01 * 0.4) * energyMult;


  const amplitude = Math.max(0.08, Math.min(1, THEME_TURB[dom] * 0.65 + i01 * 0.45));

  const complexity = Math.min(
    1,
    0.25 + a.themes.length * 0.18 + i01 * 0.45,
  );

  const key =
    seedKey ||
    `${a.themes.join(",")}|${a.sentiment.toFixed(2)}|${a.intensity}`;
  const seed = hashString(key) * 1000;


  const pal = THEME_PALETTE[dom];
  const colA: RGB = [...pal.a];
  const colB: RGB = [...pal.b];
  let colC: RGB = [...pal.c];
  const second = a.themes[1];
  if (second && second !== dom) {
    const p2 = THEME_PALETTE[second];
    colC = [
      colC[0] * 0.6 + p2.b[0] * 0.4,
      colC[1] * 0.6 + p2.b[1] * 0.4,
      colC[2] * 0.6 + p2.b[2] * 0.4,
    ];
  }

  return {
    form,
    hue,
    warmth,
    brightness,
    amplitude,
    speed,
    complexity,
    seed,
    colA,
    colB,
    colC,
  };
}

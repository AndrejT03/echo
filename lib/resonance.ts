

import { type Analysis, dominantTheme } from "./analysis";
import { hbscForTheme } from "./hbsc";
import { hashString } from "./fingerprint";


const DAILY_COHORT = 140;

export interface Resonance {
  count: number;
  primary: string;
  hbsc?: string;
}

export function computeResonance(a: Analysis, dayKey?: string): Resonance {
  const dom = dominantTheme(a);
  const theme = hbscForTheme(dom);
  const prevalence = theme?.prevalence ?? 0.2;
  const day = dayKey ?? new Date().toISOString().slice(0, 10);


  const jitter = (hashString(day + dom) - 0.5) * 0.36;

  const intensityBoost = 0.75 + (a.intensity / 100) * 0.5;

  let count = Math.round(DAILY_COHORT * prevalence * intensityBoost * (1 + jitter));
  count = Math.max(7, Math.min(220, count));

  return {
    count,
    primary: `Денес ${count} други тинејџери во Македонија чувствуваа слично како тебе.`,
    hbsc: theme?.sentence,
  };
}

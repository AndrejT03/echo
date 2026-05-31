
import data from "@/public/data/hbsc-mk.json";
import type { ThemeKey } from "./analysis";

export interface HbscIntro {
  stat: string;
  text: string;
}
export interface HbscTheme {
  prevalence: number;
  sentence: string;
}
export interface HbscData {
  source: string;
  intro: HbscIntro[];
  themes: Record<string, HbscTheme>;
}

export const HBSC = data as unknown as HbscData;

export function hbscForTheme(key: ThemeKey): HbscTheme | undefined {
  return HBSC.themes[key];
}

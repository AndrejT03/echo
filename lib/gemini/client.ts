
import { GoogleGenAI } from "@google/genai";


export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";

let client: GoogleGenAI | null = null;

export function getGemini(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!client) client = new GoogleGenAI({ apiKey });
  return client;
}

export function hasGemini(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

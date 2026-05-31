import { NextResponse } from "next/server";
import { getGemini, GEMINI_MODEL } from "@/lib/gemini/client";
import {
  SYSTEM_INSTRUCTION,
  buildPrompt,
  sanitizeAnalysis,
  localAnalyze,
} from "@/lib/analysis";

export const runtime = "nodejs";

function extractJson(s: string): string {
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) return fence[1].trim();
  const first = s.indexOf("{");
  const last = s.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    return s.slice(first, last + 1);
  }
  return s.trim();
}

export async function POST(req: Request) {
  let text = "";
  try {
    const body = await req.json();
    text = typeof body?.text === "string" ? body.text.trim() : "";
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (!text || text.length < 2) {
    return NextResponse.json({ error: "empty" }, { status: 400 });
  }

  const ai = getGemini();


  if (!ai) {
    return NextResponse.json(localAnalyze(text));
  }

  try {
    const res = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: buildPrompt(text),
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const raw = res.text ?? "";
    const parsed = JSON.parse(extractJson(raw));
    return NextResponse.json(sanitizeAnalysis(parsed, "gemini"));
  } catch (err) {
    console.error("[echo] Gemini анализа не успеа, користам локален fallback:", err);
    return NextResponse.json(localAnalyze(text));
  }
}

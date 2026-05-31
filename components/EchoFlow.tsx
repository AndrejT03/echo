"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import Fingerprint from "./Fingerprint";
import LiquidField from "./LiquidField";
import CrisisOverlay from "./CrisisOverlay";
import {
  localAnalyze,
  themeLabels,
  describeAnalysis,
  metricsFor,
  type Analysis,
} from "@/lib/analysis";
import { toFingerprintParams, type FingerprintParams } from "@/lib/fingerprint";
import { renderFingerprintPNG } from "@/lib/fingerprintGL";
import { computeResonance, type Resonance } from "@/lib/resonance";
import { saveEntry } from "@/lib/store";
import { detectCrisis } from "@/lib/crisis";
import { formatDateMK } from "@/lib/format";

type Stage = "compose" | "thinking" | "reveal";

const PLACEHOLDER =
  "Денес имав тест по математика, не спиев добро ноќва, ме боли стомак од стрес…";

const GEN_MSGS = [
  "Здивни длабоко…",
  "Се вслушувам во твоите зборови…",
  "Ги препознавам боите на денот…",
  "Го обликувам твојот отпечаток…",
];

const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

const fadeChild = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};


const cardVariant = {
  hidden: { opacity: 0, scale: 0.55, filter: "blur(14px)" },
  show: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      scale: { type: "spring" as const, stiffness: 120, damping: 16 },
      opacity: { duration: 0.5 },
      filter: { duration: 0.7 },
    },
  },
};

function CountUp({ to, duration = 1100 }: { to: number; duration?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const safety = setTimeout(() => setN(to), duration + 200);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(safety);
    };
  }, [to, duration]);
  return <>{n}</>;
}

function GeneratingText() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((p) => (p + 1) % GEN_MSGS.length), 1300);
    return () => clearInterval(id);
  }, []);
  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={i}
        className="gen-text"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.4 }}
      >
        {GEN_MSGS[i]}
      </motion.p>
    </AnimatePresence>
  );
}

export default function EchoFlow() {
  const [text, setText] = useState("");
  const [stage, setStage] = useState<Stage>("compose");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [params, setParams] = useState<FingerprintParams | null>(null);
  const [resonance, setResonance] = useState<Resonance | null>(null);
  const [createdAt, setCreatedAt] = useState("");
  const [crisis, setCrisis] = useState(false);

  const trimmed = text.trim();
  const canSubmit = trimmed.length >= 3 && stage === "compose";

  async function handleSubmit() {
    if (trimmed.length < 3) return;
    if (detectCrisis(trimmed)) setCrisis(true);
    setStage("thinking");

    const minWait = new Promise((r) => setTimeout(r, 3600));
    const work = (async (): Promise<Analysis> => {
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: trimmed }),
        });
        if (!res.ok) throw new Error("bad");
        const data = (await res.json()) as Analysis;
        if (typeof data.sentiment !== "number" || !Array.isArray(data.themes)) {
          throw new Error("shape");
        }
        return data;
      } catch {
        return localAnalyze(trimmed);
      }
    })();

    const [result] = await Promise.all([work, minWait]);
    const entry = saveEntry(trimmed, result);

    setAnalysis(result);
    setParams(toFingerprintParams(result, entry.id));
    setResonance(computeResonance(result, entry.createdAt.slice(0, 10)));
    setCreatedAt(entry.createdAt);
    setStage("reveal");
  }

  function reset() {
    setStage("compose");
    setText("");
    setAnalysis(null);
    setParams(null);
    setResonance(null);
    setCreatedAt("");
  }

  function download() {
    if (!params || !createdAt) return;
    const data = renderFingerprintPNG(params, 1080, 16);
    const a = document.createElement("a");
    a.href = data;
    a.download = `echo-${createdAt.slice(0, 10)}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  const labels = analysis ? themeLabels(analysis) : [];
  const insight = analysis ? describeAnalysis(analysis) : null;

  return (
    <main className="flow">
      <div className="container flow-inner">
        <AnimatePresence>
          {stage === "compose" && (
            <motion.section
              key="compose"
              className="compose"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14, filter: "blur(6px)" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="eyebrow">
                <span className="ln" /> внес за денес
              </div>
              <h1>
                Како се чувствуваш <span className="text-grad">денес</span>?
              </h1>
              <p className="lead">
                Без проценки. Без совети. Само ти и денешниот ден — во неколку
                реченици.
              </p>

              <div className="compose-stage">
                <div className="compose-glow" aria-hidden="true" />
                <div className="compose-box glass">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={PLACEHOLDER}
                    maxLength={1200}
                    autoFocus
                    onKeyDown={(e) => {
                      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                        handleSubmit();
                      }
                    }}
                  />
                </div>
              </div>

              <div className="compose-row">
                <span className="count mono">{text.length} / 1200</span>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                >
                  Создади отпечаток →
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {stage === "thinking" && (
            <motion.div
              key="liquid"
              className="gen-liquid"
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{
                opacity: 0,
                scale: 0.24,
                filter: "blur(16px)",
                transition: { duration: 0.9, ease: [0.7, 0, 0.2, 1] },
              }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <LiquidField intensity={0.95} />
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {stage === "thinking" && (
            <motion.div
              key="cap"
              className="gen-caption"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.25 } }}
              transition={{ delay: 0.35, duration: 0.7 }}
            >
              <GeneratingText />
              <div className="gen-dots">
                <span />
                <span />
                <span />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {stage === "reveal" && params && analysis && resonance && (
            <motion.section
              key="reveal"
              className="reveal"
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, transition: { duration: 0.25 } }}
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.09, delayChildren: 0.25 } },
              }}
            >
              <motion.header className="reveal-head" variants={fadeChild}>
                <div className="date">{formatDateMK(createdAt)}</div>
                <h2 className="themes-title">{cap(labels[0])}</h2>
                {labels.length > 1 && (
                  <div className="chips">
                    {labels.slice(1).map((l) => (
                      <span key={l} className="chip">
                        {l}
                      </span>
                    ))}
                  </div>
                )}
              </motion.header>

              <motion.div className="print-frame" variants={cardVariant}>
                <Fingerprint params={params} />
              </motion.div>

              <div className="reveal-info">
                <div className="reveal-glow" aria-hidden="true" />
                {insight && (
                  <motion.p className="insight" variants={fadeChild}>
                    {insight.summary}
                  </motion.p>
                )}

                <motion.div className="metrics" variants={fadeChild}>
                  {metricsFor(analysis).map((m, i) => (
                    <div key={m.label} className="metric glass">
                      <span className="ml">{m.label}</span>
                      <span className="mv-word">{m.value}</span>
                      <div className="mbar">
                        <motion.div
                          className="mbar-fill"
                          style={{ width: `${m.pct}%` }}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{
                            duration: 0.8,
                            delay: 0.7 + i * 0.08,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                        />
                      </div>
                      <span className="mhint">{m.hint}</span>
                    </div>
                  ))}
                </motion.div>

                <motion.div className="resonance" variants={fadeChild}>
                  <p className="big">
                    Денес{" "}
                    <b className="text-grad-soft">
                      <CountUp to={resonance.count} />
                    </b>{" "}
                    други тинејџери во Македонија чувствуваа слично како тебе.
                  </p>
                  {resonance.hbsc && <p className="hbsc">{resonance.hbsc}</p>}
                  {insight && <p className="insight-note">{insight.note}</p>}
                </motion.div>

                <motion.div className="reveal-actions" variants={fadeChild}>
                  <button className="btn btn-primary" onClick={reset}>
                    Нов внес
                  </button>
                  <button className="btn btn-ghost" onClick={download}>
                    Зачувај слика
                  </button>
                  <Link href="/galerija" className="btn btn-ghost">
                    Галерија
                  </Link>
                </motion.div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {crisis && <CrisisOverlay onClose={() => setCrisis(false)} />}
      </AnimatePresence>
    </main>
  );
}

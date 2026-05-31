"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import FingerprintThumb from "./FingerprintThumb";
import Fingerprint from "./Fingerprint";
import { loadEntries, deleteEntry, type Entry } from "@/lib/store";
import { toFingerprintParams } from "@/lib/fingerprint";
import { renderFingerprintPNG } from "@/lib/fingerprintGL";
import { themeLabels } from "@/lib/analysis";
import { formatDateMK, shortDateMK, monthMK } from "@/lib/format";

export default function Gallery() {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    setEntries(loadEntries());
  }, []);

  const groups = useMemo(() => {
    if (!entries) return [];
    const map = new Map<string, { label: string; items: Entry[] }>();
    for (const e of entries) {
      const d = new Date(e.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!map.has(key)) {
        map.set(key, {
          label: `${monthMK(d.getMonth())} ${d.getFullYear()}`,
          items: [],
        });
      }
      map.get(key)!.items.push(e);
    }
    return [...map.values()];
  }, [entries]);

  const active = entries?.find((e) => e.id === activeId) ?? null;

  function handleDelete(id: string) {
    deleteEntry(id);
    setEntries((prev) => (prev ? prev.filter((e) => e.id !== id) : prev));
    setActiveId(null);
  }

  function download(e: Entry) {
    const data = renderFingerprintPNG(
      toFingerprintParams(e.analysis, e.id),
      1080,
      16,
    );
    const a = document.createElement("a");
    a.href = data;
    a.download = `echo-${e.createdAt.slice(0, 10)}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  if (entries === null) {
    return (
      <main className="gallery">
        <div className="container" />
      </main>
    );
  }

  return (
    <main className="gallery">
      <div className="container">
        <div className="gallery-head">
          <div>
            <h1>
              Твоите <span className="text-grad">отпечатоци</span>
            </h1>
            <p className="sub">
              Визуелен дневник без зборови — {entries.length}{" "}
              {entries.length === 1 ? "ден" : "дена"}.
            </p>
          </div>
          <Link href="/odraz" className="btn btn-vivid btn-lg">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{flexShrink:0}}>
              <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Нов отпечаток
          </Link>
        </div>

        {entries.length === 0 ? (
          <div className="empty glass">
            <div className="orb-wrap" aria-hidden="true">
              <div className="orb" />
            </div>
            <h2>Сè уште нема ниту еден отпечаток</h2>
            <p>
              Запиши 2–3 реченици за денес — и гледај како твоите денови
              добиваат форма, боја и значење.
            </p>
            <Link href="/odraz" className="btn btn-vivid btn-lg">
              <svg width="15" height="15" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{flexShrink:0}}>
                <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Создади прв отпечаток
            </Link>
          </div>
        ) : (
          groups.map((g) => (
            <section key={g.label} style={{ marginBottom: "2.6rem" }}>
              <h2 className="month-label">{g.label}</h2>
              <div className="grid">
                {g.items.map((e) => (
                  <motion.button
                    key={e.id}
                    className="cell"
                    onClick={() => setActiveId(e.id)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "0px 0px -40px 0px" }}
                    transition={{ duration: 0.4 }}
                  >
                    <FingerprintThumb
                      params={toFingerprintParams(e.analysis, e.id)}
                      alt={`Отпечаток од ${formatDateMK(e.createdAt)}`}
                    />
                    <div className="cell-meta">
                      <div className="d mono">{shortDateMK(e.createdAt)}</div>
                      <div className="t">{themeLabels(e.analysis)[0]}</div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            className="detail-backdrop"
            onClick={() => setActiveId(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="detail-card glass"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 24 }}
            >
              <div className="detail-print">
                <Fingerprint params={toFingerprintParams(active.analysis, active.id)} />
              </div>
              <div className="detail-body">
                <div className="date">{formatDateMK(active.createdAt)}</div>
                <div className="themes">
                  {themeLabels(active.analysis).join(" · ")}
                </div>
                <p className="quote">„{active.text}“</p>
              </div>
              <div className="detail-actions">
                <button
                  className="btn btn-ghost"
                  onClick={() => handleDelete(active.id)}
                >
                  Избриши
                </button>
                <div style={{ display: "flex", gap: "0.6rem" }}>
                  <button className="btn btn-ghost" onClick={() => download(active)}>
                    Слика
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => setActiveId(null)}
                  >
                    Затвори
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

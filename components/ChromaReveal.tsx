"use client";

import { useEffect } from "react";


const SELECTOR =
  ".text-grad, .text-grad-soft, .chroma, .reveal-head .date, " +
  ".sec-label .num, .step .idx, .detail-body .date, .help-line .phone, .chip";

export default function ChromaReveal() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) return;

    const seen = new WeakSet<Element>();

    const play = (el: HTMLElement) => {
      el.classList.remove("chroma-in");

      void el.offsetWidth;
      el.classList.add("chroma-in");
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) play(e.target as HTMLElement);
        }
      },
      { threshold: 0.35 },
    );

    const scan = () => {
      document.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
        if (!seen.has(el)) {
          seen.add(el);
          io.observe(el);
        }
      });
    };

    scan();
    const mo = new MutationObserver(() => scan());
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}

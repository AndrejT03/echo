"use client";

import { motion } from "motion/react";
import { HELPLINES } from "@/lib/crisis";

export default function CrisisOverlay({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      className="crisis-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        className="crisis-card glass"
        initial={{ scale: 0.92, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
      >
        <h3>Ти не си сам во ова.</h3>
        <p>
          Звучи дека денес носиш нешто навистина тешко. Не мораш да го носиш
          сам — има луѓе што сакаат да те ислушаат, во секое време.
        </p>
        {HELPLINES.map((h) => (
          <div className="help-line" key={h.name}>
            <div>
              <div className="name">{h.name}</div>
              <div className="detail">{h.detail}</div>
            </div>
            {h.phone && (
              <a className="phone" href={`tel:${h.phone.replace(/\s/g, "")}`}>
                {h.phone}
              </a>
            )}
          </div>
        ))}
        <button
          className="btn btn-ghost"
          style={{ marginTop: "1.1rem", width: "100%" }}
          onClick={onClose}
        >
          Продолжи кон мојот отпечаток
        </button>
      </motion.div>
    </motion.div>
  );
}

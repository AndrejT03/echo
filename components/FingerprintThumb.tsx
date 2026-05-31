"use client";

import { useEffect, useState } from "react";
import { renderFingerprintPNG } from "@/lib/fingerprintGL";
import type { FingerprintParams } from "@/lib/fingerprint";

interface Props {
  params: FingerprintParams;
  size?: number;
  time?: number;
  alt?: string;
  className?: string;
}


export default function FingerprintThumb({
  params,
  size = 480,
  time = 14,
  alt = "",
  className,
}: Props) {
  const [src, setSrc] = useState("");

  useEffect(() => {


    setSrc(renderFingerprintPNG(params, size, time));
  }, [
    params.form,
    params.hue,
    params.warmth,
    params.brightness,
    params.amplitude,
    params.complexity,
    params.seed,
    size,
    time,
  ]);

  if (!src) {
    return <div className={className} style={{ background: "#070b1f" }} />;
  }
  return (
    <img src={src} alt={alt} className={className} draggable={false} />
  );
}

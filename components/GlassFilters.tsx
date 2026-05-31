"use client";

import { useEffect, useState } from "react";


function makeDisplacementMap(size = 160, power = 3.2): string {
  if (typeof document === "undefined") return "";
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  if (!ctx) return "";
  const img = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = (x / (size - 1)) * 2 - 1;
      const ny = (y / (size - 1)) * 2 - 1;
      const ex = Math.sign(nx) * Math.pow(Math.abs(nx), power);
      const ey = Math.sign(ny) * Math.pow(Math.abs(ny), power);
      const i = (y * size + x) * 4;
      img.data[i] = 128 + ex * 127;
      img.data[i + 1] = 128 + ey * 127;
      img.data[i + 2] = 128;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL();
}

const RED = "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0";
const GREEN = "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0";
const BLUE = "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0";


export default function GlassFilters() {
  const [map, setMap] = useState("");
  useEffect(() => {
    setMap(makeDisplacementMap());
  }, []);

  return (
    <svg
      aria-hidden="true"
      width="0"
      height="0"
      style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }}
    >
      <defs>
        <filter
          id="liquid-glass"
          x="-30%"
          y="-30%"
          width="160%"
          height="160%"
          colorInterpolationFilters="sRGB"
        >
          {map && (
            <feImage
              href={map}
              x="0"
              y="0"
              width="100%"
              height="100%"
              preserveAspectRatio="none"
              result="map"
            />
          )}
          <feDisplacementMap
            in="SourceGraphic"
            in2="map"
            scale="20"
            xChannelSelector="R"
            yChannelSelector="G"
            result="dR"
          />
          <feColorMatrix in="dR" type="matrix" values={RED} result="cR" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="map"
            scale="14"
            xChannelSelector="R"
            yChannelSelector="G"
            result="dG"
          />
          <feColorMatrix in="dG" type="matrix" values={GREEN} result="cG" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="map"
            scale="8"
            xChannelSelector="R"
            yChannelSelector="G"
            result="dB"
          />
          <feColorMatrix in="dB" type="matrix" values={BLUE} result="cB" />
          <feBlend in="cR" in2="cG" mode="screen" result="rg" />
          <feBlend in="rg" in2="cB" mode="screen" />
        </filter>

        <filter
          id="screen-chroma"
          x="0"
          y="0"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          {map && (
            <feImage
              href={map}
              x="0"
              y="0"
              width="100%"
              height="100%"
              preserveAspectRatio="none"
              result="m"
            />
          )}
          <feDisplacementMap
            in="SourceGraphic"
            in2="m"
            scale="3"
            xChannelSelector="R"
            yChannelSelector="G"
            result="r"
          />
          <feColorMatrix in="r" type="matrix" values={RED} result="sr" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="m"
            scale="-3"
            xChannelSelector="R"
            yChannelSelector="G"
            result="b"
          />
          <feColorMatrix in="b" type="matrix" values={BLUE} result="sb" />
          <feColorMatrix in="SourceGraphic" type="matrix" values={GREEN} result="sg" />
          <feBlend in="sr" in2="sg" mode="screen" result="srg" />
          <feBlend in="srg" in2="sb" mode="screen" />
        </filter>
      </defs>
    </svg>
  );
}

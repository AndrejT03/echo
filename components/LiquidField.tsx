"use client";

import { useEffect, useRef } from "react";

export interface LiquidFieldProps {

  intensity?: number;

  hueShift?: number;
  className?: string;
}

const VERT = `
attribute vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }
`;


const FRAG = `
#extension GL_OES_standard_derivatives : enable
precision highp float;
uniform vec2  uRes;
uniform float uTime;
uniform float uIntensity;
uniform float uHue;

float hash(vec2 p){ p = fract(p*vec2(123.34,345.45)); p += dot(p,p+34.345); return fract(p.x*p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f*f*(3.0-2.0*f);
  float a = hash(i), b = hash(i+vec2(1.0,0.0));
  float c = hash(i+vec2(0.0,1.0)), d = hash(i+vec2(1.0,1.0));
  return mix(mix(a,b,f.x), mix(c,d,f.x), f.y);
}
const mat2 M = mat2(1.6, 1.2, -1.2, 1.6);
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for(int i=0;i<5;i++){ v += a*noise(p); p = M*p; a *= 0.5; }
  return v;
}
float height(vec2 p, float t){
  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t*0.7));
  vec2 r = vec2(fbm(p + 1.8*q + vec2(1.7, 9.2) + t*0.5),
                fbm(p + 1.8*q + vec2(8.3, 2.8) - t*0.4));
  return fbm(p + 2.0*r + t*0.25);
}
vec3 iri(vec3 x){ return 0.5 + 0.5*cos(6.2831853*x); }

void main(){
  vec2 p = (gl_FragCoord.xy - 0.5*uRes) / min(uRes.x, uRes.y);
  p *= 1.5;
  float t = uTime * (0.05 + uIntensity*0.08);

  float h = height(p, t);


  float strength = 7.0;
  vec3 N = normalize(vec3(-dFdx(h)*strength, -dFdy(h)*strength, 1.0));
  vec3 L = normalize(vec3(0.55, 0.6, 0.85));
  vec3 V = vec3(0.0, 0.0, 1.0);
  vec3 Hh = normalize(L + V);
  float diff = 0.45 + 0.55*max(dot(N, L), 0.0);
  float spec = pow(max(dot(N, Hh), 0.0), 24.0);


  float ph = h*1.25 + N.x*0.4 - N.y*0.22 + uHue*0.16;
  vec3 col = iri(vec3(ph) + vec3(0.0, 0.33, 0.67));
  col = mix(col, vec3(1.0, 0.16, 0.5), 0.16);
  col = pow(max(col, 0.0), vec3(0.82));

  col *= diff;
  col += spec * vec3(1.0, 0.96, 0.95) * 1.2;

  float crev = smoothstep(0.0, 0.5, h);
  col *= mix(0.26, 1.0, crev);

  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(vec3(lum), col, 1.32);

  float mx = max(max(col.r, col.g), col.b);
  col /= max(1.0, mx);

  float vig = smoothstep(1.45, 0.1, length(p));
  col *= mix(0.5, 1.05, vig);

  gl_FragColor = vec4(max(col, 0.0), 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error("LiquidField shader error: " + log);
  }
  return sh;
}

export default function LiquidField({
  intensity = 0.5,
  hueShift = 0,
  className,
}: LiquidFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dyn = useRef({ intensity, hueShift });
  dyn.current = { intensity, hueShift };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cv = canvas;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);

    const attribs: WebGLContextAttributes = {
      antialias: false,
      alpha: false,
      preserveDrawingBuffer: true,
    };
    const gl = (cv.getContext("webgl", attribs) ||
      cv.getContext("experimental-webgl", attribs)) as WebGLRenderingContext | null;
    if (!gl) return;

    gl.getExtension("OES_standard_derivatives");

    let program: WebGLProgram | null = null;
    let vs: WebGLShader | null = null;
    let fs: WebGLShader | null = null;
    try {
      program = gl.createProgram()!;
      vs = compile(gl, gl.VERTEX_SHADER, VERT);
      fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    } catch {
      return;
    }
    gl.useProgram(program);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "uRes");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uIntensity = gl.getUniformLocation(program, "uIntensity");
    const uHue = gl.getUniformLocation(program, "uHue");

    const draw = (tSec: number) => {
      const { intensity: inten, hueShift: hs } = dyn.current;
      gl.uniform2f(uRes, cv.width, cv.height);
      gl.uniform1f(uTime, tSec);
      gl.uniform1f(uIntensity, inten);
      gl.uniform1f(uHue, (hs * Math.PI) / 180);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const resize = () => {
      const w = Math.max(1, Math.round((cv.clientWidth || 320) * dpr));
      const h = Math.max(1, Math.round((cv.clientHeight || 320) * dpr));
      if (cv.width !== w || cv.height !== h) {
        cv.width = w;
        cv.height = h;
        gl.viewport(0, 0, w, h);
      }
      draw(elapsed);
    };

    let raf = 0;
    let elapsed = 0;
    let last = 0;
    let running = false;
    let visible = true;

    const frame = (now: number) => {
      if (!running) return;
      if (!last) last = now;
      elapsed += (now - last) / 1000;
      last = now;
      draw(elapsed);
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (running || reduce) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const sync = () => {
      if (visible && !document.hidden) start();
      else stop();
    };

    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(cv);
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e?.isIntersecting ?? true;
        sync();
      },
      { threshold: 0.01 },
    );
    io.observe(cv);
    document.addEventListener("visibilitychange", sync);
    sync();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      gl.deleteBuffer(buf);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%", display: "block" }}
      aria-hidden="true"
    />
  );
}

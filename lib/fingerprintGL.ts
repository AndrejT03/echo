


import type { FingerprintParams } from "./fingerprint";

const VERT = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;

uniform vec2  uRes;
uniform float uTime;
uniform float uForm;
uniform float uHue;
uniform float uWarmth;
uniform float uBright;
uniform float uAmp;
uniform float uComplexity;
uniform float uSeed;
uniform vec3  uColA;
uniform vec3  uColB;
uniform vec3  uColC;

float hash21(vec2 p){
  p = fract(p * vec2(123.34, 345.45));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f*f*(3.0-2.0*f);
  float a = hash21(i), b = hash21(i+vec2(1.0,0.0));
  float c = hash21(i+vec2(0.0,1.0)), d = hash21(i+vec2(1.0,1.0));
  return mix(mix(a,b,f.x), mix(c,d,f.x), f.y);
}
const mat2 MM = mat2(1.6, 1.2, -1.2, 1.6);
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for(int i=0;i<5;i++){ v += a*vnoise(p); p = MM*p; a *= 0.5; }
  return v;
}
vec3 hsv2rgb(vec3 c){
  vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  rgb = rgb * rgb * (3.0 - 2.0 * rgb);
  return c.z * mix(vec3(1.0), rgb, c.y);
}
vec3 hueRot(vec3 col, float a){
  const vec3 k = vec3(0.57735);
  float c = cos(a), s = sin(a);
  return col * c + cross(k, col) * s + k * dot(k, col) * (1.0 - c);
}


void formTraits(out float freq, out float contrast, out float lift){
  int form = int(uForm + 0.5);
  if      (form ==  0) { freq = 1.35; contrast = 1.18; lift =  0.00; }
  else if (form ==  1) { freq = 0.85; contrast = 0.90; lift =  0.04; }
  else if (form ==  2) { freq = 1.00; contrast = 1.10; lift = -0.08; }
  else if (form ==  3) { freq = 1.10; contrast = 1.05; lift =  0.10; }
  else if (form ==  4) { freq = 1.15; contrast = 1.00; lift =  0.00; }
  else if (form ==  5) { freq = 1.22; contrast = 1.20; lift =  0.12; }
  else if (form ==  6) { freq = 0.88; contrast = 1.12; lift = -0.06; }
  else if (form ==  7) { freq = 1.38; contrast = 1.20; lift = -0.02; }
  else if (form ==  8) { freq = 1.28; contrast = 1.22; lift =  0.08; }
  else if (form ==  9) { freq = 0.78; contrast = 0.85; lift = -0.04; }
  else if (form == 10) { freq = 0.72; contrast = 0.92; lift =  0.09; }
  else                 { freq = 1.08; contrast = 1.10; lift = -0.02; }
}

void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / min(uRes.x, uRes.y);
  float t = uTime;

  float freq, contrast, lift;
  formTraits(freq, contrast, lift);


  float zoom = (1.05 + uComplexity * 0.6) * freq;
  zoom *= 0.82 + fract(uSeed * 1.37) * 0.42;
  float sa = uSeed * 0.7;
  mat2 rot = mat2(cos(sa), -sin(sa), sin(sa), cos(sa));
  vec2 p = (rot * uv) * zoom + uSeed * 0.137;


  float flow = 0.05 + uComplexity * 0.05;
  float warpAmt = 0.55 + uAmp * 1.25;


  vec2 q = vec2(fbm(p + t * flow),
                fbm(p + vec2(5.2, 1.3) - t * flow * 0.8));
  vec2 r = vec2(fbm(p + warpAmt * q + vec2(1.7, 9.2) + t * flow * 1.2),
                fbm(p + warpAmt * q + vec2(8.3, 2.8) - t * flow * 1.0));
  float depth = length(r);


  int form = int(uForm + 0.5);
  float f;
  if (form == 0) {

    vec2 fp = p + warpAmt * r;
    fp.y -= t * (0.4 + uAmp * 0.7);
    float n = fbm(fp + 0.6 * q);
    f = 1.0 - abs(2.0 * n - 1.0);
    f = pow(clamp(f, 0.0, 1.0), 1.5);
  } else if (form == 1) {

    f = fbm(p * 0.8 + 1.2 * r + t * flow * 0.4);
    f = smoothstep(0.18, 0.82, f);
  } else if (form == 2) {

    float c = fbm(p * 1.05 + warpAmt * r + t * flow * 0.4);
    f = smoothstep(0.55, 0.86, c);
  } else if (form == 3) {

    float ang = atan(uv.y, uv.x);
    float rad = length(uv);
    float petals = 0.5 + 0.5 * cos(ang * 5.0 - t * 0.3);
    float radial = 0.5 + 0.5 * sin(rad * 4.5 - t * 0.8);
    f = mix(fbm(p + warpAmt * r), petals * radial, 0.5);
    f = smoothstep(0.1, 0.9, f);
  } else if (form == 4) {

    float rad = length(uv * 1.15);
    float rings = 0.5 + 0.5 * sin(rad * 6.5 - t * 2.0);
    f = mix(fbm(p + warpAmt * r), rings, 0.4);
  } else if (form == 5) {

    float ang = atan(uv.y, uv.x);
    float rad = length(uv);
    float burst = pow(max(0.0, 0.5 + 0.5 * cos(ang * 8.0 - t * 0.45)), 3.5);
    float rise  = smoothstep(0.95, 0.0, rad - burst * 0.52);
    f = mix(fbm(p + warpAmt * r), rise, 0.65);
    f = smoothstep(0.06, 0.92, f);
  } else if (form == 6) {

    float ang = atan(uv.y, uv.x) + t * 0.14;
    float rad = length(uv);
    float spiral = 0.5 + 0.5 * sin(ang * 3.0 - rad * 6.5 + uSeed);
    float fade   = 1.0 - smoothstep(0.0, 0.88, rad);
    f = mix(fbm(p * 0.9 + warpAmt * r * 0.65) * fade, spiral * fade, 0.55);
    f = smoothstep(0.18, 0.76, f);
  } else if (form == 7) {

    float n1 = fbm(p * 1.30 + warpAmt * r + t * flow * 1.10);
    float n2 = fbm(p * 0.75 + warpAmt * q - t * flow * 0.80 + vec2(3.14, 2.72));
    float n3 = fbm(p * 1.65 - warpAmt * r * 0.55 + t * flow * 1.35 + vec2(6.28, 1.41));
    f = n1 * 0.42 + n2 * 0.34 + n3 * 0.24;
    f = smoothstep(0.28, 0.72, f);
  } else if (form == 8) {

    float ang = atan(uv.y, uv.x);
    float rad = length(uv);
    float rays = pow(max(0.0, abs(cos(ang * 6.0 + t * 1.80))), 5.5);
    float spark = smoothstep(0.75, 0.0, rad * 1.15 - rays * 0.52);
    f = mix(fbm(p + warpAmt * r + t * flow * 1.55), spark, 0.72);
    f = smoothstep(0.04, 0.90, f);
  } else if (form == 9) {

    float n = fbm((p + warpAmt * r * 0.58 + vec2(0.0, t * (0.11 + uAmp * 0.17))) * vec2(1.10, 0.52));
    float droop = smoothstep(-0.45, 0.55, uv.y) * 0.32;
    f = smoothstep(0.30, 0.72, n) * (0.66 + droop);
  } else if (form == 10) {

    float rad    = length(uv);
    float halo   = exp(-rad * 2.20) * 0.58 + exp(-rad * 0.72) * 0.42;
    float rings  = 0.5 + 0.5 * sin(rad * 4.80 - t * 0.48);
    f = mix(fbm(p * 0.52 + warpAmt * r * 0.38), rings * halo, 0.66);
    f = smoothstep(0.06, 0.88, f);
  } else {

    float ang  = atan(uv.y, uv.x) - t * 0.26;
    float rad  = length(uv);
    float arm  = 0.5 + 0.5 * sin(ang * 3.0 + rad * 5.50 + uSeed);
    float mask = smoothstep(1.08, 0.0, rad);
    f = mix(fbm(p + warpAmt * r), arm * mask, 0.58);
    f = smoothstep(0.12, 0.84, f);
  }
  f = clamp((f - 0.5) * contrast + 0.5, 0.0, 1.0);


  vec3 col = mix(uColA, uColB, smoothstep(0.04, 0.55, f));
  col = mix(col, uColC, smoothstep(0.58, 0.97, f));
  col = mix(col, uColA, smoothstep(0.15, 0.95, depth) * 0.34);

  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(vec3(lum), col, 1.18);

  col = hueRot(col, (fract(uSeed * 0.31) - 0.5) * 0.5);


  float bands = abs(fract(f * 3.0 + depth) - 0.5) * 2.0;
  float sheen = smoothstep(0.8, 0.99, 1.0 - bands);
  col += sheen * (0.13 + 0.07 * uAmp) * vec3(0.9, 0.96, 1.0);


  col += smoothstep(0.64, 0.96, f) * 0.13 * vec3(0.86, 0.95, 1.0);


  col *= (0.78 + uBright * 0.55 + lift);


  float mx = max(max(col.r, col.g), col.b);
  col /= max(1.0, mx);


  float vig = smoothstep(1.42, 0.12, length(uv));
  col *= mix(0.5, 1.08, vig);


  col += (hash21(gl_FragCoord.xy + uTime) * 2.0 - 1.0) * 0.01;

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
    throw new Error("Shader compile error: " + log);
  }
  return sh;
}

type Uniforms =
  | "uRes" | "uTime" | "uForm" | "uHue" | "uWarmth"
  | "uBright" | "uAmp" | "uComplexity" | "uSeed"
  | "uColA" | "uColB" | "uColC";

export interface FingerprintRenderer {
  render(params: FingerprintParams, timeSec: number): void;
  resize(w: number, h: number): void;
  dispose(): void;
  readonly gl: WebGLRenderingContext;
}

export function createRenderer(
  canvas: HTMLCanvasElement,
  opts: { preserveDrawingBuffer?: boolean } = {},
): FingerprintRenderer | null {
  const attribs: WebGLContextAttributes = {
    antialias: true,
    alpha: false,
    preserveDrawingBuffer: opts.preserveDrawingBuffer ?? false,
  };
  const gl =
    (canvas.getContext("webgl", attribs) ||
      canvas.getContext("experimental-webgl", attribs)) as WebGLRenderingContext | null;
  if (!gl) return null;

  const program = gl.createProgram()!;
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error("Program link error: " + gl.getProgramInfoLog(program));
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

  const u: Record<Uniforms, WebGLUniformLocation | null> = {
    uRes: gl.getUniformLocation(program, "uRes"),
    uTime: gl.getUniformLocation(program, "uTime"),
    uForm: gl.getUniformLocation(program, "uForm"),
    uHue: gl.getUniformLocation(program, "uHue"),
    uWarmth: gl.getUniformLocation(program, "uWarmth"),
    uBright: gl.getUniformLocation(program, "uBright"),
    uAmp: gl.getUniformLocation(program, "uAmp"),
    uComplexity: gl.getUniformLocation(program, "uComplexity"),
    uSeed: gl.getUniformLocation(program, "uSeed"),
    uColA: gl.getUniformLocation(program, "uColA"),
    uColB: gl.getUniformLocation(program, "uColB"),
    uColC: gl.getUniformLocation(program, "uColC"),
  };

  return {
    gl,
    resize(w: number, h: number) {
      canvas.width = Math.max(1, Math.floor(w));
      canvas.height = Math.max(1, Math.floor(h));
      gl.viewport(0, 0, canvas.width, canvas.height);
    },
    render(p: FingerprintParams, timeSec: number) {
      gl.useProgram(program);
      gl.uniform2f(u.uRes, canvas.width, canvas.height);
      gl.uniform1f(u.uTime, timeSec * p.speed);
      gl.uniform1f(u.uForm, p.form);
      gl.uniform1f(u.uHue, p.hue);
      gl.uniform1f(u.uWarmth, p.warmth);
      gl.uniform1f(u.uBright, p.brightness);
      gl.uniform1f(u.uAmp, p.amplitude);
      gl.uniform1f(u.uComplexity, p.complexity);
      gl.uniform1f(u.uSeed, p.seed);
      gl.uniform3fv(u.uColA, p.colA);
      gl.uniform3fv(u.uColB, p.colB);
      gl.uniform3fv(u.uColC, p.colC);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() {


      gl.deleteBuffer(buf);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    },
  };
}


let offCanvas: HTMLCanvasElement | null = null;
let offRenderer: FingerprintRenderer | null = null;

export function renderFingerprintPNG(
  params: FingerprintParams,
  size = 480,
  timeSec = 0,
): string {
  if (typeof document === "undefined") return "";
  if (!offCanvas) offCanvas = document.createElement("canvas");
  if (!offRenderer) {
    offRenderer = createRenderer(offCanvas, { preserveDrawingBuffer: true });
  }
  if (!offRenderer) return "";
  offRenderer.resize(size, size);
  offRenderer.render(params, timeSec);
  return offCanvas.toDataURL("image/png");
}

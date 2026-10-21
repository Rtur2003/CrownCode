// The AURIS planet when it wears a track. Same lacquer, same engraved contour
// lines as the atlas worlds (components/Home/Atlas/shaders.ts), but where an atlas
// world derives its pattern from noise, this one reads it from a data texture
// built by trackSurface.ts:
//   R  energy       raises the ground and sets the contour levels
//   G  lean         128 neutral; above it the models leaned AI, below it human
//   B  ring         strength of a repeated-peak ring on that band
// u (around) is time, v (pole to pole) is pitch. uMix fades the track in over the
// procedural planet, and uScan is the front of that fade: the surface is written
// from the first meridian eastward, like a record being cut.

import { NOISE } from '@/components/Home/Atlas/shaders'

export const trackPlanetVertex = /* glsl */ `
  uniform sampler2D uTex;
  uniform float uRelief;
  uniform float uMix;
  uniform float uScan;
  varying vec3 vObj;
  varying vec3 vNormalW;
  varying vec3 vViewW;
  varying vec3 vWorld;
  varying vec2 vUv;

  float revealAt(float u) { return 1.0 - smoothstep(uScan - 0.06, uScan, u); }

  void main() {
    vUv = uv;
    float pole = smoothstep(0.0, 0.08, uv.y) * smoothstep(1.0, 0.92, uv.y);
    float h = texture2D(uTex, uv).r;
    float shown = uMix * revealAt(uv.x) * pole;
    vec3 displaced = position + normal * h * uRelief * shown;
    vObj = normalize(position);
    vec4 world = modelMatrix * vec4(displaced, 1.0);
    vWorld = world.xyz;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vViewW = normalize(cameraPosition - world.xyz);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

export const trackPlanetFragment = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uMid;
  uniform vec3 uAccent;
  uniform vec3 uAtmo;
  uniform vec3 uLight;
  uniform vec3 uAi;
  uniform vec3 uHuman;
  uniform float uBands;
  uniform float uDetail;
  uniform float uLines;
  uniform float uSeed;
  uniform float uFocus;
  uniform sampler2D uTex;
  uniform float uMix;
  uniform float uScan;
  uniform float uSpan;
  uniform float uTick;
  uniform float uRows;
  uniform float uRelief;
  uniform float uBump;
  uniform float uProbe;
  uniform float uPlay;
  varying vec3 vObj;
  varying vec3 vNormalW;
  varying vec3 vViewW;
  varying vec3 vWorld;
  varying vec2 vUv;
  ${NOISE}

  float revealAt(float u) { return 1.0 - smoothstep(uScan - 0.06, uScan, u); }

  // The wrap from u = 1 back to 0 makes fwidth(u) jump; take the smaller of
  // the two readings so lines along the seam stay thin.
  float fwU() { return min(fwidth(vUv.x), fwidth(fract(vUv.x + 0.5))); }

  float needle(float at, float w) {
    float du = abs(vUv.x - at);
    du = min(du, 1.0 - du);
    return 1.0 - smoothstep(0.0, w * 2.0 + 0.0012, du);
  }

  void main() {
    vec3 p = vObj;
    float n = fbm(p * uDetail + uSeed);
    float warp = fbm(p * uDetail * 0.5 - uSeed);
    float lat = p.y + (warp - 0.5) * 0.45;
    float band = 0.5 + 0.5 * sin(lat * 18.0 + n * 4.0 + uSeed);
    float proc = mix(n, band, uBands);

    vec4 d = texture2D(uTex, vUv);
    float pole = smoothstep(0.0, 0.08, vUv.y) * smoothstep(1.0, 0.92, vUv.y);
    float m = uMix * revealAt(vUv.x) * pole;
    float energy = d.r;
    float lean = d.g * 2.0 - 1.0;
    float ring = d.b;

    float pattern = mix(proc, pow(energy, 0.85), m);
    vec3 surface = mix(uBase, uMid, smoothstep(0.28, 0.78, pattern));
    vec3 tint = lean > 0.0 ? uAi : uHuman;
    float leanA = abs(lean) * m;
    surface = mix(surface, tint * 0.6, leanA * 0.62);
    surface = mix(surface, uAccent * 0.55, smoothstep(0.78, 0.98, pattern) * 0.35);

    // Engraved contours of the track's own energy: more levels once it is shown.
    float k = pattern * mix(5.5, 8.5, m);
    float dist = 0.5 - abs(fract(k) - 0.5);
    float contour = 1.0 - smoothstep(0.0, fwidth(k) * 1.25, dist);
    vec3 lineColor = mix(uAccent, tint * 1.3, clamp(leanA * 2.0, 0.0, 1.0));

    // Relief shading from the energy, by screen-space derivatives.
    vec3 N = normalize(vNormalW);
    float h = energy * m;
    vec2 dH = vec2(dFdx(h), dFdy(h)) * uRelief * uBump;
    vec3 sx = dFdx(vWorld);
    vec3 sy = dFdy(vWorld);
    vec3 r1 = cross(sy, N);
    vec3 r2 = cross(N, sx);
    float det = dot(sx, r1);
    N = normalize(abs(det) * N - sign(det) * (dH.x * r1 + dH.y * r2));

    vec3 V = normalize(vViewW);
    vec3 L = normalize(uLight);
    float day = smoothstep(-0.18, 0.75, dot(N, L));
    float fresnel = pow(1.0 - max(dot(normalize(vNormalW), V), 0.0), 3.0);

    vec3 color = surface * (0.05 + 1.15 * day);
    // Stretches the models leaned towards AI glow a little brighter.
    float glow = 1.0 + 0.9 * max(lean, 0.0) * m;
    color += lineColor * contour * uLines * glow * (0.05 + 0.5 * (1.0 - day) + 0.2 * uFocus);

    // Repeated peaks in the spectrum: fine rings at the bands that carry them.
    float row = vUv.y * uRows;
    float rowLine = 1.0 - smoothstep(0.0, fwidth(row) * 1.4, abs(fract(row) - 0.5));
    color += uAccent * 1.3 * rowLine * ring * m * (0.45 + 0.55 * (1.0 - day * 0.6));

    // Time: a tick every uTick seconds along the equator, and the first meridian.
    float w = fwU();
    float tt = vUv.x * uSpan / uTick;
    float tick = 1.0 - smoothstep(0.0, fwidth(tt) * 1.4, min(fract(tt), 1.0 - fract(tt)));
    float eq = smoothstep(0.03, 0.0, abs(vUv.y - 0.5));
    color += vec3(1.0, 0.93, 0.8) * tick * eq * m * 0.6;
    float first = 1.0 - smoothstep(0.0, w * 2.2 + 0.0008, min(vUv.x, 1.0 - vUv.x));
    color += vec3(1.0, 0.93, 0.8) * first * m * 0.4 * pole;

    // The needle: the moment being looked at, and the moment being played.
    if (uProbe >= 0.0) {
      float at = needle(uProbe, w);
      float halo = smoothstep(0.035, 0.0, min(abs(vUv.x - uProbe), 1.0 - abs(vUv.x - uProbe)));
      color += vec3(1.0, 0.95, 0.84) * (at * 0.7 + halo * 0.1) * pole;
    }
    if (uPlay >= 0.0) {
      float at = needle(uPlay, w);
      color += vec3(1.0, 0.78, 0.4) * at * 1.1 * pole;
    }

    color += uAtmo * fresnel * (0.25 + 0.75 * day) * 0.9;
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`

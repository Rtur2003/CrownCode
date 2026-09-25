// GLSL for the homepage atlas. All surfaces are procedural: no planet
// textures to download, and every world stays crisp however close the
// camera flies.

const NOISE = /* glsl */ `
  float hash3(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float noise3(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash3(i), hash3(i + vec3(1, 0, 0)), f.x),
          mix(hash3(i + vec3(0, 1, 0)), hash3(i + vec3(1, 1, 0)), f.x), f.y),
      mix(mix(hash3(i + vec3(0, 0, 1)), hash3(i + vec3(1, 0, 1)), f.x),
          mix(hash3(i + vec3(0, 1, 1)), hash3(i + vec3(1, 1, 1)), f.x), f.y),
      f.z);
  }
  float fbm(vec3 p) {
    float sum = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 5; i++) {
      sum += amp * noise3(p);
      p = p * 2.03 + 17.1;
      amp *= 0.5;
    }
    return sum;
  }
`

export const planetVertex = /* glsl */ `
  varying vec3 vObj;
  varying vec3 vNormalW;
  varying vec3 vViewW;
  void main() {
    vObj = normalize(position);
    vec4 world = modelMatrix * vec4(position, 1.0);
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vViewW = normalize(cameraPosition - world.xyz);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

export const planetFragment = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uMid;
  uniform vec3 uAccent;
  uniform vec3 uAtmo;
  uniform vec3 uLight;
  uniform float uBands;
  uniform float uDetail;
  uniform float uLines;
  uniform float uGloss;
  uniform float uSeed;
  uniform float uFocus;
  varying vec3 vObj;
  varying vec3 vNormalW;
  varying vec3 vViewW;
  ${NOISE}
  void main() {
    vec3 p = vObj;
    float n = fbm(p * uDetail + uSeed);
    float warp = fbm(p * uDetail * 0.5 - uSeed);

    // Latitude bands, warped by the noise, for the gas-giant looking worlds.
    float lat = p.y + (warp - 0.5) * 0.45;
    float band = 0.5 + 0.5 * sin(lat * 18.0 + n * 4.0 + uSeed);
    float pattern = mix(n, band, uBands);
    vec3 surface = mix(uBase, uMid, smoothstep(0.28, 0.78, pattern));
    surface = mix(surface, uAccent * 0.55, smoothstep(0.78, 0.98, pattern) * 0.35);

    // Engraved topographic contours: the site's brass-engraving motif.
    // d = distance to the nearest contour level, antialiased with fwidth.
    float k = pattern * 5.5;
    float d = 0.5 - abs(fract(k) - 0.5);
    float contour = 1.0 - smoothstep(0.0, fwidth(k) * 1.25, d);

    vec3 N = normalize(vNormalW);
    vec3 V = normalize(vViewW);
    vec3 L = normalize(uLight);
    float ndl = dot(N, L);
    float day = smoothstep(-0.18, 0.75, ndl);
    float fresnel = pow(1.0 - max(dot(N, V), 0.0), 3.0);
    float spec = pow(max(dot(reflect(-L, N), V), 0.0), 90.0) * uGloss * day;

    vec3 color = surface * (0.05 + 1.15 * day);
    // Lines glow faintly by day and clearly on the night side, like lit
    // engravings; closer worlds (uFocus) light up a little more.
    color += uAccent * contour * uLines * (0.05 + 0.5 * (1.0 - day) + 0.2 * uFocus);
    color += vec3(1.0, 0.92, 0.78) * spec * 0.45;
    color += uAtmo * fresnel * (0.25 + 0.75 * day) * 0.9;
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`

export const atmosphereVertex = /* glsl */ `
  varying vec3 vNormalW;
  varying vec3 vViewW;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vViewW = normalize(cameraPosition - world.xyz);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

export const atmosphereFragment = /* glsl */ `
  uniform vec3 uAtmo;
  uniform vec3 uLight;
  uniform float uGlow;
  varying vec3 vNormalW;
  varying vec3 vViewW;
  void main() {
    vec3 N = normalize(vNormalW);
    float rim = pow(max(0.0, 0.72 - dot(-N, normalize(vViewW))), 3.2);
    float lit = 0.35 + 0.65 * smoothstep(-0.3, 0.8, dot(-N, normalize(uLight)));
    lit = mix(lit, 1.6, uGlow); // hovered in the project log: the world flares
    gl_FragColor = vec4(uAtmo * rim * lit * (2.4 + uGlow * 2.0), rim * lit);
    #include <colorspace_fragment>
  }
`

export const ringVertex = /* glsl */ `
  varying vec2 vLocal;
  void main() {
    vLocal = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const ringFragment = /* glsl */ `
  uniform vec3 uAccent;
  uniform vec3 uMid;
  uniform float uInner;
  uniform float uOuter;
  uniform float uStyle; // 0 grooves, 1 wheel, 2 dust
  uniform float uTime;
  varying vec2 vLocal;
  ${NOISE}
  void main() {
    float r = length(vLocal);
    float t = (r - uInner) / (uOuter - uInner);
    float edge = smoothstep(0.0, 0.06, t) * smoothstep(1.0, 0.9, t);
    float a = atan(vLocal.y, vLocal.x);
    float alpha;
    vec3 color;
    if (uStyle < 0.5) {
      // Vinyl: dense grooves with a moving sheen (faded as they alias).
      float g = r * 70.0;
      float groove = mix(0.5 + 0.5 * sin(g * 6.2831853), 0.5, clamp(fwidth(g) * 1.5, 0.0, 1.0));
      float sheen = pow(0.5 + 0.5 * cos(a * 2.0 - uTime * 0.4), 6.0);
      color = mix(uMid * 0.4, uAccent, groove * 0.35 + sheen * 0.55);
      alpha = edge * (0.45 + 0.25 * groove);
    } else if (uStyle < 1.5) {
      // Fortune wheel: alternating segments with thin spokes.
      float seg = fract(a / 6.2831853 * 12.0 + uTime * 0.01);
      float spoke = 1.0 - smoothstep(0.0, 0.02, min(seg, 1.0 - seg));
      float alt = step(0.5, fract(a / 6.2831853 * 6.0 + uTime * 0.01));
      color = mix(uMid * 0.6, uAccent, 0.35 + 0.35 * alt) + uAccent * spoke * 0.6;
      alpha = edge * (0.38 + 0.2 * alt + 0.4 * spoke);
    } else {
      float d = noise3(vec3(r * 14.0, a * 3.0, 0.0));
      color = mix(uMid, uAccent, d);
      alpha = edge * smoothstep(0.35, 0.8, d) * 0.5;
    }
    gl_FragColor = vec4(color, alpha);
    #include <colorspace_fragment>
  }
`

export const routeVertex = /* glsl */ `
  varying float vT;
  varying float vDepth;
  void main() {
    vT = uv.x;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

export const routeFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uTravelled;
  varying float vT;
  varying float vDepth;
  void main() {
    // Light pulses travel toward the next world; the part of the route
    // already flown is brighter, like a cleared path on a game map.
    float pulse = smoothstep(0.93, 1.0, fract(vT * 9.0 - uTime * 0.18));
    float travelled = 1.0 - smoothstep(uTravelled - 0.004, uTravelled + 0.004, vT);
    // Fade where the tube passes close to the camera, so it never smears.
    float near = smoothstep(2.0, 9.0, vDepth);
    float alpha = (0.16 + 0.32 * travelled + 0.55 * pulse) * near;
    gl_FragColor = vec4(uColor * (0.8 + pulse), alpha);
    #include <colorspace_fragment>
  }
`

export const pointsVertex = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uPixelRatio;
  varying vec3 vColor;
  varying float vTwinkle;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vTwinkle = 0.65 + 0.35 * sin(uTime * 1.3 + aPhase);
    vColor = aColor;
    gl_PointSize = aSize * uPixelRatio * (60.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`

export const pointsFragment = /* glsl */ `
  varying vec3 vColor;
  varying float vTwinkle;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float alpha = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vColor * vTwinkle, alpha * vTwinkle);
    #include <colorspace_fragment>
  }
`

export const glowFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec2 vUv;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float glow = pow(max(0.0, 1.0 - d), 2.6) * uIntensity;
    gl_FragColor = vec4(uColor * glow, glow);
    #include <colorspace_fragment>
  }
`

export const glowVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

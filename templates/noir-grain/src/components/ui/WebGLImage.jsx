import { useEffect, useRef } from 'react'
import { Renderer, Program, Mesh, Triangle, Texture } from 'ogl'
import gsap from 'gsap'
import { getMediaCapability } from '../../hooks/useMediaCapability.js'

// ─────────────────────────────────────────────────────────────

const VERT = /* glsl */ `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

// background-size: cover eşleniği UV ölçekleme
const COVER_UV = /* glsl */ `
vec2 coverUv(vec2 uv, vec2 planeRes, vec2 imageRes) {
  vec2 ratio = vec2(
    min((planeRes.x / planeRes.y) / (imageRes.x / imageRes.y), 1.0),
    min((planeRes.y / planeRes.x) / (imageRes.y / imageRes.x), 1.0)
  );
  return vec2(uv.x * ratio.x + (1.0 - ratio.x) * 0.5,
              uv.y * ratio.y + (1.0 - ratio.y) * 0.5);
}
`

// Prosedürel value-noise + fbm — harici doku gerektirmeden organik
const NOISE_GLSL = /* glsl */ `
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * vnoise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}
`

// Hover: fareyi takip eden sıvı (fluid) bükülme
const FRAG_HOVER = /* glsl */ `
precision highp float;
uniform sampler2D uTexture;
uniform vec2 uPlaneRes;
uniform vec2 uImageRes;
uniform vec2 uMouse;
uniform float uStrength;
varying vec2 vUv;
${COVER_UV}
${NOISE_GLSL}
void main() {
  vec2 uv = coverUv(vUv, uPlaneRes, uImageRes);
  float dist = distance(vUv, uMouse);
  float influence = smoothstep(0.5, 0.0, dist) * uStrength;
  vec2 warp = (vec2(
    fbm(vUv * 7.0 + uMouse * 2.0),
    fbm(vUv * 7.0 - uMouse * 2.0)
  ) - 0.5) * 0.08 * influence;
  gl_FragColor = texture2D(uTexture, uv + warp);
}
`

// Crossfade: mürekkep dağılması (ink dispersion) — görsel, noise haritası
const FRAG_FADE = /* glsl */ `
precision highp float;
uniform sampler2D uTex0;
uniform sampler2D uTex1;
uniform vec2 uPlaneRes;
uniform vec2 uImageRes0;
uniform vec2 uImageRes1;
uniform float uProgress;
varying vec2 vUv;
${COVER_UV}
${NOISE_GLSL}
void main() {
  vec2 uv0 = coverUv(vUv, uPlaneRes, uImageRes0);
  vec2 uv1 = coverUv(vUv, uPlaneRes, uImageRes1);

  float n = fbm(vUv * 4.0);
  float edge = 0.14;
  float p = uProgress * (1.0 + edge * 2.0) - edge;
  float m = smoothstep(p - edge, p + edge, n); // 1: eski görsel, 0: yeni

  // Mürekkep kenarında hafif akışkan bükülme
  float mid = 1.0 - abs(uProgress * 2.0 - 1.0);
  vec2 warp = (vec2(fbm(vUv * 6.0 + 3.1), fbm(vUv * 6.0 - 1.7)) - 0.5) * 0.05 * mid;

  vec4 c0 = texture2D(uTex0, uv0 + warp * (1.0 - m));
  vec4 c1 = texture2D(uTex1, uv1 + warp * m);
  gl_FragColor = mix(c1, c0, m);
}
`

function canUseWebGL() {
  const { hasWebGL, isTouch, reducedMotion } = getMediaCapability()
  return hasWebGL && !isTouch && !reducedMotion
}

function createRenderer(container) {
  const renderer = new Renderer({
    dpr: Math.min(window.devicePixelRatio, 2),
    alpha: true,
  })
  const gl = renderer.gl
  gl.canvas.style.width = '100%'
  gl.canvas.style.height = '100%'
  gl.canvas.style.display = 'block'
  container.appendChild(gl.canvas)
  return renderer
}

// Canvas'ı DOM'dan çıkarmak WebGL context'ini serbest bırakmaz; tarayıcının
function disposeRenderer(gl) {
  gl.canvas.remove()
  gl.getExtension('WEBGL_lose_context')?.loseContext()
}

function loadTexture(gl, src, onLoad) {
  const texture = new Texture(gl)
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    texture.image = img
    onLoad?.(img)
  }
  img.src = src
  return texture
}

// Görünürken raf döngüsü çalıştırır; görünmezken durur
function visibilityLoop(container, render) {
  let rafId = null
  const tick = () => {
    render()
    rafId = requestAnimationFrame(tick)
  }
  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && rafId === null) {
      rafId = requestAnimationFrame(tick)
    } else if (!entry.isIntersecting && rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  })
  io.observe(container)
  return () => {
    io.disconnect()
    if (rafId !== null) cancelAnimationFrame(rafId)
  }
}

export default function WebGLImage({ src, alt = '', className = '' }) {
  const containerRef = useRef(null)
  const webgl = canUseWebGL()

  useEffect(() => {
    if (!webgl) return
    const container = containerRef.current
    if (!container) return

    const renderer = createRenderer(container)
    const gl = renderer.gl

    const imageRes = { value: [1, 1] }
    const texture = loadTexture(gl, src, (img) => {
      imageRes.value = [img.naturalWidth, img.naturalHeight]
    })

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG_HOVER,
      uniforms: {
        uTexture: { value: texture },
        uPlaneRes: { value: [1, 1] },
        uImageRes: imageRes,
        uMouse: { value: [0.5, 0.5] },
        uStrength: { value: 0 },
      },
    })
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program })

    const resize = () => {
      const { width, height } = container.getBoundingClientRect()
      renderer.setSize(width, height)
      program.uniforms.uPlaneRes.value = [width, height]
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(container)

    const onMove = (e) => {
      const rect = container.getBoundingClientRect()
      program.uniforms.uMouse.value = [
        (e.clientX - rect.left) / rect.width,
        1 - (e.clientY - rect.top) / rect.height,
      ]
    }
    const onEnter = () => gsap.to(program.uniforms.uStrength, { value: 1, duration: 0.6, ease: 'power2.out' })
    const onLeave = () => gsap.to(program.uniforms.uStrength, { value: 0, duration: 0.6, ease: 'power2.out' })

    container.addEventListener('mousemove', onMove)
    container.addEventListener('mouseenter', onEnter)
    container.addEventListener('mouseleave', onLeave)

    const stopLoop = visibilityLoop(container, () => renderer.render({ scene: mesh }))

    return () => {
      stopLoop()
      ro.disconnect()
      container.removeEventListener('mousemove', onMove)
      container.removeEventListener('mouseenter', onEnter)
      container.removeEventListener('mouseleave', onLeave)
      disposeRenderer(gl)
    }
  }, [src, webgl])

  if (!webgl) {
    return (
      <div className={`overflow-hidden ${className}`}>
        <img src={src} alt={alt} loading="lazy" className="w-full h-full object-cover" />
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden ${className}`}
      role="img"
      aria-label={alt}
    />
  )
}

export function WebGLCrossfade({ images, activeIndex, alt = '', className = '' }) {
  const containerRef = useRef(null)
  const stateRef = useRef(null)
  const webgl = canUseWebGL()
  const imagesKey = images.join('|')

  useEffect(() => {
    if (!webgl) return
    const container = containerRef.current
    if (!container) return

    const renderer = createRenderer(container)
    const gl = renderer.gl

    const textures = images.map((srcUrl, i) =>
      loadTexture(gl, srcUrl, (img) => {
        state.imageRes[i] = [img.naturalWidth, img.naturalHeight]
        if (i === 0) program.uniforms.uImageRes0.value = state.imageRes[0]
      })
    )

    const state = {
      current: 0,
      imageRes: images.map(() => [1, 1]),
      textures,
    }

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG_FADE,
      uniforms: {
        uTex0: { value: textures[0] },
        uTex1: { value: textures[0] },
        uPlaneRes: { value: [1, 1] },
        uImageRes0: { value: [1, 1] },
        uImageRes1: { value: [1, 1] },
        uProgress: { value: 0 },
      },
    })
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program })

    const resize = () => {
      const { width, height } = container.getBoundingClientRect()
      renderer.setSize(width, height)
      program.uniforms.uPlaneRes.value = [width, height]
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(container)

    const stopLoop = visibilityLoop(container, () => renderer.render({ scene: mesh }))

    stateRef.current = { program, state }

    return () => {
      stopLoop()
      ro.disconnect()
      stateRef.current = null
      disposeRenderer(gl)
    }
    // Bağımlılık dizi kimliği değil içerik: çağıran her render'da yeni dizi
  }, [imagesKey, webgl])

  // activeIndex değişince distortion'lı crossfade
  useEffect(() => {
    const ref = stateRef.current
    if (!ref) return
    const { program, state } = ref
    if (activeIndex === state.current) return

    program.uniforms.uTex0.value = state.textures[state.current]
    program.uniforms.uImageRes0.value = state.imageRes[state.current]
    program.uniforms.uTex1.value = state.textures[activeIndex]
    program.uniforms.uImageRes1.value = state.imageRes[activeIndex]
    program.uniforms.uProgress.value = 0
    state.current = activeIndex

    gsap.to(program.uniforms.uProgress, { value: 1, duration: 0.9, ease: 'power2.inOut' })
  }, [activeIndex])

  if (!webgl) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        {images.map((srcUrl, i) => (
          <img
            key={srcUrl}
            src={srcUrl}
            alt={i === activeIndex ? alt : ''}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
            style={{ opacity: i === activeIndex ? 1 : 0 }}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden ${className}`}
      role="img"
      aria-label={alt}
    />
  )
}

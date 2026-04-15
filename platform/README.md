# @crowncode/platform

Next.js 14 (Pages Router) + TypeScript frontend for the CrownCode AI research platform.
For the full project overview (AURIS model, dataset, backend), see the [root README](../README.md).

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14.2 (Pages Router), React 18.3 |
| Language | TypeScript 5.7 (strict, `exactOptionalPropertyTypes`) |
| Animation | [Motion 12](https://motion.dev) (formerly Framer Motion) — all continuous animations gated by `useReducedMotion` |
| Styling | CSS Modules + design tokens in [`styles/base/variables.css`](styles/base/variables.css) |
| 3D | `@react-three/fiber` 8 + `@react-three/drei` 9 |
| Icons | `lucide-react` |
| i18n | Custom `LanguageContext` + [`locales/`](locales) JSON (TR/EN) |
| Testing | Jest 29 + Testing Library 16 + jest-axe |
| Deploy | Netlify (auto on push to `main`) |

---

## Scripts

```bash
npm run dev            # http://localhost:3000
npm run build          # production build
npm run start          # serve production build
npm run lint           # next lint
npm run type-check     # tsc --noEmit
npm run test           # jest
npm run test:watch     # jest --watch
npm run test:coverage  # jest --coverage
npm run analyze        # bundle analyzer
npm run i18n:check     # locale key parity (en.json vs tr.json)
```

---

## Directory layout

```
platform/
├── pages/              # Route entries (one file = one route)
├── components/         # Feature-grouped React components
│   ├── Home/             # Landing page sections
│   ├── AurisDetection/   # AI music detection UI (tabs: file / URL / mic)
│   ├── CrownFortune/     # Tarot / fortune wheel
│   ├── Layout/           # Shell, header, footer
│   ├── Navigation/       # HeaderNavbar, SearchModal
│   └── UI/               # Primitives: Toast, Skeleton, CopyButton
├── styles/
│   ├── base/             # variables.css, reset, typography, animations
│   ├── components/       # Component-specific CSS modules
│   └── pages/            # Page-specific CSS modules
├── context/            # LanguageContext, ToastContext
├── hooks/              # useFileAnalysis, useYouTubeAnalysis,
│                       # useMicrophoneAnalysis (Web Audio API)
├── locales/            # en.json, tr.json — keep in parity (see i18n:check)
├── config/             # product-catalog.ts
├── public/             # Static assets (favicons, tarot, AURIS imagery)
├── __tests__/          # Jest smoke + unit tests
└── scripts/            # Build-time utilities (locale parity check, etc.)
```

---

## Conventions

- **Animations**: import from `motion/react`, not `framer-motion`. Always wrap continuous/infinite animations in a `useReducedMotion` check so users with reduced-motion preferences get a still UI. Example pattern used across `Home/HeroSection.tsx`, `AurisDetection/HeroSection.tsx`:
  ```tsx
  <motion.div
    {...(prefersReducedMotion ? {} : {
      animate: { rotate: 360 },
      transition: { repeat: Infinity, duration: 30, ease: 'linear' as const }
    })}
  />
  ```
  The conditional-spread pattern is required by `exactOptionalPropertyTypes`.

- **i18n**: every user-visible string lives in `locales/en.json` + `locales/tr.json`. Run `npm run i18n:check` before shipping to confirm key parity.

- **Styling**: component-scoped CSS Modules. Global tokens come from `styles/base/variables.css` — do not hardcode colors.

- **Accessibility**: `aria-label` on interactive icons, keyboard handlers on `role="button"` divs, decorative images use `alt=""`, motion respects `prefers-reduced-motion`.

---

## AURIS detection UI

The `/ai-music-detection` page exposes three input sources, switched by a tabbed UI:

| Tab | Hook | Notes |
|---|---|---|
| File upload | `useFileAnalysis` | Client-side upload to backend `/predict` |
| URL | `useYouTubeAnalysis` | Backend downloads + analyzes |
| Microphone | `useMicrophoneAnalysis` | Web Audio API + `AnalyserNode`, streams to backend |

Backend URL is read from `NEXT_PUBLIC_API_URL`. When unset, the system-status page shows the "no external backend" state.

---

## Environment

See [`.env.example`](../.env.example) at the repo root. Most variables are optional for local dev; set `NEXT_PUBLIC_API_URL` to point at your running AURIS backend.

---

## Deployment

Netlify builds from `main`. Config: [`netlify.toml`](../netlify.toml). Build command runs from the repo root and targets this `platform/` workspace.

// Loaded lazily by <LazyMotion> in pages/_app.tsx so Motion's animation
// engine stays out of the first-load bundle. domAnimation covers animate,
// variants, exit, hover/tap/focus and whileInView — everything the site uses
// (no drag, no layout animations).
export { domAnimation as default } from 'motion/react'

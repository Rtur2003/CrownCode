'use client'

// =========================================================================
// BENTO TILE VISUALS
// =========================================================================
// Real, product-specific illustrations for the bento grid tiles that used
// to render as bare text (ML Toolkit, Dreams, Commend, Vote, Kognita).
// Each one is a small, self-contained SVG + CSS-animation component keyed
// to what that product actually does — not a shared generic icon-in-a-box.
// Pure SVG/CSS (no canvas, no JS animation loop) keeps these near-zero-cost
// on the main thread and crisp at any pixel density. Each is a standalone
// module so any one can be swapped out later without touching the others.
// =========================================================================

import React from 'react'

/** ML Toolkit — a live waveform mesh, since the product IS audio DSP. */
export const MLToolkitVisual: React.FC = () => {
  const bars = Array.from({ length: 28 }, (_, i) => i)
  return (
    <div className="bento-visual bento-visual--waveform" aria-hidden="true">
      <svg viewBox="0 0 280 160" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="mlt-bar-grad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="var(--color-gold-600)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="var(--color-gold-400)" stopOpacity="0.85" />
          </linearGradient>
        </defs>
        {bars.map((i) => {
          const seedA = Math.sin(i * 0.9) * 0.5 + 0.5
          const seedB = Math.sin(i * 0.37 + 2) * 0.5 + 0.5
          const baseHeight = 14 + seedA * 60 + seedB * 30
          const x = i * 10
          const delay = (i % 7) * 0.09
          return (
            <rect
              key={i}
              className="mlt-bar"
              x={x}
              y={160 - baseHeight}
              width="5"
              height={baseHeight}
              rx="2.5"
              fill="url(#mlt-bar-grad)"
              style={{ animationDelay: `${delay}s`, transformOrigin: `${x + 2.5}px 160px` }}
            />
          )
        })}
      </svg>
    </div>
  )
}

/** Crown Dreams — a slow-drifting nebula of star particles. */
export const DreamsVisual: React.FC = () => {
  const stars = Array.from({ length: 22 }, (_, i) => {
    const angle = (i / 22) * Math.PI * 2
    const radius = 30 + ((i * 37) % 60)
    return {
      cx: 140 + Math.cos(angle) * radius,
      cy: 60 + Math.sin(angle) * radius * 0.6,
      r: 0.6 + (i % 4) * 0.5,
      delay: (i % 9) * 0.35,
    }
  })
  return (
    <div className="bento-visual bento-visual--dreams" aria-hidden="true">
      <svg viewBox="0 0 280 160" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="dreams-core" cx="50%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#b3a3e0" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#b3a3e0" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="140" cy="56" r="70" fill="url(#dreams-core)" className="dreams-core" />
        {stars.map((s, i) => (
          <circle
            key={i}
            className="dreams-star"
            cx={s.cx}
            cy={s.cy}
            r={s.r}
            fill="#e8def8"
            style={{ animationDelay: `${s.delay}s` }}
          />
        ))}
      </svg>
    </div>
  )
}

/** Crown Commend — a terminal that types out a real generated comment,
 * since the product IS an AI comment generator. */
export const CommendVisual: React.FC = () => {
  return (
    <div className="bento-visual bento-visual--terminal" aria-hidden="true">
      <div className="commend-terminal">
        <div className="commend-terminal-dots">
          <span /><span /><span />
        </div>
        <div className="commend-terminal-line commend-terminal-line--1">
          <span className="commend-prompt">$</span> analyze --video
        </div>
        <div className="commend-terminal-line commend-terminal-line--2">
          Bu video harika bir üretim<span className="commend-cursor">|</span>
        </div>
        <div className="commend-terminal-line commend-terminal-line--3">
          <span className="commend-ok">✓</span> transcript matched
        </div>
      </div>
    </div>
  )
}

/** Crown Vote — a live bar-race, since the product automates poll voting. */
export const VoteVisual: React.FC = () => {
  const rows = [
    { w: 82, delay: 0 },
    { w: 61, delay: 0.15 },
    { w: 44, delay: 0.3 },
  ]
  return (
    <div className="bento-visual bento-visual--votebars" aria-hidden="true">
      <svg viewBox="0 0 280 100" preserveAspectRatio="xMidYMid slice">
        {rows.map((r, i) => (
          <g key={i} transform={`translate(16, ${18 + i * 28})`}>
            <rect x="0" y="0" width="248" height="12" rx="6" fill="var(--color-border)" />
            <rect
              className="vote-bar-fill"
              x="0"
              y="0"
              height="12"
              rx="6"
              fill="var(--color-info)"
              style={{ ['--vote-w' as string]: `${r.w}%`, animationDelay: `${r.delay}s` }}
            />
          </g>
        ))}
      </svg>
    </div>
  )
}

/** Kognita — a neural node graph, since it's a knowledge-graph / RAG tool. */
export const KognitaVisual: React.FC = () => {
  const nodes = [
    { x: 40, y: 30 }, { x: 40, y: 90 }, { x: 40, y: 130 },
    { x: 140, y: 55 }, { x: 140, y: 105 },
    { x: 240, y: 80 },
  ]
  const edges: [number, number][] = [[0, 3], [1, 3], [1, 4], [2, 4], [3, 5], [4, 5]]
  return (
    <div className="bento-visual bento-visual--neural" aria-hidden="true">
      <svg viewBox="0 0 280 160" preserveAspectRatio="xMidYMid slice">
        {edges.map(([a, b], i) => (
          <line
            key={i}
            className="kognita-edge"
            x1={nodes[a].x} y1={nodes[a].y}
            x2={nodes[b].x} y2={nodes[b].y}
            stroke="var(--color-info)"
            strokeWidth="1"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
        {nodes.map((n, i) => (
          <circle
            key={i}
            className="kognita-node"
            cx={n.x} cy={n.y} r="4.5"
            fill="var(--color-info)"
            style={{ animationDelay: `${i * 0.18}s` }}
          />
        ))}
      </svg>
    </div>
  )
}

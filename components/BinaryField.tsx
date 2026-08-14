"use client"

import { useEffect, useRef } from "react"
import { MARK_GRID } from "@/lib/mark-grid"

/**
 * A living field of 0s and 1s behind every page.
 *
 * The mark is hidden in it: cells inside the glyph are only revealed inside a
 * soft spotlight that follows the cursor, so the M is something you uncover
 * rather than something shown to you. The noise never stops shimmering, and
 * when there's no pointer (touch, or an idle desktop) the spotlight drifts on
 * its own so the page is never static.
 *
 * Performance: the base noise lives on an offscreen canvas and only the cells
 * whose flip timer expired are repainted there. Each frame blits that once and
 * then repaints only the ~500 cells inside the spotlight. Full-field fillText
 * every frame would cost 10x that.
 */

// Character cells are taller than they are wide, which is why MARK_GRID is
// sampled pre-squashed at 114x57: cols/rows == glyph aspect * (CELL_H/CELL_W).
// Drawing it on square cells would render the M at half its true height.
const CELL_W = 7
const CELL_H = 12
const FONT = 10 // px
const RADIUS = 230 // spotlight radius, px
const IDLE_MS = 2600 // after this with no pointer, the spotlight drifts

const GLYPH = MARK_GRID.map((r) => [...r].map((c) => c === "1"))
const G_ROWS = GLYPH.length
const G_COLS = GLYPH[0].length

function rgb(v: string): [number, number, number] {
  const s = v.trim()
  if (s.startsWith("#")) {
    const h = s.length === 4
      ? s.slice(1).split("").map((c) => c + c).join("")
      : s.slice(1)
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
    ]
  }
  const m = s.match(/[\d.]+/g)
  return m ? [+m[0], +m[1], +m[2]] : [128, 128, 128]
}

export default function BinaryField() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const ctx = cv.getContext("2d")
    if (!ctx) return

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    let dpr = 1
    let cols = 0
    let rows = 0
    let offX = 0
    let offY = 0
    let bits = new Uint8Array(0)
    let flipAt = new Float64Array(0)
    let base: HTMLCanvasElement | null = null
    let bctx: CanvasRenderingContext2D | null = null

    let muted: [number, number, number] = [136, 136, 136]
    let accent: [number, number, number] = [165, 42, 95]

    const readTokens = () => {
      const cs = getComputedStyle(document.documentElement)
      muted = rgb(cs.getPropertyValue("--muted") || "#888")
      accent = rgb(cs.getPropertyValue("--accent") || "#a52a5f")
    }

    const font = (c: HTMLCanvasElement | null, x: CanvasRenderingContext2D) => {
      x.font = `${FONT}px ui-monospace, SFMono-Regular, Menlo, monospace`
      x.textAlign = "center"
      x.textBaseline = "middle"
    }

    const paintBase = (i: number, r: number, c: number) => {
      if (!bctx) return
      const x = c * CELL_W + CELL_W / 2
      const y = r * CELL_H + CELL_H / 2
      bctx.clearRect(c * CELL_W, r * CELL_H, CELL_W, CELL_H)
      bctx.fillStyle = `rgba(${muted[0]},${muted[1]},${muted[2]},0.085)`
      bctx.fillText(bits[i] ? "1" : "0", x, y)
    }

    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.75)
      const w = window.innerWidth
      const h = window.innerHeight
      cols = Math.ceil(w / CELL_W) + 1
      rows = Math.ceil(h / CELL_H) + 1

      cv.width = w * dpr
      cv.height = h * dpr
      cv.style.width = `${w}px`
      cv.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      font(cv, ctx)

      base = document.createElement("canvas")
      base.width = w * dpr
      base.height = h * dpr
      bctx = base.getContext("2d")!
      bctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      font(base, bctx)

      // centre the glyph grid in the viewport
      offX = Math.floor((cols - G_COLS) / 2)
      offY = Math.floor((rows - G_ROWS) / 2)

      const n = rows * cols
      bits = new Uint8Array(n)
      flipAt = new Float64Array(n)
      for (let i = 0; i < n; i++) {
        bits[i] = Math.random() < 0.5 ? 1 : 0
        flipAt[i] = performance.now() + 400 + Math.random() * 2600
      }
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) paintBase(r * cols + c, r, c)
    }

    const isGlyph = (r: number, c: number) => {
      const gr = r - offY
      const gc = c - offX
      return gr >= 0 && gr < G_ROWS && gc >= 0 && gc < G_COLS && GLYPH[gr][gc]
    }

    let px = -9999
    let py = -9999
    let lastMove = -99999
    const onMove = (e: PointerEvent) => {
      px = e.clientX
      py = e.clientY
      lastMove = performance.now()
    }
    window.addEventListener("pointermove", onMove, { passive: true })

    let raf = 0
    const frame = (t: number) => {
      // shimmer: repaint only the cells whose timer expired
      if (!reduce) {
        for (let i = 0; i < bits.length; i++) {
          if (t >= flipAt[i]) {
            bits[i] = Math.random() < 0.5 ? 1 : 0
            flipAt[i] = t + 500 + Math.random() * 2800
            paintBase(i, (i / cols) | 0, i % cols)
          }
        }
      }

      // spotlight position: cursor, or a slow drift once idle
      let sx = px
      let sy = py
      if (t - lastMove > IDLE_MS) {
        const k = t / 1000
        sx = window.innerWidth * (0.5 + 0.32 * Math.sin(k * 0.21))
        sy = window.innerHeight * (0.5 + 0.28 * Math.sin(k * 0.13 + 1.7))
      }

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      if (base) ctx.drawImage(base, 0, 0, window.innerWidth, window.innerHeight)

      // repaint only what the spotlight touches
      const c0 = Math.max(0, Math.floor((sx - RADIUS) / CELL_W))
      const c1 = Math.min(cols - 1, Math.ceil((sx + RADIUS) / CELL_W))
      const r0 = Math.max(0, Math.floor((sy - RADIUS) / CELL_H))
      const r1 = Math.min(rows - 1, Math.ceil((sy + RADIUS) / CELL_H))

      for (let r = r0; r <= r1; r++) {
        for (let c = c0; c <= c1; c++) {
          const x = c * CELL_W + CELL_W / 2
          const y = r * CELL_H + CELL_H / 2
          const d = Math.hypot(x - sx, y - sy)
          if (d > RADIUS) continue
          let k = 1 - d / RADIUS
          k = k * k * (3 - 2 * k) // smoothstep, so the edge fades out softly
          if (k < 0.02) continue

          const g = isGlyph(r, c)
          ctx.clearRect(c * CELL_W, r * CELL_H, CELL_W, CELL_H)
          if (g) {
            ctx.fillStyle = `rgba(${accent[0]},${accent[1]},${accent[2]},${(0.085 + 0.62 * k).toFixed(3)})`
            ctx.fillText("1", x, y)
          } else {
            const a = 0.085 + 0.1 * k
            ctx.fillStyle = `rgba(${muted[0]},${muted[1]},${muted[2]},${a.toFixed(3)})`
            ctx.fillText(bits[r * cols + c] ? "1" : "0", x, y)
          }
        }
      }

      raf = requestAnimationFrame(frame)
    }

    const onResize = () => {
      build()
    }

    readTokens()
    build()
    raf = requestAnimationFrame(frame)

    window.addEventListener("resize", onResize)
    const scheme = window.matchMedia("(prefers-color-scheme: dark)")
    const onScheme = () => {
      readTokens()
      build()
    }
    scheme.addEventListener("change", onScheme)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("resize", onResize)
      scheme.removeEventListener("change", onScheme)
    }
  }, [])

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
    />
  )
}

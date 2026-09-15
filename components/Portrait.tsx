"use client"

import { useEffect, useRef } from "react"

/**
 * A duotone of Mara standing in the left margin, feet on the floor of the
 * viewport. It is a fixed canvas under the binary field, so it stays put while
 * the page scrolls and the digits run over it untouched.
 *
 * The photo is greyscale in the file; the colour is applied here from the
 * site's own tokens (shadows in --accent, lights in --bg, midtones leaning to a
 * pale accent), so the dark theme gets its own version for free and the image
 * never looks imported. Only drawn when there is a real margin left of the
 * 46rem column; below that the page is as it was.
 */

const SRC = "/portrait.jpg"
const HEIGHT = 0.57 // of the viewport
const GAP = 22 // px between the figure's right edge and the text column
const COLUMN = 736 + 48 // 46rem shell plus its side padding
const ALPHA = 0.52
const MIN_W = 120 // narrower than this and it is just a smudge: skip

type RGB = [number, number, number]

function rgb(v: string): RGB {
  const s = v.trim()
  if (s.startsWith("#")) {
    const h = s.length === 4 ? s.slice(1).split("").map((c) => c + c).join("") : s.slice(1)
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
  }
  const m = s.match(/[\d.]+/g)
  return m ? [+m[0], +m[1], +m[2]] : [128, 128, 128]
}

const mix = (a: RGB, b: RGB, t: number): RGB => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
]

export default function Portrait() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const ctx = cv.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.decoding = "async"
    let ready = false

    const draw = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      cv.width = Math.round(w * dpr)
      cv.height = Math.round(h * dpr)
      cv.style.width = `${w}px`
      cv.style.height = `${h}px`
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, cv.width, cv.height)
      if (!ready) return

      // where the text column starts; the figure ends just before it
      const colLeft = Math.max(0, (w - COLUMN) / 2) + 24
      const room = colLeft - GAP
      let fh = h * HEIGHT
      let fw = (fh * img.naturalWidth) / img.naturalHeight
      if (fw > room / 0.9) {
        fw = room / 0.9 // may hang 10% off the left edge, no more
        fh = (fw * img.naturalHeight) / img.naturalWidth
      }
      if (fw < MIN_W) return
      const x = room - fw
      const y = h - fh

      const cs = getComputedStyle(document.documentElement)
      const accent = rgb(cs.getPropertyValue("--accent") || "#a52a5f")
      const bg = rgb(cs.getPropertyValue("--bg") || "#fdfcfb")
      const mid = mix(accent, bg, 0.62)
      // luminance 0..1 -> colour: accent, pale accent at the middle, paper
      const lut = (l: number): RGB => (l < 0.5 ? mix(accent, mid, l / 0.5) : mix(mid, bg, (l - 0.5) / 0.5))

      // render at device pixels into a scratch layer
      const pw = Math.round(fw * dpr)
      const ph = Math.round(fh * dpr)
      const layer = document.createElement("canvas")
      layer.width = pw
      layer.height = ph
      const p = layer.getContext("2d")!
      p.imageSmoothingQuality = "high"
      p.filter = "grayscale(1)"
      p.drawImage(img, 0, 0, pw, ph)
      p.filter = "none"
      const data = p.getImageData(0, 0, pw, ph)
      const a = data.data
      for (let i = 0; i < a.length; i += 4) {
        // gentle contrast around the middle, then the two-colour map
        const l = Math.min(1, Math.max(0, 0.5 + (a[i] / 255 - 0.5) * 1.1))
        const c = lut(l)
        a[i] = c[0]
        a[i + 1] = c[1]
        a[i + 2] = c[2]
      }
      p.putImageData(data, 0, 0)

      // feather the top and both sides so the crop's rectangle never shows
      p.globalCompositeOperation = "destination-in"
      const gx = p.createLinearGradient(0, 0, pw, 0)
      gx.addColorStop(0, "rgba(0,0,0,0)")
      gx.addColorStop(0.14, "rgba(0,0,0,1)")
      gx.addColorStop(0.8, "rgba(0,0,0,1)")
      gx.addColorStop(1, "rgba(0,0,0,0)")
      p.fillStyle = gx
      p.fillRect(0, 0, pw, ph)
      const gy = p.createLinearGradient(0, 0, 0, ph)
      gy.addColorStop(0, "rgba(0,0,0,0)")
      gy.addColorStop(0.14, "rgba(0,0,0,1)")
      gy.addColorStop(1, "rgba(0,0,0,1)")
      p.fillStyle = gy
      p.fillRect(0, 0, pw, ph)

      ctx.globalAlpha = ALPHA
      ctx.drawImage(layer, Math.round(x * dpr), Math.round(y * dpr), pw, ph)
      ctx.globalAlpha = 1
    }

    img.onload = () => {
      ready = true
      draw()
    }
    img.src = SRC

    let t = 0
    const onResize = () => {
      clearTimeout(t)
      t = window.setTimeout(draw, 120)
    }
    window.addEventListener("resize", onResize)
    const themeWatch = new MutationObserver(draw)
    themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] })

    return () => {
      clearTimeout(t)
      window.removeEventListener("resize", onResize)
      themeWatch.disconnect()
    }
  }, [])

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-0 hidden lg:block" />
}

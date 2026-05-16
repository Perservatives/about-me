import { useEffect, useRef } from "react"

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  alpha: number
  phase: number
}

function seedParticles(w: number, h: number, count: number): Particle[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.22,
    vy: (Math.random() - 0.5) * 0.22,
    r: Math.random() * 1.35 + 0.45,
    alpha: Math.random() * 0.35 + 0.12,
    phase: Math.random() * Math.PI * 2,
  }))
}

export function ParticleField(props: {
  /** Changes on page switch — triggers drift burst. */
  pageKey: string
  /** -1 left · 0 none · 1 right */
  navDirection: number
  enabled?: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const windRef = useRef({ x: 0, y: -0.04 })
  const sizeRef = useRef({ w: 0, h: 0 })
  const rafRef = useRef<number>(0)
  const reducedRef = useRef(false)

  useEffect(() => {
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }, [])

  useEffect(() => {
    const d = props.navDirection
    if (d === 0) return
    windRef.current.x += d * 0.55
    windRef.current.y += (Math.random() - 0.5) * 0.15

    for (const p of particlesRef.current) {
      p.vx += d * (1.8 + Math.random() * 1.4)
      p.vy += (Math.random() - 0.5) * 1.2
      p.alpha = Math.min(0.65, p.alpha + 0.18)
    }
  }, [props.pageKey, props.navDirection])

  useEffect(() => {
    if (props.enabled === false) return

    const canvasMaybe = canvasRef.current
    if (!canvasMaybe) return
    const contextMaybe = canvasMaybe.getContext("2d")
    if (!contextMaybe) return
    const canvasEl: HTMLCanvasElement = canvasMaybe
    const context: CanvasRenderingContext2D = contextMaybe

    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    function resize() {
      const w = window.innerWidth
      const h = window.innerHeight
      sizeRef.current = { w, h }
      canvasEl.width = Math.floor(w * dpr)
      canvasEl.height = Math.floor(h * dpr)
      canvasEl.style.width = `${w}px`
      canvasEl.style.height = `${h}px`
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (particlesRef.current.length === 0) {
        const count = w < 640 ? 48 : w < 1024 ? 72 : 96
        particlesRef.current = seedParticles(w, h, count)
      }
    }

    resize()
    window.addEventListener("resize", resize)

    let t0 = performance.now()

    function frame(now: number) {
      const { w, h } = sizeRef.current
      if (w === 0 || h === 0) {
        rafRef.current = requestAnimationFrame(frame)
        return
      }

      const dt = Math.min(32, now - t0) / 16.67
      t0 = now
      const reduced = reducedRef.current
      const driftScale = reduced ? 0.35 : 1

      windRef.current.x *= 0.992
      windRef.current.y = windRef.current.y * 0.992 - 0.0025

      context.clearRect(0, 0, w, h)

      for (const p of particlesRef.current) {
        const wobble = reduced ? 0 : Math.sin(now * 0.001 + p.phase) * 0.06
        p.vx += (windRef.current.x + wobble) * 0.02 * dt
        p.vy += (windRef.current.y + wobble) * 0.02 * dt
        p.vx *= 0.985
        p.vy *= 0.985
        p.alpha += (0.22 - p.alpha) * 0.02 * dt

        const speed = Math.hypot(p.vx, p.vy)
        const cap = 2.8 * driftScale
        if (speed > cap) {
          p.vx = (p.vx / speed) * cap
          p.vy = (p.vy / speed) * cap
        }

        p.x += p.vx * dt
        p.y += p.vy * dt

        if (p.x < -8) p.x = w + 8
        if (p.x > w + 8) p.x = -8
        if (p.y < -8) p.y = h + 8
        if (p.y > h + 8) p.y = -8

        context.beginPath()
        context.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        context.fillStyle = `rgba(250, 250, 252, ${p.alpha})`
        context.fill()
      }

      rafRef.current = requestAnimationFrame(frame)
    }

    if (!reducedRef.current) {
      rafRef.current = requestAnimationFrame(frame)
    } else {
      context.clearRect(0, 0, sizeRef.current.w, sizeRef.current.h)
      for (const p of particlesRef.current) {
        context.beginPath()
        context.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        context.fillStyle = `rgba(250, 250, 252, ${p.alpha * 0.85})`
        context.fill()
      }
    }

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(rafRef.current)
    }
  }, [props.enabled])

  return (
    <canvas
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
      ref={canvasRef}
    />
  )
}

export function SceneChrome() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(ellipse_85%_70%_at_50%_45%,transparent_0%,rgba(0,0,0,0.55)_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[1] opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </>
  )
}

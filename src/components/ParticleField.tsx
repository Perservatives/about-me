import { useEffect, useRef } from "react"

type ParticleKind = "dot" | "dust" | "sparkle"

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  alpha: number
  baseAlpha: number
  phase: number
  twinkle: number
  wobbleAmp: number
  speedCap: number
  kind: ParticleKind
}

function particleCount(w: number, h: number): number {
  const area = w * h
  const target = Math.round(area * 0.00078)
  if (w < 640) return Math.min(450, Math.max(345, target))
  if (w < 1024) return Math.min(630, Math.max(510, target))
  return Math.min(780, Math.max(600, target))
}

function particleTraits(): { kind: ParticleKind; r: number; baseAlpha: number; speedCap: number; wobbleAmp: number } {
  const roll = Math.random()
  if (roll < 0.2) {
    return {
      kind: "dot",
      r: 0.14 + Math.random() * 0.28,
      baseAlpha: 0.04 + Math.random() * 0.1,
      speedCap: 0.85 + Math.random() * 0.5,
      wobbleAmp: 0.008 + Math.random() * 0.02,
    }
  }
  if (roll < 0.42) {
    return {
      kind: "dot",
      r: 0.38 + Math.random() * 0.55,
      baseAlpha: 0.08 + Math.random() * 0.18,
      speedCap: 1 + Math.random() * 0.65,
      wobbleAmp: 0.012 + Math.random() * 0.028,
    }
  }
  if (roll < 0.62) {
    return {
      kind: "dot",
      r: 0.7 + Math.random() * 0.95,
      baseAlpha: 0.1 + Math.random() * 0.22,
      speedCap: 1.15 + Math.random() * 0.75,
      wobbleAmp: 0.015 + Math.random() * 0.032,
    }
  }
  if (roll < 0.78) {
    return {
      kind: "dust",
      r: 1.05 + Math.random() * 1.15,
      baseAlpha: 0.05 + Math.random() * 0.12,
      speedCap: 0.95 + Math.random() * 0.55,
      wobbleAmp: 0.01 + Math.random() * 0.022,
    }
  }
  if (roll < 0.9) {
    return {
      kind: "dust",
      r: 1.9 + Math.random() * 1.45,
      baseAlpha: 0.07 + Math.random() * 0.14,
      speedCap: 1.05 + Math.random() * 0.6,
      wobbleAmp: 0.014 + Math.random() * 0.026,
    }
  }
  if (roll < 0.97) {
    return {
      kind: "dust",
      r: 2.8 + Math.random() * 1.8,
      baseAlpha: 0.09 + Math.random() * 0.16,
      speedCap: 1.2 + Math.random() * 0.7,
      wobbleAmp: 0.018 + Math.random() * 0.03,
    }
  }
  return {
    kind: "sparkle",
    r: 2.6 + Math.random() * 2.4,
    baseAlpha: 0.22 + Math.random() * 0.35,
    speedCap: 1.4 + Math.random() * 0.9,
    wobbleAmp: 0.02 + Math.random() * 0.04,
  }
}

function seedParticles(w: number, h: number, count: number): Particle[] {
  return Array.from({ length: count }, () => {
    const traits = particleTraits()
    const drift = 0.035 + Math.random() * 0.14
    const angle = Math.random() * Math.PI * 2
    const x = Math.random() * w
    const y = Math.random() * h
    return {
      x,
      y,
      vx: Math.cos(angle) * drift,
      vy: Math.sin(angle) * drift,
      r: traits.r,
      alpha: traits.baseAlpha,
      baseAlpha: traits.baseAlpha,
      phase: Math.random() * Math.PI * 2,
      twinkle: 0.35 + Math.random() * 3.8,
      wobbleAmp: traits.wobbleAmp,
      speedCap: traits.speedCap,
      kind: traits.kind,
    }
  })
}

function pushParticlesFromPoint(pts: Particle[], x: number, y: number, strength: number, radius: number) {
  for (const p of pts) {
    const dx = p.x - x
    const dy = p.y - y
    const dist = Math.hypot(dx, dy)
    if (dist >= radius || dist < 2) continue
    const t = (radius - dist) / radius
    const push = strength * t * t * 0.55
    p.vx += (dx / dist) * push
    p.vy += (dy / dist) * push
    p.alpha = Math.min(0.82, p.alpha + 0.06 * t)
  }
}

export function ParticleField(props: {
  pageKey: string
  navDirection: number
  enabled?: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const windRef = useRef({ x: 0, y: -0.045 })
  const mouseRef = useRef({ x: -9999, y: -9999, active: false })
  const clickPulseRef = useRef<{ x: number; y: number; strength: number } | null>(null)
  const sizeRef = useRef({ w: 0, h: 0 })
  const rafRef = useRef<number>(0)
  const reducedRef = useRef(false)
  const navBurstRef = useRef<{ d: number; key: string } | null>(null)
  const pageKeyRef = useRef(props.pageKey)

  useEffect(() => {
    pageKeyRef.current = props.pageKey
  }, [props.pageKey])

  useEffect(() => {
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }, [])

  useEffect(() => {
    function onMove(e: PointerEvent) {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true }
    }
    function onLeave() {
      mouseRef.current.active = false
    }
    function onPointerDown(e: PointerEvent) {
      if (reducedRef.current) return
      if (e.button !== 0) return
      clickPulseRef.current = { x: e.clientX, y: e.clientY, strength: 3.2 }
    }
    window.addEventListener("pointermove", onMove, { passive: true })
    window.addEventListener("pointerleave", onLeave)
    window.addEventListener("pointerdown", onPointerDown, { capture: true })
    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerleave", onLeave)
      window.removeEventListener("pointerdown", onPointerDown, { capture: true })
    }
  }, [])

  useEffect(() => {
    if (props.navDirection === 0) return
    navBurstRef.current = { d: props.navDirection, key: props.pageKey }
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
      const count = particleCount(w, h)
      const pts = particlesRef.current
      if (pts.length === 0) {
        particlesRef.current = seedParticles(w, h, count)
      } else if (pts.length < count) {
        particlesRef.current = [...pts, ...seedParticles(w, h, count - pts.length)]
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
      const mouse = mouseRef.current
      const pts = particlesRef.current

      const click = clickPulseRef.current
      if (click && !reduced) {
        clickPulseRef.current = null
        pushParticlesFromPoint(pts, click.x, click.y, click.strength, 180)
      }

      const pending = navBurstRef.current
      if (pending && pending.key === pageKeyRef.current) {
        const d = pending.d
        navBurstRef.current = null
        windRef.current.x += d * 0.38
        windRef.current.y += (Math.random() - 0.5) * 0.1
        for (const p of pts) {
          p.vx += d * (1.1 + Math.random() * 0.7)
          p.vy += (Math.random() - 0.5) * 0.7
        }
      }

      windRef.current.x *= 0.994
      windRef.current.y = windRef.current.y * 0.994 - 0.0016

      context.clearRect(0, 0, w, h)

      for (const p of pts) {
        const wobble = reduced ? 0 : Math.sin(now * 0.001 * p.twinkle + p.phase) * p.wobbleAmp
        p.vx += (windRef.current.x + wobble) * 0.01 * dt
        p.vy += (windRef.current.y + wobble) * 0.01 * dt

        if (!reduced && mouse.active) {
          const dx = mouse.x - p.x
          const dy = mouse.y - p.y
          const dist = Math.hypot(dx, dy)
          if (dist < 40 && dist > 3) {
            const repel = ((40 - dist) / 40) * 0.022
            p.vx -= (dx / dist) * repel * dt
            p.vy -= (dy / dist) * repel * dt
          } else if (dist < 120 && dist > 4) {
            const pull = ((120 - dist) / 120) * 0.008
            p.vx += (dx / dist) * pull * dt
            p.vy += (dy / dist) * pull * dt
          }
        }

        p.vx *= 0.992
        p.vy *= 0.992

        const tw = reduced ? 1 : 0.65 + 0.35 * Math.sin(now * 0.0016 * p.twinkle + p.phase * 1.3)
        const targetAlpha = p.baseAlpha * tw
        p.alpha += (targetAlpha - p.alpha) * (0.025 + p.twinkle * 0.006) * dt

        const speed = Math.hypot(p.vx, p.vy)
        const cap = p.speedCap * driftScale
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

        const drawR = p.kind === "sparkle" ? p.r * (0.88 + tw * 0.28) : p.r * (0.96 + tw * 0.06)
        const tint = p.kind === "dust" ? 242 : p.kind === "sparkle" ? 255 : 248
        context.beginPath()
        context.arc(p.x, p.y, drawR, 0, Math.PI * 2)
        context.fillStyle = `rgba(${tint}, ${tint}, ${tint + (p.kind === "sparkle" ? 0 : 2)}, ${p.alpha})`
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

  return <canvas aria-hidden className="pointer-events-none fixed inset-0 z-0" ref={canvasRef} />
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

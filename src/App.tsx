import { type CSSProperties, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react"

import {
  BIRTH_DATE_ISO,
  DISCORD_HANDLE,
  DISPLAY_NAME,
  EIGHTH_GRADE_FALL_YEAR_PT,
  EMAIL_HREF,
  EMAIL_RAW,
  GITHUB_USERNAME,
  INSTAGRAM_HANDLE,
  LEETCODE_HANDLE,
  LINK_GITHUB_HREF,
  LINK_INSTAGRAM_HREF,
  LINK_LEETCODE_HREF,
  LINK_STEREO_LIVE_HREF,
  SITE_TITLE,
} from "./constants"
import { ContactIcon, type ContactIconKind } from "./components/ContactIcons"
import { ParticleField, SceneChrome } from "./components/ParticleField"
import { gradeInPacificGradeLevel, ordinalGrade } from "./lib/schoolGrade"
import { useDecimalGregorianAgeYears } from "./hooks/useDecimalAge"
import { formatRelative, prefetchGithubRepos, useGithubRepos } from "./hooks/useGithubRepos"

type PageId = "intro" | "bio" | "age" | "builds" | "contact"

const PAGES: ReadonlyArray<{ id: PageId; label: string; kicker: string }> = [
  { id: "intro", label: "Intro", kicker: "01" },
  { id: "bio", label: "Bio", kicker: "02" },
  { id: "age", label: "Age", kicker: "03" },
  { id: "builds", label: "Builds", kicker: "04" },
  { id: "contact", label: "Contact", kicker: "05" },
]

/** Heading shown when transitioning from carousel to the vertical scroll view. */
const DOCUMENT_MODE_LABEL = "FULL INDEX"

/** Drag past last tick (~right 13%) opens full index while on Contact. */
const SLIDER_PASS_END_PROGRESS = 0.87

/** Decimal places for fractional age string (digits change visibly ~1 Hz). */
const AGE_DECIMAL_PLACES = 8

function prefersSmoothScroll(): ScrollBehavior {
  try {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "instant"
    return "smooth"
  } catch {
    return "smooth"
  }
}

function scrollToSectionId(sectionId: string) {
  const el = document.getElementById(sectionId)
  if (!el) return
  el.scrollIntoView({
    behavior: prefersSmoothScroll(),
    block: "start",
  })
}

const inlineLink =
  "underline decoration-white/40 underline-offset-[5px] hover:decoration-white hover:text-white transition-[color,text-decoration-color] duration-200 focus-visible:outline focus-visible:outline-1 focus-visible:outline-white focus-visible:outline-offset-[3px]"

const inlineButton = `${inlineLink} m-0 inline cursor-pointer border-0 bg-transparent p-0 text-inherit`

function ExtLink(props: { href: string; children: ReactNode }) {
  return (
    <a className={inlineLink} href={props.href} rel="noreferrer noopener" target="_blank">
      {props.children}
    </a>
  )
}

function indexOfPage(id: PageId): number {
  return PAGES.findIndex((p) => p.id === id)
}

function IntroPage(props: { onJump: (id: PageId) => void; footerHint?: "deck" | "scroll" }) {
  const hint =
    props.footerHint === "scroll"
      ? "Inline links snap to sections · menu jumps anchors"
      : "Slider or ← →"
  return (
    <div className="space-y-9">
      <div className="space-y-1.5 sm:space-y-2">
        <p className="m-0 text-[clamp(0.875rem,2.6vw,1.05rem)] font-medium leading-snug tracking-[-0.01em] text-white/68">
          Hey, I&apos;m
        </p>
        <h1 className="m-0 text-[clamp(2.85rem,12.5vw,5.95rem)] font-bold leading-[0.92] tracking-[-0.03em] text-white">
          {DISPLAY_NAME}
        </h1>
      </div>
      <div className="space-y-5 text-[13px] leading-[1.75] text-white/52">
        <p className="m-0 text-justify">
          <button className={inlineButton} onClick={() => props.onJump("bio")} type="button">
            continue reading
          </button>{" "}
          to learn about me.
        </p>
        <p className="m-0 text-[11px] uppercase tracking-[0.16em] text-white/38">{hint}</p>
      </div>
    </div>
  )
}

function BioPage() {
  const gradeOrdinal = ordinalGrade(gradeInPacificGradeLevel(EIGHTH_GRADE_FALL_YEAR_PT))

  return (
    <div className="space-y-7 text-[15px] leading-[1.75]">
      <p className="m-0 text-[11px] uppercase tracking-[0.18em] text-white/55">02 · Bio</p>
      <p className="m-0 text-justify">
        Hi! I'm a stupid teenager who needs to add something to his portfolio. I have extensive experience in Python and Java. I like to code when it doesn't make me insane. I am learning web development right now (I still suck, this website being one
        of my experiments). I also happen to have no life. Feel free to{" "}
        <a className={inlineLink} href={EMAIL_HREF}>
          contact me
        </a>{" "}
        or visit <ExtLink href={LINK_GITHUB_HREF}>my GitHub</ExtLink>.
      </p>
      <p className="m-0 text-[12px] lowercase leading-[1.65] tracking-[0.04em] text-white/52">
        pacific time · {gradeOrdinal} grade
      </p>
    </div>
  )
}

function AgePage(props: { ageYears: number }) {
  const ageText = useMemo(() => props.ageYears.toFixed(AGE_DECIMAL_PLACES), [props.ageYears])

  return (
    <div className="space-y-9">
      <p className="m-0 text-[11px] uppercase tracking-[0.18em] text-white/55">03 · Elapsed age</p>
      <p className="age-hover-scope m-0 flex select-none flex-col items-center gap-3 text-center sm:gap-4">
        <span
          key={ageText}
          className="age-numeral animate-age-flick inline-block max-w-full break-all font-semibold tabular-nums text-[clamp(1.05rem,5vw,4rem)] leading-tight tracking-tight text-white sm:break-normal sm:tracking-tighter"
        >
          {ageText}
        </span>
        <span className="text-[clamp(0.875rem,2.75vw,1.25rem)] font-medium uppercase tracking-[0.08em] text-white/52">
          years (so old)
        </span>
      </p>
      <p className="m-0 text-center text-[12px] uppercase tracking-[0.14em] text-white/45">
        Gregorian clock · {BIRTH_DATE_ISO} · refreshed 1&nbsp;Hz · {AGE_DECIMAL_PLACES} decimals
      </p>
    </div>
  )
}

function BuildsPage() {
  const repos = useGithubRepos(GITHUB_USERNAME, 8)

  return (
    <div className="space-y-7">
      <div className="flex items-baseline justify-between gap-3">
        <p className="m-0 text-[11px] uppercase tracking-[0.18em] text-white/55">04 · Builds</p>
        <p className="m-0 text-[10px] uppercase tracking-[0.18em] text-white/35">
          live · github.com/{GITHUB_USERNAME}
        </p>
      </div>

      <div className="animate-row-rise border border-white/[0.09] p-4 sm:p-5" style={{ animationDelay: "80ms" }}>
        <p className="m-0 text-[10px] uppercase tracking-[0.16em] text-white/42">Deployed</p>
        <p className="m-0 mt-1.5 text-[15px] font-semibold leading-tight text-white">stereo</p>
        <p className="m-0 mt-1 text-[13px] leading-[1.55] text-white/56">
          Spotify but free and worse, live on Vercel. Spotify is probably better. (gimme feedback pls)
        </p>
        <p className="m-0 mt-2.5 text-[12px] text-white/45">
          <ExtLink href={LINK_STEREO_LIVE_HREF}>stereooffline.vercel.app</ExtLink>
          <span className="px-2 text-white/25">·</span>
          <ExtLink href={`${LINK_GITHUB_HREF}/stereo`}>source</ExtLink>
        </p>
      </div>

      {repos.status === "loading" ? (
        <p className="m-0 text-[13px] text-white/50">Pulling latest pushes from GitHub…</p>
      ) : repos.status === "error" ? (
        <p className="m-0 text-[13px] leading-[1.65] text-white/50">
          Couldn&apos;t reach the GitHub API ({repos.message}). Visit{" "}
          <ExtLink href={LINK_GITHUB_HREF}>{`github.com/${GITHUB_USERNAME}`}</ExtLink> directly.
        </p>
      ) : (
        <ul className="m-0 list-none space-y-5 p-0">
          {repos.repos.map((r, i) => (
            <li
              className="animate-row-rise grid grid-cols-[3.25rem_1fr] gap-x-4 gap-y-1"
              key={r.id}
              style={{ animationDelay: `${140 + i * 70}ms` }}
            >
              <span className="text-[11px] uppercase tracking-[0.14em] text-white/40 tabular-nums">
                #{String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 space-y-1">
                <p className="m-0 text-[14.5px] leading-[1.5] text-white">
                  <ExtLink href={r.htmlUrl}>{r.name}</ExtLink>
                  {r.description ? <span className="text-white/55"> — {r.description}</span> : null}
                </p>
                <p className="m-0 text-[12px] text-white/45">
                  {r.language ? (
                    <>
                      <span>{r.language}</span>
                      <span className="px-2 text-white/25">·</span>
                    </>
                  ) : null}
                  <span>pushed {formatRelative(r.pushedAt)}</span>
                  {r.stargazersCount > 0 ? (
                    <>
                      <span className="px-2 text-white/25">·</span>
                      <span className="tabular-nums">★ {r.stargazersCount}</span>
                    </>
                  ) : null}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function CopyDiscord(props: { value: string }) {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<number | null>(null)

  useEffect(() => () => {
    if (timerRef.current != null) window.clearTimeout(timerRef.current)
  }, [])

  async function onClick() {
    try {
      await navigator.clipboard.writeText(props.value)
    } catch {
      try {
        const ta = document.createElement("textarea")
        ta.value = props.value
        ta.setAttribute("readonly", "")
        ta.style.position = "fixed"
        ta.style.left = "-9999px"
        document.body.appendChild(ta)
        ta.select()
        document.execCommand("copy")
        document.body.removeChild(ta)
      } catch {
        /* swallow */
      }
    }
    setCopied(true)
    if (timerRef.current != null) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button className={inlineButton} onClick={onClick} type="button">
      {props.value}
      <span aria-live="polite" className="ml-2 text-[11px] uppercase tracking-[0.14em] text-white/45">
        {copied ? "copied" : "copy"}
      </span>
    </button>
  )
}

function ContactPage(props: { endHint?: boolean }) {
  type Row = { icon: ContactIconKind; label: string; node: ReactNode }
  const rows: ReadonlyArray<Row> = [
    { icon: "email", label: "Email", node: <a className={inlineLink} href={EMAIL_HREF}>{EMAIL_RAW}</a> },
    { icon: "github", label: "GitHub", node: <ExtLink href={LINK_GITHUB_HREF}>{GITHUB_USERNAME}</ExtLink> },
    {
      icon: "leetcode",
      label: "LeetCode",
      node: (
        <>
          <ExtLink href={LINK_LEETCODE_HREF}>{LEETCODE_HANDLE}</ExtLink>
          <span className="ml-2 text-[11px] uppercase tracking-[0.14em] text-white/38">not very active</span>
        </>
      ),
    },
    { icon: "instagram", label: "Instagram", node: <ExtLink href={LINK_INSTAGRAM_HREF}>{INSTAGRAM_HANDLE}</ExtLink> },
    { icon: "discord", label: "Discord", node: <CopyDiscord value={DISCORD_HANDLE} /> },
  ]

  return (
    <div className="space-y-7">
      <p className="m-0 text-[11px] uppercase tracking-[0.18em] text-white/55">05 · Contact</p>
      <dl className="m-0 space-y-4 text-[15px]">
        {rows.map((r, i) => (
          <div
            className="animate-row-slide grid grid-cols-[7.25rem_1fr] items-baseline gap-x-4"
            key={r.label}
            style={{ animationDelay: `${120 + i * 90}ms` }}
          >
            <dt className="m-0 flex items-center gap-2.5 text-[11px] uppercase tracking-[0.16em] text-white/45">
              <ContactIcon kind={r.icon} />
              <span>{r.label}</span>
            </dt>
            <dd className="m-0 break-all">{r.node}</dd>
          </div>
        ))}
      </dl>
      {props.endHint ? (
        <p className="m-0 pt-4 text-[11px] uppercase tracking-[0.18em] text-white/35">
          Next: Right key or drag past the last tick for the full scroll site
        </p>
      ) : null}
    </div>
  )
}

function Slider(props: {
  count: number
  index: number
  pageLabel: (i: number) => string
  onChange: (next: number) => void
  onPassEnd?: () => void
}) {
  const { count, index, onChange, pageLabel, onPassEnd } = props
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [dragProgress, setDragProgress] = useState<number | null>(null)
  const draggingRef = useRef(false)

  const computeProgress = useCallback((clientX: number): number => {
    const el = trackRef.current
    if (!el) return 0
    const rect = el.getBoundingClientRect()
    const raw = (clientX - rect.left) / rect.width
    return Math.max(0, Math.min(1, raw))
  }, [])

  const snap = useCallback(
    (progress: number): number => Math.round(progress * (count - 1)),
    [count],
  )

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    draggingRef.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    const p = computeProgress(e.clientX)
    setDragProgress(p)
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return
    setDragProgress(computeProgress(e.clientX))
  }

  function onPointerEnd(e: React.PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return
    draggingRef.current = false
    const p = dragProgress ?? computeProgress(e.clientX)
    setDragProgress(null)
    if (onPassEnd != null && index === count - 1 && p > SLIDER_PASS_END_PROGRESS) {
      onPassEnd()
      return
    }
    onChange(snap(p))
  }

  const liveProgress = dragProgress ?? (count > 1 ? index / (count - 1) : 0)
  const dotStyle: CSSProperties = {
    left: `${liveProgress * 100}%`,
    transitionDuration: dragProgress != null ? "0s" : undefined,
  }

  return (
    <div className="px-6 pb-7 pt-3 sm:px-10 sm:pb-9">
      <div className="relative">
        <div
          aria-label="Page scrubber"
          className="relative h-8 cursor-pointer touch-none select-none"
          onPointerCancel={onPointerEnd}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          ref={trackRef}
          role="slider"
          aria-valuemin={0}
          aria-valuemax={count - 1}
          aria-valuenow={index}
          aria-valuetext={pageLabel(index)}
          tabIndex={-1}
        >
          <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-white/15" />
          {Array.from({ length: count }).map((_, i) => {
            const x = count > 1 ? (i / (count - 1)) * 100 : 50
            return (
              <button
                aria-label={`Go to ${pageLabel(i)}`}
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 grid h-5 w-5 place-items-center rounded-full bg-transparent hover:bg-white/10 focus-visible:outline focus-visible:outline-1 focus-visible:outline-white"
                key={i}
                onClick={(e) => {
                  e.stopPropagation()
                  onChange(i)
                }}
                onPointerDown={(e) => e.stopPropagation()}
                style={{ left: `${x}%` }}
                type="button"
              >
                <span aria-hidden className={`block h-[3px] w-[3px] rounded-full ${i === index ? "bg-transparent" : "bg-white/30"}`} />
              </button>
            )
          })}
          <div
            aria-hidden
            className="pointer-events-none absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white transition-[left] duration-[320ms] ease-out"
            style={dotStyle}
          />
        </div>
      </div>
    </div>
  )
}

function MenuOverlay(props: {
  currentDeckPage: PageId
  scrollMode: boolean
  onClose: () => void
  onSelect: (id: PageId) => void
}) {
  const { onClose, scrollMode, currentDeckPage, onSelect } = props

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose])

  return (
    <div
      aria-modal="true"
      className="animate-fade-in fixed inset-0 z-50 bg-black/95 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
    >
      <div className="absolute inset-0 grid place-items-center px-6">
        <ul className="m-0 list-none space-y-4 p-0" onClick={(e) => e.stopPropagation()}>
          {PAGES.map((p, i) => (
            <li className="animate-menu-item" key={p.id} style={{ animationDelay: `${60 + i * 60}ms` }}>
              <button
                aria-current={!scrollMode && currentDeckPage === p.id ? "page" : undefined}
                className={`group flex items-baseline gap-5 text-left text-[14px] uppercase tracking-[0.18em] font-bold focus-visible:outline focus-visible:outline-1 focus-visible:outline-white focus-visible:outline-offset-[4px] ${
                  !scrollMode && currentDeckPage === p.id ? "text-white" : "text-white/55 hover:text-white"
                }`}
                onClick={() => onSelect(p.id)}
                type="button"
              >
                <span className="w-8 text-[11px] tabular-nums text-white/40 group-hover:text-white/80">{p.kicker}</span>
                <span className="underline decoration-transparent underline-offset-[8px] group-hover:decoration-white/60">
                  {p.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function DocumentFullIndex(props: { ageYears: number; scrollEntryKey: number }) {
  const jump = useCallback((id: PageId) => {
    scrollToSectionId(`section-${id}`)
  }, [])

  return (
    <div className="mx-auto w-full max-w-[640px]">
      <p
        key={`label-${props.scrollEntryKey}`}
        className="animate-label-reveal m-0 px-4 text-center text-[11px] font-bold uppercase text-white/92"
      >
        {DOCUMENT_MODE_LABEL}
      </p>
      <div
        className="animate-doc-shell mt-16 space-y-24 pb-24 sm:mt-20 sm:space-y-[7.5rem] sm:pb-32"
        style={{ animationDelay: "110ms" }}
      >
        <section className="scroll-mt-[6.75rem]" id="section-intro">
          <IntroPage footerHint="scroll" onJump={jump} />
        </section>
        <section className="scroll-mt-[6.75rem] border-t border-white/[0.085] pt-20 sm:pt-24" id="section-bio">
          <BioPage />
        </section>
        <section className="scroll-mt-[6.75rem] border-t border-white/[0.085] pt-20 sm:pt-24" id="section-age">
          <AgePage ageYears={props.ageYears} />
        </section>
        <section className="scroll-mt-[6.75rem] border-t border-white/[0.085] pt-20 sm:pt-24" id="section-builds">
          <BuildsPage />
        </section>
        <section className="scroll-mt-[6.75rem] border-t border-white/[0.085] pb-12 pt-20 sm:pb-16 sm:pt-24" id="section-contact">
          <ContactPage />
        </section>
      </div>
    </div>
  )
}

function HamburgerButton(props: { open: boolean; onToggle: () => void }) {
  return (
    <button
      aria-expanded={props.open}
      aria-label={props.open ? "Close menu" : "Open menu"}
      className="relative grid h-9 w-9 place-items-center rounded-sm hover:bg-white/5 focus-visible:outline focus-visible:outline-1 focus-visible:outline-white"
      onClick={props.onToggle}
      type="button"
    >
      <span aria-hidden className="relative block h-4 w-5">
        <span
          className="absolute left-0 right-0 top-1/2 block h-px bg-white transition-transform duration-300"
          style={{ transform: props.open ? "translateY(0) rotate(45deg)" : "translateY(-4px) rotate(0)" }}
        />
        <span
          className="absolute left-0 right-0 top-1/2 block h-px bg-white transition-transform duration-300"
          style={{ transform: props.open ? "translateY(0) rotate(-45deg)" : "translateY(4px) rotate(0)" }}
        />
      </span>
    </button>
  )
}

function App() {
  const [pageId, setPageId] = useState<PageId>("intro")
  const [menuOpen, setMenuOpen] = useState(false)
  const [uiMode, setUiMode] = useState<"deck" | "scroll">("deck")
  const [scrollEntryKey, setScrollEntryKey] = useState(0)
  const ageYears = useDecimalGregorianAgeYears(BIRTH_DATE_ISO)

  useEffect(() => {
    document.title = SITE_TITLE
    prefetchGithubRepos(GITHUB_USERNAME, 8)
  }, [])

  const currentIndex = indexOfPage(pageId)
  const [navDirection, setNavDirection] = useState(0)

  const pageSurfaceKey = uiMode === "deck" ? `deck-${pageId}` : `scroll-${scrollEntryKey}`

  const goByIndex = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(PAGES.length - 1, next))
      setNavDirection(Math.sign(clamped - indexOfPage(pageId)))
      setPageId(PAGES[clamped].id)
    },
    [pageId],
  )

  const goToPage = useCallback(
    (next: PageId) => {
      setNavDirection(Math.sign(indexOfPage(next) - indexOfPage(pageId)))
      setPageId(next)
    },
    [pageId],
  )

  const enterFullIndex = useCallback(() => {
    setNavDirection(1)
    setScrollEntryKey((k) => k + 1)
    setUiMode("scroll")
  }, [])

  const closeMenu = useCallback(() => setMenuOpen(false), [])

  useEffect(() => {
    if (uiMode !== "scroll") return
    window.scrollTo(0, 0)
  }, [uiMode, scrollEntryKey])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLElement) {
        const tag = e.target.tagName
        if (tag === "INPUT" || tag === "TEXTAREA" || e.target.isContentEditable) return
      }
      if (menuOpen) return
      if (uiMode === "scroll") return

      const lastIx = PAGES.length - 1
      if (e.key === "ArrowRight") {
        e.preventDefault()
        if (currentIndex >= lastIx) enterFullIndex()
        else goByIndex(currentIndex + 1)
        return
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault()
        goByIndex(currentIndex - 1)
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [currentIndex, enterFullIndex, goByIndex, menuOpen, uiMode])

  const headerCn =
    "z-30 flex items-center justify-between px-6 py-5 sm:px-10 sm:py-6 " +
    (uiMode === "scroll"
      ? "sticky inset-x-0 top-0 border-b border-white/10 bg-black/92 backdrop-blur-md"
      : "absolute inset-x-0 top-0")

  const pageAnimCn =
    navDirection > 0 ? "animate-page-from-right" : navDirection < 0 ? "animate-page-from-left" : "animate-page-in"

  return (
    <div className="relative isolate flex min-h-svh flex-col bg-black text-[#f5f5f5]">
      <ParticleField navDirection={navDirection} pageKey={pageSurfaceKey} />
      <SceneChrome />
      <a
        className="sr-only rounded-sm border border-white/40 px-3 py-1.5 text-[12px] outline-none focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:not-sr-only focus:bg-black"
        href="#main"
      >
        Skip to content
      </a>

      <header className={headerCn}>
        <button
          className="text-[11px] font-bold uppercase tracking-[0.2em] hover:opacity-80 focus-visible:outline focus-visible:outline-1 focus-visible:outline-white focus-visible:outline-offset-[4px]"
          onClick={() => {
            if (uiMode === "scroll") {
              setNavDirection(-1)
              setUiMode("deck")
              setPageId("intro")
              window.scrollTo({ top: 0, behavior: prefersSmoothScroll() })
            } else goToPage("intro")
          }}
          type="button"
        >
          {DISPLAY_NAME}
        </button>
        <HamburgerButton onToggle={() => setMenuOpen((o) => !o)} open={menuOpen} />
      </header>

      <main
        className={`relative z-10 flex flex-1 flex-col ${uiMode === "deck" ? "items-center justify-center px-6 pb-24 pt-28 sm:px-10 sm:pb-28 sm:pt-32" : "px-6 pb-20 pt-[5.65rem] sm:px-10 sm:pb-28 sm:pt-[6rem]"}`}
        id="main"
      >
        {uiMode === "deck" ? (
          <div className="w-full max-w-[640px]">
            <div className={pageAnimCn} key={pageId}>
              {pageId === "intro" ? <IntroPage onJump={goToPage} /> : null}
              {pageId === "bio" ? <BioPage /> : null}
              {pageId === "age" ? <AgePage ageYears={ageYears} /> : null}
              {pageId === "builds" ? <BuildsPage /> : null}
              {pageId === "contact" ? <ContactPage endHint /> : null}
            </div>
          </div>
        ) : (
          <DocumentFullIndex ageYears={ageYears} scrollEntryKey={scrollEntryKey} />
        )}
      </main>

      {uiMode === "deck" ? (
        <footer className="relative z-10 shrink-0">
          <Slider
            count={PAGES.length}
            index={currentIndex}
            onChange={goByIndex}
            onPassEnd={enterFullIndex}
            pageLabel={(i) => PAGES[i].label}
          />
        </footer>
      ) : null}

      {menuOpen ? (
        <MenuOverlay
          currentDeckPage={pageId}
          onClose={closeMenu}
          scrollMode={uiMode === "scroll"}
          onSelect={(id) => {
            if (uiMode === "scroll") scrollToSectionId(`section-${id}`)
            else goToPage(id)
            setMenuOpen(false)
          }}
        />
      ) : null}
    </div>
  )
}

export default App

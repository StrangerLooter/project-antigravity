"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { BarChart3, Bot, FileText, Moon, Plus, Search, Sparkles, Sun, X } from "lucide-react"

const quickActions = [
  { href: "/submit", label: "File", icon: FileText },
  { href: "/track", label: "Track", icon: Search },
  { href: "/admin/overview", label: "Insights", icon: BarChart3 },
]

export default function CivicExperienceLayer() {
  const pathname = usePathname()
  const [darkMode, setDarkMode] = useState(false)
  const [fabOpen, setFabOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [progress, setProgress] = useState(0)
  const [cursor, setCursor] = useState({ x: -100, y: -100 })
  const [trail, setTrail] = useState({ x: -100, y: -100 })
  const [recommendedRoute, setRecommendedRoute] = useState("/submit")

  const recommendedLabel = useMemo(() => {
    if (recommendedRoute.includes("admin")) return "Admin insights"
    if (recommendedRoute.includes("track")) return "Track status"
    return "File complaint"
  }, [recommendedRoute])

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("civicai-theme")
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches
    setDarkMode(savedTheme ? savedTheme === "dark" : Boolean(prefersDark))
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light"
    window.localStorage.setItem("civicai-theme", darkMode ? "dark" : "light")
  }, [darkMode])

  useEffect(() => {
    const key = "civicai-route-hits"
    const raw = window.localStorage.getItem(key)
    let hits: Record<string, number> = {}
    try {
      hits = raw ? JSON.parse(raw) as Record<string, number> : {}
    } catch {
      hits = {}
    }
    hits[pathname] = (hits[pathname] ?? 0) + 1
    window.localStorage.setItem(key, JSON.stringify(hits))

    const topRoute = Object.entries(hits)
      .filter(([route]) => route !== pathname && ["/submit", "/track", "/admin/overview"].includes(route))
      .sort((a, b) => b[1] - a[1])[0]?.[0]
    setRecommendedRoute(topRoute ?? (pathname === "/submit" ? "/track" : "/submit"))
  }, [pathname])

  useEffect(() => {
    let raf = 0

    const updateProgress = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0)
    }

    const moveCursor = (event: MouseEvent) => {
      setCursor({ x: event.clientX, y: event.clientY })
      window.clearTimeout(raf)
      raf = window.setTimeout(() => setTrail({ x: event.clientX, y: event.clientY }), 42)
    }

    const clickRipple = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      if (!target?.closest("button, a")) return
      const ripple = document.createElement("span")
      ripple.className = "ripple-burst"
      ripple.style.left = `${event.clientX}px`
      ripple.style.top = `${event.clientY}px`
      document.body.appendChild(ripple)
      window.setTimeout(() => ripple.remove(), 620)
    }

    const tiltCard = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      const card = target?.closest<HTMLElement>(".ui-card, .civic-card, .tilt-card, .neumorphic")
      if (!card) return
      const rect = card.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width - 0.5
      const y = (event.clientY - rect.top) / rect.height - 0.5
      card.style.setProperty("--tilt-x", `${(-y * 5).toFixed(2)}deg`)
      card.style.setProperty("--tilt-y", `${(x * 6).toFixed(2)}deg`)
    }

    const resetTilt = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      const card = target?.closest<HTMLElement>(".ui-card, .civic-card, .tilt-card, .neumorphic")
      if (!card) return
      card.style.setProperty("--tilt-x", "0deg")
      card.style.setProperty("--tilt-y", "0deg")
    }

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible")
        })
      },
      { threshold: 0.14 },
    )

    document.querySelectorAll(".scroll-reveal").forEach((item) => revealObserver.observe(item))
    updateProgress()

    window.addEventListener("scroll", updateProgress, { passive: true })
    window.addEventListener("mousemove", moveCursor, { passive: true })
    window.addEventListener("mousemove", tiltCard, { passive: true })
    window.addEventListener("mouseout", resetTilt, { passive: true })
    window.addEventListener("click", clickRipple)

    return () => {
      revealObserver.disconnect()
      window.clearTimeout(raf)
      window.removeEventListener("scroll", updateProgress)
      window.removeEventListener("mousemove", moveCursor)
      window.removeEventListener("mousemove", tiltCard)
      window.removeEventListener("mouseout", resetTilt)
      window.removeEventListener("click", clickRipple)
    }
  }, [pathname])

  return (
    <>
      <div className="dynamic-video-layer pointer-events-none fixed inset-0 z-0 opacity-55" aria-hidden="true" />
      <div className="scroll-progress" style={{ transform: `scaleX(${progress})` }} />
      <div className="custom-cursor" style={{ transform: `translate3d(${cursor.x}px, ${cursor.y}px, 0)` }} />
      <div className="custom-cursor-trail" style={{ transform: `translate3d(${trail.x}px, ${trail.y}px, 0)` }} />

      <button
        className="dark-mode-toggle"
        onClick={() => setDarkMode((value) => !value)}
        aria-label="Toggle dark mode"
      >
        {darkMode ? <Sun size={17} /> : <Moon size={17} />}
      </button>

      <Link href={recommendedRoute} className="personalization-pill">
        <Bot size={15} />
        Suggested: {recommendedLabel}
      </Link>

      <div className={`experience-fab ${fabOpen ? "is-open" : ""}`}>
        <div className="experience-fab-menu" aria-hidden={!fabOpen}>
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href} className="experience-fab-item" onClick={() => setFabOpen(false)}>
              <action.icon size={16} />
              {action.label}
            </Link>
          ))}
          <button className="experience-fab-item" onClick={() => { setModalOpen(true); setFabOpen(false) }}>
            <Sparkles size={16} />
            AI Brief
          </button>
        </div>
        <button className="experience-fab-button" onClick={() => setFabOpen((value) => !value)} aria-label="Open quick actions">
          {fabOpen ? <X size={22} /> : <Plus size={23} />}
        </button>
      </div>

      {modalOpen ? (
        <div className="morph-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="morph-modal glass-panel" onClick={(event) => event.stopPropagation()}>
            <button className="absolute right-4 top-4 rounded-lg bg-white/10 p-2 text-white hover:bg-white/20 transition-colors" onClick={() => setModalOpen(false)} aria-label="Close AI brief">
              <X size={16} />
            </button>
            <div className="lottie-pulse mx-auto mb-5 text-[#22d3ee]">
              <Sparkles size={28} />
            </div>
            <h2 className="kinetic-title text-center font-display text-2xl font-black text-white">AI civic brief</h2>
            <p className="mx-auto mt-3 max-w-md text-center text-sm font-semibold leading-6 text-white/60">
              CIVICAI is tuned for faster intake: submit, classify, route, track, and visualize public issues without manual sorting.
            </p>
            <svg className="svg-line-draw mx-auto mt-5 h-16 w-56 opacity-60" viewBox="0 0 220 60" fill="none" aria-hidden="true">
              <path d="M8 44 C48 10, 78 12, 108 36 S166 56, 212 16" stroke="#22d3ee" strokeWidth="4" strokeLinecap="round" />
              <path d="M8 46 C54 26, 78 22, 110 42 S168 58, 212 28" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      ) : null}
    </>
  )
}

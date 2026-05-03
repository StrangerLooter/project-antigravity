"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState, useCallback } from "react"
import {
  BarChart3,
  Bot,
  ChevronRight,
  FileText,
  LayoutDashboard,
  LogIn,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Trello,
  UserPlus,
  UserRound,
  X,
  Zap,
} from "lucide-react"

// ─── Search index ────────────────────────────────────────────────────────────
const SEARCH_INDEX = [
  // Pages
  {
    id: "home",
    title: "Home",
    description: "Landing page – CivicAI overview and statistics",
    href: "/",
    category: "Pages",
    icon: LayoutDashboard,
    keywords: ["home", "landing", "start", "civicai", "overview"],
    color: "#22d3ee",
  },
  {
    id: "submit",
    title: "Submit a Complaint",
    description: "File a new grievance with voice, text or image",
    href: "/submit",
    category: "Pages",
    icon: FileText,
    keywords: ["submit", "complaint", "grievance", "file", "new", "report", "issue"],
    color: "#f97316",
  },
  {
    id: "track",
    title: "Track Complaint",
    description: "Search by grievance ID and check status timeline",
    href: "/track",
    category: "Pages",
    icon: Search,
    keywords: ["track", "status", "check", "follow", "grievance", "id", "timeline"],
    color: "#22d3ee",
  },
  {
    id: "citizen-dashboard",
    title: "Citizen Dashboard",
    description: "View your filed complaints, KPIs and resolution history",
    href: "/citizen/dashboard",
    category: "Pages",
    icon: UserRound,
    keywords: ["citizen", "dashboard", "my complaints", "history", "profile", "user"],
    color: "#10b981",
  },
  {
    id: "officer-board",
    title: "Officer Board",
    description: "Kanban queue with AI priority scores and status controls",
    href: "/officer/board",
    category: "Pages",
    icon: Trello,
    keywords: ["officer", "board", "queue", "kanban", "assign", "move", "department"],
    color: "#a855f7",
  },
  {
    id: "admin-overview",
    title: "Admin Overview",
    description: "City-level analytics, charts, heatmap and AI insights",
    href: "/admin/overview",
    category: "Pages",
    icon: BarChart3,
    keywords: ["admin", "analytics", "overview", "chart", "heatmap", "insights", "dashboard", "statistics"],
    color: "#f97316",
  },
  // Auth
  {
    id: "login",
    title: "Login",
    description: "Sign in with mobile number and OTP",
    href: "/auth",
    category: "Account",
    icon: LogIn,
    keywords: ["login", "sign in", "otp", "mobile", "auth", "authenticate", "access"],
    color: "#22d3ee",
  },
  {
    id: "register",
    title: "Register / Sign Up",
    description: "Create a new citizen account with your basic information",
    href: "/auth",
    category: "Account",
    icon: UserPlus,
    keywords: ["register", "sign up", "create account", "new user", "join", "signup"],
    color: "#10b981",
  },
  // Features
  {
    id: "voice-input",
    title: "Voice Input",
    description: "Submit complaints by speaking – go to Submit page",
    href: "/submit",
    category: "Features",
    icon: Zap,
    keywords: ["voice", "speak", "audio", "microphone", "speech", "recognition"],
    color: "#22d3ee",
  },
  {
    id: "ai-classify",
    title: "AI Classification",
    description: "Automatic department routing and urgency scoring by CIVICAI",
    href: "/admin/overview",
    category: "Features",
    icon: Bot,
    keywords: ["ai", "classify", "classification", "route", "routing", "gemini", "automatic", "smart"],
    color: "#a855f7",
  },
  {
    id: "heatmap",
    title: "Complaint Heatmap",
    description: "Geographic cluster view of grievances across MP",
    href: "/admin/overview",
    category: "Features",
    icon: MapPin,
    keywords: ["heatmap", "map", "location", "geo", "cluster", "geography", "district", "ward"],
    color: "#f97316",
  },
  {
    id: "sla",
    title: "SLA Tracking",
    description: "Service-level agreement countdown on each complaint",
    href: "/track",
    category: "Features",
    icon: ShieldCheck,
    keywords: ["sla", "deadline", "countdown", "timer", "service level", "resolution time"],
    color: "#ef4444",
  },
  {
    id: "ai-brief",
    title: "AI Brief",
    description: "AI insights summary – open via the floating action button",
    href: "#",
    category: "Features",
    icon: Sparkles,
    keywords: ["ai brief", "sparkles", "insights", "summary", "quick", "ai"],
    color: "#22d3ee",
  },
]

type SearchItem = typeof SEARCH_INDEX[number]

function scoreResult(item: SearchItem, query: string): number {
  const q = query.toLowerCase().trim()
  if (!q) return 0
  const titleScore = item.title.toLowerCase().includes(q) ? 10 : 0
  const descScore = item.description.toLowerCase().includes(q) ? 5 : 0
  const kwScore = item.keywords.some((kw) => kw.includes(q) || q.includes(kw)) ? 8 : 0
  return titleScore + descScore + kwScore
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function GlobalSearch() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const results = query.trim()
    ? SEARCH_INDEX.map((item) => ({ item, score: scoreResult(item, query) }))
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((r) => r.item)
    : SEARCH_INDEX

  // Group results by category
  const grouped = results.reduce<Record<string, SearchItem[]>>((acc, item) => {
    acc[item.category] ??= []
    acc[item.category].push(item)
    return acc
  }, {})

  const flatResults = results

  // Open / close
  const openSearch = useCallback(() => {
    setOpen(true)
    setQuery("")
    setActiveIndex(0)
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [])

  const closeSearch = useCallback(() => {
    setOpen(false)
    setQuery("")
    setActiveIndex(0)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        open ? closeSearch() : openSearch()
      }
      if (e.key === "Escape" && open) closeSearch()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, openSearch, closeSearch])

  // Arrow navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, flatResults.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter" && flatResults[activeIndex]) {
      e.preventDefault()
      const href = flatResults[activeIndex].href
      if (href !== "#") {
        router.push(href)
        closeSearch()
      }
    }
  }

  // Auto-scroll active item into view
  useEffect(() => {
    if (!listRef.current) return
    const active = listRef.current.querySelector("[data-active='true']") as HTMLElement | null
    active?.scrollIntoView({ block: "nearest" })
  }, [activeIndex])

  // Expose open trigger globally so AppShell can call it
  useEffect(() => {
    (window as any).__openGlobalSearch = openSearch
    return () => { delete (window as any).__openGlobalSearch }
  }, [openSearch])

  // ─── Highlight match ──────────────────────────────────────────────────────
  function highlight(text: string) {
    if (!query.trim()) return text
    const idx = text.toLowerCase().indexOf(query.toLowerCase().trim())
    if (idx === -1) return text
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-[#22d3ee]/30 text-[#22d3ee] rounded px-0.5 not-italic font-black">
          {text.slice(idx, idx + query.trim().length)}
        </mark>
        {text.slice(idx + query.trim().length)}
      </>
    )
  }

  let flatIndex = 0

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm"
        onClick={closeSearch}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className="fixed left-1/2 top-[10vh] z-[9999] w-full max-w-2xl -translate-x-1/2 rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl shadow-black/80"
        role="dialog"
        aria-modal="true"
        aria-label="Global search"
      >
        {/* Search bar */}
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
          <Search size={20} className="shrink-0 text-[#22d3ee]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIndex(0) }}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, features, admin, login…"
            className="min-w-0 flex-1 bg-transparent text-base font-semibold text-white placeholder-white/30 outline-none"
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setActiveIndex(0); inputRef.current?.focus() }}
              className="grid h-6 w-6 place-items-center rounded-md bg-white/10 text-white/60 hover:bg-white/20 transition-colors"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
          <kbd className="hidden shrink-0 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-black text-white/40 sm:block">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-white/10">
          {flatResults.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Search size={36} className="text-white/20" />
              <p className="text-sm font-bold text-white/40">No results for "{query}"</p>
              <p className="text-xs text-white/25">Try "admin", "login", "submit", "track"…</p>
            </div>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                {/* Category header */}
                <div className="px-4 pb-1 pt-3">
                  <span className="text-[11px] font-black uppercase tracking-[0.15em] text-white/30">
                    {category}
                  </span>
                </div>
                {items.map((item) => {
                  const currentFlatIndex = flatResults.indexOf(item)
                  const isActive = currentFlatIndex === activeIndex
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.id}
                      href={item.href === "#" ? "/" : item.href}
                      onClick={closeSearch}
                      data-active={isActive}
                      className={`group flex items-center gap-4 px-4 py-3 transition-colors ${
                        isActive
                          ? "bg-white/8 border-l-2 border-[#22d3ee]"
                          : "hover:bg-white/5 border-l-2 border-transparent"
                      }`}
                    >
                      {/* Icon */}
                      <span
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-transform group-hover:scale-105"
                        style={{
                          background: `${item.color}18`,
                          border: `1px solid ${item.color}30`,
                          color: item.color,
                        }}
                      >
                        <Icon size={16} />
                      </span>

                      {/* Text */}
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-black ${isActive ? "text-white" : "text-white/80"}`}>
                          {highlight(item.title)}
                        </p>
                        <p className="mt-0.5 truncate text-xs font-medium text-white/40">
                          {highlight(item.description)}
                        </p>
                      </div>

                      {/* Arrow */}
                      <ChevronRight
                        size={16}
                        className={`shrink-0 transition-all ${
                          isActive ? "text-[#22d3ee] translate-x-0.5" : "text-white/20 group-hover:text-white/40"
                        }`}
                      />
                    </Link>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 border-t border-white/10 px-4 py-3">
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-white/30">
            <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px]">↑↓</kbd>
            navigate
          </span>
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-white/30">
            <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px]">↵</kbd>
            open
          </span>
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-white/30">
            <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px]">Esc</kbd>
            close
          </span>
          <span className="ml-auto flex items-center gap-1 text-[11px] font-bold text-white/20">
            <Sparkles size={11} />
            {flatResults.length} results
          </span>
        </div>
      </div>
    </>
  )
}

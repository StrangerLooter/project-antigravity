"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Bell, ChevronRight, Command, FileText, LayoutDashboard, MapPin, Plus, Search, ShieldCheck, Sparkles, Trello, UserRound, Zap } from "lucide-react"
import type React from "react"
import dynamic from "next/dynamic"

const GlobalSearch = dynamic(() => import("@/components/GlobalSearch"), { ssr: false })

const navItems = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/submit", label: "Submit", icon: FileText },
  { href: "/track", label: "Track", icon: Search },
  { href: "/citizen/dashboard", label: "Citizen", icon: UserRound },
  { href: "/officer/board", label: "Officer", icon: Trello },
  { href: "/admin/overview", label: "Admin", icon: BarChart3 },
]

export default function CivicAppShell({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) {
  const pathname = usePathname()
  const activeItem = navItems.find((item) => item.href === "/" ? pathname === "/" : pathname.startsWith(item.href))

  function openSearch() {
    if (typeof window !== "undefined" && (window as any).__openGlobalSearch) {
      ;(window as any).__openGlobalSearch()
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white relative">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay pointer-events-none"></div>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-white/10 bg-[#0a0a0a]/95 p-4 text-white shadow-2xl shadow-black/50 backdrop-blur-xl lg:block">
        <Link href="/" className="mb-8 flex items-center gap-3 rounded-xl px-2 py-3">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-gradient-to-tr from-[#f97316] to-[#ef4444] shadow-lg shadow-[#f97316]/20">
            <ShieldCheck size={23} />
          </span>
          <span>
            <span className="block font-display text-xl font-black">CIVICAI</span>
            <span className="block text-xs font-bold text-white/50">Classified. Routed. Heard.</span>
          </span>
        </Link>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold transition ${active ? "bg-white/10 text-white shadow-lg shadow-black/15 border border-white/10" : "text-white/68 hover:bg-white/5 hover:text-white"}`}
              >
                <item.icon size={18} />
                <span className="flex-1">{item.label}</span>
                {active ? <ChevronRight size={15} /> : null}
              </Link>
            )
          })}
        </nav>
        <div className="mt-6 rounded-xl border border-white/10 bg-white/8 p-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-[#22d3ee]">
            <Sparkles size={14} /> AI routing health
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[84%] rounded-full bg-[#22d3ee]" />
          </div>
          <div className="mt-3 flex justify-between text-xs font-bold text-white/55">
            <span>Gemini-ready</span>
            <span>84%</span>
          </div>
        </div>
        <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/10 bg-white/8 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-black text-[#22d3ee]">
            <MapPin size={16} /> Madhya Pradesh pilot
          </div>
          <p className="text-sm leading-6 text-white/60">Demo data persists in this browser until local storage is cleared.</p>
        </div>
      </aside>

      <div className="lg:pl-72 relative z-10">
        <header className="glass-panel sticky top-0 z-30 border-b border-white/10 bg-[#0a0a0a]/90 px-4 py-4 shadow-sm shadow-black/50 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div>
              <div className="mb-1 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-[#f97316]">
                <span>CIVICAI App</span>
                <ChevronRight size={14} className="text-white/40" />
                <span className="text-white/60">{activeItem?.label ?? "Workspace"}</span>
              </div>
              <h1 className="kinetic-title font-display text-2xl font-black tracking-normal text-white sm:text-3xl">{title}</h1>
              <p className="mt-1 text-sm font-semibold text-white/60">{subtitle}</p>
            </div>
            <div className="hidden items-center gap-2 xl:flex">
              <button
                onClick={openSearch}
                className="flex h-10 w-72 items-center gap-2 rounded-lg border border-white/10 bg-black/50 px-3 text-sm font-semibold text-white/60 hover:border-[#22d3ee]/40 hover:bg-[#22d3ee]/5 hover:text-white/80 transition-all group"
                aria-label="Open search (Ctrl+K)"
              >
                <Search size={16} className="text-white/40 group-hover:text-[#22d3ee] transition-colors" />
                <span className="flex-1 text-left">Search anything…</span>
                <kbd className="flex items-center gap-0.5 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-black">
                  <Command size={10} />K
                </kbd>
              </button>
              <button className="relative grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors" aria-label="Notifications">
                <Bell size={18} />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#ef4444]" />
              </button>
              <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-black text-white">
                <Zap size={15} className="text-[#22d3ee]" /> Live
              </div>
              <Link href="/submit" className="advanced-hover inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#f97316] to-[#ef4444] px-4 py-2 text-sm font-black text-white shadow-lg shadow-[#f97316]/20">
                <Plus size={16} /> New Complaint
              </Link>
            </div>
          </div>
          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {navItems.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
              return (
                <Link key={item.href} href={item.href} className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold border border-white/5 ${active ? "bg-[#f97316]/20 text-[#f97316]" : "bg-white/5 text-white/60"}`}>
                  <item.icon size={16} />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </header>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
      </div>
      <Link href="/submit" className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-r from-[#f97316] to-[#ef4444] text-white shadow-2xl shadow-[#f97316]/30 lg:hidden" aria-label="New complaint">
        <Plus size={24} />
      </Link>

      {/* Mobile search button */}
      <button
        onClick={openSearch}
        className="fixed bottom-5 left-5 z-40 grid h-14 w-14 place-items-center rounded-full border border-white/10 bg-[#0a0a0a]/90 text-white shadow-2xl shadow-black/50 backdrop-blur-xl lg:hidden"
        aria-label="Search (Ctrl+K)"
      >
        <Search size={22} />
      </button>

      <GlobalSearch />
    </main>
  )
}

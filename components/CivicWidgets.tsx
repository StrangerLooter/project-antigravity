"use client"

import { CheckCircle2, Clock3, FileText, Loader2, Sparkles } from "lucide-react"
import type React from "react"
import { formatDate, statusClass, statusSteps, type Grievance } from "@/lib/civicai-data"

export function KpiCard({ icon: Icon, label, value, note }: { icon: any; label: string; value: string; note: string }) {
  return (
    <div className="ui-card neumorphic scroll-reveal group rounded-xl border border-white/10 bg-white/5 p-5 shadow-sm text-white">
      <div className="mb-5 flex items-center justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#22d3ee]/10 text-[#22d3ee] transition group-hover:scale-105">
          <Icon size={20} />
        </span>
        <span className="rounded-full bg-[#f97316]/10 px-2 py-1 text-xs font-black text-[#f97316]">{note}</span>
      </div>
      <p className="text-sm font-bold text-white/50">{label}</p>
      <p className="mt-1 font-display text-3xl font-black tracking-normal">{value}</p>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-[#22d3ee] to-[#06b6d4]" />
      </div>
      <svg className="svg-line-draw mt-4 h-8 w-full opacity-50" viewBox="0 0 180 28" fill="none" aria-hidden="true">
        <path d="M2 20 C36 4, 58 23, 88 12 S138 5, 178 18" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  )
}

export function StatusTimeline({ grievance }: { grievance: Grievance }) {
  return (
    <div className="ui-card glass-panel scroll-reveal rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 shadow-sm text-white">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-white/50">Timeline</p>
          <h2 className="font-display text-2xl font-black tracking-normal">{grievance.id}</h2>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-black ${statusClass(grievance.status)}`}>{grievance.status}</span>
      </div>
      <div className="space-y-4">
        {statusSteps.map((step, index) => {
          const entry = grievance.timeline.find((item) => item.status === step)
          const active = Boolean(entry)
          const current = grievance.status === step

          return (
            <div key={step} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className={`grid h-10 w-10 place-items-center rounded-full ${active ? "bg-[#22d3ee] text-black shadow-[0_0_15px_rgba(34,211,238,0.3)]" : "bg-white/5 text-white/30"}`}>
                  {current && step !== "Resolved" ? <Loader2 className="animate-spin" size={18} /> : active ? <CheckCircle2 size={18} /> : <Clock3 size={18} />}
                </span>
                {index !== statusSteps.length - 1 ? <span className="h-12 w-px bg-white/10" /> : null}
              </div>
              <div className="pb-4">
                <p className="font-black text-white">{step}</p>
                <p className="text-sm leading-6 text-white/60">
                  {entry ? `${entry.note} ${formatDate(entry.at)} by ${entry.actor}.` : "Pending next department action."}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="glass-panel scroll-reveal rounded-2xl border border-dashed border-white/20 bg-white/5 p-8 text-center shadow-sm text-white">
      <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-[#22d3ee]/10 text-[#22d3ee]">
        <FileText size={22} />
      </span>
      <p className="font-display text-xl font-black">{title}</p>
      <p className="mx-auto mt-2 max-w-xl leading-7 text-white/50">{text}</p>
    </div>
  )
}

export function StatusLegend() {
  const items = [
    ["Submitted", "#9ca3af"],
    ["AI Classified", "#22d3ee"],
    ["Assigned", "#a855f7"],
    ["In Progress", "#f97316"],
    ["Resolved", "#10b981"],
  ]

  return (
    <div className="ui-card glass-panel flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-sm">
      <span className="text-xs font-black uppercase tracking-[0.18em] text-white/50">Status legend</span>
      {items.map(([label, color]) => (
        <span key={label} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-black text-white/80">
          <span className="status-dot h-2.5 w-2.5 rounded-full" style={{ background: color }} />
          {label}
        </span>
      ))}
    </div>
  )
}

export function UiIdeasPanel() {
  const ideas = [
    "Micro-interactions",
    "Dynamic gradients",
    "Glassmorphism",
    "Neumorphism",
    "Custom cursor effects",
    "Scroll-triggered animation",
    "Parallax layers",
    "3D transforms",
    "SVG line animation",
    "Animated typography",
    "Dark mode toggle",
    "Skeleton loading screens",
    "Lottie-style motion",
    "Interactive charts",
    "Expandable FAB menu",
    "Dynamic video field",
    "Morphing modal",
    "Advanced hover states",
    "Scroll progress bar",
    "AI personalization",
  ]

  return (
    <section className="ui-card glass-panel scroll-reveal rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 shadow-sm text-white">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="text-[#22d3ee]" size={20} />
        <h2 className="font-display text-xl font-black tracking-normal">UI upgrades applied</h2>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {ideas.map((idea, index) => (
          <div key={idea} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-white/80">
            <span className="mr-2 font-mono text-xs text-[#22d3ee]">{String(index + 1).padStart(2, "0")}</span>
            {idea}
          </div>
        ))}
      </div>
    </section>
  )
}

"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowRight, Bot, CheckCircle2, Trello } from "lucide-react"
import CivicAppShell from "@/components/CivicAppShell"
import { StatusLegend } from "@/components/CivicWidgets"
import {
  getGrievances,
  nextStatus,
  statusClass,
  statusSteps,
  updateGrievanceStatus,
  urgencyClass,
  type Grievance,
  type Status,
} from "@/lib/civicai-data"

const columns: Status[] = ["AI Classified", "Assigned", "In Progress", "Resolved"]

function getSlaTimeLeft(deadlineDate: string) {
  if (!deadlineDate) return "N/A"
  const diff = new Date(deadlineDate).getTime() - Date.now()
  if (diff <= 0) return "SLA Breached"
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}d ${hours % 24}h left`
  return `${hours}h left`
}

export default function OfficerBoardPage() {
  const [grievances, setGrievances] = useState<Grievance[]>([])

  useEffect(() => {
    setGrievances(getGrievances())
  }, [])

  function advance(item: Grievance) {
    setGrievances(updateGrievanceStatus(item.id, nextStatus(item.status)))
  }

  return (
    <CivicAppShell title="Officer Board" subtitle="Department queue with AI priority score, status controls, and resolution context.">
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="neumorphic scroll-reveal rounded-xl border border-white/10 bg-white/5 p-5 shadow-sm text-white">
          <Trello className="mb-3 text-[#22d3ee]" />
          <p className="text-sm font-bold text-white/50">Assigned queue</p>
          <p className="font-display text-3xl font-black">{grievances.length}</p>
        </div>
        <div className="neumorphic scroll-reveal rounded-xl border border-white/10 bg-white/5 p-5 shadow-sm text-white">
          <Bot className="mb-3 text-[#10b981]" />
          <p className="text-sm font-bold text-white/50">Avg. AI confidence</p>
          <p className="font-display text-3xl font-black">84%</p>
        </div>
        <div className="neumorphic scroll-reveal rounded-xl border border-white/10 bg-white/5 p-5 shadow-sm text-white">
          <CheckCircle2 className="mb-3 text-[#f97316]" />
          <p className="text-sm font-bold text-white/50">Resolved today</p>
          <p className="font-display text-3xl font-black">{grievances.filter((item) => item.status === "Resolved").length}</p>
        </div>
      </div>

      <section className="mb-6 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
        <StatusLegend />
        <div className="ui-card glass-panel flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-[#0a0a0a] p-3 shadow-sm">
          <button className="rounded-lg border border-white/10 px-3 py-2 text-xs font-black text-white hover:bg-white/5 transition-colors">High priority</button>
          <button className="rounded-lg border border-white/10 px-3 py-2 text-xs font-black text-white hover:bg-white/5 transition-colors">Duplicates</button>
          <button className="rounded-lg bg-gradient-to-r from-[#22d3ee] to-[#06b6d4] px-3 py-2 text-xs font-black text-black shadow-lg shadow-[#22d3ee]/20">Auto assign</button>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-4">
        {columns.map((column) => {
          const items = grievances.filter((item) => item.status === column)
          return (
            <section key={column} className="scroll-reveal rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-black text-white">{column}</h2>
                <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-black text-white/50">{items.length}</span>
              </div>
              <div className="space-y-3">
                {items.length ? (
                  items.map((item) => (
                    <article key={item.id} className="advanced-hover tilt-card rounded-xl border border-white/10 bg-[#0a0a0a] p-4 shadow-sm text-white">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-black text-[#22d3ee]">{item.id}</span>
                        <span className={`rounded-full px-2 py-1 text-[10px] font-black ${urgencyClass(item.urgency)}`}>{item.urgency}</span>
                      </div>
                      <p className="text-sm font-bold leading-6">{item.summary}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-[#22d3ee]/10 px-2 py-1 text-[10px] font-black text-[#22d3ee] border border-[#22d3ee]/20">{item.department}</span>
                        <span className={`rounded-full px-2 py-1 text-[10px] font-black ${statusClass(item.status)}`}>{item.status}</span>
                        {item.status !== "Resolved" && item.slaDeadline && (
                          <span className={`rounded-full px-2 py-1 text-[10px] font-black ${new Date(item.slaDeadline).getTime() < Date.now() + 86400000 ? "bg-[#ef4444] text-white animate-pulse" : "bg-[#f97316]/10 text-[#f97316] border border-[#f97316]/20"}`}>
                            SLA: {getSlaTimeLeft(item.slaDeadline)}
                          </span>
                        )}
                      </div>
                      <div className="mt-4 rounded-lg bg-white/5 border border-white/10 p-3 text-xs leading-5 text-white/60">
                        Similar resolved cases suggest: verify site, create work order, attach completion proof.
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Link href={`/track/${item.id}`} className="flex-1 rounded-lg border border-white/10 px-3 py-2 text-center text-xs font-black text-white hover:bg-white/5 transition-colors">
                          Details
                        </Link>
                        {item.status !== "Resolved" ? (
                          <button onClick={() => advance(item)} className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-[#22d3ee] to-[#06b6d4] px-3 py-2 text-xs font-black text-black shadow-lg shadow-[#22d3ee]/20">
                            Move <ArrowRight size={14} />
                          </button>
                        ) : null}
                      </div>
                    </article>
                  ))
                ) : (
                  <p className="rounded-xl border border-dashed border-white/20 bg-transparent p-4 text-sm leading-6 text-white/50">No complaints in this lane.</p>
                )}
              </div>
            </section>
          )
        })}
      </div>
    </CivicAppShell>
  )
}

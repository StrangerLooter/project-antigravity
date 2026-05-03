"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Copy, Search, ShieldCheck, TimerReset } from "lucide-react"
import CivicAppShell from "@/components/CivicAppShell"
import { EmptyState, StatusTimeline } from "@/components/CivicWidgets"
import { findGrievance, getGrievances, sampleGrievances, statusClass, urgencyClass, type Grievance } from "@/lib/civicai-data"

export default function TrackComplaintPage({ initialId = "" }: { initialId?: string }) {
  const searchParams = useSearchParams()
  const queryId = searchParams.get("id") ?? ""
  const [trackingId, setTrackingId] = useState(initialId || queryId || "CIV-2026-00347")
  const [grievance, setGrievance] = useState<Grievance | null>(null)
  const [suggestions, setSuggestions] = useState<Grievance[]>(sampleGrievances.slice(0, 3))
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    const records = getGrievances()
    const id = initialId || queryId || trackingId
    setTrackingId(id)
    setSuggestions(records.slice(0, 3))
    setGrievance(records.find((item) => item.id.toLowerCase() === id.toLowerCase()) ?? null)
    setSearched(true)
  }, [initialId, queryId, trackingId])

  function search() {
    setGrievance(findGrievance(trackingId) ?? null)
    setSearched(true)
  }

  return (
    <CivicAppShell title="Track Complaint" subtitle="Search by grievance ID and follow the full status timeline.">
      <div className="grid gap-8 xl:grid-cols-[0.85fr_1.15fr]">
        <section className="glass-panel scroll-reveal rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 shadow-sm text-white">
          <h2 className="font-display text-2xl font-black tracking-normal">Enter Grievance ID</h2>
          <div className="mt-5 flex gap-2 rounded-xl border border-white/10 bg-white/5 p-2">
            <input value={trackingId} onChange={(event) => setTrackingId(event.target.value)} className="min-w-0 flex-1 bg-transparent px-3 font-mono text-sm font-black outline-none text-white focus:ring-0" />
            <button onClick={search} className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-gradient-to-r from-[#22d3ee] to-[#06b6d4] text-black shadow-[0_0_15px_rgba(34,211,238,0.3)]" aria-label="Search">
              <Search size={18} />
            </button>
          </div>

          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-5 text-white">
            <p className="text-sm font-bold text-white/50">Try a sample ID</p>
            <div className="mt-3 space-y-2">
              {suggestions.map((item) => (
                <button key={item.id} onClick={() => { setTrackingId(item.id); setGrievance(item); setSearched(true) }} className="flex w-full items-center justify-between gap-3 rounded-lg bg-white/8 px-3 py-3 text-left text-sm font-bold text-white/75 hover:bg-white/12">
                  <span>{item.id}</span>
                  <span className="text-[#22d3ee]">{item.status}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {grievance ? (
          <section className="space-y-5">
            <div className="glass-panel scroll-reveal rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 shadow-sm text-white">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-white/50">Complaint</p>
                  <h2 className="mt-1 font-display text-3xl font-black tracking-normal text-[#22d3ee]">{grievance.id}</h2>
                </div>
                <button className="grid h-10 w-10 place-items-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors" aria-label="Copy ID">
                  <Copy size={18} />
                </button>
              </div>
              <p className="mt-4 text-lg font-bold leading-7">{grievance.summary}</p>
              {grievance.imageDataUrl ? (
                <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                  <img src={grievance.imageDataUrl} alt="Grievance evidence" className="max-h-80 w-full object-cover" />
                  <p className="p-3 text-sm font-bold text-white/60">{grievance.imageName ?? "Uploaded image evidence"}</p>
                </div>
              ) : null}
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#22d3ee]/10 px-3 py-1 text-xs font-black text-[#22d3ee] border border-[#22d3ee]/20">{grievance.department}</span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white/80 border border-white/10">{grievance.category}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-black ${urgencyClass(grievance.urgency)}`}>{grievance.urgency}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-black ${statusClass(grievance.status)}`}>{grievance.status}</span>
              </div>
              <div className="mt-5 rounded-xl border border-[#f97316]/30 bg-[#f97316]/10 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#f97316]/20 text-[#f97316]">
                      <TimerReset size={18} />
                    </span>
                    <div>
                      <p className="text-sm font-black text-white">SLA countdown</p>
                      <p className="text-xs font-bold text-white/60">Priority window based on urgency and department queue.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-black/50 border border-[#f97316]/30 px-3 py-1.5 text-xs font-black text-[#f97316]">
                    <ShieldCheck size={14} /> 18h left
                  </div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-[#f97316] to-[#ef4444]" />
                </div>
              </div>
            </div>
            <StatusTimeline grievance={grievance} />
          </section>
        ) : searched ? (
          <EmptyState title="No grievance found" text="Check the ID and try again, or submit a new complaint to create a demo record." />
        ) : null}
      </div>
    </CivicAppShell>
  )
}

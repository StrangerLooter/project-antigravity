"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { CheckCircle2, Clock3, FileText, Gauge, Plus } from "lucide-react"
import dynamic from "next/dynamic"
import CivicAppShell from "@/components/CivicAppShell"
import { KpiCard, StatusLegend } from "@/components/CivicWidgets"
import { formatDate, getGrievances, saveGrievances, statusClass, urgencyClass, type Grievance } from "@/lib/civicai-data"
import { motion, AnimatePresence } from "framer-motion"
import { ThumbsUp, Star, RotateCcw } from "lucide-react"

const NearbyIssuesMap = dynamic(() => import("@/components/NearbyIssuesMap"), { ssr: false })

export default function CitizenDashboardPage() {
  const [grievances, setGrievances] = useState<Grievance[]>([])
  const [activeTab, setActiveTab] = useState<"personal" | "community">("personal")

  useEffect(() => {
    setGrievances(getGrievances())
  }, [])

  const handleUpvote = (id: string) => {
    const next = grievances.map(g => {
      if (g.id === id) return { ...g, upvotes: (g.upvotes || 0) + 1 }
      return g
    })
    setGrievances(next)
    saveGrievances(next)
  }

  const handleRate = (id: string, rating: number) => {
    const next = grievances.map(g => {
      if (g.id === id) return { ...g, rating }
      return g
    })
    setGrievances(next)
    saveGrievances(next)
  }

  const handleAppeal = (id: string) => {
    const next = grievances.map(g => {
      if (g.id === id) return { ...g, isAppealed: true, status: "Submitted" as const }
      return g
    })
    setGrievances(next)
    saveGrievances(next)
  }

  const stats = useMemo(() => {
    const resolved = grievances.filter((item) => item.status === "Resolved").length
    const active = grievances.length - resolved
    return { resolved, active }
  }, [grievances])

  return (
    <CivicAppShell title="Citizen Dashboard" subtitle="Your grievance history, live status, and local civic trend snapshot.">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-white/50">Welcome, Ram</p>
          <div className="flex items-center gap-6 mt-1">
            <button 
              onClick={() => setActiveTab("personal")}
              className={`font-display text-3xl font-black tracking-normal transition-colors ${activeTab === "personal" ? "text-white" : "text-white/30 hover:text-white/60"}`}
            >
              My Complaints
            </button>
            <button 
              onClick={() => setActiveTab("community")}
              className={`font-display text-3xl font-black tracking-normal transition-colors ${activeTab === "community" ? "text-white" : "text-white/30 hover:text-white/60"}`}
            >
              Community Feed
            </button>
          </div>
        </div>
        <Link href="/submit" className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#f97316] to-[#ef4444] px-4 py-3 font-black text-white shadow-lg shadow-[#f97316]/20">
          <Plus size={18} /> Quick Submit
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={FileText} label="Total filed" value={String(grievances.length)} note="+ local demo" />
        <KpiCard icon={CheckCircle2} label="Resolved" value={String(stats.resolved)} note="closed" />
        <KpiCard icon={Clock3} label="Active" value={String(stats.active)} note="open" />
        <KpiCard icon={Gauge} label="Avg. area time" value="3.1d" note="-18%" />
      </div>

      <div className="mt-5">
        <StatusLegend />
      </div>

      <section className="ui-card glass-panel scroll-reveal mt-8 rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-2xl font-black tracking-normal text-white">
            {activeTab === "personal" ? "Complaint History" : "Trending in your area"}
          </h3>
          <span className="rounded-full bg-[#22d3ee]/15 px-3 py-1 text-xs font-black text-[#22d3ee]">SMS-ready</span>
        </div>
        <div className="overflow-x-auto">
          <AnimatePresence mode="wait">
            <motion.table 
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full min-w-[800px] text-left text-sm"
            >
              <thead className="text-xs uppercase text-white/50">
                <tr>
                  <th className="py-3">ID</th>
                  <th>Issue</th>
                  <th>Department</th>
                  <th>Status</th>
                  {activeTab === "community" ? <th>Upvotes</th> : <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {grievances.map((item) => (
                  <tr key={item.id} className="border-t border-white/10 text-white">
                    <td className="py-4 font-mono text-xs font-black text-[#22d3ee]">{item.id}</td>
                    <td className="max-w-[280px] pr-5 leading-6">
                      <div className="font-semibold">{item.summary}</div>
                      {activeTab === "personal" && item.status === "Resolved" && (
                        <div className="mt-2 flex items-center gap-3">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button key={star} onClick={() => handleRate(item.id, star)}>
                                <Star size={16} className={`${(item.rating || 0) >= star ? "fill-[#f97316] text-[#f97316]" : "text-white/20"}`} />
                              </button>
                            ))}
                          </div>
                          {!item.isAppealed && (
                            <button onClick={() => handleAppeal(item.id)} className="flex items-center gap-1 text-xs font-bold text-[#ef4444] hover:underline">
                              <RotateCcw size={12} /> Appeal Decision
                            </button>
                          )}
                          {item.isAppealed && <span className="text-xs font-bold text-[#f97316]">Appealed</span>}
                        </div>
                      )}
                    </td>
                    <td>{item.department}</td>
                    <td><span className={`rounded-full px-2 py-1 text-xs font-black ${statusClass(item.status)}`}>{item.status}</span></td>
                    {activeTab === "community" ? (
                      <td>
                        <button onClick={() => handleUpvote(item.id)} className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1 hover:bg-[#22d3ee]/10 hover:text-[#22d3ee] transition-colors">
                          <ThumbsUp size={14} /> <span className="font-bold">{item.upvotes || 0}</span>
                        </button>
                      </td>
                    ) : (
                      <td><Link href={`/track/${item.id}`} className="font-black text-[#22d3ee] hover:underline">Track</Link></td>
                    )}
                  </tr>
                ))}
              </tbody>
            </motion.table>
          </AnimatePresence>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="glass-panel scroll-reveal rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 shadow-sm text-white">
          <h3 className="font-display text-2xl font-black tracking-normal">Local trend</h3>
          <div className="mt-5 space-y-4">
            {[
              ["Water Supply", 76, "#22d3ee"],
              ["Roads", 58, "#06b6d4"],
              ["Electricity", 42, "#f97316"],
            ].map(([name, value, color]) => (
              <div key={name as string}>
                <div className="mb-2 flex justify-between text-sm font-black">
                  <span>{name as string}</span>
                  <span>{value as number}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/5">
                  <div className="h-full rounded-full" style={{ width: `${value}%`, background: color as string }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="advanced-hover scroll-reveal relative min-h-72 overflow-hidden rounded-2xl border border-white/10 shadow-sm">
          <NearbyIssuesMap />
        </div>
      </section>
    </CivicAppShell>
  )
}

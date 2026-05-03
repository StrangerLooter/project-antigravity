"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertTriangle, BarChart3, CheckCircle2, Clock3, FileText, Lightbulb } from "lucide-react"
import dynamic from "next/dynamic"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import CivicAppShell from "@/components/CivicAppShell"
import { KpiCard, StatusLegend, UiIdeasPanel } from "@/components/CivicWidgets"
import { getGrievances, type Grievance } from "@/lib/civicai-data"

const NearbyIssuesMap = dynamic(() => import("@/components/NearbyIssuesMap"), { ssr: false })

export default function AdminOverviewPage() {
  const [grievances, setGrievances] = useState<Grievance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setGrievances(getGrievances())
    const timer = window.setTimeout(() => setLoading(false), 360)
    return () => window.clearTimeout(timer)
  }, [])

  const stats = useMemo(() => {
    const resolved = grievances.filter((item) => item.status === "Resolved").length
    const critical = grievances.filter((item) => item.urgency === "CRITICAL").length
    const departments = grievances.reduce<Record<string, { name: string; total: number; resolved: number }>>((acc, item) => {
      const name = item.department.replace(" & Infrastructure", "").replace(" & Garbage", "")
      acc[name] ??= { name, total: 0, resolved: 0 }
      acc[name].total += 1
      if (item.status === "Resolved") acc[name].resolved += 1
      return acc
    }, {})

    const pie = Object.values(departments).map((item, index) => ({
      name: item.name,
      value: item.total,
      color: ["#f97316", "#22d3ee", "#ef4444", "#06b6d4", "#a855f7"][index % 5],
    }))

    return {
      resolved,
      critical,
      resolutionRate: grievances.length ? Math.round((resolved / grievances.length) * 100) : 0,
      departments: Object.values(departments),
      pie,
    }
  }, [grievances])

  return (
    <CivicAppShell title="Admin Overview" subtitle="City-level operating picture for grievance volume, bottlenecks, and AI insights.">
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="skeleton-shimmer h-44 rounded-xl border border-white/10 bg-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard icon={FileText} label="Total grievances" value={String(grievances.length)} note="browser data" />
          <KpiCard icon={CheckCircle2} label="Resolution rate" value={`${stats.resolutionRate}%`} note="+ demo" />
          <KpiCard icon={Clock3} label="Avg. resolution" value="3.2d" note="-21%" />
          <KpiCard icon={AlertTriangle} label="Critical open" value={String(stats.critical)} note="watch" />
        </div>
      )}

      <div className="mt-5">
        <StatusLegend />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="glass-panel scroll-reveal tilt-card rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 shadow-sm text-white">
          <div className="mb-5 flex items-center gap-2">
            <BarChart3 className="text-[#f97316]" />
            <h2 className="font-display text-2xl font-black tracking-normal">Department performance</h2>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={stats.departments}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
              <XAxis dataKey="name" stroke="#888888" />
              <YAxis allowDecimals={false} stroke="#888888" />
              <Tooltip cursor={{fill: '#ffffff10'}} contentStyle={{backgroundColor: '#0a0a0a', borderColor: '#333'}} />
              <Bar dataKey="total" fill="#f97316" radius={[6, 6, 0, 0]} />
              <Bar dataKey="resolved" fill="#22d3ee" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        <section className="glass-panel scroll-reveal tilt-card rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 shadow-sm text-white">
          <h2 className="font-display text-2xl font-black tracking-normal">Category share</h2>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie data={stats.pie} dataKey="value" nameKey="name" innerRadius={70} outerRadius={112}>
                {stats.pie.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{backgroundColor: '#0a0a0a', borderColor: '#333'}} />
            </PieChart>
          </ResponsiveContainer>
        </section>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="advanced-hover scroll-reveal overflow-hidden rounded-2xl border border-white/10 shadow-sm">
          <div className="border-b border-white/10 bg-[#0a0a0a] px-4 py-3 text-white">
            <p className="font-black">Complaint Heatmap</p>
            <p className="text-sm text-white/50">Bhopal Ward 7 remains the strongest density cluster across MP.</p>
          </div>
          <NearbyIssuesMap />
        </section>

        <section className="glass-panel scroll-reveal tilt-card rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 shadow-sm text-white">
          <div className="mb-5 flex items-center gap-2">
            <Lightbulb className="text-[#f97316]" />
            <h2 className="font-display text-2xl font-black tracking-normal">AI insights</h2>
          </div>
          <div className="space-y-3">
            {[
              "Water complaints are the fastest-growing cluster in the current demo dataset.",
              "Critical complaints should auto-escalate if no officer action occurs within 2 hours.",
              "Road complaints near schools should receive safety-weighted priority scoring.",
              "Resolved sanitation cases can be used as response templates for similar future issues.",
            ].map((insight) => (
              <div key={insight} className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm font-semibold leading-6 text-white/80">
                {insight}
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-8">
        <UiIdeasPanel />
      </div>
    </CivicAppShell>
  )
}

"use client"

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  Bot,
  CheckCircle2,
  Clock3,
  Copy,
  FileText,
  Filter,
  Gauge,
  Globe2,
  LayoutDashboard,
  Lightbulb,
  Loader2,
  Lock,
  MapPin,
  Menu,
  MessageSquare,
  Mic,
  Phone,
  PieChart,
  Plus,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
  UserRound,
  Users,
  X,
} from "lucide-react"
import { motion } from "framer-motion"
import dynamic from "next/dynamic"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart as RePieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type React from "react"
import { useMemo, useState } from "react"
import Link from "next/link"
import CountUp from "@/components/CountUp"
import TypewriterText from "@/components/TypewriterText"
import SpotlightCard from "@/components/SpotlightCard"

const CivicScientificScene = dynamic(() => import("@/components/CivicScientificScene"), {
  ssr: false,
  loading: () => <div className="civic-3d-loading pointer-events-none absolute inset-0" aria-hidden="true" />,
})

const GlobalSearch = dynamic(() => import("@/components/GlobalSearch"), { ssr: false })

const NearbyIssuesMap = dynamic(() => import("@/components/NearbyIssuesMap"), {
  ssr: false,
  loading: () => (
    <div className="relative h-[370px] overflow-hidden rounded-xl bg-[#0a0a0a] border border-white/10">
      <div className="absolute inset-0 civic-map" />
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#22d3ee] border-t-transparent" />
      </div>
    </div>
  ),
})

type Urgency = "CRITICAL" | "HIGH" | "NORMAL" | "LOW"
type Status = "Submitted" | "AI Classified" | "Assigned" | "In Progress" | "Resolved"

type Grievance = {
  id: string
  summary: string
  department: string
  category: string
  urgency: Urgency
  status: Status
  city: string
  date: string
  score: number
}

const grievances: Grievance[] = [
  {
    id: "CIV-2026-00347",
    summary: "No water supply in Ward 7 for three days",
    department: "Water Supply",
    category: "Supply outage",
    urgency: "CRITICAL",
    status: "In Progress",
    city: "Bhopal",
    date: "22 Apr",
    score: 94,
  },
  {
    id: "CIV-2026-00341",
    summary: "Large pothole near school gate after rainfall",
    department: "Roads",
    category: "Pothole repair",
    urgency: "HIGH",
    status: "Assigned",
    city: "Indore",
    date: "21 Apr",
    score: 87,
  },
  {
    id: "CIV-2026-00319",
    summary: "Garbage collection missed in market lane",
    department: "Sanitation",
    category: "Garbage pickup",
    urgency: "NORMAL",
    status: "Resolved",
    city: "Jabalpur",
    date: "19 Apr",
    score: 71,
  },
  {
    id: "CIV-2026-00288",
    summary: "Streetlight not working on hospital approach road",
    department: "Electricity",
    category: "Streetlight",
    urgency: "HIGH",
    status: "In Progress",
    city: "Gwalior",
    date: "18 Apr",
    score: 82,
  },
]

const trendData = [
  { day: "Mon", water: 42, roads: 31, sanitation: 25 },
  { day: "Tue", water: 49, roads: 35, sanitation: 29 },
  { day: "Wed", water: 68, roads: 38, sanitation: 34 },
  { day: "Thu", water: 62, roads: 44, sanitation: 39 },
  { day: "Fri", water: 73, roads: 52, sanitation: 43 },
  { day: "Sat", water: 58, roads: 46, sanitation: 48 },
  { day: "Sun", water: 81, roads: 57, sanitation: 41 },
]

const departmentData = [
  { name: "Water", resolved: 83, pending: 17 },
  { name: "Roads", resolved: 69, pending: 31 },
  { name: "Power", resolved: 76, pending: 24 },
  { name: "Health", resolved: 88, pending: 12 },
  { name: "Sanitation", resolved: 72, pending: 28 },
]

const categoryShare = [
  { name: "Water", value: 34, color: "#22d3ee" },
  { name: "Roads", value: 24, color: "#06b6d4" },
  { name: "Power", value: 18, color: "#f97316" },
  { name: "Sanitation", value: 16, color: "#ef4444" },
  { name: "Other", value: 8, color: "#a855f7" },
]

const statusSteps: Status[] = ["Submitted", "AI Classified", "Assigned", "In Progress", "Resolved"]

const features = [
  { icon: Globe2, title: "Multilingual AI", text: "Classifies Hindi, English, Hinglish, and regional-language complaints without forcing citizens into technical categories." },
  { icon: Mic, title: "Voice + Image Intake", text: "Accepts spoken complaints and field photos so potholes, leaks, and garbage issues can be reported in seconds." },
  { icon: Route, title: "Auto Routing", text: "Maps every grievance to the right department, category, and officer queue with a confidence score." },
  { icon: Gauge, title: "Priority Scoring", text: "Detects life, health, water, and safety emergencies and raises the SLA before the file gets buried." },
  { icon: MapPin, title: "Nearby Issue Map", text: "Shows unresolved, in-progress, and resolved pins by locality for transparent civic awareness." },
  { icon: BarChart3, title: "Admin Intelligence", text: "Turns grievance volume into department performance, hotspot, and policy trend insights." },
]

const boardColumns: Status[] = ["Submitted", "Assigned", "In Progress", "Resolved"]

function urgencyClass(urgency: Urgency) {
  if (urgency === "CRITICAL") return "bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/30"
  if (urgency === "HIGH") return "bg-[#f97316]/20 text-[#f97316] border border-[#f97316]/30"
  if (urgency === "NORMAL") return "bg-[#22d3ee]/20 text-[#22d3ee] border border-[#22d3ee]/30"
  return "bg-white/10 text-white border border-white/20"
}

function statusClass(status: Status) {
  if (status === "Resolved") return "bg-[#06b6d4]/20 text-[#22d3ee] border border-[#06b6d4]/30"
  if (status === "In Progress") return "bg-[#f97316]/20 text-[#f97316] border border-[#f97316]/30"
  if (status === "Assigned") return "bg-[#22d3ee]/20 text-[#22d3ee] border border-[#22d3ee]/30"
  return "bg-white/10 text-white/60 border border-white/20"
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [complaint, setComplaint] = useState("Pichle 3 din se Ward 7 me paani nahi aa raha, hospital ke paas log bahut pareshan hain.")
  const [mode, setMode] = useState<"text" | "voice" | "image">("text")
  const [submittedId, setSubmittedId] = useState("CIV-2026-00347")
  const [trackingId, setTrackingId] = useState("CIV-2026-00347")

  const aiSuggestion = useMemo(() => {
    const text = complaint.toLowerCase()
    if (text.length < 16) return null
    if (text.includes("water") || text.includes("paani") || text.includes("pipe")) {
      return { department: "Water Supply", category: "Supply outage", urgency: "CRITICAL" as Urgency, confidence: 0.94 }
    }
    if (text.includes("road") || text.includes("pothole") || text.includes("gaddha")) {
      return { department: "Roads", category: "Road damage", urgency: "HIGH" as Urgency, confidence: 0.89 }
    }
    if (text.includes("garbage") || text.includes("kachra")) {
      return { department: "Sanitation", category: "Garbage pickup", urgency: "NORMAL" as Urgency, confidence: 0.86 }
    }
    return { department: "Public Works", category: "General grievance", urgency: "NORMAL" as Urgency, confidence: 0.78 }
  }, [complaint])

  function submitDemo() {
    const id = `CIV-2026-${Math.floor(340 + Math.random() * 580).toString().padStart(5, "0")}`
    setSubmittedId(id)
    setTrackingId(id)
  }

  return (
    <main className="min-h-screen bg-black text-white selection:bg-[#f97316]/30">
      <nav className="fixed top-6 left-0 right-0 z-50 mx-auto max-w-5xl px-4 transition-all duration-300">
        <div className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-6 py-3 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <Link href="#home" className="flex items-center gap-3 group">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-tr from-[#f97316] to-[#ef4444] text-white shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-shadow">
              <ShieldCheck size={22} />
            </span>
            <span>
              <span className="block font-display text-xl font-black tracking-normal text-white">CIVICAI</span>
              <span className="block text-xs font-semibold text-white/50">Your Voice. Heard.</span>
            </span>
          </Link>
          <div className="hidden items-center gap-8 text-sm font-semibold text-white/70 md:flex">
            <Link href="#works" className="hover:text-white transition-colors">How it works</Link>
            <Link href="/submit" className="hover:text-white transition-colors">Submit</Link>
            <Link href="/track" className="hover:text-white transition-colors">Track</Link>
            <Link href="/admin/overview" className="hover:text-white transition-colors">Admin</Link>
          </div>
          <div className="hidden items-center gap-4 md:flex">
            <button
              onClick={() => typeof window !== 'undefined' && (window as any).__openGlobalSearch?.()}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 hover:border-[#22d3ee]/40 hover:bg-[#22d3ee]/10 hover:text-[#22d3ee] transition-all"
              aria-label="Search (Ctrl+K)"
            >
              <Search size={17} />
            </button>
            <Link href="/auth" className="text-sm font-bold text-white/70 hover:text-white transition-colors">Log in</Link>
            <Link href="/submit" className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#f97316] to-[#ef4444] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all hover:-translate-y-0.5">
              File Complaint <ArrowRight size={16} />
            </Link>
          </div>
          <button className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-white md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {menuOpen ? (
          <div className="absolute top-20 left-4 right-4 rounded-2xl border border-white/10 bg-[#0a0a0a] px-6 py-6 shadow-2xl md:hidden">
            {[
              ["works", "#works"],
              ["submit", "/submit"],
              ["track", "/track"],
              ["admin", "/admin/overview"],
              ["log in / sign up", "/auth"],
            ].map(([item, href]) => (
              <Link key={item} href={href} className="block py-3 text-sm font-bold capitalize text-white/70 hover:text-white" onClick={() => setMenuOpen(false)}>
                {item}
              </Link>
            ))}
          </div>
        ) : null}
      </nav>

      <section id="home" className="relative overflow-hidden pt-20">
        <div className="aurora-blob bg-orange-600 top-1/4 left-1/4 w-96 h-96 opacity-30 mix-blend-screen"></div>
        <div className="aurora-blob bg-red-600 top-1/2 right-1/4 w-80 h-80 animation-delay-2000 opacity-20 mix-blend-screen"></div>
        <div className="aurora-blob bg-cyan-500 bottom-1/4 left-1/3 w-72 h-72 animation-delay-4000 opacity-15 mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#000000]/50 to-[#000000]" />
        <CivicScientificScene />
        <div className="science-grid parallax-layer absolute inset-0 opacity-20" />
        <div className="relative mx-auto flex min-h-[calc(100vh-100px)] max-w-5xl flex-col items-center justify-center text-center px-4 py-20 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col items-center">
            <div className="mb-8 font-black uppercase tracking-[0.3em] text-[#f97316]">
              Submit. Track. Get Resolved.
            </div>
            
            <h1 className="max-w-4xl font-display text-5xl font-black leading-[1.1] tracking-normal text-white sm:text-6xl lg:text-7xl">
              <span className="bg-gradient-to-r from-[#22d3ee] to-[#3b82f6] bg-clip-text text-transparent">Master Your Civic Rights.</span> Crack Your Infrastructure Problems.
            </h1>
            
            <p className="mt-8 max-w-2xl text-lg leading-8 text-white/60 sm:text-xl">
              Join a growing community of citizens preparing for a real-world tech-driven resolution layer at CivicAI.
            </p>

            {/* Social Proof Avatars */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <div className="flex -space-x-3">
                <img className="h-10 w-10 rounded-full border-2 border-black object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" alt="" />
                <img className="h-10 w-10 rounded-full border-2 border-black object-cover" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop" alt="" />
                <img className="h-10 w-10 rounded-full border-2 border-black object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" alt="" />
                <img className="h-10 w-10 rounded-full border-2 border-black object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" alt="" />
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <span className="text-[#f97316]">11.2 Million+</span> Citizens Supported
                <span className="ml-2 flex items-center gap-1 text-[#22d3ee]">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22d3ee] opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#06b6d4]"></span>
                  </span>
                  Live Now
                </span>
              </div>
            </div>

            <div className="mt-12">
              <Link href="/submit" className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-[#f97316] to-[#ef4444] px-8 py-4 text-lg font-bold text-white shadow-[0_0_40px_rgba(249,115,22,0.4)] transition-all hover:shadow-[0_0_60px_rgba(249,115,22,0.6)] hover:-translate-y-1">
                Start Journey <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="mt-20 flex w-full max-w-4xl flex-col items-center justify-center gap-12 rounded-[2rem] bg-gradient-to-b from-white/10 to-transparent p-10 sm:flex-row sm:gap-20 border border-white/5 shadow-2xl backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-[#22d3ee] to-transparent opacity-50"></div>
              <div className="text-center">
                <div className="font-display text-5xl font-black text-[#22d3ee]">
                  <CountUp end={11.2} decimals={1} suffix="M+" />
                </div>
                <div className="mt-2 text-xs font-bold uppercase tracking-widest text-white/50">Citizens Supported</div>
              </div>
              <div className="hidden h-16 w-px bg-white/10 sm:block"></div>
              <div className="text-center">
                <div className="font-display text-5xl font-black text-[#22d3ee]">
                  <CountUp end={85} suffix="%" />
                </div>
                <div className="mt-2 text-xs font-bold uppercase tracking-widest text-white/50">Resolution Rate</div>
              </div>
              <div className="hidden h-16 w-px bg-white/10 sm:block"></div>
              <div className="text-center">
                <div className="font-display text-5xl font-black text-[#22d3ee]">
                  <CountUp end={3} suffix="x" />
                </div>
                <div className="mt-2 text-xs font-bold uppercase tracking-widest text-white/50">Faster Routing</div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="relative">
            <div className="hologram-panel glass-panel tilt-card animate-float-drift rounded-[2rem] border border-white/10 bg-[#0a0a0a]/80 p-6 shadow-2xl shadow-cyan-900/20 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <ShieldCheck size={120} />
              </div>
              <div className="mb-6 flex items-center justify-between relative z-10">
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest text-[#22d3ee]">Smart Submission</p>
                  <h2 className="text-2xl font-black text-white">AI Grievance Form</h2>
                </div>
                <span className="rounded-full border border-[#06b6d4]/30 bg-[#06b6d4]/10 px-3 py-1 text-xs font-black text-[#22d3ee] shadow-[0_0_15px_rgba(6,182,212,0.5)]">Live</span>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-5 relative z-10">
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-white/50">Citizen input</p>
                <p className="text-sm leading-6 text-white/90">Ward 7 me teen din se paani nahi aa raha. Hospital ke paas families ko tanker nahi mila.</p>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <MiniMetric icon={Bot} label="Department" value="Water" />
                <MiniMetric icon={AlertTriangle} label="Urgency" value="Critical" />
                <MiniMetric icon={Activity} label="Confidence" value="94%" />
              </div>
              <div className="mt-6 space-y-4 relative z-10">
                {statusSteps.slice(0, 4).map((step, index) => (
                  <div key={step} className="flex items-center gap-4">
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border ${index < 3 ? "border-[#22d3ee] bg-[#22d3ee]/10 text-[#22d3ee] shadow-[0_0_10px_rgba(34,211,238,0.3)]" : "border-[#f97316] bg-[#f97316]/10 text-[#f97316]"}`}>
                      {index < 3 ? <CheckCircle2 size={18} /> : <Loader2 className="animate-spin" size={18} />}
                    </span>
                    <div>
                      <p className="text-sm font-black text-white">{step}</p>
                      <p className="text-xs text-white/50">{index === 3 ? "Officer Priya Sharma updating work order" : "Completed instantly"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="works" className="scroll-reveal mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Workflow" title="Three steps from citizen voice to department action" text="CIVICAI removes manual category selection and turns unstructured complaints into accountable civic workflows." />
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={{ visible: { transition: { staggerChildren: 0.15 } } }} className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            { icon: FileText, title: "Submit", text: "Citizen shares text, voice, or a photo in their natural language." },
            { icon: Bot, title: "AI Classifies", text: "Model detects language, category, urgency, duplicates, and department." },
            { icon: Bell, title: "Resolved", text: "Officer updates status, citizen receives SMS, email, and in-app alerts." },
          ].map((item, index) => (
            <SpotlightCard variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } }} key={item.title} whileHover={{ y: -4 }} className="neumorphic advanced-hover tilt-card relative rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-sm">
              <span className="mb-5 grid h-12 w-12 place-items-center rounded-lg bg-[#22d3ee]/10 text-[#22d3ee]">
                <item.icon size={23} />
              </span>
              <div className="mb-2 font-display text-3xl font-black text-white/10">0{index + 1}</div>
              <h3 className="text-xl font-black text-white">{item.title}</h3>
              <p className="mt-2 leading-7 text-white/50">{item.text}</p>
            </SpotlightCard>
          ))}
        </motion.div>
      </section>

      <section className="scroll-reveal bg-[#0a0a0a] py-20 relative">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay"></div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="Capabilities" title="Built for citizens, officers, and administrators" text="One platform covers the entire grievance journey, from multilingual intake to heatmap-driven public policy insights." />
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
            {features.map((feature, index) => (
              <SpotlightCard variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } }} key={feature.title} whileHover={{ y: -4 }} className={`civic-card glass-panel advanced-hover tilt-card rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md ${index === 0 ? "lg:col-span-2 lg:row-span-2" : index === 3 ? "lg:col-span-2" : "lg:col-span-1"}`}>
                <feature.icon className="mb-5 text-[#f97316]" size={index === 0 ? 36 : 28} />
                <h3 className={`font-black text-white ${index === 0 ? "text-2xl" : "text-lg"}`}>{feature.title}</h3>
                <p className="mt-3 leading-7 text-white/60">{feature.text}</p>
              </SpotlightCard>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="submit" className="mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <SectionHeader eyebrow="Citizen Portal" title="Smart grievance submission" text="The form previews AI classification before submission, so citizens can confirm the routing without learning department jargon." />
          <div className="mt-8 rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 shadow-sm">
            <h3 className="mb-4 font-black text-white">Submission modes</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                ["text", MessageSquare],
                ["voice", Mic],
                ["image", Upload],
              ].map(([name, Icon]) => (
                <button
                  key={name as string}
                  onClick={() => setMode(name as "text" | "voice" | "image")}
                  className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm font-bold capitalize transition-colors ${mode === name ? "border-[#22d3ee] bg-[#22d3ee]/10 text-[#22d3ee]" : "border-white/10 bg-white/5 text-white/50 hover:text-white"}`}
                >
                  <Icon size={16} /> {name as string}
                </button>
              ))}
            </div>
            <div className="mt-5 rounded-lg bg-white/5 p-4 text-sm leading-6 text-white/60">
              {mode === "text" ? "Type naturally in Hindi, English, Hinglish, or another local language." : null}
              {mode === "voice" ? "Voice mode is represented in this prototype with waveform-ready UI and browser microphone flow planned." : null}
              {mode === "image" ? "Image mode supports evidence uploads such as potholes, pipe leaks, and garbage dumps." : null}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 shadow-2xl">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              {["Describe", "Location", "Details"].map((step, index) => (
                <span key={step} className={`rounded-full px-3 py-1 text-xs font-black ${index === 0 ? "bg-[#22d3ee]/20 text-[#22d3ee] border border-[#22d3ee]/30" : "bg-white/5 text-white/50 border border-white/10"}`}>
                  Step {index + 1}
                </span>
              ))}
            </div>
            <span className="rounded-full bg-[#06b6d4]/10 border border-[#06b6d4]/30 px-3 py-1 text-xs font-black text-[#22d3ee]">OTP-ready</span>
          </div>
          <textarea
            value={complaint}
            onChange={(event) => setComplaint(event.target.value)}
            className="min-h-36 w-full resize-none rounded-lg border border-white/10 bg-black p-4 leading-7 text-white outline-none focus:border-[#22d3ee] focus:ring-4 focus:ring-[#22d3ee]/10"
            placeholder="Describe your problem in your own words..."
          />
          {aiSuggestion ? (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-xl border border-[#22d3ee]/20 bg-[#22d3ee]/5 p-4">
              <div className="mb-3 flex items-center gap-2 font-black text-[#22d3ee]">
                <Bot size={18} /> AI Detected
              </div>
              <div className="grid gap-3 sm:grid-cols-4">
                <MiniMetric icon={Route} label="Dept" value={<TypewriterText text={aiSuggestion.department} />} />
                <MiniMetric icon={FileText} label="Category" value={<TypewriterText text={aiSuggestion.category} delay={200} />} />
                <MiniMetric icon={AlertTriangle} label="Urgency" value={<TypewriterText text={aiSuggestion.urgency} delay={400} />} />
                <MiniMetric icon={Activity} label="Confidence" value={<TypewriterText text={`${Math.round(aiSuggestion.confidence * 100)}%`} delay={600} />} />
              </div>
            </motion.div>
          ) : null}
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <input className="rounded-lg border border-white/10 bg-black text-white px-4 py-3 outline-none focus:border-[#22d3ee]" placeholder="District" defaultValue="Bhopal" />
            <input className="rounded-lg border border-white/10 bg-black text-white px-4 py-3 outline-none focus:border-[#22d3ee]" placeholder="Phone number" defaultValue="+91 98765 43210" />
          </div>
          <button onClick={submitDemo} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#f97316] to-[#ef4444] px-5 py-3 font-black text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all hover:-translate-y-0.5">
            Submit Grievance <ArrowRight size={18} />
          </button>
          <div className="mt-5 rounded-xl border border-[#06b6d4]/30 bg-[#06b6d4]/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-[#22d3ee]">Submission ready</p>
                <p className="font-display text-2xl font-black text-white">{submittedId}</p>
              </div>
              <button className="grid h-10 w-10 place-items-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors" aria-label="Copy grievance ID">
                <Copy size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="track" className="bg-[#050505] py-20 text-white relative">
        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-[#0a0a0a]"></div>
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="font-black uppercase tracking-[0.22em] text-[#22d3ee]">Tracker</p>
            <h2 className="mt-3 font-display text-4xl font-black tracking-normal sm:text-5xl">A clear status timeline for every citizen</h2>
            <div className="mt-8 flex gap-2 rounded-xl border border-white/10 bg-white/5 p-2">
              <input value={trackingId} onChange={(event) => setTrackingId(event.target.value)} className="min-w-0 flex-1 bg-transparent px-3 text-sm font-bold outline-none text-white focus:ring-0" />
              <button className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#22d3ee] text-black" aria-label="Search grievance">
                <Search size={18} />
              </button>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3">
              <InfoPill label="Department" value="Water Supply" />
              <InfoPill label="Officer" value="Priya Sharma" />
              <InfoPill label="SLA" value="18 hours left" />
              <InfoPill label="Urgency" value="Critical" />
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-white/60">Grievance ID</p>
                <h3 className="font-display text-2xl font-black tracking-normal">{trackingId}</h3>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-black ${urgencyClass("CRITICAL")}`}>CRITICAL</span>
            </div>
            <div className="space-y-5">
              {statusSteps.map((step, index) => {
                const active = index <= 3
                return (
                  <div key={step} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span className={`grid h-9 w-9 place-items-center rounded-full border ${active ? "border-[#22d3ee] bg-[#22d3ee]/10 text-[#22d3ee]" : "border-white/10 bg-transparent text-white/40"}`}>
                        {index === 3 ? <Loader2 className="animate-spin" size={17} /> : <CheckCircle2 size={17} />}
                      </span>
                      {index !== statusSteps.length - 1 ? <span className="h-12 w-px bg-white/15" /> : null}
                    </div>
                    <div>
                      <p className="font-black">{step}</p>
                      <p className="text-sm text-white/60">
                        {active ? `${index === 0 ? "Filed" : index === 1 ? "Water Supply, Critical, 94% confidence" : index === 2 ? "Assigned to Officer Priya Sharma" : "Field team dispatched"} at 10:${20 + index * 7} AM` : "Awaiting completion"}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Citizen Dashboard" title="Personal dashboard and public issue feed" text="Citizens can see their own case history, compare local resolution times, and upvote anonymous public issues." />
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white/50">Welcome, Ram</p>
                <h3 className="text-2xl font-black text-white">My Grievances</h3>
              </div>
              <button className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-r from-[#f97316] to-[#ef4444] text-white" aria-label="Quick submit">
                <Plus size={20} />
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              <MiniMetric icon={FileText} label="Filed" value="12" />
              <MiniMetric icon={CheckCircle2} label="Resolved" value="8" />
              <MiniMetric icon={Clock3} label="Active" value="4" />
              <MiniMetric icon={Gauge} label="Avg time" value="3.1d" />
            </div>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="text-xs uppercase text-white/50">
                  <tr>
                    <th className="py-3">ID</th>
                    <th>Issue</th>
                    <th>Department</th>
                    <th>Urgency</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {grievances.map((item) => (
                    <tr key={item.id} className="border-t border-white/10 text-white">
                      <td className="py-4 font-mono text-xs font-bold">{item.id}</td>
                      <td className="max-w-[260px] pr-4 font-semibold">{item.summary}</td>
                      <td>{item.department}</td>
                      <td><span className={`rounded-full px-2 py-1 text-xs font-black ${urgencyClass(item.urgency)}`}>{item.urgency}</span></td>
                      <td><span className={`rounded-full px-2 py-1 text-xs font-black ${statusClass(item.status)}`}>{item.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between text-white">
              <h3 className="text-2xl font-black">Nearby Issues Map</h3>
              <Filter className="text-white/50" size={20} />
            </div>
            <NearbyIssuesMap />
          </div>
        </div>
      </section>

      <section className="bg-[#0a0a0a] py-20 relative">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay"></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="Officer Portal" title="Department queues that move work forward" text="Role-based boards show only relevant complaints, with AI-assisted duplicate checks and suggested resolution steps." />
          <div className="mt-10 grid gap-4 lg:grid-cols-4">
            {boardColumns.map((column) => (
              <div key={column} className="rounded-2xl border border-white/10 bg-black/50 p-4 backdrop-blur-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-black text-white">{column}</h3>
                  <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-black text-white">{grievances.filter((item) => item.status === column || (column === "Submitted" && item.status === "AI Classified")).length}</span>
                </div>
                <div className="space-y-3">
                  {grievances.filter((item) => item.status === column || (column === "Submitted" && item.status === "AI Classified")).map((item) => (
                    <div key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-sm transition-colors hover:border-[#22d3ee]/50 hover:bg-white/10">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-black text-[#22d3ee]">{item.id}</span>
                        <span className={`rounded-full px-2 py-1 text-[10px] font-black ${urgencyClass(item.urgency)}`}>{item.urgency}</span>
                      </div>
                      <p className="text-sm font-bold leading-6 text-white">{item.summary}</p>
                      <div className="mt-3 flex items-center justify-between text-xs font-bold text-white/50">
                        <span>{item.department}</span>
                        <span className="text-[#f97316]">AI {item.score}</span>
                      </div>
                    </div>
                  ))}
                  {grievances.filter((item) => item.status === column).length === 0 ? <p className="rounded-lg border border-dashed border-white/20 p-4 text-sm text-white/40">No complaints in this lane.</p> : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="admin" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 relative z-10">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-4 text-white">
            <div className="mb-6 flex items-center gap-3 px-2">
              <LayoutDashboard className="text-[#22d3ee]" />
              <span className="font-black">Admin Console</span>
            </div>
            {[
              ["Overview", BarChart3],
              ["Heatmap", MapPin],
              ["Departments", Users],
              ["AI Insights", Lightbulb],
              ["Security", Lock],
            ].map(([label, Icon]) => (
              <button key={label as string} className="mb-2 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-bold text-white/60 hover:bg-white/10 hover:text-white transition-colors">
                <Icon size={18} /> {label as string}
              </button>
            ))}
          </aside>
          <div>
            <SectionHeader eyebrow="Analytics" title="Real-time overview for administrators" text="KPI cards, department performance, heatmaps, and AI narrative insights expose bottlenecks before they become public trust issues." />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Kpi icon={FileText} label="Filed today" value="1,284" delta="+18%" />
              <Kpi icon={CheckCircle2} label="Resolution rate" value="82%" delta="+6%" />
              <Kpi icon={Clock3} label="Avg. time" value="3.2d" delta="-21%" />
              <Kpi icon={AlertTriangle} label="Critical open" value="47" delta="+9" />
            </div>
            <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
              <ChartCard title="Complaint volume by category">
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.36} />
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="day" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff' }} />
                    <Area type="monotone" dataKey="water" stroke="#22d3ee" fill="url(#water)" strokeWidth={3} />
                    <Line type="monotone" dataKey="roads" stroke="#06b6d4" strokeWidth={3} />
                    <Line type="monotone" dataKey="sanitation" stroke="#f97316" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
              <ChartCard title="Department distribution">
                <ResponsiveContainer width="100%" height={280}>
                  <RePieChart>
                    <Pie data={categoryShare} dataKey="value" nameKey="name" innerRadius={64} outerRadius={100}>
                      {categoryShare.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff' }} />
                  </RePieChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
            <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <ChartCard title="Department performance matrix">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={departmentData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff' }} />
                    <Bar dataKey="resolved" fill="#22d3ee" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="pending" fill="#f97316" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
              <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2 text-white">
                  <Lightbulb className="text-[#f97316]" />
                  <h3 className="text-xl font-black">AI Insights</h3>
                </div>
                <div className="space-y-3">
                  {[
                    "Pattern detected: 43% of Bhopal road complaints this week come from Ward 7 after rainfall.",
                    "Water complaints spike on Mondays, indicating a possible supply scheduling failure.",
                    "Roads department has the highest pending ratio at 31%; recommend temporary SLA escalation.",
                    "Duplicate cluster found around CIV-2026-00341; merge citizen upvotes into one priority case.",
                  ].map((insight) => (
                    <div key={insight} className="rounded-xl border border-[#f97316]/20 bg-[#f97316]/5 p-4 text-sm font-semibold leading-6 text-white/80">
                      {insight}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-white/5 py-16 text-white relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-[#22d3ee]/50 to-transparent"></div>
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-tr from-[#f97316] to-[#ef4444] shadow-[0_0_15px_rgba(249,115,22,0.4)]"><ShieldCheck size={22} /></span>
              <span className="font-display text-xl font-black tracking-normal">CIVICAI</span>
            </div>
            <p className="leading-7 text-white/62">Citizen Intelligence for Verified Issue Classification and Action.</p>
          </div>
          <div>
            <h3 className="mb-4 font-black">Platform</h3>
            <div className="space-y-2 text-white/62">
              <p>Citizen portal</p>
              <p>Officer board</p>
              <p>Admin analytics</p>
            </div>
          </div>
          <div>
            <h3 className="mb-4 font-black">Project</h3>
            <div className="space-y-2 text-white/62">
              <p>Created by Ram Vishwakarma</p>
              <p>Powered by Claude + Gemini + Codex</p>
              <p>April 2026 prototype</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function SectionHeader({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div className="max-w-3xl">
      <p className="font-black uppercase tracking-[0.22em] text-[#f97316]">{eyebrow}</p>
      <h2 className="mt-3 font-display text-4xl font-black leading-tight tracking-normal text-white sm:text-5xl">{title}</h2>
      <p className="mt-4 text-lg leading-8 text-white/60">{text}</p>
    </div>
  )
}

function MiniMetric({ icon: Icon, label, value }: { icon: any; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
      <Icon className="mb-2 text-[#22d3ee]" size={17} />
      <p className="text-xs font-bold uppercase text-white/50">{label}</p>
      <p className="mt-1 truncate text-sm font-black text-white">{value}</p>
    </div>
  )
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/8 p-4">
      <p className="text-xs font-bold uppercase text-white/45">{label}</p>
      <p className="mt-1 font-black">{value}</p>
    </div>
  )
}

function StatsCard({ icon: Icon, label, value, delta }: { icon: any; label: string; value: string; delta: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#22d3ee]/10 text-[#22d3ee]"><Icon size={20} /></span>
        <span className="rounded-full border border-[#06b6d4]/30 bg-[#06b6d4]/10 px-2 py-1 text-xs font-black text-[#22d3ee]">{delta}</span>
      </div>
      <p className="text-sm font-bold text-white/60">{label}</p>
      <p className="mt-1 font-display text-3xl font-black tracking-normal text-white">{value}</p>
    </div>
  )
}

function Kpi({ icon: Icon, label, value, delta }: { icon: any; label: string; value: string; delta: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#22d3ee]/10 text-[#22d3ee]"><Icon size={20} /></span>
        <span className="rounded-full border border-[#06b6d4]/30 bg-[#06b6d4]/10 px-2 py-1 text-xs font-black text-[#22d3ee]">{delta}</span>
      </div>
      <p className="text-sm font-bold text-white/60">{label}</p>
      <p className="mt-1 font-display text-3xl font-black tracking-normal text-white">{value}</p>
    </div>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <PieChart className="text-[#f97316]" size={20} />
        <h3 className="text-xl font-black text-white">{title}</h3>
      </div>
      {children}
    </div>
  )
}

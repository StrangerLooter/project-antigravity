"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { AlertTriangle, ArrowRight, Bot, CheckCircle2, FileImage, FileText, MapPin, Mic, ShieldCheck, Square, Upload, UserRound } from "lucide-react"
import dynamic from "next/dynamic"
import CivicAppShell from "@/components/CivicAppShell"
import { addGrievance, createGrievance, type AiSuggestion } from "@/lib/civicai-data"

const ComplaintMapPicker = dynamic(() => import("@/components/ComplaintMapPicker"), {
  ssr: false,
  loading: () => (
    <div className="flex h-72 items-center justify-center rounded-xl border border-white/10 bg-white/5">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#22d3ee] border-t-transparent" />
        <p className="text-sm font-bold text-white/50">Loading map...</p>
      </div>
    </div>
  ),
})

type SpeechRecognitionConstructor = new () => SpeechRecognition

type SpeechRecognition = {
  lang: string
  interimResults: boolean
  continuous: boolean
  start: () => void
  stop: () => void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
}

type SpeechRecognitionEvent = {
  results: ArrayLike<{
    0: { transcript: string }
    isFinal: boolean
  }>
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
}

const fallbackSuggestion: AiSuggestion = {
  department: "Water Supply",
  category: "Supply outage",
  urgency: "CRITICAL",
  confidence: 0.94,
  summary: "Water supply disruption requiring urgent field verification.",
  language_detected: "Hinglish",
}

export default function SubmitPage() {
  const [step, setStep] = useState(1)
  const [mode, setMode] = useState<"text" | "voice" | "image">("text")
  const [text, setText] = useState("Ward 7 me teen din se paani nahi aa raha, hospital ke paas families ko tanker nahi mila.")
  const [district, setDistrict] = useState("Bhopal")
  const [state, setState] = useState("Madhya Pradesh")
  const [locationAddress, setLocationAddress] = useState("")
  const [locationLat, setLocationLat] = useState<number | undefined>(undefined)
  const [locationLng, setLocationLng] = useState<number | undefined>(undefined)
  const [citizenName, setCitizenName] = useState("Ram Vishwakarma")
  const [phone, setPhone] = useState("+91 98765 43210")
  const [email, setEmail] = useState("ram@example.com")
  const [suggestion, setSuggestion] = useState<AiSuggestion | null>(fallbackSuggestion)
  const [submittedId, setSubmittedId] = useState("")
  const [loading, setLoading] = useState(false)
  const [imageName, setImageName] = useState("")
  const [imageDataUrl, setImageDataUrl] = useState("")
  const [voiceStatus, setVoiceStatus] = useState("Ready")
  const [isRecording, setIsRecording] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      if (text.trim().length < 10 && !imageName) {
        setSuggestion(null)
        return
      }

      const response = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, imageName }),
      }).catch(() => null)

      if (response?.ok) {
        setSuggestion(await response.json())
      }
    }, 450)

    return () => window.clearTimeout(timer)
  }, [imageName, text])

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
    }
  }, [])

  const canContinue = useMemo(() => {
    if (step === 1) return (text.trim().length >= 10 || Boolean(imageName)) && suggestion
    if (step === 2) return district.trim() && state.trim()
    return citizenName.trim() && phone.trim()
  }, [citizenName, district, phone, state, step, suggestion, text])

  const duplicateHint = useMemo(() => {
    const normalized = `${text} ${imageName}`.toLowerCase()
    if (normalized.includes("ward 7") || normalized.includes("paani") || normalized.includes("water")) {
      return "Possible duplicate cluster: 4 similar water supply reports near Bhopal Ward 7 in the last 24 hours."
    }
    if (normalized.includes("pothole") || normalized.includes("road")) {
      return "Possible duplicate cluster: road-safety complaints are trending near school and hospital zones."
    }
    if (normalized.includes("garbage") || normalized.includes("drain")) {
      return "Possible duplicate cluster: sanitation reports match recent local-cleanup tickets."
    }
    return ""
  }, [imageName, text])

  async function submit() {
    if (!suggestion) return
    setLoading(true)

    const response = await fetch("/api/grievances/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, citizenName, phone, email, district, state }),
    })
    const data = await response.json()
    const grievance = createGrievance({
      id: data.grievanceId,
      text,
      inputMode: mode,
      imageName,
      imageDataUrl,
      citizenName,
      phone,
      email,
      district,
      state,
      suggestion,
    })

    addGrievance(grievance)
    setSubmittedId(grievance.id)
    setLoading(false)
  }

  function handleImageUpload(file: File | undefined) {
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setVoiceStatus("Please upload an image file.")
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setImageName(file.name)
      setImageDataUrl(String(reader.result))
      setMode("image")
      if (!text.trim()) {
        setText(`Uploaded photo evidence: ${file.name}. Please classify the civic issue shown in this image.`)
      }
    }
    reader.readAsDataURL(file)
  }

  function toggleVoice() {
    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition
    if (!Recognition) {
      setMode("voice")
      setVoiceStatus("Speech-to-text is not supported in this browser. You can still type the complaint.")
      return
    }

    if (isRecording) {
      recognitionRef.current?.stop()
      setIsRecording(false)
      setVoiceStatus("Stopped")
      return
    }

    const recognition = new Recognition()
    recognition.lang = "hi-IN"
    recognition.interimResults = true
    recognition.continuous = true
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ")
        .trim()

      if (transcript) setText(transcript)
    }
    recognition.onerror = () => {
      setIsRecording(false)
      setVoiceStatus("Microphone permission or speech recognition failed.")
    }
    recognition.onend = () => {
      setIsRecording(false)
      setVoiceStatus("Ready")
    }

    recognitionRef.current = recognition
    setMode("voice")
    setVoiceStatus("Listening...")
    setIsRecording(true)
    recognition.start()
  }

  return (
    <CivicAppShell title="Submit Grievance" subtitle="A focused 3-step flow with live AI classification before filing.">
      <div className="grid gap-8 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="ui-card glass-panel scroll-reveal xl:sticky xl:top-24 self-start rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 shadow-sm">
          <h2 className="font-display text-2xl font-black tracking-normal text-white">Progress</h2>
          <div className="mt-6 space-y-3">
            {[
              ["Describe issue", FileText],
              ["Confirm location", MapPin],
              ["Citizen details", UserRound],
            ].map(([label, Icon], index) => (
              <button
                key={label as string}
                onClick={() => setStep(index + 1)}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-4 text-left font-black ${step === index + 1 ? "border-[#22d3ee] bg-[#22d3ee]/10 text-[#22d3ee]" : "border-white/10 bg-black/50 text-white/50"}`}
              >
                <Icon size={20} />
                Step {index + 1}: {label as string}
              </button>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-5 text-white">
            <div className="mb-2 flex items-center gap-2 font-black text-[#22d3ee]">
              <Bot size={18} /> AI preview
            </div>
            {suggestion ? (
              <div className="space-y-2 text-sm text-white/70">
                <p><strong className="text-white">Department:</strong> {suggestion.department}</p>
                <p><strong className="text-white">Category:</strong> {suggestion.category}</p>
                <p><strong className="text-white">Urgency:</strong> {suggestion.urgency}</p>
                <p><strong className="text-white">Confidence:</strong> {Math.round(suggestion.confidence * 100)}%</p>
              </div>
            ) : (
              <p className="text-sm text-white/60">Start typing to generate a routing suggestion.</p>
            )}
          </div>
          <div className="mt-4 rounded-xl border border-white/10 bg-[#22d3ee]/10 p-4">
            <div className="flex items-center gap-2 text-sm font-black text-[#22d3ee]">
              <ShieldCheck size={16} /> Filing readiness
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs font-black text-white/80">
              <span className="rounded-lg bg-black/50 border border-white/10 px-2 py-2">Text</span>
              <span className="rounded-lg bg-black/50 border border-white/10 px-2 py-2">Location</span>
              <span className="rounded-lg bg-black/50 border border-white/10 px-2 py-2">Contact</span>
            </div>
          </div>
        </section>

        <section className="ui-card glass-panel scroll-reveal rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 shadow-sm text-white">
          {submittedId ? (
            <div className="grid min-h-[480px] place-items-center text-center">
              <div>
                <span className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-[#22d3ee]/20 text-[#22d3ee]">
                  <CheckCircle2 size={34} />
                </span>
                <p className="text-sm font-black uppercase tracking-[0.22em] text-[#22d3ee]">Submitted</p>
                <h2 className="mt-3 font-display text-4xl font-black tracking-normal">{submittedId}</h2>
                <p className="mx-auto mt-4 max-w-xl leading-7 text-white/60">Your grievance has been saved to this browser demo and is ready to track.</p>
                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link href={`/track/${submittedId}`} className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#f97316] to-[#ef4444] px-5 py-3 font-black text-white shadow-lg shadow-[#f97316]/20">
                    Track Complaint <ArrowRight size={18} />
                  </Link>
                  <Link href="/citizen/dashboard" className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-5 py-3 font-black text-white">
                    Open Dashboard
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <>
              {step === 1 ? (
                <div>
                  <h2 className="font-display text-2xl font-black tracking-normal">Describe your issue</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <p className="text-xs font-black uppercase text-white/50">Input</p>
                      <p className="mt-1 font-black capitalize text-white">{mode}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <p className="text-xs font-black uppercase text-white/50">Language</p>
                      <p className="mt-1 font-black text-white">{suggestion?.language_detected ?? "Detecting"}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <p className="text-xs font-black uppercase text-white/50">Priority</p>
                      <p className="mt-1 font-black text-white">{suggestion?.urgency ?? "Pending"}</p>
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-3 gap-2">
                    {[
                      ["text", FileText],
                      ["voice", Mic],
                      ["image", Upload],
                    ].map(([name, Icon]) => (
                      <button
                        key={name as string}
                        onClick={() => {
                          if (name === "voice") toggleVoice()
                          else if (name === "image") fileInputRef.current?.click()
                          else setMode("text")
                        }}
                        className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm font-bold capitalize ${mode === name ? "border-[#22d3ee] bg-[#22d3ee]/10 text-[#22d3ee]" : "border-white/10 bg-white/5 text-white/50"}`}
                      >
                        <Icon size={16} /> {name as string}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <button onClick={toggleVoice} className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 font-black transition-colors ${isRecording ? "bg-[#ef4444] text-white" : "bg-[#22d3ee]/10 text-[#22d3ee] hover:bg-[#22d3ee]/20"}`}>
                      {isRecording ? <Square size={16} /> : <Mic size={16} />}
                      {isRecording ? "Stop recording" : "Record voice"}
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/5 px-4 py-3 font-black text-white hover:bg-white/10 transition-colors">
                      <FileImage size={16} />
                      Upload image
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => handleImageUpload(event.target.files?.[0])} />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-white/50">{voiceStatus}</p>
                  {duplicateHint ? (
                    <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#f97316]/30 bg-[#f97316]/10 p-4">
                      <AlertTriangle className="mt-0.5 shrink-0 text-[#f97316]" size={18} />
                      <div>
                        <p className="font-black text-[#f97316]">Duplicate intelligence</p>
                        <p className="mt-1 text-sm font-semibold leading-6 text-[#f97316]/80">{duplicateHint}</p>
                      </div>
                    </div>
                  ) : null}
                  {imageDataUrl ? (
                    <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                      <img src={imageDataUrl} alt="Uploaded grievance evidence" className="h-56 w-full object-cover" />
                      <div className="flex items-center justify-between gap-3 p-3 text-sm font-bold text-white/70">
                        <span className="truncate">{imageName}</span>
                        <button onClick={() => { setImageName(""); setImageDataUrl("") }} className="text-[#ef4444]">Remove</button>
                      </div>
                    </div>
                  ) : null}
                  <textarea value={text} maxLength={900} onChange={(event) => setText(event.target.value)} className="mt-5 min-h-52 w-full resize-none rounded-xl border border-white/10 bg-white/5 p-4 leading-7 outline-none focus:border-[#22d3ee] focus:ring-4 focus:ring-[#22d3ee]/10 text-white placeholder:text-white/30" />
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-white/50">
                    <span>AI suggestion refreshes as you type.</span>
                    <span className="font-mono">{text.length}/900</span>
                  </div>
                </div>
              ) : null}

              {step === 2 ? (
                <div>
                  <h2 className="font-display text-2xl font-black tracking-normal">Confirm location</h2>
                  <p className="mt-1 text-sm text-white/50">Click on the map or drag the pin to set your exact complaint location in India.</p>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <input value={district} onChange={(event) => setDistrict(event.target.value)} className="rounded-xl border border-white/10 bg-white/5 text-white px-4 py-3 outline-none focus:border-[#22d3ee] placeholder:text-white/30" placeholder="District / City" />
                    <input value={state} onChange={(event) => setState(event.target.value)} className="rounded-xl border border-white/10 bg-white/5 text-white px-4 py-3 outline-none focus:border-[#22d3ee] placeholder:text-white/30" placeholder="State" />
                  </div>
                  <div className="mt-4">
                    <ComplaintMapPicker
                      initialLat={locationLat}
                      initialLng={locationLng}
                      onLocationSelect={(loc) => {
                        setLocationLat(loc.lat)
                        setLocationLng(loc.lng)
                        setLocationAddress(loc.address)
                        // Auto-fill district from address if empty
                        if (loc.address && !district) {
                          const parts = loc.address.split(",")
                          if (parts.length > 1) setDistrict(parts[parts.length - 3]?.trim() || district)
                        }
                      }}
                    />
                  </div>
                  {locationAddress && (
                    <div className="mt-3 flex items-start gap-2 rounded-xl border border-[#22d3ee]/30 bg-[#22d3ee]/10 p-3">
                      <MapPin className="mt-0.5 shrink-0 text-[#22d3ee]" size={16} />
                      <p className="text-sm font-semibold text-[#22d3ee]">{locationAddress}</p>
                    </div>
                  )}
                </div>
              ) : null}

              {step === 3 ? (
                <div>
                  <h2 className="font-display text-2xl font-black tracking-normal">Your details</h2>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <input value={citizenName} onChange={(event) => setCitizenName(event.target.value)} className="rounded-xl border border-white/10 bg-white/5 text-white px-4 py-3 outline-none focus:border-[#22d3ee] placeholder:text-white/30" placeholder="Full name" />
                    <input value={phone} onChange={(event) => setPhone(event.target.value)} className="rounded-xl border border-white/10 bg-white/5 text-white px-4 py-3 outline-none focus:border-[#22d3ee] placeholder:text-white/30" placeholder="Phone" />
                    <input value={email} onChange={(event) => setEmail(event.target.value)} className="rounded-xl border border-white/10 bg-white/5 text-white px-4 py-3 outline-none focus:border-[#22d3ee] placeholder:text-white/30 sm:col-span-2" placeholder="Email optional" />
                  </div>
                  <div className="mt-5 rounded-xl border border-white/10 bg-[#22d3ee]/5 p-4">
                    <p className="font-black text-[#22d3ee]">Review summary</p>
                    <p className="mt-2 text-sm leading-6 text-white/70">{suggestion?.summary}</p>
                  </div>
                </div>
              ) : null}

              <div className="mt-8 flex justify-between gap-3">
                <button onClick={() => setStep(Math.max(1, step - 1))} className="rounded-lg border border-white/10 bg-white/5 px-5 py-3 font-black text-white hover:bg-white/10 transition-colors" disabled={step === 1}>
                  Back
                </button>
                {step < 3 ? (
                  <button onClick={() => setStep(step + 1)} disabled={!canContinue} className="rounded-lg bg-gradient-to-r from-[#22d3ee] to-[#06b6d4] px-5 py-3 font-black text-black shadow-lg shadow-[#22d3ee]/30 disabled:opacity-45">
                    Continue
                  </button>
                ) : (
                  <button onClick={submit} disabled={!canContinue || loading} className="rounded-lg bg-gradient-to-r from-[#f97316] to-[#ef4444] px-5 py-3 font-black text-white shadow-lg shadow-[#f97316]/30 disabled:opacity-45">
                    {loading ? "Submitting..." : "Submit Grievance"}
                  </button>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </CivicAppShell>
  )
}

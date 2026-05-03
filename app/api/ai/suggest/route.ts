import { NextResponse } from "next/server"

type Suggestion = {
  department: string
  category: string
  urgency: "CRITICAL" | "HIGH" | "NORMAL" | "LOW"
  confidence: number
  summary: string
  language_detected: "Hindi" | "English" | "Hinglish" | "Other"
  model: string
}

function classify(text: string): Suggestion {
  const value = text.toLowerCase()
  const language = /[\u0900-\u097F]/.test(text) ? "Hindi" : /\b(paani|bijli|kachra|gaddha|nahi|hai)\b/i.test(text) ? "Hinglish" : "English"

  if (/(death|hospital|fire|flood|3 days|three days|teen din|paani|water|pipe|leak|tank|tanker)/i.test(value)) {
    return {
      department: "Water Supply",
      category: /(pipe|leak)/i.test(value) ? "Pipe leak" : "Supply outage",
      urgency: /(death|hospital|fire|flood|3 days|three days|teen din)/i.test(value) ? "CRITICAL" : "HIGH",
      confidence: 0.94,
      summary: "Water supply disruption requiring urgent field verification.",
      language_detected: language,
      model: "CIVICAI local classifier v1",
    }
  }

  if (/(road|pothole|gaddha|bridge|flyover|street|traffic)/i.test(value)) {
    return {
      department: "Roads & Infrastructure",
      category: /(pothole|gaddha)/i.test(value) ? "Pothole repair" : "Road damage",
      urgency: /school|hospital|accident|main road/i.test(value) ? "HIGH" : "NORMAL",
      confidence: 0.89,
      summary: "Road infrastructure issue should be assigned to a public works officer.",
      language_detected: language,
      model: "CIVICAI local classifier v1",
    }
  }

  if (/(electric|bijli|power|wire|transformer|streetlight|light)/i.test(value)) {
    return {
      department: "Electricity",
      category: /(streetlight|light)/i.test(value) ? "Streetlight" : "Power infrastructure",
      urgency: /wire|hospital|sparking|danger/i.test(value) ? "HIGH" : "NORMAL",
      confidence: 0.87,
      summary: "Electricity issue detected with probable utility routing.",
      language_detected: language,
      model: "CIVICAI local classifier v1",
    }
  }

  if (/(garbage|kachra|drain|sanitation|dirty|waste|trash|dump)/i.test(value)) {
    return {
      department: "Sanitation & Garbage",
      category: /(drain|overflow)/i.test(value) ? "Drainage" : "Garbage pickup",
      urgency: /hospital|school|disease|overflow/i.test(value) ? "HIGH" : "NORMAL",
      confidence: 0.86,
      summary: "Sanitation complaint ready for municipal service assignment.",
      language_detected: language,
      model: "CIVICAI local classifier v1",
    }
  }

  return {
    department: "Other",
    category: "Manual review",
    urgency: "LOW",
    confidence: 0.62,
    summary: "Complaint needs manual department confirmation.",
    language_detected: language,
    model: "CIVICAI local classifier v1",
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const text = typeof body?.text === "string" ? body.text.trim() : ""
  const imageName = typeof body?.imageName === "string" ? body.imageName.trim() : ""
  const combined = [text, imageName].filter(Boolean).join(" ")

  if (combined.length < 5) {
    return NextResponse.json({ error: "Complaint text or image hint is required." }, { status: 400 })
  }

  return NextResponse.json(classify(combined))
}

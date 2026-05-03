import { NextResponse } from "next/server"

function makeGrievanceId() {
  const year = new Date().getFullYear()
  const serial = Math.floor(300 + Math.random() * 9700)
    .toString()
    .padStart(5, "0")

  return `CIV-${year}-${serial}`
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const text = typeof body?.text === "string" ? body.text.trim() : ""

  if (!text) {
    return NextResponse.json({ error: "Complaint text is required." }, { status: 400 })
  }

  const grievanceId = makeGrievanceId()

  return NextResponse.json({
    success: true,
    grievanceId,
    status: "Submitted",
    timeline: [
      { status: "Submitted", note: "Citizen complaint received.", timestamp: new Date().toISOString() },
      { status: "AI Classified", note: "Classification queued for department routing.", timestamp: new Date().toISOString() },
    ],
  })
}

import type React from "react"
import type { Metadata } from "next"
import CivicExperienceLayer from "@/components/CivicExperienceLayer"
import GlobalSearchWrapper from "@/components/GlobalSearchWrapper"
import "./globals.css"

export const metadata: Metadata = {
  title: "CIVICAI - AI Citizen Grievance Classification",
  description:
    "CIVICAI is an AI-powered citizen grievance platform that classifies, prioritizes, routes, and tracks public complaints across departments.",
  keywords:
    "CIVICAI, citizen grievance, AI classification, civic technology, government dashboard, public complaints",
  openGraph: {
    title: "CIVICAI - Your Voice. Classified. Heard.",
    description: "AI-based citizen grievance classification and action platform",
    type: "website",
  },
  generator: "Codex",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <CivicExperienceLayer />
        <GlobalSearchWrapper />
        {children}
      </body>
    </html>
  )
}

"use client"

import dynamic from "next/dynamic"

const GlobalSearch = dynamic(() => import("@/components/GlobalSearch"), { ssr: false })

export default function GlobalSearchWrapper() {
  return <GlobalSearch />
}

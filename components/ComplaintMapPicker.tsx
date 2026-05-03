"use client"

import { useState } from "react"
import { MapPin } from "lucide-react"

export default function ComplaintMapPicker({ 
  initialLat, 
  initialLng, 
  onLocationSelect 
}: { 
  initialLat?: number; 
  initialLng?: number; 
  onLocationSelect: (loc: { lat: number; lng: number; address: string }) => void 
}) {
  return (
    <div className="flex h-72 flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 p-4 text-center">
      <MapPin className="mb-3 text-[#22d3ee]" size={32} />
      <p className="text-sm font-bold text-white/50">Map Picker Placeholder</p>
      <p className="mt-1 text-xs text-white/50">
        Click below to simulate selecting a location.
      </p>
      <button 
        onClick={() => onLocationSelect({ lat: 23.2599, lng: 77.4126, address: "Ward 7, Bhopal, Madhya Pradesh" })}
        className="mt-4 rounded-lg bg-gradient-to-r from-[#22d3ee] to-[#06b6d4] px-4 py-2 text-sm font-bold text-black shadow-lg shadow-[#22d3ee]/20 hover:shadow-[#22d3ee]/30 transition-shadow"
      >
        Select Ward 7, Bhopal
      </button>
    </div>
  )
}

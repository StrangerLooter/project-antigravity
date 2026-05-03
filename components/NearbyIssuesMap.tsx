"use client"

import { useEffect, useRef, useState } from "react"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

const ISSUE_PINS = [
  { lat: 23.2399, lng: 77.4226, urgency: "CRITICAL", label: "Water - Ward 7, Bhopal", status: "In Progress" },
  { lat: 22.7196, lng: 75.8577, urgency: "HIGH", label: "Road - School Gate, Indore", status: "Assigned" },
  { lat: 23.1815, lng: 79.9864, urgency: "NORMAL", label: "Garbage - Market Lane, Jabalpur", status: "Resolved" },
  { lat: 26.2183, lng: 78.182, urgency: "HIGH", label: "Streetlight - Hospital Rd, Gwalior", status: "In Progress" },
  { lat: 24.5854, lng: 73.7125, urgency: "CRITICAL", label: "Water - Leak Near School, Udaipur", status: "Submitted" },
  { lat: 19.076, lng: 72.8777, urgency: "HIGH", label: "Drainage - Chembur, Mumbai", status: "Assigned" },
  { lat: 12.9716, lng: 77.5946, urgency: "NORMAL", label: "Garbage - Indiranagar, Bangalore", status: "Resolved" },
  { lat: 28.6139, lng: 77.209, urgency: "CRITICAL", label: "Water - Rohini, Delhi", status: "In Progress" },
  { lat: 17.385, lng: 78.4867, urgency: "HIGH", label: "Road - Hitech City, Hyderabad", status: "In Progress" },
]

const PIN_COLORS: Record<string, string> = {
  CRITICAL: "#ef4444",
  HIGH: "#f97316",
  NORMAL: "#22d3ee",
  LOW: "#06b6d4",
}

const createCustomIcon = (color: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36"><path d="M14 0C6 0 0 6 0 14c0 10 14 22 14 22S28 24 28 14C28 6 22 0 14 0z" fill="${color}" stroke="white" stroke-width="1.5"/><circle cx="14" cy="14" r="6" fill="white"/><circle cx="14" cy="14" r="3.5" fill="${color}"/></svg>`
  return L.divIcon({
    className: "custom-leaflet-icon",
    html: svg,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36],
  })
}

export default function NearbyIssuesMap() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    delete (containerRef.current as HTMLDivElement & { _leaflet_id?: number })._leaflet_id

    const map = L.map(containerRef.current, {
      scrollWheelZoom: false,
      zoomControl: true,
    }).setView([22.5, 80.0], 4.5)

    mapRef.current = map

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

    ISSUE_PINS.forEach((pin) => {
      const color = PIN_COLORS[pin.urgency] || "#94A3B8"
      L.marker([pin.lat, pin.lng], { icon: createCustomIcon(color) })
        .addTo(map)
        .bindPopup(`
          <div class="font-sans min-w-[150px]">
            <div class="font-black text-[13px] text-[#0D1117] mb-1">${pin.label}</div>
            <div class="flex items-center gap-1">
              <span class="w-2 h-2 rounded-full" style="background:${color}"></span>
              <span class="text-[11px] font-bold" style="color:${color}">${pin.urgency}</span>
            </div>
            <div class="text-[11px] text-[#5A6072] mt-1">Status: <strong>${pin.status}</strong></div>
          </div>
        `)
    })

    window.setTimeout(() => {
      map.invalidateSize()
      setReady(true)
    }, 80)

    return () => {
      map.remove()
      mapRef.current = null
      setReady(false)
    }
  }, [])

  const Legend = () => (
    <div className="flex flex-wrap items-center gap-3 border-t border-white/10 bg-white/5 px-4 py-2 text-xs">
      <span className="font-black uppercase tracking-wider text-white/50">Urgency:</span>
      {Object.entries(PIN_COLORS).map(([level, color]) => (
        <span key={level} className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full" style={{ background: color }} />
          <span className="font-black" style={{ color }}>{level}</span>
        </span>
      ))}
      <span className="ml-auto text-white/30">Click a pin for details</span>
    </div>
  )

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 shadow-sm">
      <div className="relative h-[370px] w-full">
        {!ready ? <div className="skeleton-shimmer absolute inset-0 z-10" /> : null}
        <div ref={containerRef} className="h-full w-full z-0 relative [&_.leaflet-container]:z-0" />
      </div>
      <Legend />
    </div>
  )
}

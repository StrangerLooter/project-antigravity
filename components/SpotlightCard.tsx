"use client"

import { useRef, useEffect } from "react"
import { motion, HTMLMotionProps } from "framer-motion"

export default function SpotlightCard({ children, className, ...props }: HTMLMotionProps<"div">) {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      card.style.setProperty("--x", `${x}px`)
      card.style.setProperty("--y", `${y}px`)
    }

    card.addEventListener("mousemove", handleMouseMove)
    return () => card.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <motion.div
      ref={cardRef}
      className={`relative overflow-hidden group ${className}`}
      {...props}
    >
      <div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: "radial-gradient(600px circle at var(--x, 0) var(--y, 0), rgba(27,79,255,0.08), transparent 40%)",
        }}
      />
      {children as React.ReactNode}
    </motion.div>
  )
}

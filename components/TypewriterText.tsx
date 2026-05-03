"use client"

import { useEffect, useState } from "react"

export default function TypewriterText({ text, delay = 0, speed = 40 }: { text: string; delay?: number; speed?: number }) {
  const [displayText, setDisplayText] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (delay > 0) {
      timeout = setTimeout(() => setIsTyping(true), delay)
    } else {
      setIsTyping(true)
    }
    return () => clearTimeout(timeout)
  }, [delay])

  useEffect(() => {
    if (!isTyping) return

    let i = 0
    const interval = setInterval(() => {
      setDisplayText(text.slice(0, i + 1))
      i++
      if (i >= text.length) clearInterval(interval)
    }, speed)

    return () => clearInterval(interval)
  }, [text, isTyping, speed])

  return <span>{displayText}</span>
}

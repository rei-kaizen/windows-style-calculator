"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface DisplayProps {
  value: string
  history: string[]
  mode: "standard" | "scientific" | "programmer"
}

export function Display({ value, history, mode }: DisplayProps) {
  const [glitchText, setGlitchText] = useState(value)
  const [showCursor, setShowCursor] = useState(true)

  // Glitch effect for display changes
  useEffect(() => {
    if (value !== glitchText) {
      const glitchChars = "!@#$%^&*()_+-=[]{}|;:,.<>?"
      let glitchStep = 0
      const maxSteps = 3

      const glitchInterval = setInterval(() => {
        if (glitchStep < maxSteps) {
          setGlitchText(
            value
              .split("")
              .map((char) => (Math.random() > 0.7 ? glitchChars[Math.floor(Math.random() * glitchChars.length)] : char))
              .join(""),
          )
          glitchStep++
        } else {
          setGlitchText(value)
          clearInterval(glitchInterval)
        }
      }, 50)

      return () => clearInterval(glitchInterval)
    }
  }, [value, glitchText])

  // Cursor blink effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 500)

    return () => clearInterval(cursorInterval)
  }, [])

  const getModeColor = () => {
    switch (mode) {
      case "scientific":
        return "from-purple-400 to-pink-400"
      case "programmer":
        return "from-green-400 to-emerald-400"
      default:
        return "from-cyan-400 to-blue-400"
    }
  }

  return (
    <Card className="relative overflow-hidden bg-black/60 backdrop-blur-sm border border-cyan-500/30 p-6">
      {/* Mode indicator */}
      <div className="flex justify-between items-center mb-4">
        <Badge
          variant="outline"
          className={cn("border-0 text-xs font-mono bg-gradient-to-r text-white", getModeColor())}
        >
          {mode.toUpperCase()}
        </Badge>

        {/* Status indicators */}
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: "0.5s" }} />
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" style={{ animationDelay: "1s" }} />
        </div>
      </div>

      {/* History display */}
      {history.length > 0 && (
        <div className="mb-2 text-right">
          <div className="text-sm text-cyan-300/70 font-mono">{history[history.length - 1]}</div>
        </div>
      )}

      {/* Main display */}
      <div className="relative">
        <div
          className={cn(
            "text-right text-4xl font-mono font-bold transition-all duration-300",
            "bg-gradient-to-r bg-clip-text text-transparent",
            getModeColor(),
          )}
        >
          {glitchText || "0"}
          {showCursor && <span className="animate-pulse text-cyan-400">|</span>}
        </div>

        {/* Scan line effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent h-1 animate-scan" />
      </div>

      {/* Input hints */}
      <div className="mt-4 text-xs text-cyan-300/50 font-mono">
        <div className="flex justify-between">
          <span>Ctrl+C: Copy</span>
          <span>Ctrl+V: Paste</span>
          <span>Esc: Clear</span>
        </div>
      </div>

      {/* Ambient glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-cyan-500/10 blur-xl -z-10" />
    </Card>
  )
}

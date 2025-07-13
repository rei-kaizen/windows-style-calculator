"use client"

import { useState, useEffect } from "react"
import { Calculator } from "@/components/calculator"
import { ThemeProvider } from "@/components/theme-provider"
import { AchievementSystem } from "@/components/achievement-system"
import { XPProgressBar } from "@/components/xp-progress-bar"

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Animated background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse" />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
            {/* Main Calculator */}
            <div className="flex-1 max-w-2xl">
              <Calculator />
            </div>

            {/* Side Panel */}
            <div className="w-full lg:w-80 space-y-6">
              <XPProgressBar />
              <AchievementSystem />
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}

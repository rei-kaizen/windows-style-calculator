"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CalculatorIcon as CalcIcon, Zap, Code, Settings } from "lucide-react"
import { StandardMode } from "./calculator-modes/standard-mode"
import { ScientificMode } from "./calculator-modes/scientific-mode"
import { ProgrammerMode } from "./calculator-modes/programmer-mode"
import { useCalculator } from "@/hooks/use-calculator"
import { useTheme } from "@/hooks/use-theme"
import { cn } from "@/lib/utils"

export function Calculator() {
  const [activeMode, setActiveMode] = useState("standard")
  const [glitchEffect, setGlitchEffect] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const calculator = useCalculator()

  // Trigger glitch effect on mode change
  useEffect(() => {
    setGlitchEffect(true)
    const timer = setTimeout(() => setGlitchEffect(false), 300)
    return () => clearTimeout(timer)
  }, [activeMode])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "1":
            e.preventDefault()
            setActiveMode("standard")
            break
          case "2":
            e.preventDefault()
            setActiveMode("scientific")
            break
          case "3":
            e.preventDefault()
            setActiveMode("programmer")
            break
        }
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [])

  const modes = [
    { id: "standard", label: "Standard", icon: CalcIcon, shortcut: "Ctrl+1" },
    { id: "scientific", label: "Scientific", icon: Zap, shortcut: "Ctrl+2" },
    { id: "programmer", label: "Programmer", icon: Code, shortcut: "Ctrl+3" },
  ]

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-500",
        "bg-black/40 backdrop-blur-xl border-cyan-500/30",
        "shadow-[0_0_50px_rgba(0,255,255,0.3)]",
        glitchEffect && "animate-glitch",
      )}
    >
      {/* Header */}
      <div className="relative p-6 border-b border-cyan-500/30 bg-gradient-to-r from-purple-900/50 to-cyan-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <CalcIcon className="w-8 h-8 text-cyan-400" />
              <div className="absolute inset-0 w-8 h-8 text-cyan-400 animate-ping opacity-20" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                CalcPro X
              </h1>
              <p className="text-xs text-cyan-300/70">Neural Computing Interface</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-cyan-500/50 text-cyan-300 text-xs">
              v2.1.0
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mode Tabs */}
        <Tabs value={activeMode} onValueChange={setActiveMode} className="mt-4">
          <TabsList className="grid w-full grid-cols-3 bg-black/50 border border-cyan-500/30">
            {modes.map((mode) => {
              const Icon = mode.icon
              return (
                <TabsTrigger
                  key={mode.id}
                  value={mode.id}
                  className={cn(
                    "relative group transition-all duration-300",
                    "data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-purple-500/20",
                    "data-[state=active]:text-cyan-300 data-[state=active]:shadow-[0_0_20px_rgba(0,255,255,0.3)]",
                  )}
                  title={mode.shortcut}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {mode.label}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </TabsTrigger>
              )
            })}
          </TabsList>
        </Tabs>
      </div>

      {/* Calculator Content */}
      <div className="p-6">
        <Tabs value={activeMode} className="w-full">
          <TabsContent value="standard" className="mt-0">
            <StandardMode calculator={calculator} />
          </TabsContent>
          <TabsContent value="scientific" className="mt-0">
            <ScientificMode calculator={calculator} />
          </TabsContent>
          <TabsContent value="programmer" className="mt-0">
            <ProgrammerMode calculator={calculator} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Ambient glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-cyan-500/20 blur-xl opacity-30 -z-10" />
    </Card>
  )
}

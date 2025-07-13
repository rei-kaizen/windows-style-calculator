"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Zap, TrendingUp } from "lucide-react"

export function XPProgressBar() {
  const [level, setLevel] = useState(7)
  const [currentXP, setCurrentXP] = useState(1250)
  const [xpToNext, setXpToNext] = useState(1500)
  const [recentGain, setRecentGain] = useState<number | null>(null)

  const progressPercent = (currentXP / xpToNext) * 100

  // Simulate XP gain
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentXP((prev) => {
        const newXP = prev + 25
        setRecentGain(25)
        setTimeout(() => setRecentGain(null), 2000)
        return newXP
      })
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const getLevelColor = () => {
    if (level < 5) return "from-green-400 to-emerald-500"
    if (level < 10) return "from-blue-400 to-cyan-500"
    if (level < 20) return "from-purple-400 to-pink-500"
    return "from-yellow-400 to-orange-500"
  }

  return (
    <Card className="bg-black/40 backdrop-blur-xl border-cyan-500/30 shadow-[0_0_30px_rgba(0,255,255,0.2)]">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-cyan-300">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Neural Level
          </div>
          <Badge
            variant="outline"
            className={cn("border-0 text-white font-bold", `bg-gradient-to-r ${getLevelColor()}`)}
          >
            LVL {level}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Experience</span>
            <span className="text-cyan-300 font-mono">
              {currentXP.toLocaleString()} / {xpToNext.toLocaleString()} XP
            </span>
          </div>

          <div className="relative">
            <Progress value={progressPercent} className="h-3 bg-gray-800" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>
        </div>

        {/* XP Sources */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-300">XP Sources</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Basic Calc</span>
              <span className="text-green-400">+5 XP</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Scientific</span>
              <span className="text-blue-400">+10 XP</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Programming</span>
              <span className="text-purple-400">+15 XP</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Complex Ops</span>
              <span className="text-orange-400">+25 XP</span>
            </div>
          </div>
        </div>

        {/* Recent XP Gain */}
        {recentGain && (
          <div className="flex items-center gap-2 p-2 bg-green-500/20 border border-green-500/30 rounded-lg animate-fade-in">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-300">+{recentGain} XP gained!</span>
          </div>
        )}

        {/* Next Level Preview */}
        <div className="p-3 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Next Level</span>
            <span className="text-sm text-cyan-300 font-mono">{xpToNext - currentXP} XP to go</span>
          </div>
          <div className="text-xs text-gray-400 mt-1">Unlock: Advanced Functions & New Themes</div>
        </div>
      </CardContent>
    </Card>
  )
}

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

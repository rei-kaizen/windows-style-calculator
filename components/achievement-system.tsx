"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Star, Zap, Target, Award } from "lucide-react"
import { cn } from "@/lib/utils"

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  progress: number
  maxProgress: number
  unlocked: boolean
  rarity: "common" | "rare" | "epic" | "legendary"
}

export function AchievementSystem() {
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: "first-calc",
      title: "First Steps",
      description: "Perform your first calculation",
      icon: Star,
      progress: 0,
      maxProgress: 1,
      unlocked: false,
      rarity: "common",
    },
    {
      id: "speed-demon",
      title: "Speed Demon",
      description: "Complete 10 calculations in under 30 seconds",
      icon: Zap,
      progress: 0,
      maxProgress: 10,
      unlocked: false,
      rarity: "rare",
    },
    {
      id: "mode-master",
      title: "Mode Master",
      description: "Use all three calculator modes",
      icon: Target,
      progress: 1,
      maxProgress: 3,
      unlocked: false,
      rarity: "epic",
    },
    {
      id: "precision-expert",
      title: "Precision Expert",
      description: "Perform 100 scientific calculations",
      icon: Award,
      progress: 23,
      maxProgress: 100,
      unlocked: false,
      rarity: "legendary",
    },
  ])

  const [recentUnlock, setRecentUnlock] = useState<Achievement | null>(null)

  const getRarityColor = (rarity: Achievement["rarity"]) => {
    switch (rarity) {
      case "common":
        return "from-gray-400 to-gray-600"
      case "rare":
        return "from-blue-400 to-blue-600"
      case "epic":
        return "from-purple-400 to-purple-600"
      case "legendary":
        return "from-yellow-400 to-orange-500"
    }
  }

  const getRarityBorder = (rarity: Achievement["rarity"]) => {
    switch (rarity) {
      case "common":
        return "border-gray-500/50"
      case "rare":
        return "border-blue-500/50"
      case "epic":
        return "border-purple-500/50"
      case "legendary":
        return "border-yellow-500/50"
    }
  }

  // Simulate achievement unlock
  useEffect(() => {
    const timer = setTimeout(() => {
      setAchievements((prev) =>
        prev.map((achievement) =>
          achievement.id === "first-calc" ? { ...achievement, progress: 1, unlocked: true } : achievement,
        ),
      )
      setRecentUnlock(achievements.find((a) => a.id === "first-calc") || null)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  // Clear recent unlock notification
  useEffect(() => {
    if (recentUnlock) {
      const timer = setTimeout(() => setRecentUnlock(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [recentUnlock])

  return (
    <>
      <Card className="bg-black/40 backdrop-blur-xl border-cyan-500/30 shadow-[0_0_30px_rgba(0,255,255,0.2)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-300">
            <Trophy className="w-5 h-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {achievements.map((achievement) => {
            const Icon = achievement.icon
            const progressPercent = (achievement.progress / achievement.maxProgress) * 100

            return (
              <div
                key={achievement.id}
                className={cn(
                  "relative p-4 rounded-lg border transition-all duration-300",
                  achievement.unlocked
                    ? `bg-gradient-to-r ${getRarityColor(achievement.rarity)}/20 ${getRarityBorder(achievement.rarity)} shadow-lg`
                    : "bg-gray-800/50 border-gray-600/30",
                  achievement.unlocked && "animate-pulse-slow",
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "p-2 rounded-full",
                      achievement.unlocked ? `bg-gradient-to-r ${getRarityColor(achievement.rarity)}` : "bg-gray-600",
                    )}
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4
                        className={cn("font-semibold text-sm", achievement.unlocked ? "text-white" : "text-gray-400")}
                      >
                        {achievement.title}
                      </h4>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs border-0 text-white",
                          `bg-gradient-to-r ${getRarityColor(achievement.rarity)}`,
                        )}
                      >
                        {achievement.rarity}
                      </Badge>
                    </div>

                    <p className="text-xs text-gray-300 mb-2">{achievement.description}</p>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">
                          {achievement.progress}/{achievement.maxProgress}
                        </span>
                        <span className="text-gray-400">{Math.round(progressPercent)}%</span>
                      </div>
                      <Progress value={progressPercent} className="h-2" />
                    </div>
                  </div>
                </div>

                {achievement.unlocked && (
                  <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50 animate-shimmer" />
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Achievement Unlock Notification */}
      {recentUnlock && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50 shadow-[0_0_30px_rgba(255,215,0,0.5)]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Achievement Unlocked!</h4>
                  <p className="text-sm text-yellow-200">{recentUnlock.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}

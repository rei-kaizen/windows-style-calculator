"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CalcButtonProps {
  label: string
  value: string
  type: "number" | "operator" | "function" | "equals"
  onClick: () => void
  className?: string
  disabled?: boolean
  size?: "default" | "sm" | "lg"
}

export function CalcButton({
  label,
  value,
  type,
  onClick,
  className,
  disabled = false,
  size = "default",
}: CalcButtonProps) {
  const [isPressed, setIsPressed] = useState(false)
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([])

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return

    // Create ripple effect
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const newRipple = { id: Date.now(), x, y }

    setRipples((prev) => [...prev, newRipple])
    setIsPressed(true)

    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== newRipple.id))
    }, 600)

    setTimeout(() => setIsPressed(false), 150)

    onClick()
  }

  const getButtonStyles = () => {
    const baseStyles = "relative overflow-hidden transition-all duration-200 font-mono font-semibold"

    switch (type) {
      case "number":
        return cn(
          baseStyles,
          "bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700",
          "border border-cyan-500/30 text-cyan-100 shadow-[0_0_10px_rgba(0,255,255,0.2)]",
          "hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] hover:border-cyan-400/50",
          "active:scale-95 active:shadow-[0_0_30px_rgba(0,255,255,0.6)]",
        )
      case "operator":
        return cn(
          baseStyles,
          "bg-gradient-to-br from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500",
          "border border-orange-500/50 text-white shadow-[0_0_10px_rgba(255,165,0,0.3)]",
          "hover:shadow-[0_0_20px_rgba(255,165,0,0.5)] hover:border-orange-400/70",
          "active:scale-95",
        )
      case "function":
        return cn(
          baseStyles,
          "bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500",
          "border border-purple-500/50 text-white shadow-[0_0_10px_rgba(147,51,234,0.3)]",
          "hover:shadow-[0_0_20px_rgba(147,51,234,0.5)] hover:border-purple-400/70",
          "active:scale-95",
        )
      case "equals":
        return cn(
          baseStyles,
          "bg-gradient-to-br from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500",
          "border border-emerald-500/50 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]",
          "hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] hover:border-emerald-400/70",
          "active:scale-95 font-bold text-lg",
        )
      default:
        return baseStyles
    }
  }

  const sizeStyles = {
    sm: "h-10 text-sm",
    default: "h-14 text-base",
    lg: "h-16 text-lg",
  }

  return (
    <Button
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        getButtonStyles(),
        sizeStyles[size],
        isPressed && "scale-95",
        disabled && "opacity-30 cursor-not-allowed hover:scale-100",
        className,
      )}
    >
      {/* Button content */}
      <span className="relative z-10 select-none">{label}</span>

      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 -skew-x-12 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700" />

      {/* Ripple effects */}
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="absolute rounded-full bg-white/30 animate-ping"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            animationDuration: "0.6s",
          }}
        />
      ))}

      {/* Digital glyph overlay */}
      <div className="absolute inset-0 opacity-0 hover:opacity-20 transition-opacity duration-300">
        <div className="w-full h-full bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.1)_0%,transparent_70%)]" />
      </div>
    </Button>
  )
}

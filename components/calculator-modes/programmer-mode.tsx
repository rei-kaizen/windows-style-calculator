"use client"

import { useState } from "react"
import { CalcButton } from "../calc-button"
import { Display } from "../display"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { useCalculator } from "@/hooks/use-calculator"
import { cn } from "@/lib/utils"

interface ProgrammerModeProps {
  calculator: ReturnType<typeof useCalculator>
}

export function ProgrammerMode({ calculator }: ProgrammerModeProps) {
  const { display, history, handleInput, clear, backspace } = calculator
  const [base, setBase] = useState<"HEX" | "DEC" | "OCT" | "BIN">("DEC")

  const bases = [
    { label: "HEX", value: "HEX" as const, color: "from-red-500 to-orange-500" },
    { label: "DEC", value: "DEC" as const, color: "from-cyan-500 to-blue-500" },
    { label: "OCT", value: "OCT" as const, color: "from-green-500 to-emerald-500" },
    { label: "BIN", value: "BIN" as const, color: "from-purple-500 to-pink-500" },
  ]

  const hexButtons = ["A", "B", "C", "D", "E", "F"]

  const programmerButtons = [
    [
      { label: "Lsh", value: "<<", type: "operator" as const },
      { label: "Rsh", value: ">>", type: "operator" as const },
      { label: "Or", value: "|", type: "operator" as const },
      { label: "Xor", value: "^", type: "operator" as const },
    ],
    [
      { label: "Not", value: "~", type: "function" as const },
      { label: "And", value: "&", type: "operator" as const },
      { label: "C", value: "clear", type: "function" as const },
      { label: "⌫", value: "backspace", type: "function" as const },
    ],
    [
      { label: "7", value: "7", type: "number" as const },
      { label: "8", value: "8", type: "number" as const },
      { label: "9", value: "9", type: "number" as const },
      { label: "÷", value: "/", type: "operator" as const },
    ],
    [
      { label: "4", value: "4", type: "number" as const },
      { label: "5", value: "5", type: "number" as const },
      { label: "6", value: "6", type: "number" as const },
      { label: "×", value: "*", type: "operator" as const },
    ],
    [
      { label: "1", value: "1", type: "number" as const },
      { label: "2", value: "2", type: "number" as const },
      { label: "3", value: "3", type: "number" as const },
      { label: "−", value: "-", type: "operator" as const },
    ],
    [
      { label: "(", value: "(", type: "function" as const },
      { label: ")", value: ")", type: "function" as const },
      { label: "0", value: "0", type: "number" as const },
      { label: "+", value: "+", type: "operator" as const },
    ],
  ]

  const convertValue = (value: string, fromBase: string, toBase: string): string => {
    try {
      let decimal: number

      switch (fromBase) {
        case "HEX":
          decimal = Number.parseInt(value, 16)
          break
        case "OCT":
          decimal = Number.parseInt(value, 8)
          break
        case "BIN":
          decimal = Number.parseInt(value, 2)
          break
        default:
          decimal = Number.parseInt(value, 10)
      }

      if (isNaN(decimal)) return "0"

      switch (toBase) {
        case "HEX":
          return decimal.toString(16).toUpperCase()
        case "OCT":
          return decimal.toString(8)
        case "BIN":
          return decimal.toString(2)
        default:
          return decimal.toString(10)
      }
    } catch {
      return "0"
    }
  }

  return (
    <div className="space-y-6">
      <Display value={display} history={history} mode="programmer" />

      {/* Base Selector */}
      <div className="grid grid-cols-4 gap-2">
        {bases.map((baseOption) => (
          <Button
            key={baseOption.value}
            variant={base === baseOption.value ? "default" : "outline"}
            onClick={() => setBase(baseOption.value)}
            className={cn(
              "relative overflow-hidden transition-all duration-300",
              base === baseOption.value
                ? `bg-gradient-to-r ${baseOption.color} text-white shadow-lg`
                : "border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10",
            )}
          >
            {baseOption.label}
            {base === baseOption.value && <div className="absolute inset-0 bg-white/20 animate-pulse" />}
          </Button>
        ))}
      </div>

      {/* Base Conversions Display */}
      <div className="space-y-2 p-4 bg-black/30 rounded-lg border border-cyan-500/30">
        {bases.map((baseOption) => (
          <div key={baseOption.value} className="flex justify-between items-center">
            <Badge variant="outline" className="border-cyan-500/50 text-cyan-300 min-w-[3rem]">
              {baseOption.value}
            </Badge>
            <span className="font-mono text-cyan-100 text-sm">{convertValue(display, base, baseOption.value)}</span>
          </div>
        ))}
      </div>

      {/* Hex Buttons (A-F) */}
      {base === "HEX" && (
        <div className="grid grid-cols-6 gap-2">
          {hexButtons.map((hex) => (
            <CalcButton
              key={hex}
              label={hex}
              value={hex}
              type="number"
              onClick={() => handleInput(hex)}
              className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-500/30"
            />
          ))}
        </div>
      )}

      {/* Main Button Grid */}
      <div className="grid grid-cols-4 gap-3">
        {programmerButtons.flat().map((button, index) => {
          const isDisabled =
            (base === "BIN" && ["2", "3", "4", "5", "6", "7", "8", "9"].includes(button.value)) ||
            (base === "OCT" && ["8", "9"].includes(button.value))

          return (
            <CalcButton
              key={`${button.value}-${index}`}
              label={button.label}
              value={button.value}
              type={button.type}
              onClick={() => {
                if (button.value === "clear") {
                  clear()
                } else if (button.value === "backspace") {
                  backspace()
                } else {
                  handleInput(button.value)
                }
              }}
              disabled={isDisabled}
              className={isDisabled ? "opacity-30 cursor-not-allowed" : ""}
            />
          )
        })}

        {/* Equals button spanning full width */}
        <CalcButton label="=" value="=" type="equals" onClick={() => handleInput("=")} className="col-span-4" />
      </div>
    </div>
  )
}

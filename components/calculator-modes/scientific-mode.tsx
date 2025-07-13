"use client"

import { CalcButton } from "../calc-button"
import { Display } from "../display"
import type { useCalculator } from "@/hooks/use-calculator"

interface ScientificModeProps {
  calculator: ReturnType<typeof useCalculator>
}

export function ScientificMode({ calculator }: ScientificModeProps) {
  const { display, history, handleInput, clear, backspace } = calculator

  const scientificButtons = [
    [
      { label: "(", value: "(", type: "function" as const },
      { label: ")", value: ")", type: "function" as const },
      { label: "mc", value: "mc", type: "function" as const },
      { label: "m+", value: "m+", type: "function" as const },
      { label: "m-", value: "m-", type: "function" as const },
    ],
    [
      { label: "2nd", value: "2nd", type: "function" as const },
      { label: "π", value: "pi", type: "function" as const },
      { label: "e", value: "e", type: "function" as const },
      { label: "C", value: "clear", type: "function" as const },
      { label: "⌫", value: "backspace", type: "function" as const },
    ],
    [
      { label: "x²", value: "square", type: "function" as const },
      { label: "1/x", value: "reciprocal", type: "function" as const },
      { label: "|x|", value: "abs", type: "function" as const },
      { label: "exp", value: "exp", type: "function" as const },
      { label: "mod", value: "mod", type: "operator" as const },
    ],
    [
      { label: "√", value: "sqrt", type: "function" as const },
      { label: "7", value: "7", type: "number" as const },
      { label: "8", value: "8", type: "number" as const },
      { label: "9", value: "9", type: "number" as const },
      { label: "÷", value: "/", type: "operator" as const },
    ],
    [
      { label: "xʸ", value: "^", type: "operator" as const },
      { label: "4", value: "4", type: "number" as const },
      { label: "5", value: "5", type: "number" as const },
      { label: "6", value: "6", type: "number" as const },
      { label: "×", value: "*", type: "operator" as const },
    ],
    [
      { label: "10ˣ", value: "10^", type: "function" as const },
      { label: "1", value: "1", type: "number" as const },
      { label: "2", value: "2", type: "number" as const },
      { label: "3", value: "3", type: "number" as const },
      { label: "−", value: "-", type: "operator" as const },
    ],
    [
      { label: "log", value: "log", type: "function" as const },
      { label: "±", value: "negate", type: "function" as const },
      { label: "0", value: "0", type: "number" as const },
      { label: ".", value: ".", type: "number" as const },
      { label: "+", value: "+", type: "operator" as const },
    ],
    [
      { label: "ln", value: "ln", type: "function" as const },
      { label: "sin", value: "sin", type: "function" as const },
      { label: "cos", value: "cos", type: "function" as const },
      { label: "tan", value: "tan", type: "function" as const },
      { label: "=", value: "=", type: "equals" as const },
    ],
  ]

  return (
    <div className="space-y-6">
      <Display value={display} history={history} mode="scientific" />

      <div className="grid grid-cols-5 gap-2">
        {scientificButtons.flat().map((button, index) => (
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
            size="sm"
          />
        ))}
      </div>
    </div>
  )
}

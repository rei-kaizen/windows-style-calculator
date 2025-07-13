"use client"

import { useState, useCallback } from "react"

export function useCalculator() {
  const [display, setDisplay] = useState("0")
  const [history, setHistory] = useState<string[]>([])
  const [previousValue, setPreviousValue] = useState<number | null>(null)
  const [operation, setOperation] = useState<string | null>(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)

  const inputNumber = useCallback(
    (num: string) => {
      if (waitingForOperand) {
        setDisplay(num)
        setWaitingForOperand(false)
      } else {
        setDisplay(display === "0" ? num : display + num)
      }
    },
    [display, waitingForOperand],
  )

  const inputOperation = useCallback(
    (nextOperation: string) => {
      const inputValue = Number.parseFloat(display)

      if (previousValue === null) {
        setPreviousValue(inputValue)
      } else if (operation) {
        const currentValue = previousValue || 0
        const newValue = calculate(currentValue, inputValue, operation)

        setDisplay(String(newValue))
        setPreviousValue(newValue)

        // Add to history
        setHistory((prev) => [...prev, `${currentValue} ${operation} ${inputValue} = ${newValue}`])
      }

      setWaitingForOperand(true)
      setOperation(nextOperation)
    },
    [display, previousValue, operation],
  )

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case "+":
        return firstValue + secondValue
      case "-":
        return firstValue - secondValue
      case "*":
        return firstValue * secondValue
      case "/":
        return firstValue / secondValue
      case "=":
        return secondValue
      default:
        return secondValue
    }
  }

  const performCalculation = useCallback(() => {
    const inputValue = Number.parseFloat(display)

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation)
      setDisplay(String(newValue))
      setPreviousValue(null)
      setOperation(null)
      setWaitingForOperand(true)

      // Add to history
      setHistory((prev) => [...prev, `${previousValue} ${operation} ${inputValue} = ${newValue}`])
    }
  }, [display, previousValue, operation])

  const clear = useCallback(() => {
    setDisplay("0")
    setPreviousValue(null)
    setOperation(null)
    setWaitingForOperand(false)
  }, [])

  const clearEntry = useCallback(() => {
    setDisplay("0")
  }, [])

  const backspace = useCallback(() => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1))
    } else {
      setDisplay("0")
    }
  }, [display])

  const handleInput = useCallback(
    (value: string) => {
      if (/\d/.test(value)) {
        inputNumber(value)
      } else if (["+", "-", "*", "/"].includes(value)) {
        inputOperation(value)
      } else if (value === "=") {
        performCalculation()
      } else if (value === ".") {
        if (display.indexOf(".") === -1) {
          inputNumber(".")
        }
      } else if (value === "negate") {
        setDisplay(String(Number.parseFloat(display) * -1))
      } else if (value === "sqrt") {
        const result = Math.sqrt(Number.parseFloat(display))
        setDisplay(String(result))
        setHistory((prev) => [...prev, `√${display} = ${result}`])
      } else if (value === "square") {
        const result = Math.pow(Number.parseFloat(display), 2)
        setDisplay(String(result))
        setHistory((prev) => [...prev, `${display}² = ${result}`])
      } else if (value === "reciprocal") {
        const result = 1 / Number.parseFloat(display)
        setDisplay(String(result))
        setHistory((prev) => [...prev, `1/${display} = ${result}`])
      }
      // Add more scientific and programmer functions as needed
    },
    [display, inputNumber, inputOperation, performCalculation, history],
  )

  return {
    display,
    history,
    handleInput,
    clear,
    clearEntry,
    backspace,
  }
}

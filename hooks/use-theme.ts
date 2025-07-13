"use client"

import { useState, useEffect } from "react"

type Theme = "neon-blue" | "neon-purple" | "neon-green" | "matrix"

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("neon-blue")

  useEffect(() => {
    const savedTheme = localStorage.getItem("calculator-theme") as Theme
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  const toggleTheme = () => {
    const themes: Theme[] = ["neon-blue", "neon-purple", "neon-green", "matrix"]
    const currentIndex = themes.indexOf(theme)
    const nextTheme = themes[(currentIndex + 1) % themes.length]
    setTheme(nextTheme)
    localStorage.setItem("calculator-theme", nextTheme)
  }

  return { theme, toggleTheme }
}

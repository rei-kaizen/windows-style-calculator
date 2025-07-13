"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useTheme } from "@/hooks/use-theme"

const ThemeContext = createContext<ReturnType<typeof useTheme> | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useTheme()

  return (
    <ThemeContext.Provider value={theme}>
      <div className={`theme-${theme.theme}`}>{children}</div>
    </ThemeContext.Provider>
  )
}

export function useThemeContext() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useThemeContext must be used within ThemeProvider")
  }
  return context
}

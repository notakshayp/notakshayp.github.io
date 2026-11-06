"use client"

import type React from "react"
import { createContext, useCallback, useContext, useEffect, useState } from "react"

/** What the user picked: explicit light/dark, or `auto` = follow the OS. */
export type ThemePreference = "light" | "dark" | "auto"
/** What is actually applied to the page. */
export type Theme = "light" | "dark"

interface ThemeContextType {
  /** Resolved theme currently applied (auto → system). */
  theme: Theme
  /** The user's stored preference, incl. "auto". */
  preference: ThemePreference
  /** Switch between light and dark. */
  toggleTheme: () => void
  /** Set an explicit preference. */
  setPreference: (preference: ThemePreference) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const STORAGE_KEY = "theme"
const MEDIA_QUERY = "(prefers-color-scheme: dark)"

function readSavedPreference(): ThemePreference {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === "light" || saved === "dark" || saved === "auto") return saved
  } catch {
    // storage unavailable (privacy mode) — fall through to system default
  }
  return "auto"
}

function readSystemTheme(): Theme {
  return window.matchMedia(MEDIA_QUERY).matches ? "dark" : "light"
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to `auto` so a first visit follows the OS theme.
  const [preference, setPreference] = useState<ThemePreference>("auto")
  const [systemTheme, setSystemTheme] = useState<Theme>("light")

  // Load the saved preference and start watching the OS theme.
  useEffect(() => {
    setPreference(readSavedPreference())

    const media = window.matchMedia(MEDIA_QUERY)
    const update = () => setSystemTheme(media.matches ? "dark" : "light")
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])

  const theme: Theme = preference === "auto" ? systemTheme : preference

  // Apply the resolved theme + persist the preference.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
    document.documentElement.style.colorScheme = theme
    try {
      localStorage.setItem(STORAGE_KEY, preference)
    } catch {
      // ignore storage errors
    }
  }, [theme, preference])

  const toggleTheme = useCallback(() => {
    setPreference((prev) => {
      const resolved = prev === "auto" ? systemTheme : prev
      return resolved === "dark" ? "light" : "dark"
    })
  }, [systemTheme])

  return (
    <ThemeContext.Provider value={{ theme, preference, toggleTheme, setPreference }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

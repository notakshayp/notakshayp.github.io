"use client"

import { useTheme } from "../contexts/ThemeContext"

export const ThemeToggle: React.FC = () => {
  const { theme, setPreference } = useTheme()
  const next = theme === "dark" ? "light" : "dark"

  return (
    <button
      onClick={() => setPreference(next)}
      className="theme-text-toggle"
      aria-label={`Switch to ${next} mode (currently ${theme})`}
      title={`Switch to ${next}`}
    >
      {theme}
    </button>
  )
}

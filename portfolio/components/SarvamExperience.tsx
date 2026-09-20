"use client"

import { useEffect } from "react"

export function SarvamExperience() {
  useEffect(() => {
    const work = document.querySelector(".work-area")
    if (!work || work.querySelector(".sarvam-case")) return
    const firstCase = work.querySelector(".case")
    if (!firstCase) return
    firstCase.insertAdjacentHTML("beforebegin", `<article class="case sarvam-case"><div class="case-side"><img draggable="false" src="/brands/sarvam.svg" alt="Sarvam AI"/><span>2026 — PRESENT</span><small>FDE</small></div><div class="case-main"><h3>👀 🍿</h3></div></article>`)
  }, [])

  return null
}

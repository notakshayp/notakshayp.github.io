"use client"

import { useEffect, useRef } from "react"
import { startButterflies } from "../lib/butterfly-animation"

export function Butterflies() {
  const back = useRef<HTMLCanvasElement>(null)
  const front = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (!back.current || !front.current) return
    return startButterflies(back.current, front.current)
  }, [])
  const heroLayer = { position: "absolute" as const, top: 0, left: 0, width: "100%", height: "100svh", pointerEvents: "none" as const }
  return <>
    <canvas ref={back} aria-hidden="true" style={{ ...heroLayer, zIndex: 2 }} />
    <canvas ref={front} aria-hidden="true" style={{ ...heroLayer, zIndex: 4 }} />
  </>
}

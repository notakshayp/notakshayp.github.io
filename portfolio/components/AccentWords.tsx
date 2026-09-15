"use client"

import { useEffect } from "react"

const words = new Set(["dependable", "fun", "learning", "problem"])

export function AccentWords() {
  useEffect(() => {
    const roots = document.querySelectorAll<HTMLElement>(".field-guide h1, .field-guide h2")
    roots.forEach((root) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
      const nodes: Text[] = []
      while (walker.nextNode()) nodes.push(walker.currentNode as Text)
      nodes.forEach((node) => {
        const parts = node.textContent?.split(/(dependable|fun|learning|problem)/gi)
        if (!parts || parts.length === 1) return
        const fragment = document.createDocumentFragment()
        parts.forEach((part) => {
          if (words.has(part.toLowerCase())) {
            const mark = document.createElement("span")
            mark.className = "accent-word"
            mark.textContent = part
            fragment.appendChild(mark)
          } else fragment.appendChild(document.createTextNode(part))
        })
        node.parentNode?.replaceChild(fragment, node)
      })
    })
  }, [])

  return null
}

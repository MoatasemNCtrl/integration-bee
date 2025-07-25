"use client"

import "katex/dist/katex.min.css"
import { useEffect, useState } from "react"
import katex from "katex"

interface MathDisplayProps {
  math: string
  className?: string
  display?: boolean
}

export default function MathDisplay({ math, className = "", display = true }: MathDisplayProps) {
  const [html, setHtml] = useState<string>("")

  useEffect(() => {
    try {
      const rendered = katex.renderToString(math, {
        displayMode: display,
        throwOnError: false,
        trust: true,
        macros: {
          "\\ds": "\\displaystyle",
        },
      })
      setHtml(rendered)
    } catch (error) {
      console.error("KaTeX error:", error)
      setHtml(math) // Fallback to plain text
    }
  }, [math, display])

  return (
    <div
      className={`katex-display ${className}`}
      style={{ margin: 0, padding: 0 }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}


"use client"

import { useEffect, useRef } from "react"

export default function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size to match window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Enhanced bee pixel art pattern (24x24 pixels, scaled up)
    const drawBee = (x: number, y: number, scale: number, wingOffset: number) => {
      // Body segments
      ctx.fillStyle = "#000000" // Black body
      ctx.fillRect(x + 8 * scale, y + 6 * scale, 8 * scale, 12 * scale) // Main body
      ctx.fillRect(x + 6 * scale, y + 4 * scale, 12 * scale, 4 * scale) // Thorax
      ctx.fillRect(x + 10 * scale, y + 2 * scale, 4 * scale, 4 * scale) // Head

      // Yellow stripes
      ctx.fillStyle = "#FFD700"
      ctx.fillRect(x + 8 * scale, y + 8 * scale, 8 * scale, 2 * scale)
      ctx.fillRect(x + 8 * scale, y + 12 * scale, 8 * scale, 2 * scale)
      ctx.fillRect(x + 8 * scale, y + 16 * scale, 8 * scale, 2 * scale)

      // Eyes
      ctx.fillStyle = "#FFFFFF"
      ctx.fillRect(x + 9 * scale, y + 3 * scale, 2 * scale, 2 * scale)
      ctx.fillRect(x + 13 * scale, y + 3 * scale, 2 * scale, 2 * scale)

      // Animated wings
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
      // Left wing
      ctx.beginPath()
      ctx.ellipse(x + 6 * scale, y + (8 + wingOffset) * scale, 5 * scale, 3 * scale, -Math.PI / 6, 0, Math.PI * 2)
      ctx.fill()
      // Right wing
      ctx.beginPath()
      ctx.ellipse(x + 18 * scale, y + (8 + wingOffset) * scale, 5 * scale, 3 * scale, Math.PI / 6, 0, Math.PI * 2)
      ctx.fill()

      // Antennae
      ctx.strokeStyle = "#000000"
      ctx.lineWidth = scale
      ctx.beginPath()
      ctx.moveTo(x + 10 * scale, y + 2 * scale)
      ctx.lineTo(x + 8 * scale, y)
      ctx.moveTo(x + 14 * scale, y + 2 * scale)
      ctx.lineTo(x + 16 * scale, y)
      ctx.stroke()
    }

    // Expanded math symbols with different sizes and initial positions
    const symbols = [
      // Basic math symbols
      { char: "∫", x: 100, y: 150, size: 40 },
      { char: "∑", x: 300, y: 200, size: 45 },
      { char: "√", x: 500, y: 150, size: 40 },
      { char: "∏", x: 200, y: 250, size: 42 },
      { char: "±", x: 400, y: 300, size: 38 },
      // Additional math symbols
      { char: "∞", x: 150, y: 400, size: 44 },
      { char: "∂", x: 600, y: 250, size: 40 },
      { char: "∇", x: 350, y: 100, size: 38 },
      { char: "∆", x: 450, y: 450, size: 42 },
      { char: "∈", x: 250, y: 350, size: 36 },
      { char: "λ", x: 550, y: 200, size: 40 },
      { char: "θ", x: 700, y: 300, size: 38 },
      { char: "π", x: 150, y: 500, size: 42 },
      { char: "σ", x: 650, y: 150, size: 40 },
      { char: "μ", x: 400, y: 400, size: 36 },
    ]

    // Bee positions and movement
    const bees = [
      { x: 50, y: 100, dx: 2, dy: 1 },
      { x: 200, y: 200, dx: -2, dy: 1.5 },
      { x: 400, y: 150, dx: 1.5, dy: -1 },
    ]

    let animationFrame: number
    let time = 0
    const animate = () => {
      // Clear canvas with white background
      ctx.fillStyle = "#FFFFFF"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw and animate math symbols
      symbols.forEach((symbol, i) => {
        const offset = Math.sin(time / 50 + i) * 20
        const verticalOffset = Math.cos(time / 60 + i) * 15

        ctx.font = `${symbol.size}px Arial`
        ctx.fillStyle = "#D3D3D3"

        // Calculate position with wrapping
        let x = (symbol.x + offset) % canvas.width
        let y = (symbol.y + verticalOffset) % canvas.height

        // Ensure symbols wrap smoothly
        if (x < 0) x += canvas.width
        if (y < 0) y += canvas.height

        ctx.fillText(symbol.char, x, y)
      })

      // Wing flapping animation offset
      const wingOffset = Math.sin(time / 4) * 0.5

      // Draw and animate bees
      bees.forEach((bee) => {
        // Update position
        bee.x += bee.dx
        bee.y += bee.dy

        // Bounce off edges with padding for bee size
        if (bee.x <= 0 || bee.x >= canvas.width - 96) bee.dx *= -1
        if (bee.y <= 0 || bee.y >= canvas.height - 96) bee.dy *= -1

        // Draw bee with animated wings
        drawBee(bee.x, bee.y, 4, wingOffset)
      })

      time++

      // Continue animation
      animationFrame = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationFrame)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}


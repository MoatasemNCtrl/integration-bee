"use client"

import { useEffect, useRef } from "react"

interface IntegralRushBoxProps {
  onClick: () => void
}

export default function IntegralRushBox({ onClick }: IntegralRushBoxProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = 192 // w-48 = 12rem = 192px
    canvas.height = 192 // h-48 = 12rem = 192px

    // Fire particles
    const particles: Particle[] = []

    class Particle {
      x: number
      y: number
      speed: number
      size: number
      life: number
      maxLife: number

      constructor(x: number, y: number) {
        this.x = x
        this.y = y
        this.speed = Math.random() * 2 + 1
        this.size = Math.random() * 3 + 2
        this.life = 0
        this.maxLife = 50 + Math.random() * 30
      }

      update() {
        this.y -= this.speed
        this.life++
        if (this.life >= this.maxLife) {
          this.life = 0
          this.y = canvas.height - 20
          this.x = canvas.width / 2 + (Math.random() - 0.5) * 20
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        const alpha = (this.maxLife - this.life) / this.maxLife
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size)
        gradient.addColorStop(0, `rgba(255, 150, 0, ${alpha})`)
        gradient.addColorStop(0.4, `rgba(255, 50, 0, ${alpha * 0.6})`)
        gradient.addColorStop(1, `rgba(255, 0, 0, 0)`)

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Initialize particles
    for (let i = 0; i < 50; i++) {
      particles.push(
        new Particle(canvas.width / 2 + (Math.random() - 0.5) * 20, canvas.height - 20 + Math.random() * 20),
      )
    }

    // Animation
    let animationFrame: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw background
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw fire particles
      particles.forEach((particle) => {
        particle.update()
        particle.draw(ctx)
      })

      // Draw integral symbol
      ctx.fillStyle = "black"
      ctx.font = "72px serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText("∫", canvas.width / 2, canvas.height / 2)

      // Draw text
      ctx.font = '16px "Press Start 2P"'
      ctx.fillStyle = "black"
      ctx.fillText("Integral Rush", canvas.width / 2, canvas.height - 30)

      animationFrame = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrame)
    }
  }, [])

  return (
    <button
      onClick={onClick}
      className="w-48 h-48 rounded-xl shadow-lg hover:scale-105 transition-transform duration-300 overflow-hidden border-2 border-gray-200"
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </button>
  )
}


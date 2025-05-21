"use client"

import { useEffect, useRef } from "react"

interface AudioVisualizerProps {
  audioData: Uint8Array | null
}

export function AudioVisualizer({ audioData }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !audioData) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw frequency bars
    const barWidth = canvas.width / (audioData.length / 8)
    let x = 0

    for (let i = 0; i < audioData.length; i += 8) {
      const value = audioData[i] / 256
      const barHeight = value * canvas.height

      // Create gradient for bars
      const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height)
      gradient.addColorStop(0, "#ff00ff")
      gradient.addColorStop(0.5, "#00ffff")
      gradient.addColorStop(1, "#ffff00")

      ctx.fillStyle = gradient
      ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight)

      x += barWidth
    }
  }, [audioData])

  return (
    <canvas ref={canvasRef} width={200} height={60} className="fixed bottom-0 left-0 opacity-70 pointer-events-none" />
  )
}

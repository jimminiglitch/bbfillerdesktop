"use client"

import { useEffect, useRef } from "react"

interface WaveformVisualizerProps {
  audioData: Float32Array | null
  isPlaying: boolean
  playbackTime: number
  totalDuration: number
  trimStart?: number
  trimEnd?: number
  showTrimHandles?: boolean
}

export default function WaveformVisualizer({
  audioData,
  isPlaying,
  playbackTime,
  totalDuration,
  trimStart = 0,
  trimEnd = 0,
  showTrimHandles = false,
}: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !audioData) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.clientWidth * window.devicePixelRatio
    canvas.height = canvas.clientHeight * window.devicePixelRatio

    // Draw waveform
    const drawWaveform = () => {
      if (!ctx || !audioData) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Calculate the number of samples to display
      const step = Math.ceil(audioData.length / canvas.width)
      const amp = canvas.height / 2

      // Draw grid lines
      ctx.strokeStyle = "#00ffff20"
      ctx.lineWidth = 0.5

      // Horizontal grid lines
      for (let i = 0; i < canvas.height; i += canvas.height / 10) {
        ctx.beginPath()
        ctx.moveTo(0, i)
        ctx.lineTo(canvas.width, i)
        ctx.stroke()
      }

      // Vertical grid lines
      for (let i = 0; i < canvas.width; i += canvas.width / 20) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, canvas.height)
        ctx.stroke()
      }

      // Calculate positions for trim markers
      const trimStartPos = totalDuration > 0 ? (trimStart / totalDuration) * canvas.width : 0
      const trimEndPos = totalDuration > 0 ? (trimEnd / totalDuration) * canvas.width : canvas.width

      // Draw trimmed area background
      if (trimStart > 0 || trimEnd < totalDuration) {
        // Draw left trimmed area (darker)
        if (trimStart > 0) {
          ctx.fillStyle = "#ff00ff10"
          ctx.fillRect(0, 0, trimStartPos, canvas.height)
        }

        // Draw right trimmed area (darker)
        if (trimEnd < totalDuration) {
          ctx.fillStyle = "#ff00ff10"
          ctx.fillRect(trimEndPos, 0, canvas.width - trimEndPos, canvas.height)
        }
      }

      // Draw waveform
      ctx.beginPath()
      ctx.lineWidth = 2

      // Calculate playback position
      const playbackPosition = totalDuration > 0 ? (playbackTime / totalDuration) * canvas.width : 0

      for (let i = 0; i < canvas.width; i++) {
        const idx = Math.floor(i * step)
        const x = i
        let y = amp + audioData[idx] * amp

        // Constrain y to canvas boundaries
        y = Math.max(0, Math.min(y, canvas.height))

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }

        // Change color based on playback position
        if (i === Math.floor(playbackPosition)) {
          ctx.strokeStyle = "#ff00ff"
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.strokeStyle = "#00ffff"
        }
      }
      ctx.stroke()

      // Draw playback position line
      if (playbackPosition > 0) {
        ctx.beginPath()
        ctx.strokeStyle = "#ff00ff"
        ctx.lineWidth = 2
        ctx.moveTo(playbackPosition, 0)
        ctx.lineTo(playbackPosition, canvas.height)
        ctx.stroke()
      }

      // Draw trim markers
      if (showTrimHandles || trimStart > 0 || trimEnd < totalDuration) {
        // Draw start trim marker
        ctx.beginPath()
        ctx.strokeStyle = "#ff00ff"
        ctx.lineWidth = 3
        ctx.moveTo(trimStartPos, 0)
        ctx.lineTo(trimStartPos, canvas.height)
        ctx.stroke()

        // Draw end trim marker
        ctx.beginPath()
        ctx.strokeStyle = "#ff00ff"
        ctx.lineWidth = 3
        ctx.moveTo(trimEndPos, 0)
        ctx.lineTo(trimEndPos, canvas.height)
        ctx.stroke()

        // Draw trim handles
        if (showTrimHandles) {
          // Start handle
          ctx.fillStyle = "#ff00ff"
          ctx.beginPath()
          ctx.arc(trimStartPos, canvas.height / 2, 8, 0, 2 * Math.PI)
          ctx.fill()

          // End handle
          ctx.beginPath()
          ctx.arc(trimEndPos, canvas.height / 2, 8, 0, 2 * Math.PI)
          ctx.fill()
        }
      }

      // Add glitch effect during playback
      if (isPlaying && Math.random() > 0.95) {
        ctx.fillStyle = "#ff00ff10"
        ctx.fillRect(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          Math.random() * 100,
          Math.random() * 10,
        )
      }

      // Continue animation if playing
      if (isPlaying) {
        animationRef.current = requestAnimationFrame(drawWaveform)
      }
    }

    drawWaveform()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [audioData, isPlaying, playbackTime, totalDuration, trimStart, trimEnd, showTrimHandles])

  // Redraw on playback time change
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !audioData) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Draw waveform
    const drawWaveform = () => {
      if (!ctx || !audioData) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Calculate the number of samples to display
      const step = Math.ceil(audioData.length / canvas.width)
      const amp = canvas.height / 2

      // Draw grid lines
      ctx.strokeStyle = "#00ffff20"
      ctx.lineWidth = 0.5

      // Horizontal grid lines
      for (let i = 0; i < canvas.height; i += canvas.height / 10) {
        ctx.beginPath()
        ctx.moveTo(0, i)
        ctx.lineTo(canvas.width, i)
        ctx.stroke()
      }

      // Vertical grid lines
      for (let i = 0; i < canvas.width; i += canvas.width / 20) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, canvas.height)
        ctx.stroke()
      }

      // Calculate positions for trim markers
      const trimStartPos = totalDuration > 0 ? (trimStart / totalDuration) * canvas.width : 0
      const trimEndPos = totalDuration > 0 ? (trimEnd / totalDuration) * canvas.width : canvas.width

      // Draw trimmed area background
      if (trimStart > 0 || trimEnd < totalDuration) {
        // Draw left trimmed area (darker)
        if (trimStart > 0) {
          ctx.fillStyle = "#ff00ff10"
          ctx.fillRect(0, 0, trimStartPos, canvas.height)
        }

        // Draw right trimmed area (darker)
        if (trimEnd < totalDuration) {
          ctx.fillStyle = "#ff00ff10"
          ctx.fillRect(trimEndPos, 0, canvas.width - trimEndPos, canvas.height)
        }
      }

      // Draw waveform
      ctx.beginPath()
      ctx.lineWidth = 2
      ctx.strokeStyle = "#00ffff"

      // Calculate playback position
      const playbackPosition = totalDuration > 0 ? (playbackTime / totalDuration) * canvas.width : 0

      for (let i = 0; i < canvas.width; i++) {
        const idx = Math.floor(i * step)
        const x = i
        let y = amp + audioData[idx] * amp

        // Constrain y to canvas boundaries
        y = Math.max(0, Math.min(y, canvas.height))

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }

        // Change color based on playback position
        if (i === Math.floor(playbackPosition)) {
          ctx.strokeStyle = "#ff00ff"
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.strokeStyle = "#00ffff"
        }
      }
      ctx.stroke()

      // Draw playback position line
      if (playbackPosition > 0) {
        ctx.beginPath()
        ctx.strokeStyle = "#ff00ff"
        ctx.lineWidth = 2
        ctx.moveTo(playbackPosition, 0)
        ctx.lineTo(playbackPosition, canvas.height)
        ctx.stroke()
      }

      // Draw trim markers
      if (showTrimHandles || trimStart > 0 || trimEnd < totalDuration) {
        // Draw start trim marker
        ctx.beginPath()
        ctx.strokeStyle = "#ff00ff"
        ctx.lineWidth = 3
        ctx.moveTo(trimStartPos, 0)
        ctx.lineTo(trimStartPos, canvas.height)
        ctx.stroke()

        // Draw end trim marker
        ctx.beginPath()
        ctx.strokeStyle = "#ff00ff"
        ctx.lineWidth = 3
        ctx.moveTo(trimEndPos, 0)
        ctx.lineTo(trimEndPos, canvas.height)
        ctx.stroke()

        // Draw trim handles
        if (showTrimHandles) {
          // Start handle
          ctx.fillStyle = "#ff00ff"
          ctx.beginPath()
          ctx.arc(trimStartPos, canvas.height / 2, 8, 0, 2 * Math.PI)
          ctx.fill()

          // End handle
          ctx.beginPath()
          ctx.arc(trimEndPos, canvas.height / 2, 8, 0, 2 * Math.PI)
          ctx.fill()
        }
      }
    }

    drawWaveform()
  }, [audioData, playbackTime, totalDuration, trimStart, trimEnd, showTrimHandles])

  return <canvas ref={canvasRef} className="w-full h-full" style={{ display: "block" }} />
}

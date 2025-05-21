import { useEffect, useRef } from "react"

interface SpectrumVisualizerProps {
  analyser: AnalyserNode | null
  isPlaying: boolean
}

export default function SpectrumVisualizer({ analyser, isPlaying }: SpectrumVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !analyser) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.clientWidth * window.devicePixelRatio
    canvas.height = canvas.clientHeight * window.devicePixelRatio

    // Set up analyzer
    analyser.fftSize = 256
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    // Draw spectrum
    const drawSpectrum = () => {
      if (!ctx || !analyser) return

      // Request next animation frame
      animationRef.current = requestAnimationFrame(drawSpectrum)

      // Get frequency data
      analyser.getByteFrequencyData(dataArray)

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

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

      // Draw spectrum bars
      const barWidth = (canvas.width / bufferLength) * 2.5
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height

        // Create gradient for each bar
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight)
        gradient.addColorStop(0, "#ff00ff")
        gradient.addColorStop(0.5, "#aa00ff")
        gradient.addColorStop(1, "#00ffff")

        ctx.fillStyle = gradient
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)

        // Add glow effect
        ctx.shadowColor = "#ff00ff"
        ctx.shadowBlur = 10
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0

        // Add glitch effect
        if (Math.random() > 0.99) {
          ctx.fillStyle = "#ff00ff50"
          ctx.fillRect(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            Math.random() * 100,
            Math.random() * 5,
          )
        }

        x += barWidth + 1
      }
    }

    // Start or stop animation based on isPlaying
    if (isPlaying) {
      drawSpectrum()
    } else {
      // Draw static spectrum
      analyser.getByteFrequencyData(dataArray)

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

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

      // Draw spectrum bars
      const barWidth = (canvas.width / bufferLength) * 2.5
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height

        // Create gradient for each bar
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight)
        gradient.addColorStop(0, "#ff00ff80")
        gradient.addColorStop(0.5, "#aa00ff80")
        gradient.addColorStop(1, "#00ffff80")

        ctx.fillStyle = gradient
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)

        x += barWidth + 1
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [analyser, isPlaying])

  return <canvas ref={canvasRef} className="w-full h-full" style={{ display: "block" }} />
}

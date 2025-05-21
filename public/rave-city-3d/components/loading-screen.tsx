"use client"

import { useEffect, useState } from "react"

export default function LoadingScreen() {
  const [loadingText, setLoadingText] = useState("INITIALIZING NEURAL INTERFACE")
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Glitch text effect
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.6) {
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+{}|:<>?"
        let glitched = ""
        const originalText = "INITIALIZING NEURAL INTERFACE"

        for (let i = 0; i < originalText.length; i++) {
          if (Math.random() > 0.7) {
            glitched += characters.charAt(Math.floor(Math.random() * characters.length))
          } else {
            glitched += originalText[i]
          }
        }

        setLoadingText(glitched)
      } else {
        setLoadingText("INITIALIZING NEURAL INTERFACE")
      }
    }, 80)

    // Progress simulation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 10
        return newProgress >= 100 ? 100 : newProgress
      })
    }, 150)

    return () => {
      clearInterval(glitchInterval)
      clearInterval(progressInterval)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white">
      <div className="text-2xl font-mono mb-8 glitch-text">{loadingText}</div>

      <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 via-cyan-500 to-pink-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-2 text-sm font-mono">{Math.round(progress)}%</div>
    </div>
  )
}

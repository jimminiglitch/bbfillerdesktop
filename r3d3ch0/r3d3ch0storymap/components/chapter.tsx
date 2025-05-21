"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useStory } from "@/components/story-context"
import { ChevronDown } from "lucide-react"

interface ChapterProps {
  id: number
  title: string
  audioSrc: string
  onComplete: () => void
}

// Sample chapter content - replace with actual content from the user
const chapterContent = {
  0: [
    { text: "Welcome to the Neon Nexus.", time: 0 },
    { text: "A world where technology and humanity blur together.", time: 3 },
    { text: "This is your story. Your journey through the digital wasteland.", time: 6 },
    { text: "Are you ready to begin?", time: 10 },
  ],
  1: [
    { text: "Chapter 1: The Digital Frontier", time: 0 },
    { text: "The city sprawls before you, a maze of neon and shadow.", time: 3 },
    { text: "Your mission begins at DudeRock Arcade, where information brokers gather.", time: 7 },
    { text: "Find the terminal. Access the network. Discover the truth.", time: 12 },
  ],
  2: [
    { text: "Chapter 2: Corporate Shadows", time: 0 },
    { text: "The information from the arcade leads you to NepoCorp Headquarters.", time: 3 },
    { text: "A towering monolith of glass and steel, hiding secrets in its digital heart.", time: 8 },
    { text: "Infiltrate the system. Bypass security. Reveal the conspiracy.", time: 13 },
  ],
  3: [
    { text: "Chapter 3: The Revelation", time: 0 },
    { text: "The truth is more disturbing than you imagined.", time: 3 },
    { text: "NepoCorp's project threatens to rewrite reality itself.", time: 7 },
    { text: "You have the data. You have the power. What will you do with it?", time: 12 },
    { text: "The choice is yours. The consequences are everyone's.", time: 17 },
  ],
}

export default function Chapter({ id, title, audioSrc, onComplete }: ChapterProps) {
  const { audioPlaying } = useStory()
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [showContinue, setShowContinue] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const content = chapterContent[id]

  // Set up audio and text synchronization
  useEffect(() => {
    const audio = new Audio(audioSrc)
    audioRef.current = audio

    const handleTimeUpdate = () => {
      const currentTime = audio.currentTime

      // Find the text that should be displayed at the current time
      const textIndex = content.findIndex((item, index) => {
        const nextItem = content[index + 1]
        return currentTime >= item.time && (!nextItem || currentTime < nextItem.time)
      })

      if (textIndex !== -1) {
        setCurrentTextIndex(textIndex)
      }

      // Show continue button when audio ends
      if (audio.ended) {
        setShowContinue(true)
      }
    }

    audio.addEventListener("timeupdate", handleTimeUpdate)

    // Play/pause based on global state
    if (audioPlaying) {
      audio.play()
    } else {
      audio.pause()
    }

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.pause()
      audio.src = ""
    }
  }, [audioSrc, audioPlaying, content])

  // Handle chapter completion
  const handleContinue = () => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
    onComplete()
  }

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-black text-green-400">
      <div className="max-w-3xl w-full space-y-8">
        <h2 className="text-4xl font-bold text-center mb-12">{title}</h2>

        <div className="min-h-[300px] flex items-center justify-center">
          <p className="text-2xl text-center leading-relaxed">{content[currentTextIndex]?.text || ""}</p>
        </div>

        {showContinue ? (
          <div className="flex justify-center mt-12">
            <Button onClick={handleContinue} className="bg-green-700 hover:bg-green-600 text-white px-8 py-6 text-lg">
              Continue
            </Button>
          </div>
        ) : (
          <div className="flex justify-center mt-12 animate-bounce">
            <ChevronDown className="h-8 w-8 text-green-500/50" />
          </div>
        )}
      </div>
    </div>
  )
}

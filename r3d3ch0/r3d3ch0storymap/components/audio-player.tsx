"use client"

import { Button } from "@/components/ui/button"
import { Play, Pause, Volume2, VolumeX } from "lucide-react"
import { useState } from "react"

interface AudioPlayerProps {
  isPlaying: boolean
  onToggle: () => void
}

export default function AudioPlayer({ isPlaying, onToggle }: AudioPlayerProps) {
  const [isMuted, setIsMuted] = useState(false)

  // Toggle mute state
  const toggleMute = () => {
    setIsMuted(!isMuted)

    // Mute/unmute all audio elements
    document.querySelectorAll("audio").forEach((audio) => {
      audio.muted = !isMuted
    })
  }

  return (
    <div className="flex items-center space-x-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="text-green-400 hover:text-green-300 hover:bg-green-900/20"
        title={isPlaying ? "Pause narration" : "Play narration"}
      >
        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMute}
        className="text-green-400 hover:text-green-300 hover:bg-green-900/20"
        title={isMuted ? "Unmute audio" : "Mute audio"}
      >
        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </Button>

      <span className="text-xs text-green-500/70">{isPlaying ? "Narration Playing" : "Narration Paused"}</span>
    </div>
  )
}

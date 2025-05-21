"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import LoginScreen from "@/components/login-screen"
import Chapter from "@/components/chapter"
import DudeRockArcade from "@/components/interactive/dude-rock-arcade"
import NepoCorpHQ from "@/components/interactive/nepo-corp-hq"
import Navigation from "@/components/navigation"
import AudioPlayer from "@/components/audio-player"
import { StoryProvider } from "@/components/story-context"

export default function StoryMap() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentChapter, setCurrentChapter] = useState(0)
  const [chapterProgress, setChapterProgress] = useState({
    0: false, // Chapter 0 completion status
    1: false, // Chapter 1 completion status
    "dude-rock": false, // DudeRockArcade completion status
    2: false, // Chapter 2 completion status
    "nepo-corp": false, // NepoCorpHQ completion status
    3: false, // Chapter 3 completion status
  })
  const [showInteractive, setShowInteractive] = useState({
    "dude-rock": false,
    "nepo-corp": false,
  })
  const [audioPlaying, setAudioPlaying] = useState(false)

  // Handle login
  const handleLogin = () => {
    setIsLoggedIn(true)
    setCurrentChapter(0)
  }

  // Handle chapter completion
  const completeChapter = (chapter) => {
    setChapterProgress((prev) => ({ ...prev, [chapter]: true }))

    // Logic for what happens after completing each chapter
    if (chapter === 0) {
      setCurrentChapter(1)
    } else if (chapter === 1) {
      setShowInteractive((prev) => ({ ...prev, "dude-rock": true }))
    } else if (chapter === "dude-rock") {
      setShowInteractive((prev) => ({ ...prev, "dude-rock": false }))
      setCurrentChapter(2)
    } else if (chapter === 2) {
      setShowInteractive((prev) => ({ ...prev, "nepo-corp": true }))
    } else if (chapter === "nepo-corp") {
      setShowInteractive((prev) => ({ ...prev, "nepo-corp": false }))
      setCurrentChapter(3)
    } else if (chapter === 3) {
      // Loop back to login
      setIsLoggedIn(false)
      setCurrentChapter(0)
      setChapterProgress({
        0: false,
        1: false,
        "dude-rock": false,
        2: false,
        "nepo-corp": false,
        3: false,
      })
    }
  }

  // Navigate to a specific chapter
  const navigateToChapter = (chapter) => {
    // Only allow navigation to chapters that are available
    const chapterOrder = [0, 1, "dude-rock", 2, "nepo-corp", 3]
    const currentIndex = chapterOrder.indexOf(currentChapter)
    const targetIndex = chapterOrder.indexOf(chapter)

    // Can only navigate to chapters that are completed or the next one
    if (targetIndex <= currentIndex || chapterProgress[chapterOrder[targetIndex - 1]]) {
      setCurrentChapter(chapter)
    }
  }

  // Toggle audio playback
  const toggleAudio = () => {
    setAudioPlaying(!audioPlaying)
  }

  return (
    <StoryProvider
      value={{
        currentChapter,
        chapterProgress,
        completeChapter,
        navigateToChapter,
        audioPlaying,
        toggleAudio,
      }}
    >
      <div className="h-screen w-screen overflow-hidden bg-black text-green-500 font-mono">
        {!isLoggedIn ? (
          <LoginScreen onLogin={handleLogin} />
        ) : (
          <div className="relative h-full w-full flex flex-col">
            {/* Persistent UI elements */}
            <div className="fixed top-0 left-0 w-full z-50 bg-black/80 border-b border-green-500/30">
              <div className="flex justify-between items-center p-2">
                <AudioPlayer isPlaying={audioPlaying} onToggle={toggleAudio} />
                <Navigation
                  currentChapter={currentChapter}
                  chapterProgress={chapterProgress}
                  onNavigate={navigateToChapter}
                />
              </div>
            </div>

            {/* Main content area */}
            <div className="flex-1 mt-12 relative">
              {/* Chapters */}
              {currentChapter === 0 && (
                <Chapter
                  id={0}
                  title="Chapter 0"
                  audioSrc="/audio/chapter0.mp3"
                  onComplete={() => completeChapter(0)}
                />
              )}

              {currentChapter === 1 && (
                <Chapter
                  id={1}
                  title="Chapter 1"
                  audioSrc="/audio/chapter1.mp3"
                  onComplete={() => completeChapter(1)}
                />
              )}

              {currentChapter === 2 && (
                <Chapter
                  id={2}
                  title="Chapter 2"
                  audioSrc="/audio/chapter2.mp3"
                  onComplete={() => completeChapter(2)}
                />
              )}

              {currentChapter === 3 && (
                <Chapter
                  id={3}
                  title="Chapter 3"
                  audioSrc="/audio/chapter3.mp3"
                  onComplete={() => completeChapter(3)}
                />
              )}

              {/* Interactive Overlays */}
              {showInteractive["dude-rock"] && (
                <div className="absolute inset-0 z-40 bg-black/90">
                  <DudeRockArcade onComplete={() => completeChapter("dude-rock")} />
                </div>
              )}

              {showInteractive["nepo-corp"] && (
                <div className="absolute inset-0 z-40 bg-black/90">
                  <NepoCorpHQ onComplete={() => completeChapter("nepo-corp")} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </StoryProvider>
  )
}

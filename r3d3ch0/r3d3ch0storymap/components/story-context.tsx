"use client"

import { createContext, useContext } from "react"

// Define the context type
type StoryContextType = {
  currentChapter: number | string
  chapterProgress: Record<string | number, boolean>
  completeChapter: (chapter: number | string) => void
  navigateToChapter: (chapter: number | string) => void
  audioPlaying: boolean
  toggleAudio: () => void
}

// Create the context with a default value
const StoryContext = createContext<StoryContextType>({
  currentChapter: 0,
  chapterProgress: {},
  completeChapter: () => {},
  navigateToChapter: () => {},
  audioPlaying: false,
  toggleAudio: () => {},
})

// Export the provider component
export const StoryProvider = StoryContext.Provider

// Export a custom hook to use the context
export const useStory = () => useContext(StoryContext)

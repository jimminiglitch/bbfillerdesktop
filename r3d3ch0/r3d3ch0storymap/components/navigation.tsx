"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, ChevronRight } from "lucide-react"

interface NavigationProps {
  currentChapter: number | string
  chapterProgress: Record<string | number, boolean>
  onNavigate: (chapter: number | string) => void
}

export default function Navigation({ currentChapter, chapterProgress, onNavigate }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Chapter data for navigation
  const chapters = [
    { id: 0, title: "Chapter 0: Introduction" },
    { id: 1, title: "Chapter 1: Digital Frontier" },
    { id: "dude-rock", title: "DudeRock Arcade", isInteractive: true },
    { id: 2, title: "Chapter 2: Corporate Shadows" },
    { id: "nepo-corp", title: "NepoCorp HQ", isInteractive: true },
    { id: 3, title: "Chapter 3: Revelation" },
  ]

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  // Handle chapter navigation
  const handleNavigate = (chapter: number | string) => {
    onNavigate(chapter)
    setIsOpen(false)
  }

  // Check if a chapter is available for navigation
  const isChapterAvailable = (chapterId: number | string) => {
    const chapterIndex = chapters.findIndex((c) => c.id === chapterId)
    const currentIndex = chapters.findIndex((c) => c.id === currentChapter)

    // Can navigate to current or previous chapters
    if (chapterIndex <= currentIndex) return true

    // Can navigate to next chapter if previous is completed
    const prevChapter = chapters[chapterIndex - 1]
    return prevChapter && chapterProgress[prevChapter.id]
  }

  return (
    <div className="relative">
      {/* Mobile toggle button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="md:hidden text-green-400 hover:text-green-300 hover:bg-green-900/20"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Desktop progress indicator */}
      <div className="hidden md:flex items-center space-x-2">
        {chapters.map((chapter, index) => (
          <div key={chapter.id} className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => isChapterAvailable(chapter.id) && handleNavigate(chapter.id)}
              disabled={!isChapterAvailable(chapter.id)}
              className={`
                px-2 py-1 text-xs rounded 
                ${
                  currentChapter === chapter.id
                    ? "bg-green-700/30 text-green-300"
                    : chapterProgress[chapter.id]
                      ? "text-green-400 hover:bg-green-900/20"
                      : "text-green-500/50"
                }
              `}
            >
              {index + 1}
            </Button>

            {index < chapters.length - 1 && <ChevronRight className="h-3 w-3 text-green-500/50 mx-1" />}
          </div>
        ))}
      </div>

      {/* Mobile sidebar */}
      {isOpen && (
        <div className="absolute top-10 right-0 w-64 bg-black border border-green-500/30 rounded-md shadow-lg shadow-green-500/10 z-50 md:hidden">
          <div className="p-4">
            <h3 className="text-lg font-bold mb-4 text-green-400">Navigation</h3>
            <ul className="space-y-2">
              {chapters.map((chapter) => (
                <li key={chapter.id}>
                  <Button
                    variant="ghost"
                    onClick={() => isChapterAvailable(chapter.id) && handleNavigate(chapter.id)}
                    disabled={!isChapterAvailable(chapter.id)}
                    className={`
                      w-full justify-start text-left px-3 py-2 text-sm
                      ${
                        currentChapter === chapter.id
                          ? "bg-green-700/30 text-green-300"
                          : chapterProgress[chapter.id]
                            ? "text-green-400 hover:bg-green-900/20"
                            : "text-green-500/50"
                      }
                      ${chapter.isInteractive ? "italic" : ""}
                    `}
                  >
                    {chapter.title}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

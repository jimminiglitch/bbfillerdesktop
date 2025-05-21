"use client"

interface ThemeIndicatorProps {
  themeName: string
}

export function ThemeIndicator({ themeName }: ThemeIndicatorProps) {
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-lg font-mono animate-fade-in-out pointer-events-none">
      {themeName}
    </div>
  )
}

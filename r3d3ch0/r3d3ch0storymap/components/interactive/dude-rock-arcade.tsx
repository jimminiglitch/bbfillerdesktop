"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface DudeRockArcadeProps {
  onComplete: () => void
}

export default function DudeRockArcade({ onComplete }: DudeRockArcadeProps) {
  const [step, setStep] = useState(1)
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [terminals, setTerminals] = useState([
    { id: 1, accessed: false },
    { id: 2, accessed: false },
    { id: 3, accessed: false },
  ])

  // The correct code for the final terminal
  const correctCode = "1337"

  // Handle terminal access
  const accessTerminal = (id: number) => {
    setTerminals(terminals.map((t) => (t.id === id ? { ...t, accessed: true } : t)))

    // If all terminals accessed, move to final step
    if (terminals.filter((t) => t.id !== id).every((t) => t.accessed)) {
      setStep(2)
    }
  }

  // Handle code submission
  const submitCode = () => {
    if (code === correctCode) {
      setStep(3)
      setError("")
    } else {
      setError("Invalid access code. Try again.")
    }
  }

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-black/95 text-green-400">
      <div className="max-w-3xl w-full space-y-8 border border-green-500/30 p-8 rounded-lg bg-black/80">
        <h2 className="text-3xl font-bold text-center mb-8">DudeRock Arcade</h2>

        {step === 1 && (
          <div className="space-y-8">
            <p className="text-lg text-center mb-8">Access all terminals to retrieve the security code.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {terminals.map((terminal) => (
                <div
                  key={terminal.id}
                  className={`border ${terminal.accessed ? "border-green-600" : "border-green-500/30"} p-4 rounded-md text-center`}
                >
                  <h3 className="text-xl mb-4">Terminal {terminal.id}</h3>
                  <Button
                    onClick={() => accessTerminal(terminal.id)}
                    disabled={terminal.accessed}
                    className={
                      terminal.accessed
                        ? "bg-green-700 text-white"
                        : "bg-black border border-green-500 text-green-400 hover:bg-green-900"
                    }
                  >
                    {terminal.accessed ? "ACCESSED" : "ACCESS"}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <p className="text-lg text-center mb-6">All terminals accessed. Enter the master access code.</p>

            <div className="flex flex-col items-center space-y-4">
              <div className="w-full max-w-xs">
                <Input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter code"
                  className="bg-black border-green-500/50 text-green-300 text-center text-xl tracking-widest"
                  maxLength={4}
                />
              </div>

              {error && <p className="text-red-500">{error}</p>}

              <Button onClick={submitCode} className="bg-green-700 hover:bg-green-600 text-white mt-4">
                SUBMIT
              </Button>

              <p className="text-xs text-green-500/60 mt-4">Hint: The year the arcade was founded, reversed.</p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 text-center">
            <p className="text-xl mb-6">Access granted. Data retrieved.</p>

            <div className="p-4 border border-green-500/50 rounded-md bg-black/60 text-left font-mono text-sm">
              <p>Location: NepoCorp HQ</p>
              <p>Security Level: Alpha</p>
              <p>Project Codename: NEXUS</p>
              <p>Status: Active</p>
            </div>

            <Button onClick={onComplete} className="bg-green-700 hover:bg-green-600 text-white mt-8">
              CONTINUE
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

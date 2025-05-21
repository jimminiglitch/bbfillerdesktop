"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, Shield, Database, Lock } from "lucide-react"

interface NepoCorpHQProps {
  onComplete: () => void
}

export default function NepoCorpHQ({ onComplete }: NepoCorpHQProps) {
  const [step, setStep] = useState(1)
  const [hackProgress, setHackProgress] = useState(0)
  const [securitySystems, setSecuritySystems] = useState([
    { id: 1, name: "Firewall", icon: Shield, disabled: false },
    { id: 2, name: "Database", icon: Database, disabled: false },
    { id: 3, name: "Encryption", icon: Lock, disabled: false },
  ])

  // Handle security system bypass
  const bypassSystem = (id: number) => {
    setSecuritySystems(securitySystems.map((system) => (system.id === id ? { ...system, disabled: true } : system)))

    // If all systems bypassed, move to final step
    if (securitySystems.filter((s) => s.id !== id).every((s) => s.disabled)) {
      setStep(2)
    }
  }

  // Handle data extraction progress
  useEffect(() => {
    if (step === 2) {
      const interval = setInterval(() => {
        setHackProgress((prev) => {
          const newProgress = prev + 5
          if (newProgress >= 100) {
            clearInterval(interval)
            setTimeout(() => setStep(3), 500)
            return 100
          }
          return newProgress
        })
      }, 300)

      return () => clearInterval(interval)
    }
  }, [step])

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-black/95 text-green-400">
      <div className="max-w-3xl w-full space-y-8 border border-green-500/30 p-8 rounded-lg bg-black/80">
        <h2 className="text-3xl font-bold text-center mb-8">NepoCorp HQ</h2>

        {step === 1 && (
          <div className="space-y-8">
            <p className="text-lg text-center mb-8">Bypass security systems to access the main database.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {securitySystems.map((system) => (
                <div
                  key={system.id}
                  className={`border ${system.disabled ? "border-red-600/50" : "border-green-500/30"} p-6 rounded-md text-center`}
                >
                  <div className="flex justify-center mb-4">
                    <system.icon className={`h-10 w-10 ${system.disabled ? "text-red-500" : "text-green-400"}`} />
                  </div>
                  <h3 className="text-xl mb-4">{system.name}</h3>
                  <Button
                    onClick={() => bypassSystem(system.id)}
                    disabled={system.disabled}
                    className={
                      system.disabled
                        ? "bg-red-900/50 text-white"
                        : "bg-black border border-green-500 text-green-400 hover:bg-green-900"
                    }
                  >
                    {system.disabled ? "BYPASSED" : "BYPASS"}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <p className="text-lg text-center mb-6">Security bypassed. Extracting classified data...</p>

            <div className="space-y-4">
              <Progress value={hackProgress} className="h-2 bg-green-900/30" indicatorClassName="bg-green-500" />
              <p className="text-center">{hackProgress}% Complete</p>

              <div className="h-40 overflow-y-auto border border-green-500/30 p-4 font-mono text-xs bg-black/60">
                {hackProgress > 10 && <p>{">"} Connecting to NepoCorp mainframe...</p>}
                {hackProgress > 20 && <p>{">"} Access granted to level 1 systems</p>}
                {hackProgress > 30 && <p>{">"} Downloading personnel records...</p>}
                {hackProgress > 40 && <p>{">"} Accessing Project NEXUS files...</p>}
                {hackProgress > 50 && <p>{">"} Security scan detected, rerouting...</p>}
                {hackProgress > 60 && <p>{">"} Downloading schematics...</p>}
                {hackProgress > 70 && <p>{">"} Accessing executive communications...</p>}
                {hackProgress > 80 && <p>{">"} Found Project NEXUS master file...</p>}
                {hackProgress > 90 && <p>{">"} Downloading complete data package...</p>}
                {hackProgress === 100 && <p>{">"} Download complete. Disconnecting...</p>}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 text-center">
            <div className="flex justify-center mb-6">
              <AlertCircle className="h-16 w-16 text-red-500 animate-pulse" />
            </div>

            <p className="text-xl mb-6 text-red-400">CRITICAL INFORMATION DISCOVERED</p>

            <div className="p-4 border border-red-500/50 rounded-md bg-black/60 text-left font-mono text-sm">
              <p>Project NEXUS: Reality Manipulation Protocol</p>
              <p>Status: Final Testing Phase</p>
              <p>Target: Global Implementation</p>
              <p>Warning: Catastrophic risk assessment - HIGH</p>
            </div>

            <Button onClick={onComplete} className="bg-red-700 hover:bg-red-600 text-white mt-8">
              CONTINUE
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

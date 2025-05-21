"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

interface LoginScreenProps {
  onLogin: () => void
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Simulate login process
    setTimeout(() => {
      setLoading(false)
      // Any username/password will work for this demo
      if (username && password) {
        onLogin()
      } else {
        setError("Please enter both username and password")
      }
    }, 1500)
  }

  return (
    <div className="h-full w-full flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md border border-green-500/50 bg-black/80 p-6 rounded-md shadow-lg shadow-green-500/20">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-green-400 mb-2">SYSTEM LOGIN</h1>
          <div className="text-green-300/70 text-sm">
            <p>NEPO CORPORATION</p>
            <p>AUTHORIZED ACCESS ONLY</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm text-green-400">
              USERNAME
            </label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-black border-green-500/50 text-green-300 focus:border-green-400 focus:ring-green-400/20"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm text-green-400">
              PASSWORD
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border-green-500/50 text-green-300 focus:border-green-400 focus:ring-green-400/20"
            />
          </div>

          {error && <div className="text-red-500 text-sm text-center">{error}</div>}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 hover:bg-green-600 text-white font-bold"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                AUTHENTICATING...
              </>
            ) : (
              "LOGIN"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-green-500/60">
          <p>SYSTEM VERSION 2.3.4</p>
          <p>© 2077 NEPO CORPORATION</p>
        </div>
      </div>
    </div>
  )
}

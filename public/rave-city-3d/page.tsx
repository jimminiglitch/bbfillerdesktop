"use client"

import { useEffect } from "react"
import { useState } from "react"
import RaveCity from "@/components/rave-city"
import LoadingScreen from "@/components/loading-screen"
import styles from "./page.module.css"

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const LOADING_DURATION = 2500; // Duration in milliseconds

  useEffect(() => {
    // Simulate loading assets
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, LOADING_DURATION)

    return () => clearTimeout(timer)
  }, [])

  return (
    <main className="w-full h-screen overflow-hidden bg-black">
      {isLoading ? <LoadingScreen /> : <RaveCity />}
    </main>
  )
}

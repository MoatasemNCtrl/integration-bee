"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type TimeMode = "3min" | "5min" | "unlimited" | null

export default function IntegralRushPage() {
  const [selectedMode, setSelectedMode] = useState<TimeMode>(null)
  const router = useRouter()

  const handleStart = () => {
    if (selectedMode) {
      router.push(`/rush/game/${selectedMode}`)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-8 p-4">
      {/* Title */}
      <h1 className="text-2xl text-center mb-8">Select Mode</h1>

      {/* Mode Selection */}
      <div className="flex flex-col gap-4 w-full max-w-md">
        {[
          { id: "3min", label: "3 Minutes" },
          { id: "5min", label: "5 Minutes" },
          { id: "unlimited", label: "Unlimited" },
        ].map((mode) => (
          <button
            key={mode.id}
            onClick={() => setSelectedMode(mode.id as TimeMode)}
            className={`
              px-8 py-4 rounded-lg border-2 transition-all duration-300
              ${
                selectedMode === mode.id
                  ? "border-black bg-black text-white transform scale-105"
                  : "border-black hover:bg-black/5"
              }
            `}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Start Button */}
      <button
        onClick={handleStart}
        disabled={!selectedMode}
        className={`
          mt-8 px-12 py-6 rounded-lg text-xl transition-all duration-300
          ${selectedMode ? "bg-black text-white hover:scale-105" : "bg-gray-200 text-gray-400 cursor-not-allowed"}
        `}
      >
        Start
      </button>

      {/* Back Button */}
      <button onClick={() => router.push("/")} className="mt-4 text-sm underline hover:text-gray-600">
        Back to Menu
      </button>
    </div>
  )
}


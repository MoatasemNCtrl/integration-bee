"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type TournamentType = "round-robin" | "knockout" | null

export default function TournamentPage() {
  const [selectedType, setSelectedType] = useState<TournamentType>(null)
  const router = useRouter()

  const handleContinue = () => {
    if (selectedType) {
      router.push(`/tournament/${selectedType}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">🏆 Tournament Mode</h1>
          <p className="text-xl text-gray-600">Choose your tournament style and compete with others!</p>
        </div>

        {/* Tournament Type Selection */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Round Robin Tournament */}
          <div
            onClick={() => setSelectedType("round-robin")}
            className={`
              relative p-8 rounded-2xl border-3 cursor-pointer transition-all duration-300 transform hover:scale-105
              ${
                selectedType === "round-robin"
                  ? "border-purple-500 bg-purple-50 shadow-xl scale-105"
                  : "border-gray-200 bg-white hover:border-purple-300 hover:shadow-lg"
              }
            `}
          >
            <div className="text-center">
              <div className="text-6xl mb-6">🔄</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Round Robin</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Kahoot-style tournament where everyone plays simultaneously and answers the same questions. 
                Points are awarded based on speed and accuracy.
              </p>
              
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <span className="text-green-500">✅</span>
                  <span className="text-sm text-gray-700">Everyone plays together</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-green-500">✅</span>
                  <span className="text-sm text-gray-700">Same questions for all players</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-green-500">✅</span>
                  <span className="text-sm text-gray-700">Speed & accuracy scoring</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-green-500">✅</span>
                  <span className="text-sm text-gray-700">Live leaderboard</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-green-500">✅</span>
                  <span className="text-sm text-gray-700">Best for 2-20 players</span>
                </div>
              </div>
            </div>
            
            {selectedType === "round-robin" && (
              <div className="absolute top-4 right-4">
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
              </div>
            )}
          </div>

          {/* Knockout Tournament */}
          <div
            onClick={() => setSelectedType("knockout")}
            className={`
              relative p-8 rounded-2xl border-3 cursor-pointer transition-all duration-300 transform hover:scale-105
              ${
                selectedType === "knockout"
                  ? "border-red-500 bg-red-50 shadow-xl scale-105"
                  : "border-gray-200 bg-white hover:border-red-300 hover:shadow-lg"
              }
            `}
          >
            <div className="text-center">
              <div className="text-6xl mb-6">⚔️</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Knockout</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Head-to-head elimination tournament. Players face off in 1v1 matches, 
                with winners advancing to the next round.
              </p>
              
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <span className="text-green-500">✅</span>
                  <span className="text-sm text-gray-700">1v1 elimination matches</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-green-500">✅</span>
                  <span className="text-sm text-gray-700">Tournament bracket</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-green-500">✅</span>
                  <span className="text-sm text-gray-700">Single elimination</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-green-500">✅</span>
                  <span className="text-sm text-gray-700">Winner takes all</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-green-500">✅</span>
                  <span className="text-sm text-gray-700">Best for 4-16 players</span>
                </div>
              </div>
            </div>
            
            {selectedType === "knockout" && (
              <div className="absolute top-4 right-4">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.push("/")}
            className="px-8 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 font-medium transition-all shadow-md"
          >
            ← Back to Home
          </button>
          
          <button
            onClick={handleContinue}
            disabled={!selectedType}
            className={`
              px-12 py-3 rounded-xl font-bold text-lg transition-all shadow-md
              ${
                selectedType
                  ? `${
                      selectedType === "round-robin" 
                        ? "bg-purple-500 hover:bg-purple-600" 
                        : "bg-red-500 hover:bg-red-600"
                    } text-white hover:scale-105`
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }
            `}
          >
            {selectedType ? "Continue →" : "Select Tournament Type"}
          </button>
        </div>

        {/* Info Section */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">🐝 Integration Bee Tournaments</h3>
            <p className="text-gray-600 leading-relaxed">
              Test your integration skills against other players in competitive tournaments. 
              Choose between collaborative Round Robin style or intense Knockout elimination. 
              All tournaments feature real-time scoring, live leaderboards, and exciting integration challenges!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

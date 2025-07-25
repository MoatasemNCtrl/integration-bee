"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import MathDisplay from "@/app/components/math-display"
import { IntegralProblem, getRandomProblem, getProblemsByDifficulty } from "@/lib/integral-database"

type Difficulty = "Basic" | "Intermediate" | "Advanced"

export default function PracticePage() {
  const router = useRouter()
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("Basic")
  const [currentProblem, setCurrentProblem] = useState<IntegralProblem | null>(null)
  const [showSolution, setShowSolution] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const loadRandomProblem = () => {
    const problem = getRandomProblem(selectedDifficulty)
    setCurrentProblem(problem)
    setShowSolution(false)
    setShowHint(false)
  }

  const loadSpecificProblem = (problem: IntegralProblem) => {
    setCurrentProblem(problem)
    setShowSolution(false)
    setShowHint(false)
  }

  const formatProblemToLatex = (problem: string) => {
    return problem
      .replace(/∫/g, "\\int ")
      .replace(/dx/g, "\\,dx")
      .replace(/\^(\d+)/g, "^{$1}")
      .replace(/sqrt/g, "\\sqrt")
      .replace(/sin/g, "\\sin")
      .replace(/cos/g, "\\cos")
      .replace(/tan/g, "\\tan")
      .replace(/ln/g, "\\ln")
      .replace(/pi/g, "\\pi")
      .replace(/e\^/g, "e^")
  }

  const problemsByDifficulty = getProblemsByDifficulty(selectedDifficulty)

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">📚 Practice Mode</h1>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Menu
          </button>
        </div>

        {/* Difficulty Selection */}
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Select Difficulty</h2>
          <div className="flex gap-4">
            {(["Basic", "Intermediate", "Advanced"] as Difficulty[]).map((difficulty) => (
              <button
                key={difficulty}
                onClick={() => setSelectedDifficulty(difficulty)}
                className={`px-6 py-3 rounded-lg transition-colors ${
                  selectedDifficulty === difficulty
                    ? "bg-blue-500 text-white"
                    : "bg-white border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {difficulty}
              </button>
            ))}
          </div>
        </div>

        {/* Problem Display */}
        {currentProblem && (
          <div className="bg-white border rounded-lg p-8 mb-8 text-center">
            <div className="text-3xl mb-6">
              <MathDisplay
                math={formatProblemToLatex(currentProblem.problem)}
                className="flex justify-center items-center"
              />
            </div>
            
            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={() => setShowHint(!showHint)}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                💡 {showHint ? 'Hide Hint' : 'Show Hint'}
              </button>
              <button
                onClick={() => setShowSolution(!showSolution)}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                ✅ {showSolution ? 'Hide Solution' : 'Show Solution'}
              </button>
              <button
                onClick={loadRandomProblem}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                🔄 New Problem
              </button>
            </div>

            {/* Hint Display */}
            {showHint && currentProblem.hint && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
                <h4 className="font-semibold text-yellow-800 mb-2">💡 Hint:</h4>
                <p className="text-yellow-700">{currentProblem.hint}</p>
              </div>
            )}

            {/* Solution Display */}
            {showSolution && (
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <h4 className="font-semibold text-green-800 mb-2">✅ Solution:</h4>
                <div className="text-2xl mb-2">
                  <MathDisplay
                    math={currentProblem.solution}
                    className="flex justify-center items-center"
                  />
                </div>
                {currentProblem.alternativeForms && currentProblem.alternativeForms.length > 0 && (
                  <div className="text-sm text-green-700">
                    <p className="font-medium mb-1">Alternative forms:</p>
                    {currentProblem.alternativeForms.map((form, index) => (
                      <div key={index} className="mb-1">
                        <MathDisplay
                          math={form}
                          className="flex justify-center items-center"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Problem List */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">All {selectedDifficulty} Problems</h2>
            <button
              onClick={loadRandomProblem}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              🎲 Random Problem
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {problemsByDifficulty.map((problem) => (
              <button
                key={problem.id}
                onClick={() => loadSpecificProblem(problem)}
                className={`p-4 text-left border rounded-lg hover:bg-white transition-colors ${
                  currentProblem?.id === problem.id ? "bg-blue-50 border-blue-300" : "bg-white"
                }`}
              >
                <div className="text-lg mb-2">
                  <MathDisplay
                    math={formatProblemToLatex(problem.problem)}
                    className="flex items-center"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push("/rush")}
            className="px-8 py-4 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold text-lg"
          >
            🚀 Ready for Rush Mode?
          </button>
        </div>
      </div>
    </div>
  )
}

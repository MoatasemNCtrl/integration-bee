"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function SetupPage() {
  const router = useRouter()
  const [apiKeySet, setApiKeySet] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // Check if API key is configured
    fetch("/api/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageData: "data:image/png;base64,test", solution: "test" })
    }).then(response => {
      if (response.status !== 500) {
        setApiKeySet(true)
      }
    }).finally(() => {
      setChecking(false)
    })
  }, [])

  if (checking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl">Checking configuration...</div>
      </div>
    )
  }

  if (!apiKeySet) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">🐝 Integration Bee Setup</h1>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">⚠️ Setup Required</h2>
            <p className="mb-4">
              To use Integration Bee, you need to configure your OpenAI API key for AI-powered solution validation.
            </p>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Step 1: Get OpenAI API Key</h3>
                <p className="text-sm text-gray-600">
                  Visit <a href="https://platform.openai.com/api-keys" target="_blank" className="text-blue-500 underline">OpenAI API Keys</a> to create an API key
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold">Step 2: Create Environment File</h3>
                <p className="text-sm text-gray-600 mb-2">Create a file named <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code> in your project root:</p>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
OPENAI_API_KEY=your_api_key_here
                </pre>
              </div>
              
              <div>
                <h3 className="font-semibold">Step 3: Restart the Server</h3>
                <p className="text-sm text-gray-600">
                  Stop the development server (Ctrl+C) and run <code className="bg-gray-100 px-2 py-1 rounded">npm run dev</code> again
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">🚀 Quick Setup</h2>
            <p className="mb-4">
              You can also use our setup script to automate the process:
            </p>
            <pre className="bg-gray-100 p-3 rounded text-sm">
./setup.sh
            </pre>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              🔄 Check Configuration Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold mb-4">Setup Complete!</h1>
        <p className="mb-6 text-gray-600">Integration Bee is ready to go!</p>
        <button
          onClick={() => router.push("/")}
          className="px-8 py-4 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold"
        >
          🐝 Start Playing
        </button>
      </div>
    </div>
  )
}

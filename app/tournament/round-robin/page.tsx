"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Users, Crown, LogIn, Play, Hash } from "lucide-react"

export default function RoundRobinPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [joinCode, setJoinCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const createTournament = async () => {
    if (!session?.user) {
      router.push('/auth/signin')
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch('/api/tournament/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maxPlayers: 8 // Default to 8 players for round-robin
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create tournament')
      }

      // Redirect to host page
      router.push(data.hostUrl)
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create tournament')
    } finally {
      setLoading(false)
    }
  }

  const joinTournament = async () => {
    if (!session?.user) {
      router.push('/auth/signin')
      return
    }

    if (!joinCode.trim()) {
      setError('Please enter a tournament code')
      return
    }

    // Validate 6-digit code format
    if (!/^\d{6}$/.test(joinCode.trim())) {
      setError('Tournament code must be 6 digits')
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch('/api/tournament/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: joinCode.trim()
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join tournament')
      }

      // Redirect to player page
      router.push(`/player/${joinCode.trim()}`)
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to join tournament')
    } finally {
      setLoading(false)
    }
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-black/20 border-purple-500/30">
          <CardContent className="p-6 text-center">
            <LogIn className="h-12 w-12 mx-auto mb-4 text-purple-400" />
            <h2 className="text-xl font-bold text-white mb-2">Sign In Required</h2>
            <p className="text-white/80 mb-4">You need to sign in to participate in tournaments</p>
            <Button 
              onClick={() => router.push('/auth/signin')} 
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Sign In to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-4">
            🔄 Round Robin Tournament
          </h1>
          <p className="text-xl text-white/80">Host a tournament or join with a 6-digit code</p>
        </div>

        {error && (
          <Alert className="mb-6 bg-red-500/20 border-red-500/30 max-w-2xl mx-auto">
            <AlertDescription className="text-red-200">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Host Tournament - Left Side */}
          <Card className="bg-black/20 border-yellow-500/30">
            <CardHeader className="text-center">
              <CardTitle className="text-white flex items-center justify-center gap-2 text-2xl">
                <Crown className="h-6 w-6 text-yellow-400" />
                Host Tournament
              </CardTitle>
              <CardDescription className="text-white/60 text-lg">
                Create a new round-robin tournament and get a 6-digit code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  How it works:
                </h3>
                <div className="space-y-2 text-sm text-white/80">
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 font-bold">1.</span>
                    <span>Click "Host Tournament" to create a room</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 font-bold">2.</span>
                    <span>Get a unique 6-digit code (e.g., 823519)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 font-bold">3.</span>
                    <span>Share the code with players</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 font-bold">4.</span>
                    <span>Start when ready (minimum 2 players)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Support up to 8 players</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Full tournament control</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Real-time player management</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Automatic round-robin scheduling</span>
                </div>
              </div>

              <Button 
                onClick={createTournament}
                disabled={loading}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-4 text-lg"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Creating Tournament...
                  </>
                ) : (
                  <>
                    <Crown className="h-5 w-5 mr-2" />
                    Host New Tournament
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Join Tournament - Right Side */}
          <Card className="bg-black/20 border-blue-500/30">
            <CardHeader className="text-center">
              <CardTitle className="text-white flex items-center justify-center gap-2 text-2xl">
                <Hash className="h-6 w-6 text-blue-400" />
                Join Tournament
              </CardTitle>
              <CardDescription className="text-white/60 text-lg">
                Enter a 6-digit code to join an existing tournament
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  How to join:
                </h3>
                <div className="space-y-2 text-sm text-white/80">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">1.</span>
                    <span>Get the 6-digit code from the host</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">2.</span>
                    <span>Enter the code in the field below</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">3.</span>
                    <span>Click "Join Tournament"</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">4.</span>
                    <span>Wait in the lobby for the host to start</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="joinCode" className="text-white font-bold">Tournament Code</Label>
                  <Input
                    id="joinCode"
                    type="text"
                    placeholder="000000"
                    value={joinCode}
                    onChange={(e) => {
                      // Only allow numbers, max 6 digits
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                      setJoinCode(value)
                    }}
                    className="bg-white/10 border-blue-500/30 text-white placeholder-white/30 text-center text-3xl font-mono tracking-[0.5em] py-6"
                    maxLength={6}
                  />
                  <p className="text-white/60 text-sm text-center">
                    Enter the 6-digit code shared by the tournament host
                  </p>
                </div>

                <div className="space-y-3 text-sm text-white/80">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Instant tournament access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Real-time lobby updates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Compete for the top spot</span>
                  </div>
                </div>

                <Button 
                  onClick={joinTournament}
                  disabled={loading || joinCode.length !== 6}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 text-lg"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Joining Tournament...
                    </>
                  ) : (
                    <>
                      <Users className="h-5 w-5 mr-2" />
                      Join Tournament
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* How Round Robin Works */}
        <Card className="bg-black/20 border-purple-500/30 mb-8">
          <CardHeader>
            <CardTitle className="text-white text-center text-2xl">How Round Robin Tournaments Work</CardTitle>
            <CardDescription className="text-white/60 text-center text-lg">
              Everyone plays simultaneously in a Kahoot-style format
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="space-y-3">
                <div className="text-5xl">🎯</div>
                <h3 className="text-white font-bold text-lg">Same Questions</h3>
                <p className="text-white/70">All players answer identical integration problems simultaneously</p>
              </div>
              <div className="space-y-3">
                <div className="text-5xl">⚡</div>
                <h3 className="text-white font-bold text-lg">Speed Matters</h3>
                <p className="text-white/70">Points awarded based on both accuracy and how quickly you answer</p>
              </div>
              <div className="space-y-3">
                <div className="text-5xl">🏆</div>
                <h3 className="text-white font-bold text-lg">Live Rankings</h3>
                <p className="text-white/70">Real-time leaderboard shows who's leading throughout the tournament</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button 
            onClick={() => router.push('/tournament')} 
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10"
          >
            ← Back to Tournament Selection
          </Button>
        </div>
      </div>
    </div>
  )
}

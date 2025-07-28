"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Users, Crown, Zap, Hash, LogIn, Timer, Target } from "lucide-react"

export default function OneVOnePage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [mode, setMode] = useState<'menu' | 'create' | 'join' | 'random'>('menu')
  const [joinCode, setJoinCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [matchmaking, setMatchmaking] = useState(false)
  
  // Game settings
  const [timeControl, setTimeControl] = useState(180) // 3 minutes default
  const [difficulty, setDifficulty] = useState("Mixed")
  const [questionsToWin, setQuestionsToWin] = useState(5)

  useEffect(() => {
    // Check if user is in matchmaking queue on component mount
    if (session?.user) {
      checkQueueStatus()
    }
  }, [session])

  const checkQueueStatus = async () => {
    try {
      const response = await fetch('/api/duel/matchmaking')
      const data = await response.json()
      
      if (data.inQueue) {
        setMatchmaking(true)
        setMode('random')
        // Poll for matches
        pollForMatch()
      }
    } catch (error) {
      console.error('Error checking queue status:', error)
    }
  }

  const pollForMatch = () => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/duel/matchmaking')
        const data = await response.json()
        
        if (!data.inQueue) {
          // Match found or removed from queue
          clearInterval(interval)
          setMatchmaking(false)
          // The matchmaking API will redirect to game when match is found
        }
      } catch (error) {
        console.error('Error polling for match:', error)
        clearInterval(interval)
        setMatchmaking(false)
      }
    }, 2000)

    // Cleanup interval after 5 minutes
    setTimeout(() => {
      clearInterval(interval)
      if (matchmaking) {
        leaveQueue()
      }
    }, 300000)
  }

  const createDuel = async () => {
    if (!session?.user) {
      router.push('/auth/signin')
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch('/api/duel/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeControl,
          difficulty,
          questionsToWin
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create duel')
      }

      // Redirect to host page
      router.push(data.hostUrl)
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create duel')
    } finally {
      setLoading(false)
    }
  }

  const joinDuel = async () => {
    if (!session?.user) {
      router.push('/auth/signin')
      return
    }

    if (!joinCode.trim()) {
      setError('Please enter a duel code')
      return
    }

    if (!/^\d{6}$/.test(joinCode.trim())) {
      setError('Duel code must be 6 digits')
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch('/api/duel/join', {
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
        throw new Error(data.error || 'Failed to join duel')
      }

      // Redirect to player page
      router.push(data.playerUrl)
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to join duel')
    } finally {
      setLoading(false)
    }
  }

  const joinRandomQueue = async () => {
    if (!session?.user) {
      router.push('/auth/signin')
      return
    }

    setLoading(true)
    setError("")
    setMatchmaking(true)

    try {
      const response = await fetch('/api/duel/matchmaking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeControl,
          difficulty
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join matchmaking')
      }

      if (data.matched) {
        // Immediate match found
        router.push(data.gameUrl)
      } else {
        // Added to queue, start polling
        pollForMatch()
      }
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to join matchmaking')
      setMatchmaking(false)
    } finally {
      setLoading(false)
    }
  }

  const leaveQueue = async () => {
    try {
      await fetch('/api/duel/matchmaking', { method: 'DELETE' })
      setMatchmaking(false)
      setMode('menu')
    } catch (error) {
      console.error('Error leaving queue:', error)
    }
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-900 to-yellow-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-black/20 border-red-500/30">
          <CardContent className="p-6 text-center">
            <LogIn className="h-12 w-12 mx-auto mb-4 text-red-400" />
            <h2 className="text-xl font-bold text-white mb-2">Sign In Required</h2>
            <p className="text-white/80 mb-4">You need to sign in to participate in 1v1 duels</p>
            <Button 
              onClick={() => router.push('/auth/signin')} 
              className="w-full bg-red-600 hover:bg-red-700"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Sign In to Duel
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-900 to-yellow-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-4">
            ⚔️ 1v1 Duel
          </h1>
          <p className="text-xl text-white/80">Challenge a friend or find a random opponent</p>
        </div>

        {error && (
          <Alert className="mb-6 bg-red-500/20 border-red-500/30 max-w-2xl mx-auto">
            <AlertDescription className="text-red-200">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {mode === 'menu' && (
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Choose Your Opponent */}
            <Card className="bg-black/20 border-orange-500/30">
              <CardHeader className="text-center">
                <CardTitle className="text-white flex items-center justify-center gap-2 text-2xl">
                  <Crown className="h-6 w-6 text-orange-400" />
                  Choose Your Opponent
                </CardTitle>
                <CardDescription className="text-white/60 text-lg">
                  Create a private duel room and invite a specific player
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                  <h3 className="text-white font-bold mb-3">How it works:</h3>
                  <div className="space-y-2 text-sm text-white/80">
                    <div className="flex items-start gap-2">
                      <span className="text-orange-400 font-bold">1.</span>
                      <span>Set your game preferences</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-orange-400 font-bold">2.</span>
                      <span>Create a duel room with a 6-digit code</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-orange-400 font-bold">3.</span>
                      <span>Share the code with your opponent</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-orange-400 font-bold">4.</span>
                      <span>Start dueling when they join!</span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  <Button 
                    onClick={() => setMode('create')}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 text-lg"
                    size="lg"
                  >
                    <Crown className="h-5 w-5 mr-2" />
                    Create Duel Room
                  </Button>
                  
                  <Button 
                    onClick={() => setMode('join')}
                    variant="outline"
                    className="w-full border-orange-500/30 text-orange-400 hover:bg-orange-500/10 font-bold py-4 text-lg"
                    size="lg"
                  >
                    <Hash className="h-5 w-5 mr-2" />
                    Join with Code
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Random Opponent */}
            <Card className="bg-black/20 border-red-500/30">
              <CardHeader className="text-center">
                <CardTitle className="text-white flex items-center justify-center gap-2 text-2xl">
                  <Zap className="h-6 w-6 text-red-400" />
                  Random Opponent
                </CardTitle>
                <CardDescription className="text-white/60 text-lg">
                  Quick matchmaking with players of similar skill level
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <h3 className="text-white font-bold mb-3">Quick & Fair:</h3>
                  <div className="space-y-2 text-sm text-white/80">
                    <div className="flex items-start gap-2">
                      <span className="text-red-400 font-bold">•</span>
                      <span>Instant matchmaking with online players</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-red-400 font-bold">•</span>
                      <span>Choose time control and difficulty</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-red-400 font-bold">•</span>
                      <span>Automatic game start when matched</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-red-400 font-bold">•</span>
                      <span>No codes needed - just click and play!</span>
                    </div>
                  </div>
                </div>

                {!matchmaking ? (
                  <Button 
                    onClick={() => setMode('random')}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 text-lg"
                    size="lg"
                  >
                    <Zap className="h-5 w-5 mr-2" />
                    Find Random Opponent
                  </Button>
                ) : (
                  <div className="text-center space-y-3">
                    <div className="flex items-center justify-center gap-2 text-white">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Searching for opponent...</span>
                    </div>
                    <Button 
                      onClick={leaveQueue}
                      variant="outline"
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      Cancel Search
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {mode === 'create' && (
          <Card className="bg-black/20 border-orange-500/30 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-white text-center text-2xl">Create Duel Room</CardTitle>
              <CardDescription className="text-white/60 text-center">
                Set up your duel preferences and get a 6-digit code to share
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2">
                    <Timer className="h-4 w-4" />
                    Time Control
                  </Label>
                  <Select value={timeControl.toString()} onValueChange={(value) => setTimeControl(parseInt(value))}>
                    <SelectTrigger className="bg-white/10 border-orange-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="60">1 minute (Bullet)</SelectItem>
                      <SelectItem value="180">3 minutes (Blitz)</SelectItem>
                      <SelectItem value="300">5 minutes (Rapid)</SelectItem>
                      <SelectItem value="600">10 minutes (Classical)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Difficulty</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger className="bg-white/10 border-orange-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Basic">Basic</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                      <SelectItem value="Mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Questions to Win
                  </Label>
                  <Select value={questionsToWin.toString()} onValueChange={(value) => setQuestionsToWin(parseInt(value))}>
                    <SelectTrigger className="bg-white/10 border-orange-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">First to 3</SelectItem>
                      <SelectItem value="5">First to 5</SelectItem>
                      <SelectItem value="7">First to 7</SelectItem>
                      <SelectItem value="10">First to 10</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={() => setMode('menu')}
                  variant="outline"
                  className="flex-1 border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                >
                  ← Back
                </Button>
                <Button 
                  onClick={createDuel}
                  disabled={loading}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Crown className="h-4 w-4 mr-2" />
                      Create Room
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {mode === 'join' && (
          <Card className="bg-black/20 border-orange-500/30 max-w-xl mx-auto">
            <CardHeader>
              <CardTitle className="text-white text-center text-2xl">Join Duel Room</CardTitle>
              <CardDescription className="text-white/60 text-center">
                Enter the 6-digit code shared by your opponent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="joinCode" className="text-white">Duel Code</Label>
                <Input
                  id="joinCode"
                  type="text"
                  placeholder="000000"
                  value={joinCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                    setJoinCode(value)
                  }}
                  className="bg-white/10 border-orange-500/30 text-white placeholder-white/30 text-center text-3xl font-mono tracking-[0.5em] py-6"
                  maxLength={6}
                />
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={() => setMode('menu')}
                  variant="outline"
                  className="flex-1 border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                >
                  ← Back
                </Button>
                <Button 
                  onClick={joinDuel}
                  disabled={loading || joinCode.length !== 6}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <Users className="h-4 w-4 mr-2" />
                      Join Duel
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {mode === 'random' && (
          <Card className="bg-black/20 border-red-500/30 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-white text-center text-2xl">Random Matchmaking</CardTitle>
              <CardDescription className="text-white/60 text-center">
                Set your preferences and we'll find you an opponent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!matchmaking ? (
                <>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-white flex items-center gap-2">
                        <Timer className="h-4 w-4" />
                        Time Control
                      </Label>
                      <Select value={timeControl.toString()} onValueChange={(value) => setTimeControl(parseInt(value))}>
                        <SelectTrigger className="bg-white/10 border-red-500/30 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="60">1 minute (Bullet)</SelectItem>
                          <SelectItem value="180">3 minutes (Blitz)</SelectItem>
                          <SelectItem value="300">5 minutes (Rapid)</SelectItem>
                          <SelectItem value="600">10 minutes (Classical)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Difficulty</Label>
                      <Select value={difficulty} onValueChange={setDifficulty}>
                        <SelectTrigger className="bg-white/10 border-red-500/30 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Basic">Basic</SelectItem>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                          <SelectItem value="Mixed">Mixed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      onClick={() => setMode('menu')}
                      variant="outline"
                      className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      ← Back
                    </Button>
                    <Button 
                      onClick={joinRandomQueue}
                      disabled={loading}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Finding...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          Find Opponent
                        </>
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-3 text-white text-xl">
                      <Loader2 className="h-8 w-8 animate-spin text-red-400" />
                      <span>Searching for opponent...</span>
                    </div>
                    <div className="text-white/60">
                      <p>Time Control: {timeControl}s | Difficulty: {difficulty}</p>
                      <p className="text-sm mt-2">This may take a few moments</p>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={leaveQueue}
                    variant="outline"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    Cancel Search
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="mt-8 text-center">
          <Button 
            onClick={() => router.push('/')} 
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10"
          >
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  )
}

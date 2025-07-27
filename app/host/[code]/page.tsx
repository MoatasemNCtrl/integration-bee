'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Copy, Play, Clock } from 'lucide-react'

interface Tournament {
  id: string
  code: string
  status: string
  maxPlayers: number
  createdAt: string
  host: {
    id: string
    name: string
    image: string
  }
  participants: Array<{
    id: string
    joinedAt: string
    user: {
      id: string
      name: string
      image: string
    }
  }>
}

interface HostPageProps {
  params: {
    code: string
  }
}

export default function TournamentHostPage({ params }: HostPageProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchTournament()
    // Refresh data every 2 seconds
    const interval = setInterval(fetchTournament, 2000)
    return () => clearInterval(interval)
  }, [params.code])

  const fetchTournament = async () => {
    try {
      const response = await fetch(`/api/tournament/create?code=${params.code}`)
      const data = await response.json()
      
      if (!response.ok) {
        setError(data.error || 'Tournament not found')
        return
      }
      
      setTournament(data.tournament)
      
      // Check if user is the host
      if (session?.user?.id && data.tournament.host.id !== session.user.id) {
        router.push(`/player/${params.code}`)
      }
    } catch (error) {
      setError('Failed to load tournament')
    } finally {
      setLoading(false)
    }
  }

  const copyCode = () => {
    navigator.clipboard.writeText(params.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const startTournament = async () => {
    if (!tournament || tournament.participants.length < 2) {
      alert('Need at least 2 players to start')
      return
    }
    
    try {
      const response = await fetch('/api/tournament/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: params.code
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start tournament')
      }

      // Refresh tournament data to show updated status
      fetchTournament()
      alert(`Tournament started! Created ${data.matchesCreated} matches.`)
      
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to start tournament')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading tournament...</div>
      </div>
    )
  }

  if (error || !tournament) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="w-full max-w-md bg-black/20 border-red-500/30">
          <CardContent className="p-6">
            <div className="text-center text-red-400">
              <h2 className="text-xl font-bold mb-2">Tournament Not Found</h2>
              <p>{error}</p>
              <Button 
                onClick={() => router.push('/')} 
                className="mt-4"
                variant="outline"
              >
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-2">
            🏆 Tournament Host
          </h1>
          <p className="text-white/80">You're hosting this round-robin tournament</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Tournament Info */}
          <Card className="bg-black/20 border-yellow-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Tournament Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-6xl font-mono font-bold text-yellow-400 mb-2">
                  {tournament.code}
                </div>
                <Button
                  onClick={copyCode}
                  variant="outline"
                  size="sm"
                  className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {copied ? 'Copied!' : 'Copy Code'}
                </Button>
              </div>
              
              <div className="space-y-2 text-sm text-white/80">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant={tournament.status === 'WAITING' ? 'secondary' : 'default'}>
                    {tournament.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Players:</span>
                  <span>{tournament.participants.length} / {tournament.maxPlayers}</span>
                </div>
                <div className="flex justify-between">
                  <span>Host:</span>
                  <span>{tournament.host.name}</span>
                </div>
              </div>

              <Button 
                onClick={startTournament}
                disabled={tournament.participants.length < 2 || tournament.status !== 'WAITING'}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Tournament
              </Button>
            </CardContent>
          </Card>

          {/* Players List */}
          <Card className="bg-black/20 border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5" />
                Players ({tournament.participants.length})
              </CardTitle>
              <CardDescription className="text-white/60">
                Players will automatically appear here when they join
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tournament.participants.map((participant, index) => (
                  <div 
                    key={participant.id}
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    {participant.user.image ? (
                      <img 
                        src={participant.user.image} 
                        alt={participant.user.name || 'Player'}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-sm">
                        {participant.user.name?.[0] || 'P'}
                      </div>
                    )}
                    <div>
                      <div className="text-white font-medium">
                        {participant.user.name || 'Anonymous Player'}
                      </div>
                      <div className="text-white/60 text-xs">
                        Joined {new Date(participant.joinedAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                
                {tournament.participants.length === 0 && (
                  <div className="text-center py-8 text-white/60">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Waiting for players to join...</p>
                    <p className="text-sm mt-1">Share the code: <span className="font-mono text-yellow-400">{tournament.code}</span></p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Card className="bg-black/20 border-purple-500/30 inline-block">
            <CardContent className="p-4">
              <p className="text-white/80 text-sm">
                Share this code with players: <span className="font-mono text-yellow-400 font-bold text-lg">{tournament.code}</span>
              </p>
              <p className="text-white/60 text-xs mt-1">
                Players can join at any Integration Bee homepage by entering this code
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

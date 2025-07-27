'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Clock, Trophy, ArrowLeft } from 'lucide-react'

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

interface PlayerPageProps {
  params: {
    code: string
  }
}

export default function TournamentPlayerPage({ params }: PlayerPageProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isParticipant, setIsParticipant] = useState(false)
  const [joining, setJoining] = useState(false)

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
      
      // Check if current user is a participant
      const participant = data.tournament.participants.find((p: any) => p.user.id === session?.user?.id)
      setIsParticipant(!!participant)
      
    } catch (error) {
      setError('Failed to load tournament')
    } finally {
      setLoading(false)
    }
  }

  const joinTournament = async () => {
    if (!session?.user) {
      router.push('/auth/signin')
      return
    }

    setJoining(true)
    try {
      const response = await fetch('/api/tournament/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: params.code })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        alert(data.error || 'Failed to join tournament')
        return
      }
      
      setIsParticipant(true)
      fetchTournament() // Refresh data
      
    } catch (error) {
      alert('Failed to join tournament')
    } finally {
      setJoining(false)
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

  const userPosition = tournament.participants.findIndex(p => p.user.id === session?.user?.id) + 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => router.push('/')}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Home
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-2">
              🏆 Tournament
            </h1>
            <p className="text-white/80">Round-Robin Tournament #{tournament.code}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Tournament Status */}
          <Card className="bg-black/20 border-yellow-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Tournament Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-mono font-bold text-yellow-400 mb-2">
                  {tournament.code}
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-white/80">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant={tournament.status === 'WAITING' ? 'secondary' : 'default'}>
                    {tournament.status === 'WAITING' ? 'Waiting for Players' : tournament.status}
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
                {isParticipant && userPosition && (
                  <div className="flex justify-between">
                    <span>Your Position:</span>
                    <Badge variant="outline" className="text-green-400 border-green-400">
                      #{userPosition}
                    </Badge>
                  </div>
                )}
              </div>

              {!isParticipant && tournament.status === 'WAITING' && (
                <Button 
                  onClick={joinTournament}
                  disabled={joining || tournament.participants.length >= tournament.maxPlayers}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {joining ? 'Joining...' : 'Join Tournament'}
                </Button>
              )}

              {isParticipant && tournament.status === 'WAITING' && (
                <div className="text-center p-4 bg-green-500/20 rounded-lg">
                  <div className="text-green-400 font-medium">✓ You're in the tournament!</div>
                  <div className="text-white/60 text-sm mt-1">Waiting for host to start...</div>
                </div>
              )}

              {tournament.status !== 'WAITING' && (
                <div className="text-center p-4 bg-blue-500/20 rounded-lg">
                  <div className="text-blue-400 font-medium">Tournament in progress</div>
                  <div className="text-white/60 text-sm mt-1">Good luck!</div>
                </div>
              )}
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
                {tournament.status === 'WAITING' 
                  ? 'Players currently in the tournament'
                  : 'Tournament participants'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tournament.participants.map((participant, index) => (
                  <div 
                    key={participant.id}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      participant.user.id === session?.user?.id 
                        ? 'bg-green-500/20 border border-green-500/30' 
                        : 'bg-white/5'
                    }`}
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
                    <div className="flex-1">
                      <div className="text-white font-medium flex items-center gap-2">
                        {participant.user.name || 'Anonymous Player'}
                        {participant.user.id === session?.user?.id && (
                          <Badge variant="outline" className="text-green-400 border-green-400 text-xs">
                            You
                          </Badge>
                        )}
                        {participant.user.id === tournament.host.id && (
                          <Badge variant="outline" className="text-yellow-400 border-yellow-400 text-xs">
                            Host
                          </Badge>
                        )}
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
                    <p>No players yet</p>
                    <p className="text-sm mt-1">Be the first to join!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {tournament.status === 'WAITING' && (
          <div className="mt-8 text-center">
            <Card className="bg-black/20 border-purple-500/30 inline-block">
              <CardContent className="p-4">
                <p className="text-white/80 text-sm">
                  <Clock className="h-4 w-4 inline mr-2" />
                  {isParticipant 
                    ? 'Waiting for the host to start the tournament...'
                    : 'Join now to participate in this round-robin tournament!'
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

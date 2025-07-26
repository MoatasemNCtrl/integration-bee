"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Trophy, Medal, Star, TrendingUp, Crown, Users, Calendar, ArrowLeft } from "lucide-react"

interface LeaguePlayer {
  id: string
  name: string
  points: number
  rank: number
  streak: number
  accuracy: number
  problemsSolved: number
  weeklyPoints: number
  trend: "up" | "down" | "same"
  division: "Premier" | "Championship" | "League One" | "League Two"
}

interface LeagueStats {
  totalPlayers: number
  yourRank: number
  yourPoints: number
  weeklyRank: number
  division: string
  nextPromotion?: number
  nextRelegation?: number
}

const MOCK_PLAYERS: LeaguePlayer[] = [
  { id: "1", name: "MathWhiz", points: 2847, rank: 1, streak: 12, accuracy: 94.2, problemsSolved: 156, weeklyPoints: 127, trend: "up", division: "Premier" },
  { id: "2", name: "IntegralKing", points: 2734, rank: 2, streak: 8, accuracy: 91.7, problemsSolved: 143, weeklyPoints: 98, trend: "up", division: "Premier" },
  { id: "3", name: "CalculusGuru", points: 2689, rank: 3, streak: 15, accuracy: 93.1, problemsSolved: 138, weeklyPoints: 112, trend: "same", division: "Premier" },
  { id: "4", name: "DerivativeAce", points: 2598, rank: 4, streak: 6, accuracy: 89.4, problemsSolved: 134, weeklyPoints: 89, trend: "down", division: "Premier" },
  { id: "5", name: "You", points: 2456, rank: 5, streak: 9, accuracy: 87.3, problemsSolved: 128, weeklyPoints: 76, trend: "up", division: "Premier" },
  { id: "6", name: "LimitLegend", points: 2398, rank: 6, streak: 4, accuracy: 86.8, problemsSolved: 125, weeklyPoints: 82, trend: "down", division: "Premier" },
  { id: "7", name: "SeriesSolver", points: 2342, rank: 7, streak: 11, accuracy: 88.9, problemsSolved: 119, weeklyPoints: 94, trend: "up", division: "Premier" },
  { id: "8", name: "FunctionFan", points: 2289, rank: 8, streak: 3, accuracy: 85.2, problemsSolved: 117, weeklyPoints: 67, trend: "same", division: "Premier" },
]

const MOCK_STATS: LeagueStats = {
  totalPlayers: 2847,
  yourRank: 5,
  yourPoints: 2456,
  weeklyRank: 3,
  division: "Premier League",
  nextPromotion: undefined,
  nextRelegation: 2200
}

export default function LeaguePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("leaderboard")
  const [selectedDivision, setSelectedDivision] = useState("Premier")
  const [players, setPlayers] = useState<LeaguePlayer[]>(MOCK_PLAYERS)
  const [stats, setStats] = useState<LeagueStats>(MOCK_STATS)
  const [loading, setLoading] = useState(false)

  // Fetch leaderboard data
  const fetchLeaderboard = async (type: string = 'global') => {
    setLoading(true)
    try {
      const response = await fetch(`/api/league?type=${type}`)
      const data = await response.json()
      
      if (data.success) {
        setPlayers(data.leaderboard)
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch user stats
  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/league?type=user')
      const data = await response.json()
      
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error)
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchLeaderboard()
    fetchUserStats()
  }, [])

  // Refresh data when tab changes
  useEffect(() => {
    if (activeTab === 'weekly') {
      fetchLeaderboard('weekly')
    } else if (activeTab === 'leaderboard') {
      fetchLeaderboard('global')
    }
  }, [activeTab])

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />
    return <span className="text-sm font-bold text-gray-500">#{rank}</span>
  }

  const getTrendIcon = (trend: string) => {
    if (trend === "up") return <TrendingUp className="h-4 w-4 text-green-500" />
    if (trend === "down") return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
    return <div className="h-4 w-4" />
  }

  const getDivisionColor = (division: string) => {
    switch (division) {
      case "Premier": return "bg-purple-500"
      case "Championship": return "bg-blue-500"
      case "League One": return "bg-green-500"
      case "League Two": return "bg-orange-500"
      default: return "bg-gray-500"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Integration League
              </h1>
              <p className="text-xl text-gray-300">Compete globally in the premier calculus competition</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push("/league/profile")}
              variant="outline"
              className="border-gray-600 hover:bg-white/10"
            >
              <Users className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button
              onClick={() => router.push("/league/solve")}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              <Star className="h-4 w-4 mr-2" />
              Solve Problems
            </Button>
          </div>
        </div>

        {/* Your Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-purple-800/50 to-indigo-800/50 border-purple-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">Global Rank</p>
                  <p className="text-2xl font-bold text-white">#{stats.yourRank}</p>
                </div>
                <Trophy className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-800/50 to-cyan-800/50 border-blue-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">Total Points</p>
                  <p className="text-2xl font-bold text-white">{stats.yourPoints.toLocaleString()}</p>
                </div>
                <Star className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-800/50 to-emerald-800/50 border-green-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">Weekly Rank</p>
                  <p className="text-2xl font-bold text-white">#{stats.weeklyRank}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-800/50 to-red-800/50 border-orange-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">Division</p>
                  <p className="text-lg font-bold text-white">{stats.division}</p>
                </div>
                <Users className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-black/20 border border-gray-700">
            <TabsTrigger value="leaderboard" className="data-[state=active]:bg-purple-600">
              Global Leaderboard
            </TabsTrigger>
            <TabsTrigger value="weekly" className="data-[state=active]:bg-purple-600">
              Weekly Rankings
            </TabsTrigger>
            <TabsTrigger value="divisions" className="data-[state=active]:bg-purple-600">
              Divisions
            </TabsTrigger>
          </TabsList>

          {/* Global Leaderboard */}
          <TabsContent value="leaderboard" className="space-y-4">
            <Card className="bg-black/20 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  Global Leaderboard
                </CardTitle>
                <CardDescription>
                  Top players competing for integration supremacy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {players.map((player) => (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between p-4 rounded-lg transition-all hover:bg-white/5 ${
                        player.name === "You" ? "bg-purple-900/30 border border-purple-700/50" : "bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 min-w-[60px]">
                          {getRankIcon(player.rank)}
                          {getTrendIcon(player.trend)}
                        </div>
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500">
                            {player.name.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-white">{player.name}</p>
                          <p className="text-sm text-gray-400">
                            {player.problemsSolved} problems • {player.accuracy}% accuracy
                          </p>
                        </div>
                        <Badge className={`${getDivisionColor(player.division)} text-white`}>
                          {player.division}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-white">{player.points.toLocaleString()}</p>
                        <p className="text-sm text-gray-400">
                          🔥 {player.streak} streak
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Weekly Rankings */}
          <TabsContent value="weekly" className="space-y-4">
            <Card className="bg-black/20 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-green-500" />
                  Weekly Rankings
                </CardTitle>
                <CardDescription>
                  This week's top performers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {players
                    .sort((a, b) => b.weeklyPoints - a.weeklyPoints)
                    .map((player, index) => (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between p-4 rounded-lg transition-all hover:bg-white/5 ${
                        player.name === "You" ? "bg-green-900/30 border border-green-700/50" : "bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 min-w-[60px]">
                          {getRankIcon(index + 1)}
                        </div>
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-500">
                            {player.name.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-white">{player.name}</p>
                          <p className="text-sm text-gray-400">
                            Weekly streak: {player.streak}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-white">{player.weeklyPoints}</p>
                        <p className="text-sm text-gray-400">points this week</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Divisions */}
          <TabsContent value="divisions" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Premier League */}
              <Card className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border-purple-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-6 w-6 text-yellow-500" />
                    Premier League
                  </CardTitle>
                  <CardDescription>Elite tier (2200+ points)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Players in division:</span>
                      <span>127</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Min points required:</span>
                      <span>2200</span>
                    </div>
                    <Progress value={75} className="h-2" />
                    <p className="text-xs text-gray-400">You're safe from relegation</p>
                  </div>
                </CardContent>
              </Card>

              {/* Championship */}
              <Card className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 border-blue-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Medal className="h-6 w-6 text-blue-400" />
                    Championship
                  </CardTitle>
                  <CardDescription>Advanced tier (1600-2199 points)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Players in division:</span>
                      <span>384</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Promotion at:</span>
                      <span>2200 points</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* League One */}
              <Card className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-green-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-6 w-6 text-green-400" />
                    League One
                  </CardTitle>
                  <CardDescription>Intermediate tier (1000-1599 points)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Players in division:</span>
                      <span>672</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Promotion at:</span>
                      <span>1600 points</span>
                    </div>
                    <Progress value={30} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* League Two */}
              <Card className="bg-gradient-to-br from-orange-900/50 to-red-900/50 border-orange-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-6 w-6 text-orange-400" />
                    League Two
                  </CardTitle>
                  <CardDescription>Starting tier (0-999 points)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Players in division:</span>
                      <span>1,664</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Promotion at:</span>
                      <span>1000 points</span>
                    </div>
                    <Progress value={15} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

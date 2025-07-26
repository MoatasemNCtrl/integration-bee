"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  Trophy, 
  Medal, 
  Star,
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  Zap,
  Award,
  BarChart3,
  Clock
} from "lucide-react"

interface UserProfile {
  name: string
  rank: number
  points: number
  division: "Premier" | "Championship" | "League One" | "League Two"
  accuracy: number
  streak: number
  longestStreak: number
  problemsSolved: number
  averageTime: number
  favoriteType: string
  joinDate: string
  weeklyProgress: number[]
  achievements: Achievement[]
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  earned: boolean
  progress?: number
  maxProgress?: number
  earnedDate?: string
}

const MOCK_PROFILE: UserProfile = {
  name: "You",
  rank: 5,
  points: 2456,
  division: "Premier",
  accuracy: 87.3,
  streak: 9,
  longestStreak: 23,
  problemsSolved: 128,
  averageTime: 45,
  favoriteType: "Substitution",
  joinDate: "2024-01-15",
  weeklyProgress: [120, 145, 98, 167, 134, 189, 156],
  achievements: [
    {
      id: "first_solve",
      name: "First Steps",
      description: "Solve your first integral",
      icon: "🎯",
      earned: true,
      earnedDate: "2024-01-15"
    },
    {
      id: "streak_10",
      name: "Hot Streak",
      description: "Solve 10 problems in a row correctly",
      icon: "🔥",
      earned: true,
      earnedDate: "2024-01-22"
    },
    {
      id: "streak_25",
      name: "Unstoppable",
      description: "Solve 25 problems in a row correctly",
      icon: "⚡",
      earned: false,
      progress: 23,
      maxProgress: 25
    },
    {
      id: "speed_demon",
      name: "Speed Demon",
      description: "Solve a problem in under 15 seconds",
      icon: "💨",
      earned: true,
      earnedDate: "2024-02-03"
    },
    {
      id: "perfectionist",
      name: "Perfectionist",
      description: "Maintain 95% accuracy over 50 problems",
      icon: "💎",
      earned: false,
      progress: 32,
      maxProgress: 50
    },
    {
      id: "century",
      name: "Century Club",
      description: "Solve 100 problems",
      icon: "💯",
      earned: true,
      earnedDate: "2024-02-18"
    }
  ]
}

export default function LeagueProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile>(MOCK_PROFILE)
  const [activeTab, setActiveTab] = useState("overview")

  const getDivisionColor = (division: string) => {
    switch (division) {
      case "Premier": return "bg-purple-500"
      case "Championship": return "bg-blue-500"
      case "League One": return "bg-green-500"
      case "League Two": return "bg-orange-500"
      default: return "bg-gray-500"
    }
  }

  const getAchievementProgress = (achievement: Achievement) => {
    if (!achievement.maxProgress) return 100
    return (achievement.progress || 0) / achievement.maxProgress * 100
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
              onClick={() => router.push("/league")}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                League Profile
              </h1>
              <p className="text-xl text-gray-300">Your integration journey</p>
            </div>
          </div>
        </div>

        {/* Profile Header */}
        <Card className="bg-black/20 border-gray-700 mb-8">
          <CardContent className="p-8">
            <div className="flex items-center gap-8">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-2xl">
                  {profile.name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <h2 className="text-3xl font-bold text-white">{profile.name}</h2>
                  <Badge className={`${getDivisionColor(profile.division)} text-white`}>
                    {profile.division} League
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm text-gray-400">Global Rank</p>
                    <p className="text-2xl font-bold text-yellow-400">#{profile.rank}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Points</p>
                    <p className="text-2xl font-bold text-green-400">{profile.points.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Current Streak</p>
                    <p className="text-2xl font-bold text-orange-400">🔥 {profile.streak}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Accuracy</p>
                    <p className="text-2xl font-bold text-blue-400">{profile.accuracy}%</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-black/20 border border-gray-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
              Overview
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-purple-600">
              Achievements
            </TabsTrigger>
            <TabsTrigger value="statistics" className="data-[state=active]:bg-purple-600">
              Statistics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Performance Overview */}
              <Card className="bg-black/20 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-6 w-6 text-blue-400" />
                    Performance Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Problems Solved</span>
                      <span>{profile.problemsSolved}</span>
                    </div>
                    <Progress value={(profile.problemsSolved / 200) * 100} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Accuracy Rate</span>
                      <span>{profile.accuracy}%</span>
                    </div>
                    <Progress value={profile.accuracy} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Current Streak</span>
                      <span>{profile.streak} / {profile.longestStreak} (best)</span>
                    </div>
                    <Progress value={(profile.streak / profile.longestStreak) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="bg-black/20 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-6 w-6 text-green-400" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Average Time</span>
                    <span className="text-white">{profile.averageTime}s</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Longest Streak</span>
                    <span className="text-white">{profile.longestStreak} problems</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Favorite Type</span>
                    <span className="text-white">{profile.favoriteType}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Member Since</span>
                    <span className="text-white">{new Date(profile.joinDate).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Progress */}
            <Card className="bg-black/20 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-purple-400" />
                  Weekly Progress
                </CardTitle>
                <CardDescription>
                  Points earned over the last 7 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-32">
                  {profile.weeklyProgress.map((points, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-gradient-to-t from-purple-600 to-blue-500 rounded-t-sm"
                        style={{ height: `${(points / Math.max(...profile.weeklyProgress)) * 100}%` }}
                      />
                      <div className="text-xs text-gray-400 mt-1">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                      </div>
                      <div className="text-xs text-white">{points}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <Card className="bg-black/20 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-6 w-6 text-yellow-500" />
                  Achievements
                </CardTitle>
                <CardDescription>
                  Track your integration milestones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-lg border transition-all ${
                        achievement.earned
                          ? "bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-yellow-700/50"
                          : "bg-white/5 border-gray-700 opacity-75"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-white">{achievement.name}</h3>
                          <p className="text-sm text-gray-400 mb-2">{achievement.description}</p>
                          
                          {achievement.earned ? (
                            <Badge className="bg-yellow-600 text-white">
                              Earned {achievement.earnedDate}
                            </Badge>
                          ) : achievement.maxProgress ? (
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>{achievement.progress}/{achievement.maxProgress}</span>
                                <span>{getAchievementProgress(achievement).toFixed(0)}%</span>
                              </div>
                              <Progress value={getAchievementProgress(achievement)} className="h-1" />
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-gray-400 border-gray-600">
                              Not Earned
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="statistics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 border-blue-700/50">
                <CardContent className="p-6 text-center">
                  <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                  <p className="text-2xl font-bold text-white">{profile.rank}</p>
                  <p className="text-sm text-gray-300">Global Rank</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-green-700/50">
                <CardContent className="p-6 text-center">
                  <Star className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <p className="text-2xl font-bold text-white">{profile.points.toLocaleString()}</p>
                  <p className="text-sm text-gray-300">Total Points</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-700/50">
                <CardContent className="p-6 text-center">
                  <Zap className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                  <p className="text-2xl font-bold text-white">{profile.streak}</p>
                  <p className="text-sm text-gray-300">Current Streak</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-black/20 border-gray-700">
              <CardHeader>
                <CardTitle>Detailed Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm text-gray-400">Problems Solved</p>
                    <p className="text-xl font-bold text-white">{profile.problemsSolved}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Accuracy Rate</p>
                    <p className="text-xl font-bold text-white">{profile.accuracy}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Average Time</p>
                    <p className="text-xl font-bold text-white">{profile.averageTime}s</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Longest Streak</p>
                    <p className="text-xl font-bold text-white">{profile.longestStreak}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

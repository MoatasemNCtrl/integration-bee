"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { LogIn, LogOut, User, Trophy, Settings } from "lucide-react"
import { useRouter } from "next/navigation"

export function UserNav() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === "loading") {
    return (
      <div className="h-8 w-8 rounded-full bg-gray-700 animate-pulse" />
    )
  }

  if (!session) {
    return (
      <Button
        onClick={() => signIn()}
        variant="outline"
        size="sm"
        className="border-gray-600 hover:bg-white/10 text-white"
      >
        <LogIn className="h-4 w-4 mr-2" />
        Sign In
      </Button>
    )
  }

  const user = session.user
  const gameData = user.gameData

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.image || ""} alt={user.name || ""} />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500">
              {user.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80 bg-gray-900 border-gray-700" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.image || ""} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-lg">
                  {user.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium leading-none text-white">{user.name}</p>
                <p className="text-xs leading-none text-gray-400 mt-1">{user.email}</p>
              </div>
            </div>
            
            {gameData && (
              <div className="bg-gray-800 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">League Points</span>
                  <Badge className="bg-green-600 text-white">
                    {gameData.leaguePoints.toLocaleString()}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Division</span>
                  <Badge variant="outline" className="text-purple-400 border-purple-400">
                    {gameData.division}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400">Solved: </span>
                    <span className="text-white">{gameData.correctSolved}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Streak: </span>
                    <span className="text-orange-400">🔥 {gameData.currentStreak}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-gray-700" />
        
        <DropdownMenuItem 
          onClick={() => router.push("/league/profile")}
          className="text-white hover:bg-gray-800 cursor-pointer"
        >
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => router.push("/league")}
          className="text-white hover:bg-gray-800 cursor-pointer"
        >
          <Trophy className="mr-2 h-4 w-4" />
          <span>League</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => router.push("/stats")}
          className="text-white hover:bg-gray-800 cursor-pointer"
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Statistics</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-gray-700" />
        
        <DropdownMenuItem 
          onClick={() => signOut()}
          className="text-red-400 hover:bg-gray-800 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

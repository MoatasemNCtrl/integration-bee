import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      gameData?: {
        leaguePoints: number
        totalProblems: number
        correctSolved: number
        currentStreak: number
        longestStreak: number
        division: string
        weeklyPoints: number
      }
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        
        // Fetch user game data
        const userData = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            leaguePoints: true,
            totalProblems: true,
            correctSolved: true,
            currentStreak: true,
            longestStreak: true,
            division: true,
            weeklyPoints: true,
          }
        })
        
        if (userData) {
          session.user.gameData = userData
        }
      }
      return session
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          // Update last active time on sign in
          await prisma.user.update({
            where: { email: user.email! },
            data: { lastActive: new Date() }
          })
        } catch (error) {
          console.error("Error updating user on sign in:", error)
        }
      }
      return true
    }
  },
  session: {
    strategy: "database",
  },
  pages: {
    signIn: "/auth/signin",
  },
}

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')

// Create Prisma client for PostgreSQL
const prisma = new PrismaClient()

async function importData() {
  try {
    console.log('📥 Importing data to PostgreSQL...')
    
    // Read exported data
    if (!fs.existsSync('sqlite-export.json')) {
      console.log('❌ No export file found. Run export script first.')
      return
    }
    
    const data = JSON.parse(fs.readFileSync('sqlite-export.json', 'utf8'))
    
    console.log('🧹 Cleaning existing data...')
    // Clean existing data (be careful in production!)
    await prisma.userAchievement.deleteMany()
    await prisma.gameSession.deleteMany()
    await prisma.leaderboard.deleteMany()
    await prisma.session.deleteMany()
    await prisma.account.deleteMany()
    await prisma.achievement.deleteMany()
    await prisma.user.deleteMany()
    
    console.log('📊 Importing achievements...')
    for (const achievement of data.achievements) {
      await prisma.achievement.create({
        data: {
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          type: achievement.type,
          condition: achievement.condition,
          points: achievement.points,
          createdAt: new Date(achievement.createdAt)
        }
      })
    }
    
    console.log('👥 Importing users...')
    for (const user of data.users) {
      // Create user
      await prisma.user.create({
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
          image: user.image,
          leaguePoints: user.leaguePoints,
          totalProblems: user.totalProblems,
          correctSolved: user.correctSolved,
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak,
          division: user.division,
          weeklyPoints: user.weeklyPoints,
          joinedAt: new Date(user.joinedAt),
          lastActive: new Date(user.lastActive)
        }
      })
      
      // Import accounts
      for (const account of user.accounts) {
        await prisma.account.create({
          data: {
            id: account.id,
            userId: account.userId,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            refresh_token: account.refresh_token,
            access_token: account.access_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token,
            session_state: account.session_state
          }
        })
      }
      
      // Import sessions
      for (const session of user.sessions) {
        await prisma.session.create({
          data: {
            id: session.id,
            sessionToken: session.sessionToken,
            userId: session.userId,
            expires: new Date(session.expires)
          }
        })
      }
    }
    
    console.log('🎮 Importing game sessions...')
    for (const gameSession of data.gameSessions) {
      await prisma.gameSession.create({
        data: {
          id: gameSession.id,
          userId: gameSession.userId,
          mode: gameSession.mode,
          problemsAttempted: gameSession.problemsAttempted,
          problemsSolved: gameSession.problemsSolved,
          pointsEarned: gameSession.pointsEarned,
          timeSpent: gameSession.timeSpent,
          startedAt: new Date(gameSession.startedAt),
          completedAt: gameSession.completedAt ? new Date(gameSession.completedAt) : null
        }
      })
    }
    
    console.log('🏆 Importing user achievements...')
    for (const userAchievement of data.userAchievements) {
      await prisma.userAchievement.create({
        data: {
          id: userAchievement.id,
          userId: userAchievement.userId,
          achievementId: userAchievement.achievementId,
          unlockedAt: new Date(userAchievement.unlockedAt)
        }
      })
    }
    
    console.log('📈 Importing leaderboards...')
    for (const leaderboard of data.leaderboards) {
      await prisma.leaderboard.create({
        data: {
          id: leaderboard.id,
          userId: leaderboard.userId,
          weekStarting: new Date(leaderboard.weekStarting),
          weeklyPoints: leaderboard.weeklyPoints,
          rank: leaderboard.rank,
          division: leaderboard.division
        }
      })
    }
    
    console.log('✅ Migration completed successfully!')
    console.log(`📊 Imported:`)
    console.log(`   - Users: ${data.users.length}`)
    console.log(`   - Achievements: ${data.achievements.length}`)
    console.log(`   - User Achievements: ${data.userAchievements.length}`)
    console.log(`   - Game Sessions: ${data.gameSessions.length}`)
    console.log(`   - Leaderboards: ${data.leaderboards.length}`)
    
  } catch (error) {
    console.error('❌ Import failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

importData()

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')

// Create Prisma client for SQLite
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./dev.db'
    }
  }
})

async function exportData() {
  try {
    console.log('🔍 Exporting data from SQLite...')
    
    // Export all data
    const users = await prisma.user.findMany({
      include: {
        accounts: true,
        sessions: true
      }
    })
    
    const achievements = await prisma.achievement.findMany()
    const userAchievements = await prisma.userAchievement.findMany()
    const gameSessions = await prisma.gameSession.findMany()
    const leaderboards = await prisma.leaderboard.findMany()
    
    const exportData = {
      users,
      achievements,
      userAchievements,
      gameSessions,
      leaderboards,
      exportedAt: new Date().toISOString()
    }
    
    // Save to JSON file
    fs.writeFileSync('sqlite-export.json', JSON.stringify(exportData, null, 2))
    
    console.log('✅ Data exported to sqlite-export.json')
    console.log(`📊 Summary:`)
    console.log(`   - Users: ${users.length}`)
    console.log(`   - Achievements: ${achievements.length}`)
    console.log(`   - User Achievements: ${userAchievements.length}`)
    console.log(`   - Game Sessions: ${gameSessions.length}`)
    console.log(`   - Leaderboards: ${leaderboards.length}`)
    
  } catch (error) {
    console.error('❌ Export failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

exportData()

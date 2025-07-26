import { prisma } from "@/lib/prisma"

const achievements = [
  {
    key: "first_solve",
    name: "First Steps",
    description: "Solve your first integral",
    icon: "🎯",
    category: "progress",
    requirement: 1
  },
  {
    key: "streak_5",
    name: "Getting Warmed Up",
    description: "Solve 5 problems in a row correctly",
    icon: "🔥",
    category: "streak",
    requirement: 5
  },
  {
    key: "streak_10",
    name: "Hot Streak",
    description: "Solve 10 problems in a row correctly",
    icon: "🔥",
    category: "streak",
    requirement: 10
  },
  {
    key: "streak_25",
    name: "Unstoppable",
    description: "Solve 25 problems in a row correctly",
    icon: "⚡",
    category: "streak",
    requirement: 25
  },
  {
    key: "speed_demon",
    name: "Speed Demon",
    description: "Solve a problem in under 15 seconds",
    icon: "💨",
    category: "speed",
    requirement: 15
  },
  {
    key: "perfectionist",
    name: "Perfectionist",
    description: "Maintain 95% accuracy over 50 problems",
    icon: "💎",
    category: "accuracy",
    requirement: 50
  },
  {
    key: "century",
    name: "Century Club",
    description: "Solve 100 problems",
    icon: "💯",
    category: "progress",
    requirement: 100
  },
  {
    key: "league_climber",
    name: "League Climber",
    description: "Reach Championship division",
    icon: "📈",
    category: "progression",
    requirement: 1600
  },
  {
    key: "premier_league",
    name: "Premier League",
    description: "Reach Premier division",
    icon: "👑",
    category: "progression",
    requirement: 2200
  }
]

async function seedAchievements() {
  console.log("Seeding achievements...")
  
  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { key: achievement.key },
      update: achievement,
      create: achievement
    })
  }
  
  console.log("Achievements seeded successfully!")
}

// Export as default for easy running
export default seedAchievements

// Allow direct execution
if (require.main === module) {
  seedAchievements()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

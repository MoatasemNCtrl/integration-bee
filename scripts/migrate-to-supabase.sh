#!/bin/bash

echo "🚀 Integration Bee - Supabase Migration Script"
echo "=============================================="

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL not set in .env.local"
    echo "Please add your Supabase PostgreSQL URL to .env.local:"
    echo 'DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"'
    echo 'DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"'
    exit 1
fi

echo "📋 Step 1: Generating Prisma client for PostgreSQL..."
npx prisma generate

echo "🗃️  Step 2: Creating database schema..."
npx prisma db push

echo "📥 Step 3: Importing SQLite data to PostgreSQL..."
node scripts/import-to-postgresql.js

echo "✅ Migration completed!"
echo ""
echo "🎯 Next steps:"
echo "1. Test your app: npm run dev"
echo "2. Verify data in Supabase dashboard"
echo "3. Update production environment variables"
echo ""
echo "🗑️  Optional: Remove SQLite files when satisfied:"
echo "   rm prisma/dev.db"
echo "   rm sqlite-export.json"

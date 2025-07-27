# Supabase PostgreSQL Migration Guide

## Step 1: Create Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up with GitHub (recommended)
3. Create a new project:
   - Project name: `integration-bee`
   - Database password: Generate a strong password (save this!)
   - Region: Choose closest to your users

## Step 2: Get Database URL

1. In your Supabase dashboard, go to **Settings** → **Database**
2. Copy the **Connection string** under "Connection parameters"
3. It will look like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

## Step 3: Update Environment Variables

Add to your `.env.local` file:
```bash
# Supabase Configuration
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

## Next Steps

Run the migration script that will be created to complete the setup.

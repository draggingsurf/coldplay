# Database Setup Instructions for Simplified Coldplay Canoodlers

## 🚨 IMPORTANT: Database Cleanup Required

The old complex database tables are still in your Supabase project and need to be cleaned up. Follow these steps:

## Step 1: Access Supabase SQL Editor

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: `hyprwxypazqoduoxpcqx`
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"

## Step 2: Run the Cleanup Script

Copy and paste the entire contents of [`database_cleanup_and_setup.sql`](database_cleanup_and_setup.sql) into the SQL editor and click "Run".

This script will:
- ✅ Drop all old tables (competitions, leaderboard, game_sessions, etc.)
- ✅ Create new simplified tables (players, game_scores)
- ✅ Set up proper indexes and permissions
- ✅ Create a helpful player_stats view

## Step 3: Verify the Setup

After running the script, you should see only these tables in your database:

### Tables Created:
- `players` - Stores wallet addresses and join dates
- `game_scores` - Records final scores when games end

### View Created:
- `player_stats` - Shows aggregated statistics per player

## Step 4: Test the Application

1. Go to `http://localhost:8000`
2. Try connecting a wallet (if you have Phantom/Solflare installed)
3. The system should now properly create player records and store scores

## Expected Database Flow

1. **User connects wallet** → Creates record in `players` table
2. **User plays game** → No database activity during gameplay
3. **User ends game** → Creates record in `game_scores` table with final score

## Troubleshooting

If you see errors:
- Make sure to run the entire script at once
- Check that you have proper permissions in Supabase
- Verify the script completed without errors

## Database Schema Reference

```sql
-- Players table
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game scores table  
CREATE TABLE game_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    score INTEGER NOT NULL DEFAULT 0,
    game_duration INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Next Steps

After running the database setup:
1. Test wallet connection
2. Test game playing and score recording
3. Check that data appears in the Supabase tables
4. The simplified flow should now work correctly!
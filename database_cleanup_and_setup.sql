-- Database Cleanup and Setup for Simplified Coldplay Canoodlers Game
-- Run this in your Supabase SQL Editor to clean up old tables and create new ones

-- =====================================================
-- STEP 1: DROP ALL OLD TABLES (Clean Slate)
-- =====================================================

-- Drop old tables in correct order (respecting foreign key constraints)
DROP TABLE IF EXISTS game_captures CASCADE;
DROP TABLE IF EXISTS game_sessions CASCADE;
DROP TABLE IF EXISTS leaderboard CASCADE;
DROP TABLE IF EXISTS competition_participants CASCADE;
DROP TABLE IF EXISTS competitions CASCADE;
DROP TABLE IF EXISTS players CASCADE;

-- Drop any views that might exist
DROP VIEW IF EXISTS player_stats CASCADE;
DROP VIEW IF EXISTS competition_leaderboard CASCADE;

-- Drop any functions that might exist
DROP FUNCTION IF EXISTS record_capture(UUID) CASCADE;
DROP FUNCTION IF EXISTS end_game_session(UUID) CASCADE;
DROP FUNCTION IF EXISTS update_leaderboard() CASCADE;

-- =====================================================
-- STEP 2: CREATE SIMPLIFIED TABLES
-- =====================================================

-- Players table (simplified - only essential fields)
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game scores table (new - for recording final scores only)
CREATE TABLE game_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    score INTEGER NOT NULL DEFAULT 0,
    game_duration INTEGER, -- Duration in seconds (optional)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STEP 3: CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes for better performance
CREATE INDEX idx_players_wallet_address ON players(wallet_address);
CREATE INDEX idx_game_scores_player_id ON game_scores(player_id);
CREATE INDEX idx_game_scores_created_at ON game_scores(created_at DESC);
CREATE INDEX idx_game_scores_score ON game_scores(score DESC);

-- =====================================================
-- STEP 4: CREATE HELPFUL VIEW (OPTIONAL)
-- =====================================================

-- Optional: Create a view for player statistics
CREATE OR REPLACE VIEW player_stats AS
SELECT 
    p.id,
    p.wallet_address,
    p.created_at as joined_at,
    COUNT(gs.id) as total_games,
    COALESCE(MAX(gs.score), 0) as best_score,
    COALESCE(AVG(gs.score), 0) as average_score,
    COALESCE(SUM(gs.score), 0) as total_score
FROM players p
LEFT JOIN game_scores gs ON p.id = gs.player_id
GROUP BY p.id, p.wallet_address, p.created_at;

-- =====================================================
-- STEP 5: SET UP ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on tables
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed)
CREATE POLICY "Allow public read access on players" ON players
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert on players" ON players
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access on game_scores" ON game_scores
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert on game_scores" ON game_scores
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- STEP 6: GRANT PERMISSIONS
-- =====================================================

-- Grant permissions to anon and authenticated users
GRANT SELECT, INSERT ON players TO anon, authenticated;
GRANT SELECT, INSERT ON game_scores TO anon, authenticated;
GRANT SELECT ON player_stats TO anon, authenticated;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Run these to verify the setup worked:
-- SELECT * FROM players;
-- SELECT * FROM game_scores;
-- SELECT * FROM player_stats;

-- Check table structure:
-- \d players
-- \d game_scores

COMMENT ON TABLE players IS 'Simplified players table - only wallet address and join date';
COMMENT ON TABLE game_scores IS 'Game scores table - records final scores when games end';
COMMENT ON VIEW player_stats IS 'View showing aggregated player statistics';
-- Simplified Database Schema for Coldplay Canoodlers Game
-- Only includes essential tables for wallet verification and score tracking

-- Players table (simplified)
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game scores table (new - for recording final scores)
CREATE TABLE IF NOT EXISTS game_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    score INTEGER NOT NULL DEFAULT 0,
    game_duration INTEGER, -- Duration in seconds (optional)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_players_wallet_address ON players(wallet_address);
CREATE INDEX IF NOT EXISTS idx_game_scores_player_id ON game_scores(player_id);
CREATE INDEX IF NOT EXISTS idx_game_scores_created_at ON game_scores(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_scores_score ON game_scores(score DESC);

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

-- Comments explaining the simplified approach:
-- 1. No competition tables - game is always available
-- 2. No leaderboard tables - can be generated from game_scores
-- 3. No session tracking - just record final scores
-- 4. No real-time updates - simple score recording
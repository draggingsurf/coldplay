-- Sample Data for Testing Leaderboard
-- Run this in your Supabase SQL Editor to add test data

-- Insert sample players
INSERT INTO players (wallet_address) VALUES 
('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'),
('4vJ9JU1bJJE96FWSJKvHsmmFADCg4gpZQff4P3bkLKi'),
('8HNwzpvFb5yJDaNvdCJStEHTphKXiRhB3bvFqmkAWWM'),
('2mBJKvHsmmFADCg4gpZQff4P3bkLKi9JU1bJJE96FWS'),
('7LVL9zYtAWWM9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDs'),
('3gpZQff4P3bkLKi4vJ9JU1bJJE96FWSJKvHsmmFADCg'),
('6HNwzpvFb5yJDaNvdCJStEHTphKXiRhB3bvFqmkAWW'),
('1JKvHsmmFADCg4gpZQff4P3bkLKi2mBJU1bJJE96FW'),
('5L9zYtAWWM9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsG'),
('9pZQff4P3bkLKi4vJ9JU1bJJE96FWSJKvHsmmFADC')
ON CONFLICT (wallet_address) DO NOTHING;

-- Insert sample game scores
WITH player_ids AS (
    SELECT id, wallet_address FROM players 
    WHERE wallet_address IN (
        '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        '4vJ9JU1bJJE96FWSJKvHsmmFADCg4gpZQff4P3bkLKi',
        '8HNwzpvFb5yJDaNvdCJStEHTphKXiRhB3bvFqmkAWWM',
        '2mBJKvHsmmFADCg4gpZQff4P3bkLKi9JU1bJJE96FWS',
        '7LVL9zYtAWWM9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDs',
        '3gpZQff4P3bkLKi4vJ9JU1bJJE96FWSJKvHsmmFADCg',
        '6HNwzpvFb5yJDaNvdCJStEHTphKXiRhB3bvFqmkAWW',
        '1JKvHsmmFADCg4gpZQff4P3bkLKi2mBJU1bJJE96FW',
        '5L9zYtAWWM9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsG',
        '9pZQff4P3bkLKi4vJ9JU1bJJE96FWSJKvHsmmFADC'
    )
)
INSERT INTO game_scores (player_id, score, game_duration)
SELECT 
    p.id,
    CASE 
        WHEN p.wallet_address = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM' THEN 2400
        WHEN p.wallet_address = '4vJ9JU1bJJE96FWSJKvHsmmFADCg4gpZQff4P3bkLKi' THEN 2100
        WHEN p.wallet_address = '8HNwzpvFb5yJDaNvdCJStEHTphKXiRhB3bvFqmkAWWM' THEN 1800
        WHEN p.wallet_address = '2mBJKvHsmmFADCg4gpZQff4P3bkLKi9JU1bJJE96FWS' THEN 1500
        WHEN p.wallet_address = '7LVL9zYtAWWM9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDs' THEN 1200
        WHEN p.wallet_address = '3gpZQff4P3bkLKi4vJ9JU1bJJE96FWSJKvHsmmFADCg' THEN 1000
        WHEN p.wallet_address = '6HNwzpvFb5yJDaNvdCJStEHTphKXiRhB3bvFqmkAWW' THEN 800
        WHEN p.wallet_address = '1JKvHsmmFADCg4gpZQff4P3bkLKi2mBJU1bJJE96FW' THEN 700
        WHEN p.wallet_address = '5L9zYtAWWM9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsG' THEN 600
        ELSE 550
    END as score,
    300 as game_duration
FROM player_ids p;

-- Add some additional scores for variety
INSERT INTO game_scores (player_id, score, game_duration)
SELECT 
    (SELECT id FROM players WHERE wallet_address = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'),
    2000, 250
UNION ALL
SELECT 
    (SELECT id FROM players WHERE wallet_address = '4vJ9JU1bJJE96FWSJKvHsmmFADCg4gpZQff4P3bkLKi'),
    1900, 280
UNION ALL
SELECT 
    (SELECT id FROM players WHERE wallet_address = '8HNwzpvFb5yJDaNvdCJStEHTphKXiRhB3bvFqmkAWWM'),
    1700, 320;

-- Verify the data
SELECT 'Players created:' as info, COUNT(*) as count FROM players
UNION ALL
SELECT 'Scores created:' as info, COUNT(*) as count FROM game_scores
UNION ALL
SELECT 'Player stats available:' as info, COUNT(*) as count FROM player_stats;

-- Show top 10 leaderboard
SELECT 
    ROW_NUMBER() OVER (ORDER BY best_score DESC) as rank,
    wallet_address,
    best_score,
    total_games,
    ROUND(average_score::numeric, 1) as avg_score
FROM player_stats 
ORDER BY best_score DESC 
LIMIT 10;
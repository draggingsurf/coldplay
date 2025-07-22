// Player Statistics Management for Coldplay Canoodlers Game
// Handles individual player data, scores, and game history

class PlayerStats {
    constructor() {
        this.supabase = null;
        this.isInitialized = false;
        this.currentPlayer = null;
        this.playerData = null;
        
        this.init();
    }

    async init() {
        try {
            // Import Supabase client
            const { supabase } = await import('./supabaseClient.js');
            this.supabase = supabase;
            this.isInitialized = true;
            
            console.log('✅ PlayerStats initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize PlayerStats:', error);
        }
    }

    async setCurrentPlayer(walletAddress) {
        if (!this.isInitialized) {
            console.warn('⚠️ PlayerStats not initialized yet');
            return false;
        }

        try {
            this.currentPlayer = walletAddress;
            await this.loadPlayerData();
            return true;
            
        } catch (error) {
            console.error('❌ Failed to set current player:', error);
            return false;
        }
    }

    async loadPlayerData() {
        if (!this.currentPlayer || !this.isInitialized) {
            return;
        }

        try {
            // Get player stats from the view
            const { data, error } = await this.supabase
                .from('player_stats')
                .select('*')
                .eq('wallet_address', this.currentPlayer)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            this.playerData = data || {
                wallet_address: this.currentPlayer,
                total_games: 0,
                best_score: 0,
                average_score: 0,
                total_score: 0,
                joined_at: new Date().toISOString()
            };

            console.log(`📊 Loaded stats for player ${this.currentPlayer}:`, this.playerData);
            
        } catch (error) {
            console.error('❌ Failed to load player data:', error);
            this.playerData = null;
        }
    }

    async createPlayer(walletAddress) {
        if (!this.isInitialized) {
            console.warn('⚠️ PlayerStats not initialized yet');
            return null;
        }

        try {
            const { data, error } = await this.supabase
                .from('players')
                .insert({ wallet_address: walletAddress })
                .select('*')
                .single();

            if (error) {
                // Player might already exist
                if (error.code === '23505') {
                    console.log(`ℹ️ Player ${walletAddress} already exists`);
                    return await this.getPlayer(walletAddress);
                }
                throw error;
            }

            console.log(`✅ Created new player: ${walletAddress}`);
            return data;
            
        } catch (error) {
            console.error('❌ Failed to create player:', error);
            return null;
        }
    }

    async getPlayer(walletAddress) {
        if (!this.isInitialized) {
            return null;
        }

        try {
            const { data, error } = await this.supabase
                .from('players')
                .select('*')
                .eq('wallet_address', walletAddress)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // Player doesn't exist, create them
                    return await this.createPlayer(walletAddress);
                }
                throw error;
            }

            return data;
            
        } catch (error) {
            console.error('❌ Failed to get player:', error);
            return null;
        }
    }

    async recordGameScore(walletAddress, score, gameDuration = null) {
        if (!this.isInitialized) {
            console.warn('⚠️ PlayerStats not initialized yet');
            return false;
        }

        try {
            // Ensure player exists
            const player = await this.getPlayer(walletAddress);
            if (!player) {
                console.error('❌ Could not find or create player');
                return false;
            }

            // Record the game score
            const { error } = await this.supabase
                .from('game_scores')
                .insert({
                    player_id: player.id,
                    score: score,
                    game_duration: gameDuration
                });

            if (error) throw error;

            console.log(`✅ Recorded score ${score} for player ${walletAddress}`);
            
            // Refresh player data if this is the current player
            if (this.currentPlayer === walletAddress) {
                await this.loadPlayerData();
            }

            // Update leaderboard if available
            if (window.leaderboard && window.leaderboard.addPlayerScore) {
                await window.leaderboard.addPlayerScore(walletAddress, score);
            }

            return true;
            
        } catch (error) {
            console.error('❌ Failed to record game score:', error);
            return false;
        }
    }

    async getPlayerGameHistory(walletAddress, limit = 10) {
        if (!this.isInitialized) {
            return [];
        }

        try {
            const player = await this.getPlayer(walletAddress);
            if (!player) return [];

            const { data, error } = await this.supabase
                .from('game_scores')
                .select('score, game_duration, created_at')
                .eq('player_id', player.id)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;

            return data || [];
            
        } catch (error) {
            console.error('❌ Failed to get player game history:', error);
            return [];
        }
    }

    async getPlayerRank(walletAddress) {
        if (!this.isInitialized) {
            return null;
        }

        try {
            const { data, error } = await this.supabase
                .from('player_stats')
                .select('wallet_address, best_score')
                .order('best_score', { ascending: false });

            if (error) throw error;

            const playerIndex = data.findIndex(player => player.wallet_address === walletAddress);
            return playerIndex >= 0 ? {
                rank: playerIndex + 1,
                totalPlayers: data.length,
                percentile: Math.round(((data.length - playerIndex) / data.length) * 100)
            } : null;
            
        } catch (error) {
            console.error('❌ Failed to get player rank:', error);
            return null;
        }
    }

    getCurrentPlayerData() {
        return this.playerData;
    }

    getCurrentPlayerStats() {
        if (!this.playerData) {
            return {
                gamesPlayed: 0,
                bestScore: 0,
                averageScore: 0,
                totalScore: 0,
                rank: null
            };
        }

        return {
            gamesPlayed: this.playerData.total_games || 0,
            bestScore: this.playerData.best_score || 0,
            averageScore: Math.round(this.playerData.average_score || 0),
            totalScore: this.playerData.total_score || 0,
            joinedAt: this.playerData.joined_at
        };
    }

    async getTopPlayers(limit = 10) {
        if (!this.isInitialized) {
            return [];
        }

        try {
            const { data, error } = await this.supabase
                .from('player_stats')
                .select('wallet_address, best_score, total_games, average_score')
                .order('best_score', { ascending: false })
                .limit(limit);

            if (error) throw error;

            return data || [];
            
        } catch (error) {
            console.error('❌ Failed to get top players:', error);
            return [];
        }
    }

    async getTotalPlayersCount() {
        if (!this.isInitialized) {
            return 0;
        }

        try {
            const { count, error } = await this.supabase
                .from('players')
                .select('*', { count: 'exact', head: true });

            if (error) throw error;

            return count || 0;
            
        } catch (error) {
            console.error('❌ Failed to get total players count:', error);
            return 0;
        }
    }

    async getGameStats() {
        if (!this.isInitialized) {
            return {
                totalGames: 0,
                totalPlayers: 0,
                averageScore: 0,
                highestScore: 0
            };
        }

        try {
            // Get total games
            const { count: totalGames, error: gamesError } = await this.supabase
                .from('game_scores')
                .select('*', { count: 'exact', head: true });

            if (gamesError) throw gamesError;

            // Get total players
            const totalPlayers = await this.getTotalPlayersCount();

            // Get average and highest scores
            const { data: scoreStats, error: statsError } = await this.supabase
                .from('game_scores')
                .select('score');

            if (statsError) throw statsError;

            const scores = scoreStats.map(s => s.score);
            const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
            const highestScore = scores.length > 0 ? Math.max(...scores) : 0;

            return {
                totalGames: totalGames || 0,
                totalPlayers,
                averageScore,
                highestScore
            };
            
        } catch (error) {
            console.error('❌ Failed to get game stats:', error);
            return {
                totalGames: 0,
                totalPlayers: 0,
                averageScore: 0,
                highestScore: 0
            };
        }
    }

    // Format wallet address for display
    formatWalletAddress(address) {
        if (!address || address.length < 10) return address;
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    }

    // Cleanup method
    destroy() {
        this.isInitialized = false;
        this.currentPlayer = null;
        this.playerData = null;
        console.log('🧹 PlayerStats destroyed');
    }
}

// Create global player stats instance
window.playerStats = new PlayerStats();

// Add a helper function to get player's total score
window.getPlayerTotalScore = async function(walletAddress) {
    if (!window.playerStats || !window.playerStats.isInitialized) {
        console.warn('PlayerStats not initialized yet');
        return 0;
    }
    
    try {
        await window.playerStats.setCurrentPlayer(walletAddress);
        const playerData = window.playerStats.getCurrentPlayerStats();
        return playerData.totalScore || 0;
    } catch (error) {
        console.error('Failed to get player total score:', error);
        return 0;
    }
};

export { PlayerStats };
// Real-time Leaderboard Management for Coldplay Canoodlers Game
// Handles instant leaderboard updates using Supabase real-time subscriptions

class Leaderboard {
    constructor() {
        this.supabase = null;
        this.updateInterval = null;
        this.realtimeSubscription = null;
        this.isInitialized = false;
        this.currentLeaderboard = [];
        this.maxPlayers = 10; // Show top 10 players
        
        this.init();
    }

    async init() {
        try {
            // Import Supabase client
            const { supabase } = await import('./supabaseClient.js');
            this.supabase = supabase;
            this.isInitialized = true;
            
            console.log('✅ Leaderboard initialized successfully');
            
            // Load initial leaderboard data
            await this.loadLeaderboard();
            
            // Set up real-time subscriptions instead of polling
            this.setupRealtimeSubscription();
            
            // Keep a backup refresh every 5 minutes as fallback
            this.startBackupRefresh();
            
        } catch (error) {
            console.error('❌ Failed to initialize leaderboard:', error);
            this.showFallbackLeaderboard();
        }
    }

    setupRealtimeSubscription() {
        if (!this.isInitialized) {
            console.warn('⚠️ Cannot setup real-time subscription - not initialized');
            return;
        }

        try {
            console.log('🔄 Setting up real-time leaderboard subscription');
            
            // Subscribe to changes in game_scores table
            this.realtimeSubscription = this.supabase
                .channel('leaderboard-updates')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'game_scores'
                    },
                    (payload) => {
                        console.log('🎯 New score recorded, updating leaderboard:', payload);
                        this.handleRealtimeScoreUpdate(payload);
                    }
                )
                .subscribe((status) => {
                    console.log('📡 Real-time subscription status:', status);
                    if (status === 'SUBSCRIBED') {
                        console.log('✅ Real-time leaderboard updates are now active');
                    }
                });

        } catch (error) {
            console.error('❌ Failed to setup real-time subscription:', error);
            // Fallback to polling if real-time fails
            this.startBackupRefresh();
        }
    }

    async handleRealtimeScoreUpdate(payload) {
        try {
            // Refresh the entire leaderboard when a new score is added
            // This ensures we get the latest aggregated stats from player_stats view
            await this.loadLeaderboard();
            
            // Add visual feedback for real-time update
            this.showUpdateNotification();
            
        } catch (error) {
            console.error('❌ Failed to handle real-time score update:', error);
        }
    }

    showUpdateNotification() {
        // Add a subtle visual indicator that the leaderboard was updated
        const leaderboard = document.querySelector('.leaderboard');
        if (leaderboard) {
            leaderboard.classList.add('updated');
            setTimeout(() => {
                leaderboard.classList.remove('updated');
            }, 1000);
        }

        // Show real-time indicator
        const realtimeIndicator = document.getElementById('realtimeIndicator');
        if (realtimeIndicator) {
            realtimeIndicator.classList.add('active');
            setTimeout(() => {
                realtimeIndicator.classList.remove('active');
            }, 2000);
        }

        // Also show a brief notification on title
        const leaderboardTitle = document.querySelector('.leaderboard-title');
        if (leaderboardTitle) {
            const originalText = leaderboardTitle.textContent;
            leaderboardTitle.textContent = '🔄 Updated!';
            leaderboardTitle.style.color = '#4CAF50';
            setTimeout(() => {
                leaderboardTitle.textContent = originalText;
                leaderboardTitle.style.color = '';
            }, 1500);
        }
    }

    async loadLeaderboard() {
        if (!this.isInitialized) {
            console.warn('⚠️ Leaderboard not initialized yet');
            return;
        }

        try {
            // Query top players with their best scores
            const { data, error } = await this.supabase
                .from('player_stats')
                .select('wallet_address, best_score, total_games')
                .order('best_score', { ascending: false })
                .limit(this.maxPlayers);

            if (error) {
                throw error;
            }

            this.currentLeaderboard = data || [];
            this.renderLeaderboard();
            
            console.log(`📊 Loaded ${this.currentLeaderboard.length} players for leaderboard`);
            
        } catch (error) {
            console.error('❌ Failed to load leaderboard:', error);
            this.showFallbackLeaderboard();
        }
    }

    renderLeaderboard() {
        const leaderboardList = document.getElementById('leaderboardList');
        const leaderboardTitle = document.querySelector('.leaderboard-title');
        
        if (!leaderboardList) {
            console.error('❌ Leaderboard container not found');
            return;
        }

        // Update title to show top 10
        if (leaderboardTitle) {
            leaderboardTitle.innerHTML = `🏆 Top ${this.maxPlayers} Players`;
        }

        // Clear existing content
        leaderboardList.innerHTML = '';

        if (this.currentLeaderboard.length === 0) {
            leaderboardList.innerHTML = `
                <div class="leaderboard-item">
                    <span>🎮 No players yet</span>
                    <span>Be the first to play!</span>
                </div>
            `;
            return;
        }

        // Render each player
        this.currentLeaderboard.forEach((player, index) => {
            const position = index + 1;
            const medal = this.getMedalForPosition(position);
            const shortAddress = this.shortenWalletAddress(player.wallet_address);
            
            const leaderboardItem = document.createElement('div');
            leaderboardItem.className = 'leaderboard-item';
            leaderboardItem.innerHTML = `
                <span>${medal} ${shortAddress}</span>
                <span>${player.best_score} points</span>
            `;
            
            // Add special styling for top 3
            if (position <= 3) {
                leaderboardItem.style.background = this.getTopThreeBackground(position);
                leaderboardItem.style.color = '#fff';
                leaderboardItem.style.fontWeight = 'bold';
            }
            
            leaderboardList.appendChild(leaderboardItem);
        });
    }

    getMedalForPosition(position) {
        const medals = {
            1: '🥇',
            2: '🥈', 
            3: '🥉'
        };
        return medals[position] || `#${position}`;
    }

    getTopThreeBackground(position) {
        const backgrounds = {
            1: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', // Gold
            2: 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)', // Silver
            3: 'linear-gradient(135deg, #CD7F32 0%, #B8860B 100%)'  // Bronze
        };
        return backgrounds[position] || 'rgba(0,0,0,0.05)';
    }

    shortenWalletAddress(address) {
        if (!address || address.length < 10) return address;
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    }

    showFallbackLeaderboard() {
        console.log('📋 Showing fallback leaderboard data');
        
        // Show some placeholder data when database is unavailable
        this.currentLeaderboard = [
            { wallet_address: 'Player1...abc', best_score: 150, total_games: 5 },
            { wallet_address: 'Player2...def', best_score: 120, total_games: 3 },
            { wallet_address: 'Player3...ghi', best_score: 90, total_games: 2 },
            { wallet_address: 'Player4...jkl', best_score: 80, total_games: 4 },
            { wallet_address: 'Player5...mno', best_score: 70, total_games: 1 }
        ];
        
        this.renderLeaderboard();
    }

    async addPlayerScore(walletAddress, score) {
        if (!this.isInitialized) {
            console.warn('⚠️ Leaderboard not initialized, cannot add score');
            return;
        }

        try {
            // First, ensure player exists
            const { data: existingPlayer, error: playerError } = await this.supabase
                .from('players')
                .select('id')
                .eq('wallet_address', walletAddress)
                .single();

            let playerId;
            
            if (playerError && playerError.code === 'PGRST116') {
                // Player doesn't exist, create them
                const { data: newPlayer, error: createError } = await this.supabase
                    .from('players')
                    .insert({ wallet_address: walletAddress })
                    .select('id')
                    .single();
                    
                if (createError) throw createError;
                playerId = newPlayer.id;
            } else if (playerError) {
                throw playerError;
            } else {
                playerId = existingPlayer.id;
            }

            // Add the score - this will trigger the real-time subscription
            const { error: scoreError } = await this.supabase
                .from('game_scores')
                .insert({
                    player_id: playerId,
                    score: score
                });

            if (scoreError) throw scoreError;

            console.log(`✅ Added score ${score} for player ${walletAddress} - real-time update will follow`);
            
            // Note: No need to manually refresh here since real-time subscription will handle it
            
        } catch (error) {
            console.error('❌ Failed to add player score:', error);
        }
    }

    startBackupRefresh() {
        // Backup refresh every 5 minutes (in case real-time fails)
        this.updateInterval = setInterval(() => {
            console.log('🔄 Backup leaderboard refresh');
            this.loadLeaderboard();
        }, 300000); // 5 minutes
        
        console.log('🔄 Started backup leaderboard refresh (5min interval)');
    }

    stopBackupRefresh() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
            console.log('⏹️ Stopped backup leaderboard refresh');
        }
    }

    stopRealtimeSubscription() {
        if (this.realtimeSubscription) {
            this.supabase.removeChannel(this.realtimeSubscription);
            this.realtimeSubscription = null;
            console.log('⏹️ Stopped real-time leaderboard subscription');
        }
    }

    async refreshNow() {
        console.log('🔄 Manual leaderboard refresh requested');
        await this.loadLeaderboard();
    }

    // Get current player's rank
    async getPlayerRank(walletAddress) {
        if (!this.isInitialized) return null;

        try {
            const { data, error } = await this.supabase
                .from('player_stats')
                .select('wallet_address, best_score')
                .order('best_score', { ascending: false });

            if (error) throw error;

            const playerIndex = data.findIndex(player => player.wallet_address === walletAddress);
            return playerIndex >= 0 ? playerIndex + 1 : null;
            
        } catch (error) {
            console.error('❌ Failed to get player rank:', error);
            return null;
        }
    }

    // Force immediate refresh (for manual testing)
    async forceRefresh() {
        console.log('🔄 Force refreshing leaderboard');
        await this.loadLeaderboard();
    }

    // Cleanup method
    destroy() {
        this.stopBackupRefresh();
        this.stopRealtimeSubscription();
        this.isInitialized = false;
        console.log('🧹 Leaderboard destroyed');
    }
}

// Create global leaderboard instance
window.leaderboard = new Leaderboard();

export { Leaderboard };
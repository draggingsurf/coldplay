// Main Application Logic for SECRETCOUPLE Surveillance Game
// Handles UI interactions, game state, and page transitions

// Initialize Stagewise Toolbar for development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.port) {
    console.log('🔧 Initializing Stagewise toolbar for development environment');
    
    // Load stagewise toolbar from CDN since local modules don't work with Python server
    const script = document.createElement('script');
    script.type = 'module';
    script.textContent = `
        try {
            console.log('📦 Loading Stagewise toolbar from CDN...');
            const { initToolbar } = await import('https://unpkg.com/@stagewise/toolbar@0.6.2/dist/index.es.js');
            
            console.log('🚀 Initializing Stagewise toolbar...');
            initToolbar({
                plugins: [],
            });
            console.log('✅ Stagewise toolbar initialized successfully');
        } catch (error) {
            console.error('❌ Failed to load Stagewise toolbar:', error);
            console.log('⚠️ Stagewise toolbar not available in this environment');
        }
    `;
    document.head.appendChild(script);
}

class SecretCoupleApp {
    constructor() {
        this.currentPage = 'welcome';
        this.gameState = {
            score: 0,
            timeLeft: 24 * 60 * 60, // 24 hours in seconds
            gameActive: false
        };
        this.wallet = null;
        this.isEligible = false;
        this.freePlayersCount = 1000; // Track free spots
        this.gameTimer = null;
        this.competitionTimer = null;
        this.cameraGameInitialized = false;
        
        this.init();
    }

    async init() {
        console.log('📸 Initializing SECRETCOUPLE Surveillance System');
        
        // Wait for GameIntegration to be ready
        this.waitForGameIntegration();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Update free spots display
        this.updateFreeSpots();
        
        // Start surveillance timer
        this.startCompetitionTimer();
        
        console.log('✅ Surveillance system online');
    }

    waitForGameIntegration() {
        // Check if GameIntegration is ready
        if (window.gameIntegration) {
            this.setupWalletIntegration();
        } else {
            // Wait for GameIntegration to load
            setTimeout(() => this.waitForGameIntegration(), 100);
        }
    }

    setupWalletIntegration() {
        // Override GameIntegration's updateUI to work with our new design
        if (window.gameIntegration) {
            const originalUpdateUI = window.gameIntegration.updateUI;
            window.gameIntegration.updateUI = () => {
                this.handleWalletStateChange();
            };
        }
    }

    setupEventListeners() {
        // Welcome page buttons
        const connectWalletBtn = document.getElementById('connectWalletBtn');
        const playBtn = document.getElementById('playBtn');
        
        // Game page buttons
        const endSessionBtn = document.getElementById('endSessionBtn');
        const disconnectBtn = document.getElementById('disconnectBtn');
        const startGameBtn = document.getElementById('startGameBtn');

        if (connectWalletBtn) {
            connectWalletBtn.addEventListener('click', () => this.connectWallet());
        }

        if (playBtn) {
            playBtn.addEventListener('click', () => this.goToGamePage());
        }

        if (endSessionBtn) {
            endSessionBtn.addEventListener('click', () => this.endSession());
        }

        if (disconnectBtn) {
            disconnectBtn.addEventListener('click', () => this.disconnectWallet());
        }

        if (startGameBtn) {
            startGameBtn.addEventListener('click', () => this.startCameraGame());
        }
    }

    async connectWallet() {
        const connectBtn = document.getElementById('connectWalletBtn');
        const walletStatus = document.getElementById('walletStatus');
        
        connectBtn.disabled = true;
        connectBtn.textContent = '🔄 Connecting...';
        
        try {
            if (window.gameIntegration) {
                await window.gameIntegration.connectWallet();
            } else {
                throw new Error('Game integration not ready');
            }
        } catch (error) {
            console.error('❌ Wallet connection failed:', error);
            this.showWalletStatus('❌ Failed to connect wallet: ' + error.message, 'error');
            connectBtn.disabled = false;
            connectBtn.textContent = '🔗 Connect Wallet';
        }
    }

    handleWalletStateChange() {
        const gameIntegration = window.gameIntegration;
        if (!gameIntegration) return;

        this.wallet = gameIntegration.user;
        this.isEligible = gameIntegration.isEligible || this.freePlayersCount > 0;

        if (this.wallet) {
            this.showWalletConnected();
            // Initialize player stats for the connected wallet
            this.initializePlayerStats();
        } else {
            this.showWalletDisconnected();
        }
    }

    showWalletConnected() {
        const connectBtn = document.getElementById('connectWalletBtn');
        const walletStatus = document.getElementById('walletStatus');
        const playBtn = document.getElementById('playBtn');

        connectBtn.style.display = 'none';
        walletStatus.style.display = 'block';
        
        if (this.isEligible) {
            this.showWalletStatus('✅ Surveillance access granted! Agent cleared for operation.', 'success');
            playBtn.style.display = 'inline-block';
        } else {
            this.showWalletStatus('❌ You need $10 worth of $COUPLE tokens for surveillance access.', 'error');
            playBtn.style.display = 'none';
        }
    }

    showWalletDisconnected() {
        const connectBtn = document.getElementById('connectWalletBtn');
        const walletStatus = document.getElementById('walletStatus');
        const playBtn = document.getElementById('playBtn');

        connectBtn.style.display = 'inline-block';
        connectBtn.disabled = false;
        connectBtn.textContent = '🔗 Connect Wallet';
        walletStatus.style.display = 'none';
        playBtn.style.display = 'none';
    }

    showWalletStatus(message, type) {
        const walletStatus = document.getElementById('walletStatus');
        walletStatus.textContent = message;
        walletStatus.className = `wallet-status wallet-${type === 'success' ? 'connected' : 'insufficient'}`;
    }

    goToGamePage() {
        const welcomePage = document.getElementById('welcomePage');
        const gamePage = document.getElementById('gamePage');
        
        welcomePage.classList.add('hidden');
        gamePage.classList.add('active');
        
        this.currentPage = 'game';
        this.updateStatusMessage('Surveillance system activated. Begin your hunt...');
        
        console.log('📸 Switched to surveillance interface');
    }

    goToWelcomePage() {
        const welcomePage = document.getElementById('welcomePage');
        const gamePage = document.getElementById('gamePage');
        
        welcomePage.classList.remove('hidden');
        gamePage.classList.remove('active');
        
        this.currentPage = 'welcome';
        
        console.log('🏠 Switched to welcome page');
    }

    async disconnectWallet() {
        try {
            if (window.gameIntegration) {
                await window.gameIntegration.disconnectWallet();
            }
            this.updateStatusMessage('Agent disconnected. Surveillance targets remain undetected...');
            
            // Go back to welcome page after a delay
            setTimeout(() => {
                this.goToWelcomePage();
            }, 2000);
            
        } catch (error) {
            console.error('❌ Disconnect failed:', error);
        }
    }

    endSession() {
        if (this.gameState.gameActive) {
            this.stopGame();
        }
        
        this.updateStatusMessage('Surveillance operation terminated. Return when ready to resume hunt.');
        
        // Go back to welcome page after a delay
        setTimeout(() => {
            this.goToWelcomePage();
        }, 2000);
    }

    startCameraGame() {
        console.log('🎥 Starting camera game');
        
        this.gameState.gameActive = true;
        this.gameState.score = 0;
        
        // Hide start button, show game area
        document.getElementById('startGameSection').style.display = 'none';
        document.getElementById('gameArea').style.display = 'block';
        
        // Initialize camera game if not already done
        if (!this.cameraGameInitialized) {
            this.initializeCameraGame();
        }
        
        this.updateScore();
        this.updateStatusMessage('Surveillance camera active. Track targets and expose secret couples!');
        
        // Change start button to restart for next time
        const startBtn = document.getElementById('startGameBtn');
        startBtn.textContent = '🔄 Restart Camera Game';
    }

    async initializeCameraGame() {
        try {
            // Check if camera game is available
            if (window.stadiumGame && window.stadiumGame.init) {
                console.log('✅ Initializing camera game');
                
                // Initialize the camera game
                window.stadiumGame.init();
                this.cameraGameInitialized = true;
                
                // Initialize with session if available
                if (window.gameAPI && window.gameAPI.initializeWithSession && this.wallet) {
                    window.gameAPI.initializeWithSession(this.wallet.id);
                }
                
                console.log('✅ Camera game initialized successfully');
            } else {
                console.error('❌ Camera game not available');
                this.updateStatusMessage('Camera game not available. Please refresh the page.');
            }
        } catch (error) {
            console.error('❌ Error initializing camera game:', error);
            this.updateStatusMessage('Error starting camera game. Please try again.');
        }
    }

    completeGame() {
        this.gameState.gameActive = false;
        this.updateStatusMessage('🎯 MISSION ACCOMPLISHED! Secret couples exposed successfully!');
        
        // Record score
        this.recordScore();
        
        // Show restart option
        document.getElementById('startGameSection').style.display = 'block';
        const startBtn = document.getElementById('startGameBtn');
        startBtn.textContent = '🎮 Play Again';
    }

    stopGame() {
        this.gameState.gameActive = false;
        
        if (this.gameState.score > 0) {
            this.recordScore();
        }
        
        // Hide game area
        document.getElementById('gameArea').style.display = 'none';
        
        // Show start game section again
        document.getElementById('startGameSection').style.display = 'block';
        
        const startBtn = document.getElementById('startGameBtn');
        startBtn.textContent = '🎥 Start Camera Game';
        
        this.updateStatusMessage('Ready to play again!');
    }

    async recordScore() {
        if (this.gameState.score === 0) return;
        
        try {
            // Sync score from camera game
            this.syncScoreFromCameraGame();
            
            // Record score in PlayerStats if wallet is connected
            if (this.wallet && this.wallet.publicKey) {
                const walletAddress = this.wallet.publicKey.toString();
                
                // Record score using PlayerStats
                if (window.playerStats) {
                    await window.playerStats.recordGameScore(walletAddress, this.gameState.score);
                    console.log('✅ Score recorded in database:', this.gameState.score);
                }
            }
            
            // Record score using the existing game API
            if (window.gameAPI && window.gameAPI.endGame) {
                await window.gameAPI.endGame();
            }
            
            console.log('📊 Score recorded for camera game:', this.gameState.score);
            this.updateLeaderboard();
        } catch (error) {
            console.error('❌ Failed to record score:', error);
        }
    }

    updateScore() {
        const scoreDisplay = document.getElementById('scoreDisplay');
        scoreDisplay.textContent = `Your Score: ${this.gameState.score}`;
        
        // Also update camera game score display if it exists
        const cameraScore = document.getElementById('score');
        if (cameraScore) {
            cameraScore.textContent = `Solana: ${this.gameState.score}`;
        }
    }

    // Method to sync score from camera game
    syncScoreFromCameraGame() {
        if (window.stadiumGame && window.stadiumGame.gameState) {
            this.gameState.score = window.stadiumGame.gameState.score;
            this.updateScore();
        }
    }

    updateStatusMessage(message) {
        const statusMessage = document.getElementById('statusMessage');
        statusMessage.textContent = message;
    }

    updateFreeSpots() {
        const freeSpotsElement = document.getElementById('freeSpotsLeft');
        if (freeSpotsElement) {
            freeSpotsElement.textContent = this.freePlayersCount;
        }
    }

    startCompetitionTimer() {
        this.competitionTimer = setInterval(() => {
            this.gameState.timeLeft--;
            this.updateTimerDisplay();
            
            if (this.gameState.timeLeft <= 0) {
                this.endCompetition();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const timerDisplay = document.getElementById('timerDisplay');
        const hours = Math.floor(this.gameState.timeLeft / 3600);
        const minutes = Math.floor((this.gameState.timeLeft % 3600) / 60);
        const seconds = this.gameState.timeLeft % 60;
        
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        timerDisplay.textContent = `Time left: ${timeString}`;
    }

    endCompetition() {
        clearInterval(this.competitionTimer);
        this.updateStatusMessage('🏁 Competition ended! Check the final leaderboard for winners.');
        
        // Disable new games
        this.gameState.gameActive = false;
        
        // Show final results
        this.showFinalResults();
    }

    showFinalResults() {
        // This would show the final leaderboard and reward distribution
        console.log('🏆 Competition ended - showing final results');
    }

    async initializePlayerStats() {
        if (this.wallet && this.wallet.publicKey && window.playerStats) {
            const walletAddress = this.wallet.publicKey.toString();
            await window.playerStats.setCurrentPlayer(walletAddress);
            console.log('✅ Player stats initialized for:', walletAddress);
        }
    }

    updateLeaderboard() {
        // Update leaderboard using the new dynamic system
        if (window.leaderboard) {
            window.leaderboard.refreshNow();
            console.log('📊 Refreshing dynamic leaderboard');
        } else {
            console.log('⚠️ Dynamic leaderboard not available');
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.secretCoupleApp = new SecretCoupleApp();
});

export { SecretCoupleApp };
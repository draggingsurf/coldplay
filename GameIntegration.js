import { supabase } from './supabaseClient.js';

class GameIntegration {
  constructor() {
    this.user = null;
    this.isEligible = false;
    this.walletConnection = null;
    this.gameSession = null;
    this.isInitialized = false;
    this.error = null;

    this.init();
  }

  async init() {
    try {
      console.log('GameIntegration: Starting initialization');
      
      // Initialize wallet connection
      const { WalletConnection } = await import('./WalletConnection.js');
      this.walletConnection = new WalletConnection();
      console.log('GameIntegration: WalletConnection initialized');

      // Listen for wallet connection changes
      this.walletConnection.onUserChange((user, isEligible) => {
        console.log('GameIntegration: User state changed', {
          walletAddress: user?.wallet_address,
          isEligible
        });
        this.user = user;
        this.isEligible = isEligible;
        this.updateUI();
      });

      this.isInitialized = true;
      this.updateUI();
      
      console.log('GameIntegration: Initialization completed successfully');
      
    } catch (error) {
      console.error('GameIntegration: Initialization failed', error);
      this.error = error.message;
      this.updateUI();
    }
  }

  async connectWallet() {
    try {
      console.log('GameIntegration: Attempting to connect wallet');
      
      if (!this.walletConnection) {
        throw new Error('Wallet connection not initialized');
      }
      
      await this.walletConnection.connectWallet();
      console.log('GameIntegration: Wallet connection attempt completed');
      
    } catch (error) {
      console.error('GameIntegration: Error connecting wallet', error);
      alert(`Failed to connect wallet: ${error.message}`);
    }
  }

  async disconnectWallet() {
    try {
      console.log('GameIntegration: Attempting to disconnect wallet');
      
      if (this.walletConnection) {
        await this.walletConnection.disconnectWallet();
        console.log('GameIntegration: Wallet disconnected successfully');
      }
      
    } catch (error) {
      console.error('GameIntegration: Error disconnecting wallet', error);
    }
  }

  async recheckEligibility() {
    try {
      console.log('GameIntegration: Rechecking wallet eligibility');
      
      if (!this.walletConnection) {
        throw new Error('Wallet connection not available');
      }
      
      const isEligible = await this.walletConnection.checkTokenEligibility();
      
      console.log('GameIntegration: Eligibility check completed', { isEligible });
      
      if (isEligible) {
        alert('🎉 Great! You have sufficient SOL balance and are now eligible to play.');
      } else {
        alert('💰 You need at least 0.1 SOL in your wallet to play. Get Devnet SOL from the Solana Faucet.');
      }
      
    } catch (error) {
      console.error('GameIntegration: Error checking eligibility', error);
      alert(`❌ Failed to check SOL balance: ${error.message}`);
    }
  }

  async startGame() {
    console.log('GameIntegration: Attempting to start game');
    
    if (!this.user || !this.isEligible) {
      console.warn('GameIntegration: Cannot start game - missing requirements', {
        hasUser: !!this.user,
        isEligible: this.isEligible
      });
      return;
    }

    try {
      console.log('GameIntegration: Creating new game session', {
        playerId: this.user.id,
        playerWallet: this.user.wallet_address
      });

      // Create a simple game session record
      const { data, error } = await supabase
        .from('players')
        .select('id')
        .eq('wallet_address', this.user.wallet_address)
        .single();

      if (error) {
        console.error('GameIntegration: Failed to verify player', error);
        throw new Error(`Failed to verify player: ${error.message}`);
      }

      // Set a simple session flag
      this.gameSession = { 
        player_id: data.id, 
        start_time: new Date().toISOString() 
      };
      
      console.log('GameIntegration: Game session started', {
        playerId: this.gameSession.player_id
      });

      // Initialize the game
      if (window.gameAPI && window.gameAPI.initializeWithSession) {
        console.log('GameIntegration: Initializing game API');
        window.gameAPI.initializeWithSession(this.gameSession.player_id);
      }

      this.updateUI();

    } catch (err) {
      console.error('GameIntegration: Error starting game', err);
      alert(`Failed to start game: ${err.message}`);
    }
  }

  async endGame() {
    if (!this.gameSession) {
      console.log('GameIntegration: No active game session to end');
      return;
    }

    try {
      console.log('GameIntegration: Ending game session', {
        playerId: this.gameSession.player_id
      });
      
      // End the game locally
      if (window.gameAPI && window.gameAPI.endGame) {
        await window.gameAPI.endGame();
      }

      this.gameSession = null;
      this.updateUI();
      
      console.log('GameIntegration: Game session ended successfully');

    } catch (err) {
      console.error('GameIntegration: Error ending game session', err);
      this.gameSession = null;
      this.updateUI();
    }
  }

  updateUI() {
    const container = document.getElementById('gameIntegrationContainer');
    if (!container) return;

    if (!this.isInitialized) {
      container.innerHTML = `
        <div class="loading">
          <h3>🎮 Initializing Game...</h3>
          <p>Loading wallet integration...</p>
        </div>
      `;
      return;
    }

    if (this.error) {
      container.innerHTML = `
        <div class="error">
          <h3>❌ Initialization Error</h3>
          <p>${this.error}</p>
          <button onclick="location.reload()" class="game-btn">Reload</button>
        </div>
      `;
      return;
    }

    let html = '';

    if (!this.user) {
      html = `
        <div class="wallet-prompt">
          <h3>🔗 Connect Your Wallet</h3>
          <p>Connect your Solana wallet to play the game.</p>
          <button id="connectWalletBtn" class="game-btn">Connect Wallet</button>
        </div>
      `;
    } else if (!this.isEligible) {
      html = `
        <div class="eligibility-prompt">
          <h3>💰 SOL Balance Required</h3>
          <p>You need at least <strong>0.1 SOL</strong> in your wallet to play this game.</p>
          <p><small>Get Devnet SOL from the <a href="https://faucet.solana.com/" target="_blank" style="color: #FFD700;">Solana Faucet</a></small></p>
          <div class="button-group">
            <button id="recheckEligibilityBtn" class="game-btn">Check Balance Again</button>
            <button id="disconnectWalletBtn" class="game-btn secondary">Disconnect</button>
          </div>
        </div>
      `;
    } else {
      html = `
        <div class="game-controls">
          <h3>🎮 Ready to Play!</h3>
          <p>Wallet: ${this.formatWallet(this.user.wallet_address)}</p>
          ${!this.gameSession ? 
            `<button id="startGameBtn" class="game-btn start-btn">🎮 Start Game</button>` :
            `<button id="endGameBtn" class="game-btn end-btn">🛑 End Game</button>`
          }
          <button id="disconnectWalletBtn" class="game-btn secondary">Disconnect Wallet</button>
        </div>
      `;
    }

    container.innerHTML = html;

    // Add event listeners
    this.attachEventListeners();
  }

  formatWallet(address) {
    if (!address || address.length < 10) return address || 'Unknown';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }

  attachEventListeners() {
    const connectBtn = document.getElementById('connectWalletBtn');
    const recheckBtn = document.getElementById('recheckEligibilityBtn');
    const startBtn = document.getElementById('startGameBtn');
    const endBtn = document.getElementById('endGameBtn');
    const disconnectBtn = document.getElementById('disconnectWalletBtn');

    if (connectBtn) {
      connectBtn.addEventListener('click', () => this.connectWallet());
    }

    if (recheckBtn) {
      recheckBtn.addEventListener('click', () => this.recheckEligibility());
    }

    if (startBtn) {
      startBtn.addEventListener('click', () => this.startGame());
    }

    if (endBtn) {
      endBtn.addEventListener('click', () => this.endGame());
    }

    if (disconnectBtn) {
      disconnectBtn.addEventListener('click', () => this.disconnectWallet());
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.gameIntegration = new GameIntegration();
});

export { GameIntegration };

import { supabase } from './supabaseClient.js';
import { SolanaTokenVerifier } from './SolanaTokenVerifier.js';

class WalletConnection {
  constructor() {
    this.user = null;
    this.isEligible = false;
    this.publicKey = null;
    this.wallet = null;
    this.userChangeCallbacks = [];
    this.tokenVerifier = new SolanaTokenVerifier();
    
    this.initWalletDetection();
  }
  
  initWalletDetection() {
    // Check for available wallets
    this.detectWallets();
  }
  
  detectWallets() {
    // Check for Phantom wallet
    if (window.solana && window.solana.isPhantom) {
      this.wallet = window.solana;
      console.log('Phantom wallet detected');
      return 'phantom';
    }
    
    // Check for Solflare wallet
    if (window.solflare && window.solflare.isSolflare) {
      this.wallet = window.solflare;
      console.log('Solflare wallet detected');
      return 'solflare';
    }
    
    // Check for other wallets
    if (window.solana) {
      this.wallet = window.solana;
      console.log('Generic Solana wallet detected');
      return 'generic';
    }
    
    console.log('No Solana wallet detected');
    return null;
  }
  
  // Register callback for when user/eligibility changes
  onUserChange(callback) {
    this.userChangeCallbacks.push(callback);
    // If we already have user data, call the callback immediately
    if (this.user !== null) {
      callback(this.user, this.isEligible);
    }
  }
  
  // Notify all callbacks of user changes
  notifyUserChange() {
    this.userChangeCallbacks.forEach(callback => {
      callback(this.user, this.isEligible);
    });
  }

  async connectWallet() {
    try {
      if (!this.wallet) {
        throw new Error('No Solana wallet found. Please install Phantom or Solflare wallet.');
      }
      
      // Request connection
      const response = await this.wallet.connect();
      this.publicKey = response.publicKey;
      
      console.log('Wallet connected:', this.publicKey.toString());
      
      // Set up disconnect listener
      this.wallet.on('disconnect', () => {
        this.handleDisconnect();
      });
      
      // Check user in database
      await this.checkUserExists();
      
      return this.publicKey.toString();
      
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  }
  
  async disconnectWallet() {
    try {
      if (this.wallet && this.wallet.disconnect) {
        await this.wallet.disconnect();
      }
      
      this.handleDisconnect();
      
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  }
  
  handleDisconnect() {
    this.publicKey = null;
    this.user = null;
    this.isEligible = false;
    this.notifyUserChange();
    console.log('Wallet disconnected');
  }

  async checkUserExists() {
    if (!this.publicKey) return;
    
    const walletAddress = this.publicKey.toString();
    
    try {
      // Check if user exists
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking user:', error);
        throw error;
      }
      
      if (data) {
        // User exists
        this.user = data;
        console.log('Existing user found:', walletAddress);
        
        // Always check SOL eligibility for existing users (in case their balance changed)
        await this.checkTokenEligibility(walletAddress);
      } else {
        // Create new user
        const { data: newUser, error: createError } = await supabase
          .from('players')
          .insert([{ 
            wallet_address: walletAddress,
            created_at: new Date().toISOString()
          }])
          .select()
          .single();
        
        if (createError) {
          console.error('Error creating user:', createError);
          throw createError;
        }
        
        this.user = newUser;
        console.log('New user created:', walletAddress);
        
        // Check SOL eligibility for new user
        await this.checkTokenEligibility(walletAddress);
      }
      
      this.notifyUserChange();
      
    } catch (err) {
      console.error('Error in checkUserExists:', err);
      throw err;
    }
  }
  
  async checkTokenEligibility(walletAddress = null) {
    try {
      const address = walletAddress || this.publicKey?.toString();
      if (!address) {
        throw new Error('No wallet address available');
      }
      
      console.log('🔍 Checking SOL eligibility for:', address);
      
      // Use the SolanaTokenVerifier to check eligibility
      const isEligible = await this.tokenVerifier.verifyTokens(address);
      const tokenBalance = await this.tokenVerifier.getTokenBalance(address);
      
      this.isEligible = isEligible;
      
      console.log(`🎯 SOL eligibility result: ${isEligible}, Balance: ${tokenBalance.toFixed(4)} SOL`);
      
      this.notifyUserChange();
      return isEligible;
        
    } catch (err) {
      console.error('❌ Error checking SOL eligibility:', err);
      this.isEligible = false;
      this.notifyUserChange();
      return false;
    }
  }
  
  isWalletConnected() {
    return this.publicKey !== null && this.wallet !== null;
  }
  
  getWalletAddress() {
    return this.publicKey?.toString() || null;
  }
  
  getWalletType() {
    return this.detectWallets();
  }
}

export { WalletConnection };

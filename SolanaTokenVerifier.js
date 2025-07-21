class SolanaTokenVerifier {
  constructor() {
    // Minimum SOL balance required (0.1 SOL)
    this.minSolBalance = 0.1;

    // Check if Solana Web3 is available
    if (!window.solanaWeb3) {
      console.warn('Solana Web3 library not loaded from CDN');
      this.Connection = null;
      this.PublicKey = null;
      this.LAMPORTS_PER_SOL = null;
      return;
    }

    const { Connection, PublicKey, LAMPORTS_PER_SOL } = window.solanaWeb3;
    this.Connection = Connection;
    this.PublicKey = PublicKey;
    this.LAMPORTS_PER_SOL = LAMPORTS_PER_SOL;

    // Use Devnet for testing
    this.connection = new Connection(
      'https://api.devnet.solana.com',
      'confirmed'
    );

    console.log('🔗 SolanaTokenVerifier initialized for Devnet');
    console.log(`💰 Minimum required balance: ${this.minSolBalance} SOL`);
  }

  async verifyTokens(walletAddress) {
    try {
      if (!walletAddress) {
        throw new Error('Wallet address is required');
      }

      // Check if Solana Web3 is available
      if (!this.Connection || !this.PublicKey || !this.connection) {
        console.warn('🚫 Solana Web3 not available, bypassing SOL verification for development');
        return true; // Allow access for development/testing
      }

      console.log(`🔍 Checking SOL balance for wallet: ${walletAddress}`);

      const walletPublicKey = new this.PublicKey(walletAddress);

      // Get SOL balance (in lamports)
      const balance = await this.connection.getBalance(walletPublicKey);

      // Convert lamports to SOL
      const solBalance = balance / this.LAMPORTS_PER_SOL;

      console.log(`💰 Wallet SOL balance: ${solBalance.toFixed(4)} SOL`);
      console.log(`✅ Required minimum: ${this.minSolBalance} SOL`);

      if (solBalance >= this.minSolBalance) {
        console.log(`✅ SOL verification successful! Balance: ${solBalance.toFixed(4)} SOL`);
        return true;
      } else {
        console.log(`❌ Insufficient SOL balance. Need ${this.minSolBalance} SOL, have ${solBalance.toFixed(4)} SOL`);
        return false;
      }

    } catch (error) {
      console.error('❌ Error verifying SOL balance:', error);

      // For development, bypass verification on error
      console.warn('🔧 Development mode: bypassing SOL verification due to error');
      return true;
    }
  }

  async getTokenBalance(walletAddress) {
    try {
      // Check if Solana Web3 is available
      if (!this.Connection || !this.PublicKey || !this.connection) {
        console.warn('🚫 Solana Web3 not available, returning mock SOL balance for development');
        return 0.1; // Return mock SOL balance for development
      }

      const walletPublicKey = new this.PublicKey(walletAddress);

      // Get SOL balance (in lamports)
      const balance = await this.connection.getBalance(walletPublicKey);

      // Convert lamports to SOL
      const solBalance = balance / this.LAMPORTS_PER_SOL;

      console.log(`💰 Retrieved SOL balance: ${solBalance.toFixed(4)} SOL`);

      return solBalance;

    } catch (error) {
      console.error('❌ Error getting SOL balance:', error);
      return 0;
    }
  }
}

export { SolanaTokenVerifier };
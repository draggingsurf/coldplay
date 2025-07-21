# Coldplay Canoodlers - Production Blockchain Game

## Overview

Coldplay Canoodlers is a production-ready interactive web-based game where players control a virtual camera at a Coldplay concert to find and capture couples in the crowd. The game features full Solana blockchain integration for wallet connection and token verification, with Supabase for backend data storage and real-time leaderboards.

## Features

- **Interactive Gameplay**: Pixel-art style game with smooth camera controls
- **Solana Integration**: Real wallet connection (Phantom, Solflare) with token verification
- **Token-Gated Access**: Requires specific Solana tokens to participate
- **Real-Time Leaderboards**: Live competition tracking with automatic updates
- **Persistent Statistics**: Comprehensive player stats and game history
- **Competition System**: Time-limited competitions with prize pools
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- **Frontend**: Vanilla JavaScript ES6+, HTML5 Canvas, CSS3
- **Backend**: Supabase (PostgreSQL with real-time subscriptions)
- **Blockchain**: Solana (mainnet/devnet support)
- **Wallet Support**: Phantom, Solflare, and other Solana wallets

## Project Structure

```
/
├── assets/                  # Game assets (images, sounds)
├── index.html               # Main application entry point
├── game.js                  # Core game engine and logic
├── supabaseClient.js        # Supabase connection and configuration
├── WalletConnection.js      # Solana wallet integration
├── SolanaTokenVerifier.js   # Token ownership verification
├── GameIntegration.js       # Main integration orchestrator
├── Leaderboard.js           # Real-time leaderboard component
├── CompetitionStatus.js     # Competition tracking component
├── PlayerStats.js           # Player statistics component
├── package.json             # Dependencies and scripts
└── README.md                # This documentation
```

## Database Schema (Supabase)

### Tables

1. **players**
   - `id` (UUID, primary key)
   - `wallet_address` (String, unique)
   - `username` (String, nullable)
   - `is_eligible` (Boolean)
   - `created_at` (Timestamp)

2. **competitions**
   - `id` (UUID, primary key)
   - `name` (String)
   - `status` (String: 'active', 'ended', 'upcoming')
   - `start_time` (Timestamp)
   - `end_time` (Timestamp)
   - `max_participants` (Integer, nullable)
   - `reward_distribution` (JSON)

3. **game_sessions**
   - `id` (UUID, primary key)
   - `player_id` (UUID, foreign key to players.id)
   - `competition_id` (UUID, foreign key to competitions.id)
   - `start_time` (Timestamp)
   - `end_time` (Timestamp, nullable)
   - `final_score` (Integer, default 0)

4. **captures**
   - `id` (UUID, primary key)
   - `session_id` (UUID, foreign key to game_sessions.id)
   - `timestamp` (Timestamp)
   - `points` (Integer, default 10)

5. **leaderboard**
   - `id` (UUID, primary key)
   - `competition_id` (UUID, foreign key to competitions.id)
   - `player_id` (UUID, foreign key to players.id)
   - `current_score` (Integer, default 0)
   - `rank` (Integer)
   - `last_updated` (Timestamp)

### Server Functions

1. **verify_wallet_tokens**
   - Verifies if a wallet holds the required tokens
   - Parameters: `wallet_address`, `contract_address`
   - Returns: Boolean

2. **record_capture**
   - Records a capture during gameplay and updates scores
   - Parameters: `session_uuid`
   - Returns: Success status

3. **end_game_session**
   - Ends a game session and finalizes scores
   - Parameters: `session_uuid`
   - Returns: Success status

## User Flow

1. **Initial Load**
   - User opens the game page
   - Game assets load and the main game screen appears
   - Sidebar shows "Connect Your Wallet to Play" prompt

2. **Wallet Connection**
   - User clicks "Connect Wallet" button
   - Solana wallet popup appears (Phantom, Solflare, etc.)
   - User approves the connection
   - Backend checks if user exists in database
     - If not, creates a new player record
   - Backend verifies token ownership for eligibility

3. **Eligibility Check**
   - If user has required tokens:
     - Shows game controls, competition status, leaderboard, and player stats
   - If user doesn't have required tokens:
     - Shows "Token Required" message
     - User can click "Check Again" to re-verify tokens

4. **Starting a Game**
   - User clicks "Start Game" button
   - Backend creates a new game session in the database
   - Game initializes with the session ID
   - "Start Game" button changes to "End Game"

5. **Gameplay**
   - User controls the camera using mouse movement
   - User clicks to capture couples in the crowd
   - Each successful capture:
     - Increases local score
     - Calls backend to record the capture
     - Updates the score in the database
     - Shows a success message on the jumbotron

6. **Ending a Game**
   - User clicks "End Game" button
   - Backend finalizes the game session
   - Updates leaderboard and player stats
   - "End Game" button changes back to "Start Game"

7. **Viewing Stats and Leaderboard**
   - User can view their current rank and score
   - Leaderboard shows top players in the current competition
   - Competition status shows time remaining and participant count

8. **Disconnecting Wallet**
   - User clicks "Disconnect Wallet" button
   - Wallet connection is terminated
   - UI resets to initial state

## Setup and Installation

1. **Prerequisites**
   - Node.js and npm installed
   - Supabase account and project
   - Solana wallet (Phantom, Solflare, etc.)

2. **Installation**
   ```bash
   # Clone the repository
   git clone https://github.com/yourusername/coldplay-canoodlers.git
   cd coldplay-canoodlers

   # Install dependencies
   npm install
   ```

3. **Configuration**
   - Create a `.env` file with your Supabase credentials
   - Update `supabaseClient.js` with your Supabase URL and anon key
   - Update `SolanaTokenVerifier.js` with your token contract address

4. **Running Locally**
   ```bash
   # Start the development server
   npm run dev
   
   # Or manually with http-server
   npx http-server -p 8080 -o
   
   # Or with Python
   python -m http.server 8080
   ```

5. **Accessing the Game**
   - Open your browser and navigate to `http://localhost:8080`
   - The game will automatically load with full blockchain integration

## Deployment

1. **Frontend Deployment**
   - Deploy the static files to any web hosting service (Netlify, Vercel, GitHub Pages, etc.)

2. **Backend (Supabase) Setup**
   - Create the required tables in your Supabase project
   - Set up Row Level Security policies
   - Create the server-side functions

## Security Considerations

- Implement proper Row Level Security in Supabase
- Validate all user inputs on the server side
- Use secure RPC functions for critical operations
- Never expose private keys or sensitive information

## Future Enhancements

- Mobile responsiveness
- Multiple game modes
- Social sharing features
- NFT rewards for top players
- Enhanced visual effects and animations

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Coldplay for inspiration
- Solana and Supabase for their excellent documentation
- The open-source community for various libraries and tools used in this project
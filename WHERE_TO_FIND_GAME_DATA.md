# Where to Find Game Data in Supabase

## 🚨 Important: You're Looking in the Wrong Place!

The screenshot you shared shows **Supabase Authentication > Users**, but our simplified game **doesn't use Supabase Auth**. 

The "No users in your project" message refers to **authenticated users**, not our game players.

## ✅ Where to Find Game Players and Scores

### Step 1: Go to Table Editor (Not Authentication)

1. In your Supabase dashboard, click **"Table Editor"** in the left sidebar (NOT "Authentication")
2. You should see these tables after running the cleanup script:
   - `players` - Contains wallet addresses of players
   - `game_scores` - Contains final scores when games end

### Step 2: Check if Database Cleanup Was Run

If you don't see the `players` and `game_scores` tables, you need to:

1. Go to **SQL Editor** in Supabase
2. Run the [`database_cleanup_and_setup.sql`](database_cleanup_and_setup.sql) script
3. This will create the correct tables

### Step 3: Test Player Creation

To test if players are being created:

1. **Install a Solana wallet** (Phantom or Solflare browser extension)
2. **Add some Devnet SOL** to your wallet (from https://faucet.solana.com/)
3. **Visit** `http://localhost:8000`
4. **Click "Connect Wallet"** and connect your wallet
5. **Check the `players` table** in Supabase Table Editor

### Step 4: Test Score Recording

To test if scores are being recorded:

1. **Connect wallet** (with 0.1+ SOL)
2. **Click "Start Game"**
3. **Play the game** (find couples and capture them)
4. **Click "End Game"**
5. **Check the `game_scores` table** in Supabase Table Editor

## 🔍 What You Should See

### In `players` table:
```
id                                   | wallet_address                              | created_at
-------------------------------------|---------------------------------------------|------------------
550e8400-e29b-41d4-a716-446655440000 | BRtp2CAJepp7LphjQerCfq9MgHtEAtcXRpvKfqeDhTgh | 2025-01-21 21:30:00
```

### In `game_scores` table:
```
id                                   | player_id                            | score | game_duration | created_at
-------------------------------------|--------------------------------------|-------|---------------|------------------
550e8400-e29b-41d4-a716-446655440001 | 550e8400-e29b-41d4-a716-446655440000 | 50    | 120          | 2025-01-21 21:35:00
```

## 🚫 What NOT to Look For

- **Don't look in Authentication > Users** - Our game doesn't use Supabase Auth
- **Don't expect email/password users** - We only store wallet addresses
- **Don't look for real-time updates** - Data is only written when games end

## 🛠️ Troubleshooting

### If no data appears:

1. **Check console logs** for errors when connecting wallet
2. **Verify database tables exist** in Table Editor
3. **Make sure you have 0.1+ SOL** in your wallet
4. **Try the full flow**: Connect → Start Game → End Game
5. **Check browser console** for any JavaScript errors

### If wallet connection fails:

1. **Install Phantom or Solflare** browser extension
2. **Create a wallet** and get Devnet SOL
3. **Refresh the page** and try again

The game data will appear in the **Table Editor**, not in **Authentication > Users**!
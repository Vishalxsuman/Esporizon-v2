# Esporizon - Complete Feature Documentation & Testing Guide

## Table of Contents
1. [Frontend Features](#frontend-features)
2. [Backend Features](#backend-features)
3. [Host Features](#host-features)
4. [Player Features](#player-features)
5. [Database Schema](#database-schema)
6. [API Testing Scenarios](#api-testing-scenarios)
7. [UI/UX Flow](#uiux-flow)

---

## Frontend Features

### 1. Authentication System
**Location**: `src/pages/AuthPage.tsx`, `src/contexts/AuthContext.tsx`

**Features**:
- Firebase Email/Password authentication
- Google OAuth integration
- JWT token management
- Protected route middleware
- Session persistence

**Testing**:
```bash
# Test Registration
1. Navigate to /auth
2. Click "Sign Up"
3. Enter: email@test.com, password123
4. Verify redirect to dashboard

# Test Login
1. Navigate to /auth
2. Enter registered credentials
3. Verify token in localStorage
4. Check Firebase console for user
```

### 2. Tournament Discovery
**Location**: `src/pages/*.Arena.tsx` (FreeFire, BGMI, Valorant, Minecraft)

**Features**:
- Game-specific arena pages
- 3-tab layout (Upcoming, Ongoing, Completed)
- Tournament filtering by status
- Tournament cards with key details
- "Join Now" modal integration

**Testing**:
```bash
# Access Arenas
- /arena/freefire
- /arena/bgmi
- /arena/valorant
- /arena/minecraft

# Verify Filters
1. Click "Upcoming" tab
2. Verify only upcoming tournaments shown
3. Repeat for Ongoing and Completed
```

### 3. Tournament Registration
**Location**: `src/components/JoinTournamentModal.tsx`

**Features**:
- Solo/Duo/Squad team formation
- Player role assignment
- Wallet balance check
- Entry fee deduction
- Real-time validation

**Testing**:
```bash
# Test Solo Registration
1. Click "Join Now" on tournament
2. Enter IGN (In-Game Name)
3. Select role (e.g., Assaulter)
4. Click Register
5. Verify wallet deducted entry fee

# Test Squad Registration (4 players)
1. Enter Team Name
2. Add 4 player details (Names + Roles)
3. Verify all fields required
4. Submit and check MongoDB
```

### 4. Host Dashboard
**Location**: `src/pages/HostDashboard.tsx`

**Features**:
- Game selection tabs (Free Fire, BGMI, Valorant, Minecraft)
- Quick action cards:
  - Create Tournament
  - Manage Tournaments
  - Reports & Disputes
  - Wallet & Earnings
  - Analytics (Coming Soon)
- Stats overview (Active Tournaments, Players, Revenue)

**Testing**:
```bash
# Access Dashboard
1. Ensure user has host status: localStorage.setItem('user_is_host', 'true')
2. Navigate to /host/dashboard
3. Click game tabs and verify UI updates
4. Click action cards and verify routing
```

### 5. Create Tournament
**Location**: `src/pages/CreateTournament.tsx`

**Features**:
- Prize type selection (Winner-based / Kill-based)
- 98/2 split validation (Player 98%, Platform 2%)
- Prize distribution percentages
- Game-specific room configuration:
  - **Free Fire/BGMI**: Room ID, Password, Match Time
  - **Valorant**: Custom Lobby ID, Match Code
  - **Minecraft**: Server Name, World Name, Game Mode
- Real-time form validation

**Testing**:
```bash
# Create Winner-Based Tournament
1. Navigate to /host/create/freefire
2. Fill: Title, Description, Start Date, Deadline
3. Set Entry Fee: ₹100
4. Select "Winner-Based"
5. Set Distribution: 1st=60%, 2nd=25%, 3rd=13% (Total 98%)
6. Enter Room ID: 12345678, Password: FF2024
7. Submit and verify MongoDB entry

# Create Kill-Based Tournament
1. Follow steps 1-3
2. Select "Kill-Based"
3. Set Per Kill: ₹3
4. Complete and submit
```

### 6. Host Reports
**Location**: `src/pages/HostReports.tsx`

**Features**:
- View all player reports
- Filter by status (All, Open, In Progress, Resolved)
- Message thread view
- Reply to players
- Mark as resolved

**Testing**:
```bash
# View Reports
1. Navigate to /host/reports
2. Click filter buttons and verify filtering
3. Click report card to open details
4. Type reply and click Send
5. Click "Mark as Resolved"
6. Verify status update in MongoDB
```

### 7. Host Wallet
**Location**: `src/pages/HostWallet.tsx`

**Features**:
- Current balance display
- Total earnings tracking
- 2% service fee breakdown
- Transaction history
- Withdrawal button (minimum ₹500)

**Testing**:
```bash
# View Wallet
1. Navigate to /host/wallet
2. Verify balance shows ₹0 initially
3. Publish tournament results
4. Refresh and verify 2% fee credited
5. Check transaction history shows service_fee entry
```

### 8. Wallet Service
**Location**: `src/services/WalletService.ts`

**API Methods**:
- `getWallet(uid)` - Fetch balance and stats
- `depositFunds(uid, amount)` - Add money
- `getTransactionHistory(uid)` - Fetch transactions
- `getWalletStats(uid)` - Get statistics

**Testing**:
```javascript
// Console test
import { walletService } from './services/WalletService';
const uid = 'user123';
await walletService.depositFunds(uid, 500); // Add ₹500
const wallet = await walletService.getWallet(uid);
console.log(wallet.balance); // Should be 500
```

---

## Backend Features

### 1. Authentication Middleware
**Location**: `backend-standalone/src/middleware/auth.js`

**Features**:
- Firebase JWT token verification
- User extraction from token
- Protected route enforcement

**Testing**:
```bash
# Test Protected Route
curl http://localhost:5000/api/wallet \
  -H "Authorization: Bearer invalid_token"
# Expected: 401 Unauthorized

curl http://localhost:5000/api/wallet \
  -H "Authorization: Bearer <valid_firebase_token>"
# Expected: 200 with wallet data
```

### 2. Tournament Creation
**Location**: `backend-standalone/src/controllers/tournament.controller.js`

**Validation Logic**:
```javascript
// Prize Distribution Validation
if (prizeType === 'winner') {
    const total = first + second + third;
    if (Math.abs(total - 98) > 0.01) {
        return error('Distribution must sum to 98%');
    }
}

// Game Room Validation
if (game === 'freefire' && !roomId) {
    return error('Room ID required for Free Fire');
}
```

**Testing**:
```bash
# Valid Tournament
curl -X POST http://localhost:5000/api/tournaments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "game": "freefire",
    "title": "Pro Tournament",
    "entryFee": 100,
    "prizeType": "winner",
    "prizeDistribution": {"first": 60, "second": 25, "third": 13},
    "gameRoomConfig": {"roomId": "12345678", "password": "FF2024"}
  }'

# Invalid Distribution (99% total)
# Expected: 400 error "Must sum to 98%"
```

### 3. Tournament Registration
**Location**: `backend-standalone/src/controllers/tournament.controller.js`

**Process**:
1. Check tournament not full
2. Check user not already registered
3. Find/create user wallet
4. Verify sufficient balance
5. Debit entry fee (atomic transaction)
6. Add player to tournament
7. Commit or rollback transaction

**Testing**:
```bash
# Successful Registration
curl -X POST http://localhost:5000/api/tournaments/<tournamentId>/register \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "teamName": "Team Alpha",
    "players": [
      {"userId": "user123", "userName": "Player1", "role": "Assaulter"}
    ]
  }'

# Insufficient Balance
# 1. Create wallet with ₹50
# 2. Try registering for ₹100 tournament
# Expected: 400 "Insufficient wallet balance"
```

### 4. Result Publishing & Auto-Credit
**Location**: `backend-standalone/src/controllers/result.controller.js`

**Auto-Wallet Flow**:
```javascript
// Calculate prize pool
const totalPrizePool = entryFee * currentSlots;
const playerShare = totalPrizePool * 0.98; // 98%
const platformFee = totalPrizePool * 0.02; // 2%

// Credit host wallet
await hostWallet.credit(platformFee, 'service_fee', `2% from ${tournamentTitle}`);

// Credit winners
if (prizeType === 'winner') {
    await winnerWallet.credit(
        playerShare * (first / 100),
        'prize_win',
        `1st place ${tournamentTitle}`
    );
}
```

**Testing**:
```bash
# Publish Results
1. Create tournament: 10 players × ₹100 = ₹1000 pool
2. Publish results with winners
3. Check wallets:
   - Host: +₹20 (2%)
   - 1st place (60%): +₹588 (60% of ₹980)
   - 2nd place (25%): +₹245
   - 3rd place (13%): +₹127

# MongoDB Query
db.wallets.find({ firebaseUid: 'host_uid' })
// Verify balance increased by ₹20
```

### 5. Report System
**Location**: `backend-standalone/src/controllers/report.controller.js`

**Features**:
- Create report (player → host)
- View reports (host/player specific)
- Add replies to message thread
- Update status (open, in_progress, resolved)

**Testing**:
```bash
# Create Report
curl -X POST http://localhost:5000/api/reports \
  -H "Authorization: Bearer <player_token>" \
  -d '{
    "tournamentId": "tour123",
    "issueType": "room_access",
    "subject": "Room ID not working",
    "message": "Cannot join with provided Room ID"
  }'

# Add Reply (Host)
curl -X POST http://localhost:5000/api/reports/<reportId>/reply \
  -H "Authorization: Bearer <host_token>" \
  -d '{"message": "Please check password: FF2024"}'

# Mark Resolved
curl -X PATCH http://localhost:5000/api/reports/<reportId>/status \
  -H "Authorization: Bearer <host_token>" \
  -d '{"status": "resolved"}'
```

### 6. Wallet Operations
**Location**: `backend-standalone/src/controllers/wallet.controller.js`

**Endpoints**:
- `GET /api/wallet` - Get balance, stats, recent transactions
- `POST /api/wallet/deposit` - Add funds
- `GET /api/wallet/transactions` - Paginated history
- `GET /api/wallet/stats` - Total deposited/earned/spent

**Testing**:
```bash
# Deposit
curl -X POST http://localhost:5000/api/wallet/deposit \
  -H "Authorization: Bearer <token>" \
  -d '{"amount": 1000}'

# Get Wallet
curl http://localhost:5000/api/wallet \
  -H "Authorization: Bearer <token>"

# Response:
{
  "balance": 1000,
  "totalDeposited": 1000,
  "totalEarned": 0,
  "totalSpent": 0,
  "transactions": [...]
}
```

---

## Database Schema

### Wallet Model
```javascript
{
  userId: ObjectId,
  firebaseUid: String,
  balance: Number (default: 0),
  totalDeposited: Number,
  totalEarned: Number (prizes + fees),
  totalSpent: Number (entry fees),
  transactions: [{
    type: String (deposit, entry_fee, prize_win, service_fee),
    amount: Number,
    tournamentId: ObjectId,
    description: String,
    status: String,
    metadata: Mixed,
    createdAt: Date
  }]
}
```

### Report Model
```javascript
{
  tournamentId: ObjectId,
  reporterId: ObjectId,
  reporterFirebaseUid: String,
  playerName: String,
  hostId: ObjectId,
  hostFirebaseUid: String,
  issueType: String (room_access, result_dispute, payment_issue),
  subject: String,
  status: String (open, in_progress, resolved, closed),
  messages: [{
    senderId: ObjectId,
    senderFirebaseUid: String,
    senderName: String,
    senderType: String (player, host),
    message: String,
    timestamp: Date
  }],
  resolvedAt: Date,
  resolvedById: ObjectId
}
```

### Tournament Model (Enhanced)
```javascript
{
  // Core fields
  title, description, game, status, mode,
  entryFee, prizePool, slots, startDate, registrationDeadline,
  
  // Prize Configuration
  prizeType: String (winner, kill),
  perKillAmount: Number,
  platformFeePercentage: Number (default: 2),
  prizeDistribution: {
    first: Number,
    second: Number,
    third: Number
  },
  
  // Game Room Configuration
  gameRoomConfig: {
    roomId: String,
    password: String,
    matchTime: Date,
    customLobbyId: String,
    serverName: String,
    worldName: String,
    gameMode: String
  },
  
  // Results
  resultsPublished: Boolean,
  resultsPublishedAt: Date,
  
  // Participants
  registeredPlayers: [...]
}
```

---

## Complete Testing Scenarios

### Scenario 1: End-to-End Tournament Flow
```bash
# 1. Host creates tournament
POST /api/tournaments
{
  "game": "bgmi",
  "title": "BGMI Pro Series",
  "entryFee": 50,
  "maxSlots": 20,
  "prizeType": "winner",
  "prizeDistribution": {"first": 60, "second": 25, "third": 13},
  "gameRoomConfig": {"roomId": "87654321", "password": "BGMI2024"}
}

# 2. Player deposits money
POST /api/wallet/deposit
{"amount": 500}

# 3. Player registers
POST /api/tournaments/<id>/register
{"teamName": "Alpha", "players": [...]}

# 4. Verify wallet deducted
GET /api/wallet
// balance: 450 (₹500 - ₹50)

# 5. Host publishes results
POST /api/results/publish
{"tournamentId": "<id>", "winners": [...]}

# 6. Verify auto-credits
GET /api/wallet (Player)
// balance: 450 + prize amount

GET /api/wallet (Host)
// balance: 0 + (50 × 20 × 0.02) = ₹20
```

### Scenario 2: Dispute Resolution Flow
```bash
# 1. Player creates report
POST /api/reports
{
  "tournamentId": "<id>",
  "issueType": "room_access",
  "subject": "Cannot join room",
  "message": "Room ID says invalid"
}

# 2. Host views reports
GET /api/reports/host?status=open

# 3. Host replies
POST /api/reports/<reportId>/reply
{"message": "Room ID updated to 99999999"}

# 4. Player replies back
POST /api/reports/<reportId>/reply  
{"message": "Working now, thanks!"}

# 5. Host marks resolved
PATCH /api/reports/<reportId>/status
{"status": "resolved"}
```

---

## UI/UX Flow Diagrams

### Player Journey
```
Landing Page → Browse Arena → Select Tournament → Join Modal →
Wallet Check → Register → Await Start → View Room Details →
Play → View Results → Receive Prize
```

### Host Journey
```
Host Dashboard → Create Tournament → Configure Prize & Room →
Publish → Monitor Registrations → Start Tournament →
Upload Results → AI Verification → Publish Results →
Receive 2% Fee → Resolve Disputes
```

---

## Known Limitations & Future Enhancements

### Current Limitations
- AI result extraction not yet connected
- Withdrawal to bank account (UI only)
- Mobile app pending
- Live streaming integration pending

### Planned Features
- [ ] AI result extraction service integration
- [ ] Real-time tournament updates (WebSockets)
- [ ] Sponsor management module
- [ ] Advanced analytics with charts
- [ ] Email notifications for events
- [ ] SMS alerts for room details
- [ ] Refund automation

---

## Production Checklist

Before deploying to production:

- [ ] Environment variables configured
- [ ] MongoDB indexes created
- [ ] Firebase project in production mode
- [ ] CORS origins restricted
- [ ] Rate limiting enabled
- [ ] Error logging setup (Sentry)
- [ ] MongoDB backups automated
- [ ] SSL certificates installed
- [ ] CDN configured for static assets
- [ ] Load testing completed
- [ ] Security audit passed

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-18  
**Maintained By**: Esporizon Development Team

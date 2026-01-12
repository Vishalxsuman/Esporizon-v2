# Esporizon V2 - Premium Esports Platform

A high-performance, real-time esports platform featuring competitive card games, chess, and social features, migrated to GitHub Pages with modern authentication and CDN-based asset delivery.

## 🚀 System Architecture

- **Hosting:** GitHub Pages (Static Hosting)
- **Authentication:** [Clerk](https://clerk.com) (OIDC / OAuth 2.0) - **SOLE AUTH PROVIDER**
- **Assets:** [Cloudinary](https://cloudinary.com/) (Image Uploads)
- **Data Persistence:** Firebase Firestore (Posts, Likes, Comments, Game State, Tournaments)
- **CI/CD:** GitHub Actions (`.github/workflows/deploy.yml`)

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + Framer Motion
- **Icons:** Lucide React
- **Notifications:** React Hot Toast
- **Game Logic:** Custom TypeScript Game Engines (Card 29, Chess)

## 🔐 Security & Architecture

- **Clerk Auth Only:** Firebase Auth is NOT used. All user identity is managed by Clerk.
- **Firestore Data:** Security rules enforce read/write access based on Clerk User IDs.
- **Stateless Frontend:** SPA architecture with client-side routing.
- **Zero Trust:** Backend-less design relying on robust Firestore rules.

## 📦 Deployment Guide

### Environment Variables
Create a `.env` file in the root using `VITE_` prefix:
```env
# Clerk
VITE_CLERK_PUBLISHABLE_KEY=...

# Firebase (Firestore Only)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
# ... other firebase config
```

### Build & Deploy
1. Push to the `main` branch.
2. GitHub Actions will build (`npm run build`) and deploy to GitHub Pages.
3. Custom domain `esporizon.in` is configured via the `public/CNAME` file.

## 📁 Project Structure

```
esporizon/
├── .github/workflows/  # Deployment automation
├── public/             # CNAME, 404.html, and favicon
├── src/
│   ├── components/     # UI Components (GameHeader, PlayerSeat, SocialFeed, etc.)
│   ├── contexts/       # Auth & Theme providers
│   ├── hooks/          # Custom hooks (Game State, Bots, Audio)
│   ├── pages/          # Application views (Dashboard, Card29Game, ChessGame, etc.)
│   ├── services/       # Firebase & Game Logic (MatchService, WalletService)
│   ├── types/          # TypeScript definitions
│   └── utils/          # Helper functions
└── Images/             # Static game posters
```

## 🎮 Features

### Core Platform
- **Cinematic Landing Page:** Modern hero section with glassmorphism effects.
- **Interactive Dashboard:** 3:4 vertical game posters with live indicators and real-time wallet updates.
- **Wallet System:** Simulated balance and transactions via `localStorage` (migrating to Firestore).
- **Social Nexus:** Real-time social feed with posts, likes, comments, and user search.
- **Profile System:** Custom attributes, stats tracking, and avatar management.
- **Tournament System:** Create, join, and manage tournaments with automated bracket generation (frontend mocked).

### 🃏 29 Card Game (Flagship)
- **Complete Rule Set:** Full bidding mechanic (16-28), trump selection, and strict trick-taking rules.
- **Advanced UI/UX:**
  - Glassmorphism Game Header with round/trick tracking.
  - "Last Hand" history overlay.
  - Interactive table animations for card plays.
  - Smart trump reveal mechanics with "pop-out" card.
- **Multiplayer Engine:**
  - Real-time firestore syncing (sub-second latency).
  - Robust reconnection handling.
  - Server-synced 30s turn timers.
- **Intelligence:**
  - Smart Bots for practice mode (3s delay).
  - "Double" and "Redouble" challenge phases.

### ♟️ Chess
- **Online Multiplayer:** Quick matchmaking and invite system.
- **Bot Integration:** Play against AI engine.
- **Standard Rules:** Checkmate, stalemate, and move validation.

### 🎨 Color Prediction (Win Go)
- **Multiple Game Modes:** 30s, 1 Min, 3 Min, and 5 Min rounds.
- **Backend Engine:** Standalone Express.js server with period management and result generation.
- **Real-Time Betting:** Place bets on colors (Red/Green/Violet), numbers (0-9), or size (Big/Small).
- **Server-Synced Timer:** Backend authority ensures fair round cycles (Betting → Locked → Result → New Round).
- **Automated Payouts:** 1.95x for colors/size, 9x for exact numbers, special rates for 0/5.
- **History & Chart:** Browse up to 100 past results with pagination (10 per page).
- **Mobile Optimized:** Compact Game Balance card and responsive UI for all screen sizes.

### 🏆 Tournaments & Matchmaking
- **Guest Access:** instant play with simple room codes—no login required for casual matches.
- **Public Lobbies:** Browse and join open games.
- **Private Rooms:** Invite friends via 6-digit codes.
- **Spectator Mode:** (Planned) Watch live high-stakes matches.

---

🎮 **ESPO V2 - Powering the next generation of esports.**
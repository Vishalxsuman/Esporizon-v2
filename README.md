# Esporizon V2 - Premium Esports Platform

A high-performance, static esports platform migrated to GitHub Pages with modern authentication and CDN-based asset delivery.

## 🚀 System Architecture

- **Hosting:** GitHub Pages (Static Hosting)
- **Authentication:** [Clerk](https://clerk.com) (OIDC / OAuth 2.0) - **SOLE AUTH PROVIDER**
- **Assets:** [Cloudinary](https://cloudinary.com/) (Image Uploads)
- **Data Persistence:** Firebase Firestore (Posts, Likes, Comments)
- **CI/CD:** GitHub Actions (`.github/workflows/deploy.yml`)

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + Framer Motion
- **Icons:** Lucide React
- **Notifications:** React Hot Toast

## 🔐 Security & Architecture

- **Clerk Auth Only:** Firebase Auth is NOT used. All user identity is managed by Clerk.
- **Firestore Data:** Posts, likes, and comments are stored in Firestore.
- **Stateless Frontend:** No backend server required.

## 📦 Deployment Guide

### Environment Variables
Create a `.env` file in the root using `VITE_` prefix:
```env
# Clerk
VITE_CLERK_PUBLISHABLE_KEY=...

# Firebase (Firestore Only)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...
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
│   ├── components/     # UI Components
│   ├── contexts/       # Auth & Theme providers
│   ├── pages/          # Application views
│   ├── services/       # LocalStorage data logic
│   └── types/          # TypeScript definitions
└── Images/             # Static game posters
```

## 🎮 Features

- **Cinematic Landing Page:** Modern hero section with glassmorphism.
- **Interactive Dashboard:** 3:4 vertical game posters with live indicators.
- **Wallet System:** Simulated balance and transactions via `localStorage`.
- **Social Feed:** Real-time post simulation with local persistence.
- **Tournament Management:** Static tournament listings with join/create mocks.

---

🎮 **ESPO V2 - Powering the next generation of esports.**
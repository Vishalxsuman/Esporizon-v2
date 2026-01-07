# Esporizon V2 - Premium Esports Platform

A high-performance, static esports platform migrated to GitHub Pages with modern authentication and CDN-based asset delivery.

## 🚀 System Architecture

- **Hosting:** GitHub Pages (Static Hosting)
- **Authentication:** [Clerk](https://clerk.com) (OIDC / OAuth 2.0)
- **Assets:** [jsDelivr](https://www.jsdelivr.net/) (CDN for static images)
- **Data Persistence:** `localStorage` (Wallet & Post simulation)
- **CI/CD:** GitHub Actions (`.github/workflows/deploy.yml`)

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + Framer Motion
- **Icons:** Lucide React
- **Notifications:** React Hot Toast

## 🔐 Security Features

- **Clerk Auth:** Secure, industry-standard authentication.
- **Stateless Architecture:** Minimizes server-side vulnerabilities by leveraging static hosting.
- **Client-Side Simulation:** Wallet operations and posts are managed via `localStorage` for a zero-server prototype.

## 📦 Deployment Guide

### Environment Variables
Create a `.env` file in the root:
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

### Build & Deploy
1. Push to the `main` branch.
2. GitHub Actions will build (`npm run build`) and deploy to GitHub Pages.
3. Custom domain `esporison.in` is configured via the `public/CNAME` file.

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
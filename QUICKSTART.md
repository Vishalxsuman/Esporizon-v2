# ESPO V2 - Quick Start Guide

## 🚀 Get Your Live Link in 5 Minutes

This guide will take you from localhost to a live GitHub Pages URL: `https://esporison.in` (using your custom domain).

---

## Prerequisites

- Node.js 18+ installed
- GitHub Account
- Clerk Account (for Authentication)

---

## Step-by-Step Deployment

### 1. Setup Clerk (2 mins)

1. Sign up/Log in to [Clerk](https://clerk.com).
2. Create a new application named `ESPO V2`.
3. Choose `Email` and `Google` as authentication providers.
4. Copy your **Publishable Key**.
5. Create a `.env` file in the project root:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
   ```

---

### 2. Install Dependencies (1 min)

```bash
# Install dependencies
npm install
```

---

### 3. Local Development (1 min)

```bash
# Run locally
npm run dev
```

Visit `http://localhost:5173` to see your app.

---

### 4. Configure GitHub Repository (1 min)

1. Push your code to a GitHub repository.
2. Go to your repo **Settings** → **Secrets and variables** → **Actions**.
3. Add a new secret:
   - **Name:** `VITE_CLERK_PUBLISHABLE_KEY`
   - **Value:** (Your Clerk Publishable Key)

---

### 5. Deploy to GitHub Pages

Once you push to the `main` branch, the GitHub Action in `.github/workflows/deploy.yml` will automatically build and deploy your site.

**Deployment URLs:**
- Website: `https://esporison.in` (once CNAME is propagated)
- GitHub Pages: `https://[YourUsername].github.io/Esporizon-v2/`

---

## 🔧 Architecture Summary

- **Hosting:** GitHub Pages (Static)
- **Auth:** Clerk (Social & Email)
- **Data:** `localStorage` (Wallet, Posts simulation)
- **Assets:** jsDelivr CDN (`https://cdn.jsdelivr.net/gh/[Username]/[Repo]@main/Images/`)

---

## Bug Fix: SPA 404 on Refresh

We have included a `public/404.html` script to handle the "404 on Refresh" issue common with React on GitHub Pages. This allows you to reload any page (e.g., `/dashboard`) without losing the routing context.

---

🎮 **Happy Gaming!**

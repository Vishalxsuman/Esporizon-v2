# ESPO V 2 - Quick Start Guide

## 🚀 Get Your Live Link in 10 Minutes

This guide will take you from localhost to a live Firebase Hosting URL: `https://esporizon-1dd37.web.app`

---

## Prerequisites

- Node.js 18+ installed
- Firebase project: `esporizon-1dd37` (already created)
- Firebase Service Account JSON (get from Firebase Console)

---

## Step-by-Step Deployment

### 1. Setup Environment Variables (2 mins)

```bash
# Navigate to project
cd "d:/ESPO V 2"

# Create frontend .env from template
copy .env.example .env

# Create backend .env from template  
copy server\.env.example server\.env
```

**Edit `server/.env`** and replace the `FIREBASE_SERVICE_ACCOUNT` placeholder with your actual Service Account JSON:

**How to get Service Account JSON:**
1. Go to https://console.firebase.google.com/project/esporizon-1dd37/settings/serviceaccounts/adminsdk
2. Click "Generate new private key"
3. Open downloaded JSON file
4. Copy entire content and paste it as a single line in `server/.env`

---

### 2. Install Dependencies (1 min)

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

---

### 3. Install Firebase CLI (1 min)

```bash
npm install -g firebase-tools
firebase login
```

A browser window will open - sign in with your Google account.

---

### 4. Build Frontend (1 min)

```bash
npm run build
```

This creates a production-ready `dist` folder.

---

### 5. Deploy to Firebase Hosting (1 min)

```bash
# Deploy using the automated script
npm run deploy:market

# OR manually:
# firebase deploy --only hosting
```

**Expected Output:**
```
✔ Deploy complete!

Hosting URL: https://esporizon-1dd37.web.app
```

---

### 6. Deploy Backend (3 mins)

**Option A: Railway (Recommended - Easiest)**

1. Go to https://railway.app and sign up
2. Click "New Project" → "Deploy from GitHub"
3. Connect your GitHub account and select your repo
4. In Railway dashboard:
   - Add environment variable: `NODE_ENV=production`
   - Add environment variable: `FIREBASE_SERVICE_ACCOUNT=<your-service-account-json>`
5. Railway will auto-deploy and give you a URL like: `https://espo-api.railway.app`

**Option B: Render.com**

1. Go to https://render.com → "New +" → "Web Service"
2. Connect GitHub repo
3. Configure:
   - **Build Command:** `cd server && npm install`
   - **Start Command:** `cd server && node index.js`
4. Add environment variables in Render dashboard
5. Deploy → get URL like: `https://espo-api.onrender.com`

---

### 7. Update Frontend API URL (30 seconds)

Edit `.env` and update with your backend URL:

```env
VITE_API_BASE_URL=https://your-backend.railway.app/api
```

**Important:** Rebuild and redeploy after changing .env!

```bash
npm run build
npm run deploy:market
```

---

### 8. Enable Firebase Authentication (1 min)

1. Go to Firebase Console → Authentication → Get Started
2. Enable these providers:
   - ✅ Email/Password
   - ✅ Google (add your email as test user)
3. Verify authorized domain includes: `esporizon-1dd37.web.app`

---

### 9. Set Firestore Security Rules (30 seconds)

Copy the rules from `README.md` (Step 9 in Production Roadmap) and paste into:

Firebase Console → Firestore Database → Rules → Publish

---

### 10. Test Your Live Site! 🎉

Visit: **https://esporizon-1dd37.web.app**

**Complete User Flow Test:**
1. Sign up with email or Google ✅
2. View Dashboard ✅  
3. Check wallet balance ✅
4. Try Color Prediction game ✅
5. Join a tournament ✅

---

## 🔧 Development Commands

```bash
# Run frontend locally
npm run dev
# Opens on http://localhost:3000

# Run backend locally (in separate terminal)
npm run server:dev
# Opens on http://localhost:5000

# Build for production
npm run build

# Preview production build locally
npm run preview

# Deploy to Firebase Hosting
npm run deploy:market
```

---

## ⚡ Quick Redeploy

**Frontend only:**
```bash
npm run deploy:market
```

**Backend only:**
- Railway/Render: Just `git push` (auto-deploys)
- Heroku: `git push heroku main`

---

## 🐛 Troubleshooting

### "Firebase config not found" error
- Ensure `.env` file exists in root directory
- Run `npm run build` again

### API calls failing (CORS errors)
- Update `server/index.js` CORS to allow your production domain:
  ```javascript
  app.use(cors({
    origin: 'https://esporizon-1dd37.web.app',
    credentials: true
  }))
  ```
- Redeploy backend

### Authentication not working
- Check Firebase Console → Authentication → Settings → Authorized domains
- Ensure `esporizon-1dd37.web.app` is listed

### Wallet operations failing
- Verify backend environment variables are set correctly
- Check backend logs for Firebase Admin errors
- Ensure Service Account JSON is valid

---

## 📊 Monitor Your App

- **Firebase Console:** https://console.firebase.google.com/project/esporizon-1dd37
- **Backend Logs:** Check Railway/Render dashboard
- **Performance:** Firebase Console → Performance tab
- **Analytics:** Firebase Console → Analytics tab

---

## 🎯 Post-Deployment Checklist

- [ ] Frontend live at `https://esporizon-1dd37.web.app`
- [ ] Backend deployed and accessible
- [ ] Email/Password authentication works
- [ ] Google sign-in works
- [ ] Wallet operations (add funds) work
- [ ] Color Prediction game functional
- [ ] Tournament grid loads
- [ ] No CORS errors in browser console
- [ ] Mobile responsive (test on phone)

---

## 📚 More Resources

- **Full Documentation:** See `README.md`
- **Security Details:** See `SECURITY_AUDIT.md`
- **Setup Guide:** See `SETUP.md`
- **Firebase Docs:** https://firebase.google.com/docs

---

**Your Live URLs:**
- Frontend: `https://esporizon-1dd37.web.app`
- Backend: `https://your-backend-url.railway.app`
- Firebase Console: `https://console.firebase.google.com/project/esporizon-1dd37`

🎮 **Happy Gaming!**

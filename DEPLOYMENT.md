# ESPO V 2 - Deployment Options

---

## 🚀 Option 1: GitHub Pages (esporizon.in)

**Current Setup:** GitHub Pages with custom domain `esporizon.in`

### ✅ Prerequisites Completed

- [x] Repository: Public (Vishalxsuman/Esporizon-v2)
- [x] Build configuration: Updated with `base: '/'`
- [x] CNAME file: Located at `public/CNAME` → copies to `dist/CNAME`
- [x] GitHub Actions workflow: Configured in `.github/workflows/deploy.yml`

---

### Step 1: Add GitHub Actions Secrets

Go to: `https://github.com/Vishalxsuman/Esporizon-v2/settings/secrets/actions`

Click **New repository secret** and add these 7 secrets from your `.env` file:

| Secret Name | Value (from .env) |
|-------------|------------------|
| `VITE_CLERK_PUBLISHABLE_KEY` | pk_test_... |
| `VITE_FIREBASE_API_KEY` | AIza... |
| `VITE_FIREBASE_AUTH_DOMAIN` | esporizon-1dd37.firebaseapp.com |
| `VITE_FIREBASE_PROJECT_ID` | esporizon-1dd37 |
| `VITE_FIREBASE_STORAGE_BUCKET` | esporizon-1dd37.appspot.com |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | 123... |
| `VITE_FIREBASE_APP_ID` | 1:123... |

---

### Step 2: Configure DNS Records in GoDaddy

**CRITICAL:** Site will NOT work until DNS is configured.

Login to GoDaddy → Manage Domains → esporizon.in → DNS Management

**Add 4 A Records (Delete old ones if any):**
```
Type: A
Name: @
Value: 185.199.108.153
TTL: 600 seconds (10 minutes)
```

Repeat for these 3 additional IPs:
- `185.199.109.153`
- `185.199.110.153`
- `185.199.111.153`

**Add 1 CNAME Record:**
```
Type: CNAME
Name: www
Value: Vishalxsuman.github.io
TTL: 1 Hour
```

**Save all changes.** DNS propagation: 5-60 minutes.

---

### Step 3: Deploy to GitHub Pages

```powershell
# Ensure all changes are committed
git status
git add .
git commit -m "Configure GitHub Pages with custom domain"
git push origin main
```

**Watch the deployment:**
1. Go to: `https://github.com/Vishalxsuman/Esporizon-v2/actions`
2. Wait for green checkmark (~2-3 minutes)
3. Click on the workflow run to see details

---

### Step 4: Configure Custom Domain in GitHub

**ONLY do this AFTER DNS records are configured in GoDaddy.**

1. Go to: `https://github.com/Vishalxsuman/Esporizon-v2/settings/pages`
2. Under "Source" → Select: **GitHub Actions**
3. Under "Custom domain":
   - Enter: `esporizon.in`
   - Click **Save**
   - Wait for "DNS check successful" ✅ (may take 5-10 minutes)
4. Once DNS verifies, check the box: **Enforce HTTPS**

---

### Step 5: Verify Live Site

**Wait 15-75 minutes total for:**
- GitHub Actions build (2-3 min)
- DNS propagation (5-60 min)
- SSL certificate generation (5-15 min)

**Then visit:**
```
https://esporizon.in
```

**Test checklist:**
- [ ] Site loads without errors
- [ ] Authentication works (Clerk)
- [ ] Dashboard displays
- [ ] All routes work (tournaments, profile, etc.)
- [ ] No console errors
- [ ] Mobile responsive

---

### 🔄 Quick Redeploy (After Initial Setup)

```powershell
# After making code changes
git add .
git commit -m "Description of changes"
git push origin main
# GitHub Actions will auto-deploy
```

---

## 🚀 Option 2: Firebase Hosting (Alternative)

## 🚀 Final Deployment Steps

### Step 1: Verify Environment Files

Ensure these files exist and are properly configured:

```powershell
# Frontend environment (should already exist)
cat .env

# Backend environment (should already exist)  
cat server/.env
```

**Required in `server/.env`:**
- `FIREBASE_SERVICE_ACCOUNT` with actual Service Account JSON

If you need to add it:
1. Get from: https://console.firebase.google.com/project/esporizon-1dd37/settings/serviceaccounts/adminsdk
2. Click "Generate new private key"
3. Open the JSON file and copy entire content
4. Paste as single line in `server/.env`

---

### Step 2: Deploy Backend (Choose One Platform)

#### Option A: Railway (Recommended - Easiest)

```powershell
# 1. Sign up at https://railway.app
# 2. Click "New Project" → "Deploy from GitHub"
# 3. Connect your GitHub repo
# 4. In Railway dashboard, add environment variables:
#    - NODE_ENV = production
#    - FIREBASE_SERVICE_ACCOUNT = <your-service-account-json>
#    - PORT will be auto-set by Railway
# 5. Railway will give you a URL like: https://espo-api.railway.app
```

#### Option B: Render

```powershell
# 1. Go to https://render.com → "New +" → "Web Service"
# 2. Connect GitHub repo
# 3. Configure:
#    Build Command: cd server && npm install
#    Start Command: cd server && node index.js
# 4. Add environment variables in dashboard
# 5. Get URL like: https://espo-api.onrender.com
```

#### Option C: Heroku

```powershell
# Install Heroku CLI first
heroku login
heroku create esporizon-api

# Deploy server
cd server
git init
git add .
git commit -m "Deploy server"
git remote add heroku https://git.heroku.com/esporizon-api.git
git push heroku main

# Set environment variables
heroku config:set FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
heroku config:set NODE_ENV=production

cd ..
```

---

### Step 3: Update Frontend API URL

After deploying backend, update `.env` with your backend URL:

```env
# Change this line:
VITE_API_BASE_URL=https://your-backend-url.railway.app/api

# Examples:
# Railway: https://espo-api.railway.app/api
# Render: https://espo-api.onrender.com/api  
# Heroku https://esporizon-api.herokuapp.com/api
```

**IMPORTANT: Rebuild after changing .env!**

```powershell
npm run build
```

---

### Step 4: Install Firebase CLI

```powershell
# Install globally
npm install -g firebase-tools

# Login to Firebase
firebase login
```

A browser window will open - sign in with your Google account.

---

### Step 5: Deploy to Firebase Hosting

```powershell
# One command deployment!
npm run deploy:market
```

**Expected Output:**
```
> esporizon@1.0.0 deploy:market
> npm run build && firebase deploy --only hosting

✓ 359 modules transformed
✓ built in 2.61s

=== Deploying to 'esporizon-1dd37'...

✔ Deploy complete!

Project Console: https://console.firebase.google.com/project/esporizon-1dd37/overview
Hosting URL: https://esporizon-1dd37.web.app
```

---

### Step 6: Enable Firebase Authentication

1. Go to https://console.firebase.google.com/project/esporizon-1dd37/authentication
2. Click "Get Started"
3. Enable these sign-in methods:
   - ✅ **Email/Password** → Enable
   - ✅ **Google** → Enable, add your test email
4. Verify authorized domain includes: `esporizon-1dd37.web.app`

---

### Step 7: Set Firestore Security Rules

1. Go to https://console.firebase.google.com/project/esporizon-1dd37/firestore/rules
2. Paste these production-ready rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Wallets - users can read their own, only server can write
    match /wallets/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false; // Server-only with Admin SDK
    }
    
    // Transactions - users can read their own
    match /transactions/{transactionId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow write: if false; // Server-only
    }
    
    // Matches - all authenticated users can read
    match /matches/{matchId} {
      allow read: if request.auth != null;
      allow write: if false; // Admin-only
    }
  }
}
```

3. Click "Publish"

---

### Step 8: Configure Backend CORS (Optional but Recommended)

Update `server/index.js` to restrict CORS to production domain:

```javascript
// Replace: app.use(cors())
// With:
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://esporizon-1dd37.web.app'
    : '*',
  credentials: true
}))
```

Redeploy backend after this change.

---

### Step 9: Test Complete User Flow 🎉

Visit: **https://esporizon-1dd37.web.app**

✅ **Checklist:**
- [ ] Sign up with email and password works
- [ ] Sign in with Google OAuth works
- [ ] Dashboard loads with wallet balance
- [ ] Add funds button works (requires backend)
- [ ] Color Prediction game functions
- [ ] Tournament grid displays matches
- [ ] No CORS errors in browser console
- [ ] Mobile responsive (test on phone)

---

## 🔧 Quick Redeploy Commands

**Frontend only (after UI changes):**
```powershell
npm run deploy:market
```

**Backend only (after API changes):**
- Railway/Render: Just `git push` (auto-deploys)
- Heroku: `git push heroku main`

**Full redeploy (both):**
```powershell
# Frontend
npm run deploy:market

# Backend - depends on platform
git push  # Railway/Render
git push heroku main  # Heroku
```

---

## 📊 Your Live URLs

After deployment:

- **Frontend:** `https://esporizon-1dd37.web.app`
- **Backend:** `https://your-backend.railway.app`
- **Firebase Console:** `https://console.firebase.google.com/project/esporizon-1dd37`

---

## 🐛 Troubleshooting

### Build fails with "Firebase not found"
```powershell
# Clear cache and rebuild
rm -rf node_modules/.vite
rm -rf dist
npm install
npm run build
```

### API calls fail with CORS errors
- Update CORS configuration in `server/index.js`
- Redeploy backend
- Clear browser cache

### Authentication doesn't work on deployed site
- Check Firebase Console → Authentication → Settings → Authorized domains
- Ensure `esporizon-1dd37.web.app` is listed

### Wallet operations fail
- Verify backend environment variables are set correctly
- Check backend logs for Firebase Admin errors
- Ensure `FIREBASE_SERVICE_ACCOUNT` is valid JSON

---

## 🎯 Success Criteria

✅ All items should be checked:

- [ ] Production build completes without errors
- [ ] Frontend deployed to Firebase Hosting
- [ ] Backend deployed to chosen platform
- [ ] Environment variables configured correctly
- [ ] Firebase Authentication enabled (Email + Google)
- [ ] Firestore security rules published
- [ ] Live site accessible at `https://esporizon-1dd37.web.app`
- [ ] Complete user flow tested
- [ ] No errors in browser console
- [ ] Mobile responsive verified

---

**Congratulations! Your esports platform is now live! 🎮🎉**

# Production Deployment Checklist

## 🎯 Quick Reference for Future Deployments

This checklist ensures that environment variables are correctly injected and the production build works on GitHub Pages.

---

## Pre-Deployment Checklist

### 1. Environment File Verification
```bash
# Ensure .env file exists
ls -la .env

# Verify it contains production API URL
cat .env | grep VITE_API_BASE_URL
```

Expected output:
```
VITE_API_BASE_URL=https://api.esporizon.in
```

### 2. Code Quality
- [ ] All TypeScript compilation errors resolved
- [ ] No `process.env.*` usage in frontend code (use `import.meta.env.*` instead)
- [ ] No hardcoded `localhost` URLs
- [ ] All env vars prefixed with `VITE_`

---

## Build Process

### 1. Clean Previous Build
```bash
# Remove old dist folder
rm -rf dist

# Windows PowerShell
Remove-Item -Path "dist" -Recurse -Force -ErrorAction SilentlyContinue
```

### 2. Run Production Build
```bash
npm run build
```

Expected output:
```
✓ 2163 modules transformed.
✓ built in X.XXs
```

### 3. Verify Build Output
```bash
# Check dist folder exists
ls dist/

# Check for production API URL in built files
grep -r "api.esporizon.in" dist/

# Windows PowerShell
Get-ChildItem -Path "dist" -Filter "*.js" -Recurse | Select-String -Pattern "api.esporizon.in"
```

**Expected**: Should find `https://api.esporizon.in` in JavaScript bundles

### 4. Verify No Localhost References
```bash
# Check for localhost (should only be in error messages)
grep -r "localhost:5000" dist/

# Windows PowerShell
Get-ChildItem -Path "dist" -Filter "*.js" -Recurse | Select-String -Pattern "localhost:5000"
```

**Expected**: Zero results OR only in error message text (acceptable)

---

## Deployment to GitHub Pages

### 1. Stage Changes
```bash
# Add rebuilt dist folder
git add dist/

# Add any code changes
git add src/
```

### 2. Commit with Descriptive Message
```bash
git commit -m "deploy: production build with env vars [build-date]

- Rebuilt with VITE_API_BASE_URL=https://api.esporizon.in
- Verified production API URL in bundles
- Ready for GitHub Pages deployment"
```

### 3. Push to Main Branch
```bash
git push origin main
```

### 4. Monitor Deployment
- Go to: https://github.com/Vishalxsuman/Esporizon-v2/actions
- Wait for green checkmark (2-5 minutes)
- Check deployments: https://github.com/Vishalxsuman/Esporizon-v2/deployments

---

## Post-Deployment Verification

### 1. Site Load Test
Open https://esporizon.in in **incognito mode**:
- [ ] Site loads without white screen
- [ ] No console errors in DevTools (F12)
- [ ] Landing page displays correctly

### 2. Environment Variable Check
Open DevTools → Console:
- [ ] **No** "VITE_API_BASE_URL is not defined" error
- [ ] **No** red errors related to API configuration

### 3. Network Inspection
Open DevTools → Network tab → XHR/Fetch:
- [ ] All API requests show `https://api.esporizon.in` domain
- [ ] No requests to `localhost:5000`
- [ ] API responses return expected status codes (200, 201, etc.)

### 4. CORS Verification
In Network tab:
- [ ] No CORS errors in console
- [ ] API requests include proper headers
- [ ] Responses have `Access-Control-Allow-Origin` header

### 5. Feature Testing
Test core functionality:
- [ ] **Login**: Firebase authentication works
- [ ] **Dashboard**: Tournament data loads
- [ ] **Wallet**: Balance displays and updates
- [ ] **Tournaments**: List appears with correct data
- [ ] **Feed**: Social feed fetches posts
- [ ] **Profile**: User data loads correctly

---

## Troubleshooting Common Issues

### Issue 1: "VITE_API_BASE_URL is not defined"

**Cause**: Environment variable not injected during build

**Fix**:
1. Verify `.env` file exists: `cat .env`
2. Ensure it contains: `VITE_API_BASE_URL=https://api.esporizon.in`
3. Rebuild: `npm run build`
4. Verify injection: `grep -r "api.esporizon.in" dist/`

### Issue 2: API calls going to localhost

**Cause**: Old build or `.env.development` overriding

**Fix**:
1. Delete dist: `rm -rf dist`
2. Ensure `.env` has production URL
3. Rebuild: `npm run build`
4. Push fresh build to GitHub

### Issue 3: CORS errors

**Cause**: Backend not allowing `esporizon.in` origin

**Fix**: Update backend CORS configuration:
```javascript
const allowedOrigins = [
  'https://esporizon.in',
  'https://www.esporizon.in',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
```

Then restart backend: `pm2 restart all`

### Issue 4: GitHub Pages shows old version

**Cause**: Browser cache or GitHub Pages delay

**Fix**:
1. Wait 5 minutes for deployment
2. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
3. Test in incognito mode
4. Clear browser cache

### Issue 5: Custom domain not working

**Cause**: DNS or GitHub Pages configuration

**Fix**:
1. Verify CNAME file in dist: `cat dist/CNAME`
2. Should contain: `esporizon.in`
3. Check GitHub Pages settings → Custom domain
4. Verify DNS records:
   - A records pointing to GitHub Pages IPs
   - CNAME record for `www` subdomain

---

## Environment Variable Rules for Vite

### ✅ DO:
1. Prefix all client-side env vars with `VITE_`
2. Use `import.meta.env.VITE_*` in code
3. Put production values in `.env` file
4. Rebuild after ANY env var change
5. Verify built files contain correct values

### ❌ DON'T:
1. Use `process.env.*` in frontend code (Node.js only)
2. Rely on `.env.production` alone (can be flaky)
3. Expect runtime env loading with GitHub Pages
4. Use un-prefixed env vars (won't be exposed to client)
5. Deploy without verifying built files

---

## Quick Command Reference

### Development
```bash
# Start dev server (uses .env.development)
npm run dev

# Check what env vars are available
# Add this temporarily in your code:
console.log(import.meta.env)
```

### Production Build
```bash
# Clean, build, verify
rm -rf dist && npm run build && grep -r "api.esporizon.in" dist/
```

### Deployment
```bash
# Full deployment workflow
git add dist/ src/
git commit -m "deploy: production build $(date +'%Y-%m-%d')"
git push origin main
```

### Verification
```bash
# Check deployment status
curl -I https://esporizon.in

# Test API endpoint
curl https://api.esporizon.in/health
```

---

## Emergency Rollback

If production breaks after deployment:

```bash
# Revert to previous commit
git revert HEAD

# Or reset to specific commit
git reset --hard <previous-commit-hash>

# Force push (use with caution)
git push origin main --force

# Wait 2-5 minutes for GitHub Pages to redeploy
```

---

## Backend CORS Configuration

### Expected CORS Setup

File: `backend/src/server.js` or similar

```javascript
const express = require('express');
const cors = require('cors');

const app = express();

const allowedOrigins = [
  'https://esporizon.in',
  'https://www.esporizon.in',
  'http://localhost:3000',  // for local dev
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
```

### Restart Backend After CORS Changes

```bash
# SSH into AWS Lightsail
ssh user@api.esporizon.in

# If using PM2
pm2 restart all
pm2 logs --lines 50

# If using systemd
sudo systemctl restart esporizon-api

# If running directly
pkill node
node backend/src/server.js &
```

---

## Success Criteria

Your deployment is successful when:

- [x] Site loads at https://esporizon.in without errors
- [x] No "VITE_API_BASE_URL is not defined" in console
- [x] All API calls go to https://api.esporizon.in
- [x] Login works
- [x] Wallet, tournaments, feed all functional
- [x] No CORS errors
- [x] No localhost references in Network tab

---

## Notes

- **Always test in incognito** to avoid cache issues
- **Wait 2-5 minutes** after pushing for GitHub Pages to deploy
- **Monitor GitHub Actions** for deployment failures
- **Check backend logs** if API calls fail
- **Keep this checklist updated** as deployment process evolves

---

**Last Updated**: 2026-01-20  
**Next Review**: After any major infrastructure changes

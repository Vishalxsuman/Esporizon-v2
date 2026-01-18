# Esporizon - Testing Checklist

## ✅ Pre-Testing Setup

### Backend
- [ ] MongoDB is running (`mongod` or `sudo service mongod start`)
- [ ] Backend server is running on port 5000 (`cd backend-standalone && npm run dev`)
- [ ] Backend health check passes: `curl http://localhost:5000/health`

### Frontend
- [ ] Frontend is running on port 5173 (`npm run dev`)
- [ ] No build errors in console
- [ ] Firebase configuration is set in .env

---

## 🧪 Test Cases

### 1. Authentication Flow
**Sign Up**
- [ ] Navigate to signup page
- [ ] Enter email and password
- [ ] Click "Sign Up"
- [ ] Verify user is created
- [ ] Verify redirect to dashboard

**Sign In**
- [ ] Navigate to signin page
- [ ] Enter credentials
- [ ] Click "Sign In"
- [ ] Verify login successful
- [ ] Verify wallet balance appears

**Google Sign In**
- [ ] Click "Sign in with Google"
- [ ] Select Google account
- [ ] Verify login successful

---

### 2. Wallet Operations

**Deposit Funds**
1. [ ] Click on wallet icon in navbar OR navigate to `/wallet`
2. [ ] Click "Buy ESPO Coins"
3. [ ] Enter amount: 500
4. [ ] Click "Confirm Purchase"
5. [ ] Verify success toast appears: "₹500 Added to Deployment Fund"
6. [ ] Verify balance updates to show +500
7. [ ] Check transaction history shows deposit

**Expected Result**: Balance should increase by 500 coins

**Alternative Test**:
- [ ] Open browser console (F12)
- [ ] Type: `localStorage.setItem('wallet_balance', '1000')`
- [ ] Refresh page
- [ ] Verify balance shows ₹1000

---

### 3. Tournament System

**View Tournaments**
1. [ ] Navigate to Free Fire arena `/arena/freefire`
2. [ ] Verify tournaments load
3. [ ] Click on "Upcoming" tab
4. [ ] Verify upcoming tournaments display
5. [ ] Click on "Live Now" tab
6. [ ] Verify ongoing tournaments display
7. [ ] Click on "Completed" tab
8. [ ] Verify completed tournaments display

**Join Tournament (Free)**
1. [ ] Find a FREE tournament (Entry Fee: ₹0)
2. [ ] Click "Register Now"
3. [ ] Fill in team/player name
4. [ ] Agree to terms
5. [ ] Click through steps
6. [ ] Click "Confirm & Join"
7. [ ] Verify success message
8. [ ] Check browser console for API call

**Expected API Call**:
```
POST http://localhost:5000/api/tournaments/{id}/register
Body: { teamName: "...", players: [...] }
```

**Join Tournament (Paid)**
1. [ ] Ensure wallet has sufficient balance (>= entry fee)
2. [ ] Find a tournament with entry fee (e.g., ₹50)
3. [ ] Click "Register Now"
4. [ ] Fill in details
5. [ ] Proceed to payment step
6. [ ] Verify balance check passes
7. [ ] Click "Pay & Join"
8. [ ] Verify wallet deduction
9. [ ] Verify registration success

---

### 4. Navigation & UI

**Header Navigation**
- [ ] Click "Play Hub" - navigates to `/play`
- [ ] Click arena cards - navigate to respective arenas
- [ ] Click profile icon - shows dropdown
- [ ] Click wallet - navigates to `/wallet`

**Mobile Navigation**
- [ ] Open on mobile viewport (DevTools: F12 → Toggle device toolbar)
- [ ] Verify bottom nav bar appears
- [ ] Click each nav item
- [ ] Verify pages load correctly

**Theme Toggle** (if implemented)
- [ ] Find theme toggle button
- [ ] Click to switch theme
- [ ] Verify colors change
- [ ] Refresh page
- [ ] Verify theme persists

---

### 5. Backend API Testing (Terminal)

**Health Check**
```bash
curl http://localhost:5000/health
# Expected: {"status":"OK"}
```

**Get Wallet Balance**
```bash
curl http://localhost:5000/api/wallet \
  -H "user-id: test-user-123"
# Expected: {"success":true,"balance":0}
```

**Deposit Funds**
```bash
curl -X POST http://localhost:5000/api/wallet/deposit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-token" \
  -H "user-id: test-user-123" \
  -H "user-role: player" \
  -d '{"amount":500}'
# Expected: {"success":true,"message":"Deposited 500 coins...","balance":500}
```

**List Tournaments**
```bash
curl http://localhost:5000/api/tournaments
# Expected: {"success":true,"count":...,"data":[...]}
```

---

### 6. Error Handling

**Insufficient Balance**
1. [ ] Set wallet balance to 0
2. [ ] Try to join paid tournament (₹50)
3. [ ] Verify error: "Insufficient balance"
4. [ ] Verify redirect to wallet page works

**Duplicate Registration**
1. [ ] Join a tournament
2. [ ] Try joining same tournament again
3. [ ] Verify error: "Already registered" or similar

**Network Error**
1. [ ] Stop backend server
2. [ ] Try any API operation
3. [ ] Verify error message displays
4. [ ] Start backend again
5. [ ] Verify functionality resumes

---

### 7. Host Features

**Become a Host**
1. [ ] Click "Create Tournament" on any arena
2. [ ] If not host, verify redirect to host benefits
3. [ ] Follow flow to become host
4. [ ] Verify localStorage: `user_is_host` = 'true'

**Create Tournament**
1. [ ] Ensure user is host
2. [ ] Click "Create Tournament"
3. [ ] Fill in all required fields
4. [ ] Click "Create"
5. [ ] Verify tournament appears in listings

---

## 🐛 Known Issues to Fix

- [ ] If wallet API fails, frontend should show error
- [ ] Tournament registration should update "Registered Players" count
- [ ] Host dashboard should show managed tournaments

---

## 📊 Success Criteria

✅ **All test cases pass**
✅ **No console errors during normal flow**
✅ **API calls succeed with 200 status**
✅ **UI is responsive on mobile**
✅ **Wallet deposit/deduct works correctly**
✅ **Tournament join flow completes successfully**

---

## 🚀 Ready for GitHub Checklist

- [ ] All tests pass
- [ ] `.gitignore` properly configured
- [ ] No sensitive data in code (.env files ignored)
- [ ] README.md is comprehensive
- [ ] QUICKSTART.md guide is clear
- [ ] No build/compile errors
- [ ] Code is commented where necessary
- [ ] Package.json has correct dependencies

---

**Last Updated**: 2026-01-18
**Tester**: _________________

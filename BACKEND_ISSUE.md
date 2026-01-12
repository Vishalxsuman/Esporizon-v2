# Backend Issue: Game Mode Not Being Handled

## Problem Identified

The backend API at `http://65.2.33.69:5000/api/current-period` is **ignoring the `gameType` parameter** and always returning 1-minute game data.

### Evidence

Testing all game types shows they return identical data:

```bash
# Request for 30-second game
GET /api/current-period?gameType=30s
Response: {"periodId":"1m-1768176782999","gameType":"1m","remainingSeconds":16}

# Request for 1-minute game
GET /api/current-period?gameType=1m  
Response: {"periodId":"1m-1768176782999","gameType":"1m","remainingSeconds":12}

# Request for 3-minute game
GET /api/current-period?gameType=3m
Response: {"periodId":"1m-1768176782999","gameType":"1m","remainingSeconds":4}
```

**Problem**: All requests return `gameType=1m` regardless of what was requested.

---

## Root Cause

The backend `/api/current-period` endpoint likely:
1. Is not reading the `gameType` query parameter
2. Or is hardcoded to only handle 1-minute games
3. Or has a bug where it defaults to '1m' when gameType is not recognized

---

## Required Backend Fix

The backend must be updated to properly handle all game types. Here's what needs to be checked:

### 1. Verify Query Parameter Reading

```javascript
// Backend should read gameType from request
app.get('/api/current-period', (req, res) => {
  const gameType = req.query.gameType; // Should be '30s', '1m', '3m', or '5m'
  console.log('Received gameType:', gameType);
  
  // Then lookup period for that specific game type
  const periodData = getCurrentPeriodForGameType(gameType);
  res.json(periodData);
});
```

### 2. Check Game Type Mapping

The backend needs to maintain separate game instances for each mode:
- `30s` → 30-second rounds
- `1m` → 1-minute rounds  
- `3m` → 3-minute rounds
- `5m` → 5-minute rounds

Each should have its own:
- Period ID format (e.g., `30s-timestamp`, `1m-timestamp`, `3m-timestamp`)
- Timer countdown
- Result generation
- History

### 3. Verify Database/Storage Structure

If using Firestore/database, ensure periods are stored separately by game type:
```
periods/
  30s/
    current: { periodId: "30s-...", remainingSeconds: 25 }
  1m/
    current: { periodId: "1m-...", remainingSeconds: 55 }
  3m/
    current: { periodId: "3m-...", remainingSeconds: 175 }
  5m/
    current: { periodId: "5m-...", remainingSeconds: 295 }
```

---

## Frontend Status

✅ **Frontend is correctly implemented:**
- UI mode '30s' → maps to `WIN_GO_30S` → API requests `gameType=30s`
- UI mode '1min' → maps to `WIN_GO_1_MIN` → API requests `gameType=1m`
- UI mode '3min' → maps to `WIN_GO_3_MIN` → API requests `gameType=3m`
- UI mode '5min' → maps to `WIN_GO_5_MIN` → API requests `gameType=5m`

The frontend is sending the correct parameters. The issue is 100% on the backend not responding with different data for each game type.

---

## Temporary Workaround

If you need to deploy now and can only support 1-minute games:

1. Hide other game modes from the UI:
   ```typescript
   // In ColorPrediction.tsx
   const GAME_MODES: GameMode[] = [
     { id: '1min', label: 'Win Go 1 Min', duration: 60 },
     // Hide others until backend supports them
   ];
   ```

2. Add a notice: "Other game modes coming soon"

---

## Testing After Backend Fix

Once the backend is fixed, verify each mode works independently:

```bash
# Each should return different periodId and gameType
curl "http://65.2.33.69:5000/api/current-period?gameType=30s"
curl "http://65.2.33.69:5000/api/current-period?gameType=1m"
curl "http://65.2.33.69:5000/api/current-period?gameType=3m"
curl "http://65.2.33.69:5000/api/current-period?gameType=5m"
```

Expected responses should have matching gameType:
- `gameType=30s` → `{"periodId":"30s-...", "gameType":"30s", ...}`
- `gameType=1m` → `{"periodId":"1m-...", "gameType":"1m", ...}`
- etc.

---

## Contact Backend Team

The backend needs to:
1. Read the `gameType` query parameter correctly
2. Maintain separate game sessions for each mode
3. Return the correct `gameType` in the response
4. Generate different `periodId` prefixes for each mode

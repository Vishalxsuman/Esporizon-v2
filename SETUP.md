# Esporizon Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### 2. Firebase Setup

#### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project named "Esporizon"
3. Enable **Authentication** (Email/Password and Google)
4. Enable **Firestore Database** (start in test mode for development)

#### Step 2: Get Client Config
1. Go to Project Settings → General
2. Scroll to "Your apps" section
3. Click "Web" icon (</>) to add a web app
4. Copy the Firebase configuration object

#### Step 3: Get Service Account Key
1. Go to Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Download the JSON file
4. Copy the entire JSON content

### 3. Environment Variables

#### Frontend (.env in root)
Create `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_API_BASE_URL=http://localhost:5000/api
```

#### Backend (server/.env)
Create `.env` file in the `server` directory:

```env
PORT=5000
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}
```

**Important**: Paste the entire service account JSON as a single-line string.

### 4. Firestore Security Rules (Development)

For development, use these rules in Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Wallets - users can only read their own wallet
    match /wallets/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false; // Only server can write
    }
    
    // Transactions - users can only read their own transactions
    match /transactions/{transactionId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow write: if false; // Only server can write
    }
    
    // Matches - all authenticated users can read
    match /matches/{matchId} {
      allow read: if request.auth != null;
      allow write: if false; // Only server can write
    }
    
    // Color Predictions - users can read all, write only their own
    match /colorPredictions/{predictionId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update, delete: if false;
    }
  }
}
```

### 5. Run the Application

#### Terminal 1: Frontend
```bash
npm run dev
```
Frontend will run on `http://localhost:3000`

#### Terminal 2: Backend
```bash
npm run server:dev
```
Backend will run on `http://localhost:5000`

### 6. Test the Application

1. Open `http://localhost:3000`
2. Click "Join Tournament" or "View Dashboard"
3. Sign up with email/password or Google
4. You'll be redirected to the Dashboard
5. Test wallet operations (they require server to be running)

## Troubleshooting

### Firebase Admin Initialization Error
- Ensure `FIREBASE_SERVICE_ACCOUNT` is a valid JSON string
- Check that the service account has proper permissions
- Verify the JSON is on a single line (no line breaks)

### CORS Errors
- Ensure the backend server is running
- Check that `VITE_API_BASE_URL` matches the backend URL
- Verify CORS is enabled in `server/index.js`

### Authentication Issues
- Verify Firebase Authentication is enabled
- Check that Email/Password and Google providers are enabled
- Ensure `.env` file has correct Firebase config

### Wallet Operations Failing
- Ensure backend server is running
- Check that user is authenticated (token in headers)
- Verify Firestore security rules allow server writes
- Check server logs for detailed error messages

## Production Deployment

### Frontend (Vercel/Netlify)
1. Build: `npm run build`
2. Deploy `dist` folder
3. Set environment variables in hosting platform

### Backend (Railway/Heroku/Render)
1. Deploy `server` folder
2. Set environment variables:
   - `PORT` (auto-set by platform)
   - `FIREBASE_SERVICE_ACCOUNT` (as JSON string)
3. Update `VITE_API_BASE_URL` in frontend to production URL

### Firestore Security Rules (Production)
Update rules to be more restrictive:
- Add rate limiting
- Add validation for data types
- Restrict read access based on user roles
- Add audit logging

## Next Steps

1. **Add Real Tournament Data**: Connect to actual tournament APIs
2. **Implement Payment Gateway**: Add Razorpay/Paytm for wallet top-ups
3. **Add Match Streaming**: Integrate live match streams
4. **Implement Leaderboards**: Add tournament leaderboards
5. **Add Notifications**: Implement push notifications for match updates
6. **Performance Monitoring**: Add analytics and error tracking

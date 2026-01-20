const admin = require('firebase-admin');
const User = require('../models/User.model');

/**
 * Initialize Firebase Admin SDK
 * Supports both environment variable (JSON string) and file-based service account key
 */
let firebaseInitialized = false;

function initializeFirebaseAdmin() {
    if (firebaseInitialized) return;

    try {
        let serviceAccount;

        // Option 1: Environment variable with JSON string
        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            try {
                serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
                if (process.env.NODE_ENV !== 'production') {

                    console.log('✅ Using Firebase service account from environment variable');

                }
            } catch (parseError) {
                console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', parseError.message);
                throw parseError;
            }
        }
        // Option 2: File-based service account key
        else if (require('fs').existsSync('serviceAccountKey.json')) {
            serviceAccount = require('../serviceAccountKey.json');
            if (process.env.NODE_ENV !== 'production') {

                console.log('✅ Using Firebase service account from serviceAccountKey.json');

            }
        }
        // Option 3: No Firebase Admin SDK available
        else {
            if (process.env.NODE_ENV !== 'production') {

                console.warn('⚠️ No Firebase Admin SDK credentials found');

            }
            if (process.env.NODE_ENV !== 'production') {

                console.warn('   Set FIREBASE_SERVICE_ACCOUNT_KEY env var or create serviceAccountKey.json');

            }
            if (process.env.NODE_ENV !== 'production') {

                console.warn('   Firebase token verification is DISABLED');

            }
            return;
        }

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });

        firebaseInitialized = true;
        if (process.env.NODE_ENV !== 'production') {

            console.log('✅ Firebase Admin SDK initialized successfully');

        }
    } catch (error) {
        console.error('❌ Firebase Admin SDK initialization failed:', error.message);
        if (process.env.NODE_ENV !== 'production') {

            console.warn('   Continuing without Firebase authentication');

        }
    }
}

// Initialize on module load
initializeFirebaseAdmin();

/**
 * Middleware: Verify Firebase ID Token
 * Attaches user info to req.user if token is valid
 */
const verifyFirebaseToken = async (req, res, next) => {
    try {
        // If Firebase Admin is not initialized, skip auth (development mode)
        if (!firebaseInitialized) {
            if (process.env.NODE_ENV !== 'production') {

                console.warn('⚠️ Firebase auth skipped - Admin SDK not initialized');

            }
            // Fall back to header-based mock auth for development
            const lookupId = req.headers['user-id'] || 'MOCK_USER_ID';
            const dbUser = await User.findOne({ id: lookupId });

            req.user = {
                id: lookupId,
                username: dbUser?.username || 'MockPlayer',
                displayName: dbUser?.profile?.displayName || 'Mock Player',
                avatarUrl: dbUser?.profile?.avatarUrl || '',
                role: dbUser?.role || req.headers['user-role'] || 'player',
                isHost: dbUser?.role === 'host' || req.headers['user-role'] === 'host',
                subscriptionActive: req.headers['user-sub'] === 'true'
            };
            return next();
        }

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No authorization token provided'
            });
        }

        const idToken = authHeader.split('Bearer ')[1];

        // Timeout protection for Firebase verification (5 seconds max)
        const verifyPromise = admin.auth().verifyIdToken(idToken);
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Firebase verification timeout')), 5000)
        );

        const decodedToken = await Promise.race([verifyPromise, timeoutPromise]);

        // Fetch user from database to get actual role
        const dbUser = await User.findOne({ id: decodedToken.uid });

        // Attach user info to request
        req.user = {
            id: decodedToken.uid,
            email: decodedToken.email,
            username: dbUser?.username || decodedToken.name || 'User',
            displayName: dbUser?.profile?.displayName || decodedToken.name || 'User',
            avatarUrl: dbUser?.profile?.avatarUrl || decodedToken.picture || '',
            role: dbUser?.role || 'player',
            isHost: dbUser?.role === 'host',
            subscriptionActive: decodedToken.subscriptionActive || false
        };

        next();
    } catch (error) {
        console.error('Firebase token verification failed:', error.message);
        // Do not return 500. Return 401 for ANY auth failure.
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token' // Keep generic for security
        });
    }
};

/**
 * Optional middleware: Verify token but don't require it
 * Used for routes that are public but have extended features for authenticated users
 */
const optionalAuth = async (req, res, next) => {
    try {
        if (!firebaseInitialized) {
            return next();
        }

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(idToken);

        req.user = {
            id: decodedToken.uid,
            email: decodedToken.email,
            role: decodedToken.role || 'player',
            subscriptionActive: decodedToken.subscriptionActive || false
        };

        next();
    } catch (error) {
        // Silent failure - just continue without user
        next();
    }
};

module.exports = { verifyFirebaseToken, optionalAuth };

import { initializeApp, FirebaseApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'

// ========================================
// 🔥 FIREBASE CONFIGURATION VALIDATION
// ========================================

/**
 * Validates that all required Firebase environment variables are configured.
 * This prevents runtime crashes on GitHub Pages when env vars are missing.
 */
function validateFirebaseConfig(): {
    isValid: boolean
    missingVars: string[]
    config: Record<string, string | undefined>
} {
    const config = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
        measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID, // Optional
    }

    const missingVars: string[] = []

    if (!config.apiKey || config.apiKey === 'undefined') {
        missingVars.push('VITE_FIREBASE_API_KEY')
    }
    if (!config.authDomain || config.authDomain === 'undefined') {
        missingVars.push('VITE_FIREBASE_AUTH_DOMAIN')
    }
    if (!config.projectId || config.projectId === 'undefined') {
        missingVars.push('VITE_FIREBASE_PROJECT_ID')
    }
    if (!config.storageBucket || config.storageBucket === 'undefined') {
        missingVars.push('VITE_FIREBASE_STORAGE_BUCKET')
    }
    if (!config.messagingSenderId || config.messagingSenderId === 'undefined') {
        missingVars.push('VITE_FIREBASE_MESSAGING_SENDER_ID')
    }
    if (!config.appId || config.appId === 'undefined') {
        missingVars.push('VITE_FIREBASE_APP_ID')
    }

    return {
        isValid: missingVars.length === 0,
        missingVars,
        config,
    }
}


// ========================================
// 🔥 FIREBASE INITIALIZATION
// ========================================

const validation = validateFirebaseConfig()

// Export flag for conditional feature usage
export const isFirebaseConfigured = validation.isValid

// Initialize Firebase only if configuration is valid
let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null
let googleProvider: GoogleAuthProvider | null = null

if (validation.isValid) {
    try {
        app = initializeApp(validation.config)
        auth = getAuth(app)
        googleProvider = new GoogleAuthProvider()
        db = getFirestore(app)

        // Success logging (DEV only)
        if (import.meta.env.DEV) {
            console.log('✅ Firebase Initialized Successfully:', {
                authDomain: validation.config.authDomain,
                projectId: validation.config.projectId,
            })
        }
    } catch (error) {
        if (import.meta.env.MODE !== 'production') {

            console.error('❌ Firebase initialization failed:', error);

        }
        throw new Error(
            `Firebase initialization error: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
    }
} else {
    // Configuration error - provide clear guidance
    const errorMessage = `
🚨 Firebase Configuration Error - Missing Required Environment Variables:

Missing variables:
${validation.missingVars.map((v) => `  - ${v}`).join('\n')}

For LOCAL DEVELOPMENT:
  Create a .env file in the project root with these variables.
  See .env.example for the template.

For GITHUB PAGES DEPLOYMENT:
  Add these as GitHub Repository Variables (NOT secrets):
  Settings → Secrets and variables → Actions → Variables tab
  
  Required variables:
  - VITE_FIREBASE_API_KEY
  - VITE_FIREBASE_AUTH_DOMAIN (e.g., your-project.firebaseapp.com)
  - VITE_FIREBASE_PROJECT_ID
  - VITE_FIREBASE_STORAGE_BUCKET
  - VITE_FIREBASE_MESSAGING_SENDER_ID
  - VITE_FIREBASE_APP_ID

Firebase features will be DISABLED until this is resolved.
`.trim()

    if (import.meta.env.MODE !== 'production') {


        console.error(errorMessage);


    }

    // In development, throw to catch issues early
    if (import.meta.env.DEV) {
        throw new Error(errorMessage)
    }
}

// ========================================
// 🔥 SAFE EXPORTS WITH FALLBACKS
// ========================================

/**
 * Throws a helpful error if Firebase is not configured.
 * Prevents silent failures and "undefined" crashes.
 */
function assertFirebaseConfigured(): void {
    if (!isFirebaseConfigured) {
        throw new Error(
            'Firebase is not configured. Check console for missing environment variables.'
        )
    }
}

// Export with runtime checks
export { auth, googleProvider, db }

// Named exports for safer usage
export const getFirebaseDb = (): Firestore => {
    assertFirebaseConfigured()
    return db!
}

export const getGoogleProvider = (): GoogleAuthProvider => {
    assertFirebaseConfigured()
    return googleProvider!
}

/**
 * Safe auth getter for services that require authentication.
 * Throws descriptive error if Firebase is not configured.
 * 
 * Use this instead of importing `auth` directly in services that need guaranteed auth access.
 */
export const getFirebaseAuth = (): Auth => {
    if (!auth) {
        throw new Error(
            'Firebase Auth is not initialized. Ensure all required environment variables are configured.'
        )
    }
    return auth
}

export default app

import admin from 'firebase-admin'

// Lazy-loaded Firestore instance
// This ensures Firebase Admin is initialized before accessing firestore()
let dbInstance = null

export const getDb = () => {
    if (!dbInstance) {
        dbInstance = admin.firestore()
    }
    return dbInstance
}

export { admin }

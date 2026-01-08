import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // Import auth even if handled by Clerk for some potential future needs, or remove if strictly Clerk.
// Actually, for this specific request, we are using Clerk for Auth, but we might need Firebase Auth linked or just use Firestore freely.
// Re-reading context: "without involving backend code or Firebase" was for images (Cloudinary).
// For posts, we are using Firestore.
// We usually need a firebase config.

// Using placeholders that the user MUST fill in .env
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app); 

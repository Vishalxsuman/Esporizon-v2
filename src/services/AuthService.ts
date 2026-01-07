import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User,
} from 'firebase/auth'
import { auth, googleProvider } from '@/config/firebase'

class AuthService {
  async signIn(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(auth, email, password)
  }

  async signUp(email: string, password: string, displayName: string): Promise<void> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(userCredential.user, { displayName })
  }

  async signInWithGoogle(): Promise<void> {
    await signInWithPopup(auth, googleProvider)
  }

  async signOut(): Promise<void> {
    await firebaseSignOut(auth)
  }

  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback)
  }

  getCurrentUser(): User | null {
    return auth.currentUser
  }
}

export const authService = new AuthService()

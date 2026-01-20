import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
} from 'firebase/auth'
import { auth, googleProvider, isFirebaseConfigured } from '@/config/firebaseConfig'
import { User } from '@/types'

interface AuthContextType {
  user: User | null
  loading: boolean
  authReady: boolean
  idToken: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  getToken: (options?: any) => Promise<string | null>
  updateUserHostStatus: (isHost: boolean) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authReady, setAuthReady] = useState(false)
  const [idToken, setIdToken] = useState<string | null>(null)

  useEffect(() => {
    // Check if Firebase is configured
    if (!isFirebaseConfigured) {
      if (import.meta.env.MODE !== 'production') {

          console.warn('⚠️ Firebase not configured - Auth features disabled');

      }
      setLoading(false)
      setAuthReady(true)
      return
    }

    if (!auth) {
      setLoading(false)
      setAuthReady(true)
      return
    }

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get ID token first
        let token: string | null = null
        try {
          token = await firebaseUser.getIdToken()
          setIdToken(token)
        } catch (error) {
          if (import.meta.env.MODE !== 'production') {

              console.error('Failed to get initial ID token:', error);

          }
        }

        // Map Firebase user to our User type with default isHost: false
        setUser({
          id: firebaseUser.uid,
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || 'Gamer',
          photoURL: firebaseUser.photoURL,
          isHost: false // Default to false, will be updated if backend responds
        })

        // Try to fetch user role from backend (non-blocking, fire-and-forget)
        if (token) {
          import('@/services/api').then(({ api }) => {
            api.get('/api/user/profile')
              .then(response => {
                if (response?.data) {
                  const isHost = response.data.role === 'host' || response.data.isHost === true
                  setUser(prev => prev ? { ...prev, isHost } : null)
                }
              })
              .catch(() => {
                // Silently fail - user stays with isHost: false
                // This is fine for new users or when backend is unreachable
              })
          }).catch(() => {
            // API module failed to load, ignore
          })
        }
      } else {
        setUser(null)
        setIdToken(null)
      }

      // Mark auth as ready only after first state change
      setAuthReady(true)
      setLoading(false)
    })

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!auth) {
      throw new Error('Firebase Auth not configured')
    }
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error: any) {
      if (import.meta.env.MODE !== 'production') {

          console.error('Sign in error:', error);

      }
      throw new Error(error.message || 'Failed to sign in')
    }
  }

  const signUp = async (email: string, password: string, displayName: string) => {
    if (!auth) {
      throw new Error('Firebase Auth not configured')
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      // Update user profile with display name
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: displayName,
        })
      }
    } catch (error: any) {
      if (import.meta.env.MODE !== 'production') {

          console.error('Sign up error:', error);

      }
      throw new Error(error.message || 'Failed to sign up')
    }
  }

  const signInWithGoogle = async () => {
    if (!auth || !googleProvider) {
      throw new Error('Firebase Auth not configured')
    }
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (error: any) {
      if (import.meta.env.MODE !== 'production') {

          console.error('Google sign in error:', error);

      }
      throw new Error(error.message || 'Failed to sign in with Google')
    }
  }

  const signOut = async () => {
    if (!auth) {
      throw new Error('Firebase Auth not configured')
    }
    try {
      await firebaseSignOut(auth)
    } catch (error: any) {
      if (import.meta.env.MODE !== 'production') {

          console.error('Sign out error:', error);

      }
      throw new Error(error.message || 'Failed to sign out')
    }
  }

  const getToken = async (options?: any) => {
    try {
      if (!auth || !auth.currentUser) {
        return null
      }
      // Get Firebase ID token
      const token = await auth.currentUser.getIdToken(options?.forceRefresh || false)
      setIdToken(token) // Cache the token
      return token
    } catch (error: any) {
      if (import.meta.env.MODE !== 'production') {

          console.error('Get token error:', error);

      }
      return null
    }
  }

  const updateUserHostStatus = (isHost: boolean) => {
    setUser(prev => prev ? { ...prev, isHost } : null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authReady,
        idToken,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        getToken,
        updateUserHostStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

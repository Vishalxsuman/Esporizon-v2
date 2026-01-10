import React, { createContext, useContext, ReactNode } from 'react'
import { useUser, useClerk, useSignIn, useSignUp, useAuth as useAuthFromClerk } from '@clerk/clerk-react'
import { User } from '@/types'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  getToken: (options?: any) => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isLoaded } = useUser()
  const { signOut: clerkSignOut } = useClerk()
  const { signIn: clerkSignIn, isLoaded: signInLoaded } = useSignIn()
  const { signUp: clerkSignUp, isLoaded: signUpLoaded } = useSignUp()
  const { getToken: clerkGetToken } = useAuthFromClerk()

  const getToken = async (options?: any) => {
    return clerkGetToken(options)
  }

  const signIn = async (email: string, password: string) => {
    if (!signInLoaded) return
    const result = await clerkSignIn.create({
      identifier: email,
      password,
    })
    if (result.status !== 'complete') {
      console.error('Sign in failed', result)
    }
  }

  const signUp = async (email: string, password: string, displayName: string) => {
    if (!signUpLoaded) return
    const result = await clerkSignUp.create({
      emailAddress: email,
      password,
    })
    await result.update({
      username: displayName,
    })
    // Note: Clerk usually requires verification. For this simulation, we'll assume it's handled.
  }

  const signInWithGoogle = async () => {
    if (!signInLoaded) return
    await clerkSignIn.authenticateWithRedirect({
      strategy: 'oauth_google',
      redirectUrl: '/sso-callback',
      redirectUrlComplete: '/dashboard',
    })
  }

  const signOut = async () => {
    await clerkSignOut()
  }

  // Map Clerk user to existing components' expectations if needed
  const mappedUser: User | null = user ? {
    id: user.id,
    uid: user.id,
    email: user.primaryEmailAddress?.emailAddress || null,
    displayName: user.fullName || user.username || 'Gamer',
    photoURL: user.imageUrl || null,
  } : null

  return (
    <AuthContext.Provider value={{
      user: mappedUser,
      loading: !isLoaded,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      getToken
    }}>
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

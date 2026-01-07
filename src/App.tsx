import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import Navigation from './components/Navigation'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key")
}

// Lazy load pages for code splitting (improves LCP)
const LandingPage = lazy(() => import('./pages/LandingPage'))
const AuthPage = lazy(() => import('./pages/AuthPage'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const TournamentGrid = lazy(() => import('./pages/TournamentGrid'))
const ColorPrediction = lazy(() => import('./pages/ColorPrediction'))
const TournamentList = lazy(() => import('./pages/TournamentList'))
const CreateTournament = lazy(() => import('./pages/CreateTournament'))
const TournamentDetails = lazy(() => import('./pages/TournamentDetails'))
const CreatePost = lazy(() => import('./pages/CreatePost'))
const SocialPage = lazy(() => import('./pages/SocialPage'))
const WalletPage = lazy(() => import('./pages/WalletPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const PlaceholderPage = lazy(() => import('./pages/PlaceholderPage'))

// Loading component for suspense
const PageLoader = () => (
  <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent)]"></div>
  </div>
)

function App() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <ThemeProvider>
        <AuthProvider>
          <Router basename={import.meta.env.BASE_URL}>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={
                  <>
                    <SignedIn>
                      <Navigate to="/dashboard" replace />
                    </SignedIn>
                    <SignedOut>
                      <AuthPage />
                    </SignedOut>
                  </>
                } />

                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <>
                      <SignedIn><Dashboard /></SignedIn>
                      <SignedOut><RedirectToSignIn /></SignedOut>
                    </>
                  }
                />
                <Route
                  path="/tournaments"
                  element={
                    <>
                      <SignedIn><TournamentGrid /></SignedIn>
                      <SignedOut><RedirectToSignIn /></SignedOut>
                    </>
                  }
                />
                <Route
                  path="/predict"
                  element={
                    <>
                      <SignedIn><ColorPrediction /></SignedIn>
                      <SignedOut><RedirectToSignIn /></SignedOut>
                    </>
                  }
                />
                <Route
                  path="/tournaments/:gameId"
                  element={
                    <>
                      <SignedIn><TournamentList /></SignedIn>
                      <SignedOut><RedirectToSignIn /></SignedOut>
                    </>
                  }
                />
                <Route
                  path="/tournaments/:gameId/create"
                  element={
                    <>
                      <SignedIn><CreateTournament /></SignedIn>
                      <SignedOut><RedirectToSignIn /></SignedOut>
                    </>
                  }
                />
                <Route
                  path="/tournament/:id"
                  element={
                    <>
                      <SignedIn><TournamentDetails /></SignedIn>
                      <SignedOut><RedirectToSignIn /></SignedOut>
                    </>
                  }
                />
                <Route
                  path="/social"
                  element={
                    <>
                      <SignedIn><SocialPage /></SignedIn>
                      <SignedOut><RedirectToSignIn /></SignedOut>
                    </>
                  }
                />
                <Route
                  path="/wallet"
                  element={
                    <>
                      <SignedIn><WalletPage /></SignedIn>
                      <SignedOut><RedirectToSignIn /></SignedOut>
                    </>
                  }
                />
                <Route
                  path="/create-post"
                  element={
                    <>
                      <SignedIn><CreatePost /></SignedIn>
                      <SignedOut><RedirectToSignIn /></SignedOut>
                    </>
                  }
                />
                <Route
                  path="/earnings"
                  element={
                    <>
                      <SignedIn><PlaceholderPage title="Earnings" /></SignedIn>
                      <SignedOut><RedirectToSignIn /></SignedOut>
                    </>
                  }
                />
                <Route
                  path="/support"
                  element={
                    <>
                      <SignedIn><PlaceholderPage title="Support" /></SignedIn>
                      <SignedOut><RedirectToSignIn /></SignedOut>
                    </>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <>
                      <SignedIn><ProfilePage /></SignedIn>
                      <SignedOut><RedirectToSignIn /></SignedOut>
                    </>
                  }
                />
                <Route
                  path="/profile/:userId"
                  element={
                    <>
                      <SignedIn><ProfilePage /></SignedIn>
                      <SignedOut><RedirectToSignIn /></SignedOut>
                    </>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <>
                      <SignedIn><ProfilePage /></SignedIn>
                      <SignedOut><RedirectToSignIn /></SignedOut>
                    </>
                  }
                />
              </Routes>
            </Suspense>
            <Navigation />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ClerkProvider>
  )
}

export default App

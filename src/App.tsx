import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navigation from './components/Navigation'

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
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tournaments"
                element={
                  <ProtectedRoute>
                    <TournamentGrid />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/predict"
                element={
                  <ProtectedRoute>
                    <ColorPrediction />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tournaments/:gameId"
                element={
                  <ProtectedRoute>
                    <TournamentList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tournaments/:gameId/create"
                element={
                  <ProtectedRoute>
                    <CreateTournament />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tournament/:id"
                element={
                  <ProtectedRoute>
                    <TournamentDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/social"
                element={
                  <ProtectedRoute>
                    <SocialPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/wallet"
                element={
                  <ProtectedRoute>
                    <WalletPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-post"
                element={
                  <ProtectedRoute>
                    <CreatePost />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/earnings"
                element={
                  <ProtectedRoute>
                    <PlaceholderPage title="Earnings" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/support"
                element={
                  <ProtectedRoute>
                    <PlaceholderPage title="Support" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/:userId"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
          <Navigation />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

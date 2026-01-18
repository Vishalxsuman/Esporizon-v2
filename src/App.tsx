import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { WalletProvider } from './contexts/WalletContext'
import Navigation from './components/Navigation'
import ProtectedRoute from './components/ProtectedRoute'


// lazy load pages for code splitting (improves LCP)
const LandingPage = lazy(() => import('./pages/LandingPage'))
const AuthPage = lazy(() => import('./pages/AuthPage'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const TournamentGrid = lazy(() => import('./pages/TournamentGrid'))
const TournamentList = lazy(() => import('./pages/TournamentList'))
const CreateTournament = lazy(() => import('./pages/CreateTournament'))
const TournamentDetails = lazy(() => import('./pages/TournamentDetails'))
// const SocialPage = lazy(() => import('./pages/SocialPage'))
const WarRoomPage = lazy(() => import('./pages/WarRoomPage'))
const WalletPage = lazy(() => import('./pages/WalletPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const PlaceholderPage = lazy(() => import('./pages/PlaceholderPage'))
const PlayHub = lazy(() => import('./pages/PlayHub'))
const CreateMatch = lazy(() => import('./pages/CreateMatch'))
const MatchLobby = lazy(() => import('./pages/MatchLobby'))
const GameRouter = lazy(() => import('./pages/GameRouter'))
const PublicLobbies = lazy(() => import('./pages/PublicLobbies'))
const FreeFireArena = lazy(() => import('./pages/FreeFireArena'))
const BGMIArena = lazy(() => import('./pages/BGMIArena'))
const ValorantArena = lazy(() => import('./pages/ValorantArena'))
const MinecraftArena = lazy(() => import('./pages/MinecraftArena'))
const HostDashboard = lazy(() => import('./pages/HostDashboard'))
const SubscriptionBenefits = lazy(() => import('./pages/SubscriptionBenefits'))
const SubscriptionPurchase = lazy(() => import('./pages/HostSubscriptionPurchase'))
const TournamentManage = lazy(() => import('./pages/TournamentManage'))
const HostProfile = lazy(() => import('./pages/HostProfile'))
const TournamentResultsPage = lazy(() => import('./pages/TournamentResultsPage'))
const MyTournaments = lazy(() => import('./pages/MyTournaments'))
const HostReports = lazy(() => import('./pages/HostReports'))
const HostWallet = lazy(() => import('./pages/HostWallet'))

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
        <WalletProvider>
          <Router basename={import.meta.env.BASE_URL}>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<AuthPage />} />

                {/* Protected Routes */}

                <Route
                  path="/host/reports"
                  element={
                    <ProtectedRoute>
                      <HostReports />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/host/wallet"
                  element={
                    <ProtectedRoute>
                      <HostWallet />
                    </ProtectedRoute>
                  }
                />
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
                  path="/arena/freefire"
                  element={
                    <ProtectedRoute>
                      <FreeFireArena />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/arena/bgmi"
                  element={
                    <ProtectedRoute>
                      <BGMIArena />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/arena/valorant"
                  element={
                    <ProtectedRoute>
                      <ValorantArena />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/arena/minecraft"
                  element={
                    <ProtectedRoute>
                      <MinecraftArena />
                    </ProtectedRoute>
                  }
                />
                <Route path="/host/dashboard" element={
                  <ProtectedRoute>
                    <HostDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/host/benefits" element={
                  <ProtectedRoute>
                    <SubscriptionBenefits />
                  </ProtectedRoute>
                } />
                <Route path="/host/subscribe" element={
                  <ProtectedRoute>
                    <SubscriptionPurchase />
                  </ProtectedRoute>
                } />

                <Route
                  path="/host/manage"
                  element={
                    <ProtectedRoute>
                      <TournamentManage />
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
                  path="/host/create/:gameId"
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
                  path="/tournament/:id/results"
                  element={
                    <ProtectedRoute>
                      <TournamentResultsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/host/:id"
                  element={
                    <ProtectedRoute>
                      <HostProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-tournaments"
                  element={
                    <ProtectedRoute>
                      <MyTournaments />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/social"
                  element={
                    <ProtectedRoute>
                      <WarRoomPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/war-room"
                  element={
                    <ProtectedRoute>
                      <WarRoomPage />
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
                  element={<Navigate to="/war-room" replace />}
                />
                <Route
                  path="/play"
                  element={<PlayHub />}
                />
                <Route
                  path="/play/create"
                  element={
                    <ProtectedRoute>
                      <CreateMatch />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/play/lobbies"
                  element={<PublicLobbies />}
                />
                <Route
                  path="/play/match/:id"
                  element={<MatchLobby />}
                />

                <Route
                  path="/play/game/:id"
                  element={<GameRouter />}
                />
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <PlaceholderPage title="Notifications" />
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
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
            <Navigation />
          </Router>
        </WalletProvider>
      </AuthProvider>
    </ThemeProvider>

  )
}

export default App

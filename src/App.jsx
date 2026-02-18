import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Toaster from './components/common/Toaster'
import { AuthProvider } from './context/AuthContext'
import { Layout } from './components/layout'
import { AuthLayout } from './components/layout/AuthLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { ThemeProvider } from './context/ThemeContext'
import { PageLoader } from './components/common/LoadingComponents'

// Lazy load auth pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const SignUpPage = lazy(() => import('./pages/auth/SignUpPage'))
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'))
const VerifyEmailPage = lazy(() => import('./pages/auth/VerifyEmailPage'))
const RestoreAccountPage = lazy(() => import('./pages/auth/RestoreAccountPage'))

// Lazy load main pages
const HomePage = lazy(() => import('./pages/HomePage'))
const WatchPage = lazy(() => import('./pages/WatchPage'))
const TrendingPage = lazy(() => import('./pages/TrendingPage'))
const UploadPage = lazy(() => import('./pages/UploadPage'))
const MyVideosPage = lazy(() => import('./pages/MyVideosPage'))
const EditVideoPage = lazy(() => import('./pages/EditVideoPage'))
const TrashPage = lazy(() => import('./pages/TrashPage'))
const PlaylistTrashPage = lazy(() => import('./pages/PlaylistTrashPage'))
const PlaylistsPage = lazy(() => import('./pages/PlaylistsPage'))
const PlaylistDetailPage = lazy(() => import('./pages/PlaylistDetailPage'))
const WatchLaterPage = lazy(() => import('./pages/WatchLaterPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const TweetsPage = lazy(() => import('./pages/TweetsPage'))
const SearchPage = lazy(() => import('./pages/SearchPage'))
const HistoryPage = lazy(() => import('./pages/HistoryPage'))
const SubscriptionsPage = lazy(() => import('./pages/SubscriptionsPage'))
const LikedVideosPage = lazy(() => import('./pages/LikedVideosPage'))
const ShortsPage = lazy(() => import('./pages/ShortsPage'))
const ChannelPage = lazy(() => import('./pages/ChannelPage'))
const LibraryPage = lazy(() => import('./pages/LibraryPage'))

import './index.css'

const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ""

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <ThemeProvider>
          <Router>
            <Toaster />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Auth Routes - Wrapped in AuthLayout */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<SignUpPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/verify-email" element={<VerifyEmailPage />} />
                  <Route path="/restore-account" element={<RestoreAccountPage />} />
                </Route>

                {/* Protected Routes - Main Layout */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }>
                  <Route index element={<HomePage />} />
                  <Route path="shorts" element={<ShortsPage />} />
                  <Route path="trending" element={<TrendingPage />} />
                  <Route path="subscriptions" element={<SubscriptionsPage />} />
                  <Route path="my-videos" element={<MyVideosPage />} />
                  <Route path="history" element={<HistoryPage />} />
                  <Route path="library" element={<LibraryPage />} />
                  <Route path="liked" element={<LikedVideosPage />} />
                  <Route path="watch-later" element={<WatchLaterPage />} />

                  {/* Playlist Routes */}
                  <Route path="playlists" element={<PlaylistsPage />} />
                  <Route path="playlists/trash" element={<PlaylistTrashPage />} />
                  <Route path="playlist/:playlistId" element={<PlaylistDetailPage />} />

                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route path="search" element={<SearchPage />} />

                  {/* Video Routes */}
                  <Route path="watch/:videoId" element={<WatchPage />} />
                  <Route path="video/:videoId" element={<WatchPage />} /> {/* Alias */}
                  <Route path="video/:videoId/edit" element={<EditVideoPage />} />

                  {/* Channel Routes */}
                  <Route path="channel/:username" element={<ChannelPage />} />


                  <Route path="upload" element={<UploadPage />} />
                  <Route path="tweets" element={<TweetsPage />} />
                  <Route path="trash" element={<TrashPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path=":username" element={<ChannelPage />} />

                  {/* Catch All / 404 */}
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </Suspense>
          </Router>
        </ThemeProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  )
}

export default App

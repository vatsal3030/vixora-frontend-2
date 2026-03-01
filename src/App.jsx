import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Toaster from './components/common/Toaster'
import { AuthProvider } from './context/AuthContext'
import { Layout } from './components/layout'
import { AuthLayout } from './components/layout/AuthLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminRoute from './components/auth/AdminRoute'
import { AdminLayout } from './components/layout/AdminLayout'
import { ThemeProvider } from './context/ThemeContext'
import { AppSkeleton } from './components/skeletons/AppSkeleton'
import { VideoHoverProvider } from './context/VideoHoverContext'
import VixoraAI from './components/ai/VixoraAI'
import { MiniPlayerProvider } from './context/MiniPlayerContext'
import MiniPlayer from './components/video/MiniPlayer'
import { Analytics } from '@vercel/analytics/react'
import './index.css'

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
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

// Lazy load admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <MiniPlayerProvider>
          <VideoHoverProvider>
            <Router>
              <Toaster />
              <VixoraAI />
              <MiniPlayer />
              <Suspense fallback={<AppSkeleton />}>
                <Routes>
                  {/* Auth Routes - Wrapped in AuthLayout */}
                  <Route element={<AuthLayout />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<SignUpPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/verify-email" element={<VerifyEmailPage />} />
                    <Route path="/restore-account" element={<RestoreAccountPage />} />
                  </Route>

                  {/* Admin Routes - Wrapped in AdminLayout and AdminRoute */}
                  <Route path="/admin" element={
                    <AdminRoute>
                      <AdminLayout />
                    </AdminRoute>
                  }>
                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    {/* Stubs for future admin tabs, navigating back to dashboard for now */}
                    <Route path="reports" element={<div>Reports (WIP)</div>} />
                    <Route path="users" element={<div>Users (WIP)</div>} />
                    <Route path="videos" element={<div>Videos (WIP)</div>} />
                    <Route path="tweets" element={<div>Tweets (WIP)</div>} />
                    <Route path="playlists" element={<div>Playlists (WIP)</div>} />
                    <Route path="audit-logs" element={<div>Audit Logs (WIP)</div>} />
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

                    {/* Upload Route */}
                    <Route path="upload" element={<UploadPage />} />

                    {/* Trash Route */}
                    <Route path="trash" element={<TrashPage />} />

                    {/* User Setting & Profile Route */}
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="profile" element={<ProfilePage />} />

                    {/* Channel Routes */}
                    <Route path=":username/*" element={<ChannelPage />} />

                    {/* Tweets Routes */}
                    <Route path="tweets" element={<TweetsPage />} />
                  </Route>

                  {/* Catch all route - 404 */}
                  <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
                </Routes>
              </Suspense>
            </Router>
          </VideoHoverProvider>
        </MiniPlayerProvider>
      </ThemeProvider>
      <Analytics debug={false} />
    </AuthProvider>
  )
}

export default App

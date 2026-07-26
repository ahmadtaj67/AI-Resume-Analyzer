import { lazy, Suspense, useEffect } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import LoadingScreen from '../components/LoadingScreen.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useSettings } from '../hooks/useSettings.js'
import AuthLayout from '../layouts/AuthLayout.jsx'
import ProtectedLayout from '../layouts/ProtectedLayout.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import PublicRoute from './PublicRoute.jsx'
import AdminRoute from './AdminRoute.jsx'
import { getDefaultAuthenticatedPath } from '../utils/redirect.js'

const AdminAnalyticsPage = lazy(() => import('../pages/admin/AdminAnalyticsPage.jsx'))
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage.jsx'))
const AdminReportsPage = lazy(() => import('../pages/admin/AdminReportsPage.jsx'))
const AdminSettingsPage = lazy(() => import('../pages/admin/AdminSettingsPage.jsx'))
const AdminUserDetailsPage = lazy(() => import('../pages/admin/AdminUserDetailsPage.jsx'))
const AdminUsersPage = lazy(() => import('../pages/admin/AdminUsersPage.jsx'))
const LoginPage = lazy(() => import('../pages/auth/LoginPage.jsx'))
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage.jsx'))
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage.jsx'))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage.jsx'))
const ProfilePage = lazy(() => import('../pages/profile/ProfilePage.jsx'))
const ReportDetailsPage = lazy(() => import('../pages/reports/ReportDetailsPage.jsx'))
const ResumeComparisonPage = lazy(() => import('../pages/reports/ResumeComparisonPage.jsx'))
const ReportsHistoryPage = lazy(() => import('../pages/reports/ReportsHistoryPage.jsx'))

function RouteLoadingFallback() {
  return (
    <div className="route-loading-shell" role="status" aria-live="polite">
      <div className="dashboard-skeleton-block" />
      <p>Loading page...</p>
    </div>
  )
}

function SettingsRouteRefresher() {
  const location = useLocation()
  const { refreshSettings } = useSettings()

  useEffect(() => {
    refreshSettings()
  }, [location.pathname, refreshSettings])

  return null
}

function RootRedirect() {
  const { isAuthenticated, isInitializing, user } = useAuth()

  if (isInitializing) {
    return <LoadingScreen />
  }

  return (
    <Navigate
      to={isAuthenticated ? getDefaultAuthenticatedPath(user) : '/login'}
      replace
    />
  )
}

function AppRouter() {
  return (
    <BrowserRouter>
      <SettingsRouteRefresher />
      <Suspense fallback={<RouteLoadingFallback />}>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route element={<PublicRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route element={<ProtectedLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/compare" element={<ResumeComparisonPage />} />
              <Route path="/reports" element={<ReportsHistoryPage />} />
              <Route path="/reports/:reportId" element={<ReportDetailsPage />} />
            </Route>
          </Route>
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/users/:userId" element={<AdminUserDetailsPage />} />
            <Route path="/admin/reports" element={<AdminReportsPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default AppRouter

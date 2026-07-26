import { Navigate, Outlet } from 'react-router-dom'
import LoadingScreen from '../components/LoadingScreen.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getDefaultAuthenticatedPath } from '../utils/redirect.js'

function PublicRoute({ children }) {
  const { isAuthenticated, isInitializing, user } = useAuth()

  if (isInitializing) {
    return <LoadingScreen />
  }

  if (isAuthenticated) {
    return <Navigate to={getDefaultAuthenticatedPath(user)} replace />
  }

  return children || <Outlet />
}

export default PublicRoute

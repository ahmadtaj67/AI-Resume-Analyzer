import { Navigate, Outlet } from 'react-router-dom'
import LoadingScreen from '../components/LoadingScreen.jsx'
import { useAuth } from '../context/AuthContext.jsx'

function PublicRoute({ children }) {
  const { isAuthenticated, isInitializing } = useAuth()

  if (isInitializing) {
    return <LoadingScreen />
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children || <Outlet />
}

export default PublicRoute

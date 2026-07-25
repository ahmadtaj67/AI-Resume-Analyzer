import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function ProtectedLayout() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const displayName = user?.full_name || user?.email || 'Development user'

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <a className="app-brand" href="/dashboard" aria-label="AI Resume Analyzer dashboard">
          <span className="app-brand-mark" aria-hidden="true">
            AI
          </span>
          <span>AI Resume Analyzer</span>
        </a>
        <nav className="app-nav" aria-label="Application navigation">
          <span className="current-user">Signed in as {displayName}</span>
          <button className="ghost-button" type="button" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}

export default ProtectedLayout

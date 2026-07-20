import { Outlet } from 'react-router-dom'

function ProtectedLayout() {
  const handleLogoutPlaceholder = () => {
    window.alert('Logout will be connected in a future phase.')
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
          <button className="ghost-button" type="button" onClick={handleLogoutPlaceholder}>
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

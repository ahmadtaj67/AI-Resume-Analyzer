import { Link } from 'react-router-dom'

function DashboardSidebar({ navigationItems, onLogout, userEmail, userInitials, userName }) {
  return (
    <aside className="dashboard-sidebar" aria-label="Dashboard sidebar">
      <div>
        <Link className="dashboard-sidebar-brand" to="/dashboard" aria-label="AI Resume Analyzer dashboard">
          <span className="dashboard-brand-mark" aria-hidden="true">
            AI
          </span>
          <span>
            <strong>AI Resume Analyzer</strong>
            <small>Smart Career Insights</small>
          </span>
        </Link>

        <nav className="dashboard-sidebar-nav" aria-label="Dashboard navigation">
          {navigationItems.map((item) => (
            item.href ? (
              <Link
                aria-current={item.isActive ? 'page' : undefined}
                className={item.isActive ? 'dashboard-nav-item is-active' : 'dashboard-nav-item'}
                key={item.label}
                to={item.href}
              >
                <span>{item.label}</span>
              </Link>
            ) : (
              <button
                aria-current={item.isActive ? 'page' : undefined}
                className={item.isActive ? 'dashboard-nav-item is-active' : 'dashboard-nav-item'}
                disabled={item.isSoon}
                key={item.label}
                onClick={item.onClick}
                type="button"
              >
                <span>{item.label}</span>
                {item.isSoon ? <span className="dashboard-soon-badge">Soon</span> : null}
              </button>
            )
          ))}
        </nav>
      </div>

      <footer className="dashboard-sidebar-footer">
        <div className="dashboard-user-compact">
          <span className="dashboard-avatar" aria-hidden="true">
            {userInitials}
          </span>
          <span className="dashboard-user-text">
            <strong>{userName}</strong>
            <small title={userEmail}>{userEmail}</small>
          </span>
        </div>
        <button className="dashboard-logout-button" type="button" onClick={onLogout}>
          Logout
        </button>
      </footer>
    </aside>
  )
}

export default DashboardSidebar

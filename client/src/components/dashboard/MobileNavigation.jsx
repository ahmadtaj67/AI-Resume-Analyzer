import { useEffect, useId, useState } from 'react'
import { Link } from 'react-router-dom'

function MobileNavigation({ navigationItems, onLogout, userInitials }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuId = useId()

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleItemClick = (onClick) => {
    onClick?.()
    setIsOpen(false)
  }

  const handleLogout = () => {
    setIsOpen(false)
    onLogout()
  }

  return (
    <header className="dashboard-mobile-header">
      <Link className="dashboard-mobile-brand" to="/dashboard" aria-label="AI Resume Analyzer dashboard">
        <span className="dashboard-brand-mark" aria-hidden="true">
          AI
        </span>
        <span>AI Resume Analyzer</span>
      </Link>

      <div className="dashboard-mobile-actions">
        <span className="dashboard-avatar dashboard-avatar-small" aria-label="Current user">
          {userInitials}
        </span>
        <button
          aria-controls={menuId}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Close dashboard navigation' : 'Open dashboard navigation'}
          className="dashboard-menu-button"
          onClick={() => setIsOpen((currentValue) => !currentValue)}
          type="button"
        >
          <span aria-hidden="true">{isOpen ? 'Close' : 'Menu'}</span>
        </button>
      </div>

      {isOpen ? (
        <nav className="dashboard-mobile-menu" id={menuId} aria-label="Mobile dashboard navigation">
          {navigationItems.map((item) => (
            item.href ? (
              <Link
                aria-current={item.isActive ? 'page' : undefined}
                className={item.isActive ? 'dashboard-nav-item is-active' : 'dashboard-nav-item'}
                key={item.label}
                onClick={() => setIsOpen(false)}
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
                onClick={() => handleItemClick(item.onClick)}
                type="button"
              >
                <span>{item.label}</span>
                {item.isSoon ? <span className="dashboard-soon-badge">Soon</span> : null}
              </button>
            )
          ))}
          <button className="dashboard-logout-button" type="button" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      ) : null}
    </header>
  )
}

export default MobileNavigation

import { useLocation } from 'react-router-dom'
import DashboardHeader from '../dashboard/DashboardHeader.jsx'
import DashboardSidebar from '../dashboard/DashboardSidebar.jsx'
import MobileNavigation from '../dashboard/MobileNavigation.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useSettings } from '../../hooks/useSettings.js'

const formatRole = (role) => {
  if (typeof role !== 'string' || role.trim().length === 0) {
    return 'User'
  }

  return role
    .trim()
    .split(/\s+/)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join(' ')
}

const getInitials = (user) => {
  const fullName = user?.full_name?.trim()

  if (fullName) {
    return fullName
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('')
  }

  return user?.email?.charAt(0).toUpperCase() || 'U'
}

const getNavigationItems = (pathname) => [
  {
    label: 'Admin Dashboard',
    href: '/admin',
    isActive: pathname === '/admin',
  },
  {
    label: 'Users',
    href: '/admin/users',
    isActive: pathname.startsWith('/admin/users'),
  },
  {
    label: 'Analytics',
    href: '/admin/analytics',
    isActive: pathname === '/admin/analytics',
  },
  {
    label: 'Reports',
    href: '/admin/reports',
    isActive: pathname === '/admin/reports',
  },
  {
    label: 'Platform Settings',
    href: '/admin/settings',
    isActive: pathname === '/admin/settings',
  },
  {
    label: 'User Workspace',
    href: '/dashboard',
    isActive: pathname === '/dashboard',
  },
]

function AdminShell({ children }) {
  const { logout, user } = useAuth()
  const { settings } = useSettings()
  const location = useLocation()
  const userName = user?.full_name?.trim() || 'Admin'
  const userEmail = user?.email?.trim() || 'Email not available'
  const userInitials = getInitials(user)
  const navigationItems = getNavigationItems(location.pathname)

  return (
    <div className="dashboard-shell admin-shell">
      <DashboardSidebar
        navigationItems={navigationItems}
        onLogout={logout}
        platformName={settings.platformName}
        platformTagline={settings.platformTagline}
        userEmail={userEmail}
        userInitials={userInitials}
        userName={userName}
      />

      <div className="dashboard-main-shell">
        <MobileNavigation
          navigationItems={navigationItems}
          onLogout={logout}
          platformName={settings.platformName}
          userInitials={userInitials}
        />

        <main className="dashboard-main admin-main">
          <DashboardHeader
            accountStatus={user?.is_active ? 'Active' : 'Not available'}
            roleLabel={formatRole(user?.role)}
            userEmail={userEmail}
            userInitials={userInitials}
            userName={userName}
          />
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminShell

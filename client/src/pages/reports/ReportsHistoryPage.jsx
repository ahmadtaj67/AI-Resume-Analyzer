import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import DashboardHeader from '../../components/dashboard/DashboardHeader.jsx'
import DashboardSidebar from '../../components/dashboard/DashboardSidebar.jsx'
import MobileNavigation from '../../components/dashboard/MobileNavigation.jsx'
import ReportsHistoryList from '../../components/reports/ReportsHistoryList.jsx'
import ReportsPagination from '../../components/reports/ReportsPagination.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { getReports } from '../../services/resumeService.js'

const REPORTS_LIMIT = 10

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

const getNavigationItems = (pathname, user) => [
  ...(user?.role === 'admin'
    ? [
        {
          label: 'Admin Dashboard',
          href: '/admin',
          isActive: pathname === '/admin',
        },
      ]
    : []),
  {
    label: 'Dashboard',
    href: '/dashboard',
    isActive: pathname === '/dashboard',
  },
  {
    label: 'Reports',
    href: '/reports',
    isActive: pathname.startsWith('/reports'),
  },
  {
    label: 'Compare',
    href: '/compare',
    isActive: pathname === '/compare',
  },
  {
    label: 'Profile',
    href: '/profile',
    isActive: pathname === '/profile',
  },
]

function ReportsHistoryPage() {
  const { logout, user } = useAuth()
  const location = useLocation()
  const pageTopRef = useRef(null)
  const [reports, setReports] = useState([])
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const userName = user?.full_name?.trim() || 'User'
  const userEmail = user?.email?.trim() || 'Email not available'
  const userInitials = getInitials(user)
  const navigationItems = getNavigationItems(location.pathname, user)

  const fetchReports = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const result = await getReports({
        page,
        limit: REPORTS_LIMIT,
      })

      setReports(Array.isArray(result?.reports) ? result.reports : [])
      setPagination(result?.pagination || null)
    } catch {
      setErrorMessage('Your report history could not be loaded. Please try again.')
      setReports([])
      setPagination(null)
    } finally {
      setIsLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || (pagination && nextPage > pagination.totalPages)) {
      return
    }

    setPage(nextPage)
    pageTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="dashboard-shell">
      <DashboardSidebar
        navigationItems={navigationItems}
        onLogout={logout}
        userEmail={userEmail}
        userInitials={userInitials}
        userName={userName}
      />

      <div className="dashboard-main-shell">
        <MobileNavigation
          navigationItems={navigationItems}
          onLogout={logout}
          userInitials={userInitials}
        />

        <main className="dashboard-main reports-page-main" ref={pageTopRef}>
          <DashboardHeader
            accountStatus={user?.is_active ? 'Active' : 'Not available'}
            roleLabel="User"
            userEmail={userEmail}
            userInitials={userInitials}
            userName={userName}
          />

          <section className="reports-page-heading" aria-labelledby="reports-history-title">
            <p className="eyebrow">Reports</p>
            <h1 id="reports-history-title">Report History</h1>
            <p>Review your saved resume analysis reports.</p>
          </section>

          <div className="reports-state-message" aria-live="polite">
            {isLoading ? <p>Loading reports...</p> : null}
            {errorMessage ? (
              <div className="state-message-actions" role="alert">
                <p>{errorMessage}</p>
                <button className="dashboard-secondary-action" onClick={fetchReports} type="button">
                  Retry
                </button>
              </div>
            ) : null}
          </div>

          {isLoading ? (
            <section className="dashboard-panel dashboard-skeleton-stack" aria-label="Loading report history">
              <div className="dashboard-skeleton-line" />
              <div className="dashboard-skeleton-line" />
              <div className="dashboard-skeleton-line" />
            </section>
          ) : null}

          {!isLoading && !errorMessage && reports.length === 0 ? (
            <section className="reports-empty-state" aria-labelledby="reports-empty-title">
              <h2 id="reports-empty-title">You have not saved any resume reports yet.</h2>
              <p>Analyze a PDF resume to create your first saved report.</p>
              <Link className="dashboard-primary-action" to="/dashboard">
                Analyze a Resume
              </Link>
            </section>
          ) : null}

          {!isLoading && !errorMessage && reports.length > 0 ? (
            <>
              <ReportsHistoryList reports={reports} />
              <ReportsPagination
                onPageChange={handlePageChange}
                pagination={pagination}
              />
            </>
          ) : null}
        </main>
      </div>
    </div>
  )
}

export default ReportsHistoryPage

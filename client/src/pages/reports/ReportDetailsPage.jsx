import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import DashboardHeader from '../../components/dashboard/DashboardHeader.jsx'
import DashboardSidebar from '../../components/dashboard/DashboardSidebar.jsx'
import MobileNavigation from '../../components/dashboard/MobileNavigation.jsx'
import ReportAnalysisContent from '../../components/reports/ReportAnalysisContent.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { getReportById } from '../../services/resumeService.js'
import { formatDisplayDate } from '../../utils/dateFormat.js'

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
    label: 'Profile',
    href: '/profile',
    isActive: pathname === '/profile',
  },
]

function ReportDetailsPage() {
  const { reportId } = useParams()
  const { logout, user } = useAuth()
  const location = useLocation()
  const [report, setReport] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [isNotFound, setIsNotFound] = useState(false)

  const userName = user?.full_name?.trim() || 'User'
  const userEmail = user?.email?.trim() || 'Email not available'
  const userInitials = getInitials(user)
  const navigationItems = getNavigationItems(location.pathname, user)

  useEffect(() => {
    let isMounted = true

    const fetchReport = async () => {
      setIsLoading(true)
      setErrorMessage('')
      setIsNotFound(false)

      try {
        const nextReport = await getReportById(reportId)

        if (isMounted) {
          setReport(nextReport)
        }
      } catch (error) {
        if (!isMounted) {
          return
        }

        if (error.status === 404) {
          setIsNotFound(true)
        } else {
          setErrorMessage('The report could not be loaded. Please try again.')
        }

        setReport(null)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchReport()

    return () => {
      isMounted = false
    }
  }, [reportId])

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

        <main className="dashboard-main reports-page-main">
          <DashboardHeader
            accountStatus={user?.is_active ? 'Active' : 'Not available'}
            roleLabel="User"
            userEmail={userEmail}
            userInitials={userInitials}
            userName={userName}
          />

          <nav className="reports-breadcrumbs" aria-label="Report navigation">
            <Link to="/reports">Report History</Link>
            <Link to="/dashboard">Dashboard</Link>
          </nav>

          <div className="reports-state-message" aria-live="polite">
            {isLoading ? <p>Loading report...</p> : null}
            {errorMessage ? <p role="alert">{errorMessage}</p> : null}
          </div>

          {!isLoading && isNotFound ? (
            <section className="reports-empty-state" aria-labelledby="report-not-found-title">
              <h1 id="report-not-found-title">Report Not Found</h1>
              <p>This report does not exist or you do not have access to it.</p>
              <Link className="dashboard-primary-action" to="/reports">
                Back to Report History
              </Link>
            </section>
          ) : null}

          {!isLoading && report ? (
            <article className="dashboard-analysis-result" aria-labelledby="report-details-title">
              <div className="dashboard-analysis-heading">
                <div>
                  <p className="eyebrow">Saved report</p>
                  <h1 id="report-details-title">Resume Report</h1>
                  <p title={report.fileName}>{report.fileName}</p>
                </div>
                <Link className="dashboard-secondary-action" to="/reports">
                  Back to History
                </Link>
              </div>

              <dl className="report-details-metadata" aria-label="Report metadata">
                <div>
                  <dt>Saved</dt>
                  <dd>{formatDisplayDate(report.createdAt)}</dd>
                </div>
                <div>
                  <dt>Updated</dt>
                  <dd>{formatDisplayDate(report.updatedAt)}</dd>
                </div>
                <div>
                  <dt>Model</dt>
                  <dd>{report.aiModel}</dd>
                </div>
              </dl>

              <ReportAnalysisContent
                analysis={report.analysis}
                extraction={report.extraction}
                fileName={report.fileName}
              />
            </article>
          ) : null}
        </main>
      </div>
    </div>
  )
}

export default ReportDetailsPage

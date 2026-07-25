import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import DashboardHeader from '../../components/dashboard/DashboardHeader.jsx'
import DashboardSidebar from '../../components/dashboard/DashboardSidebar.jsx'
import MobileNavigation from '../../components/dashboard/MobileNavigation.jsx'
import OverviewCard from '../../components/dashboard/OverviewCard.jsx'
import ProfileSummary from '../../components/dashboard/ProfileSummary.jsx'
import QuickActions from '../../components/dashboard/QuickActions.jsx'
import RecentReportsEmptyState from '../../components/dashboard/RecentReportsEmptyState.jsx'
import RecentReportsList from '../../components/dashboard/RecentReportsList.jsx'
import ResumeUploadPlaceholder from '../../components/dashboard/ResumeUploadPlaceholder.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { getDashboardSummary } from '../../services/resumeService.js'

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

const getUserName = (user) => user?.full_name?.trim() || 'User'

const getUserEmail = (user) => user?.email?.trim() || 'Email not available'

const getFirstName = (user) => {
  const fullName = user?.full_name?.trim()

  if (!fullName) {
    return ''
  }

  return fullName.split(/\s+/)[0]
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

  const email = user?.email?.trim()

  if (email) {
    return email.charAt(0).toUpperCase()
  }

  return 'U'
}

const getAccountStatus = (user) => {
  if (user?.is_active === true) {
    return 'Active'
  }

  if (user?.is_active === false) {
    return 'Inactive'
  }

  return 'Not available'
}

function DashboardPage() {
  const { logout, user } = useAuth()
  const location = useLocation()
  const profileRef = useRef(null)
  const mainContentRef = useRef(null)
  const [dashboardSummary, setDashboardSummary] = useState({
    totalReports: null,
    latestScore: null,
    recentReports: [],
  })
  const [isSummaryLoading, setIsSummaryLoading] = useState(true)
  const [summaryError, setSummaryError] = useState('')

  const userName = getUserName(user)
  const userEmail = getUserEmail(user)
  const firstName = getFirstName(user)
  const userInitials = getInitials(user)
  const roleLabel = formatRole(user?.role)
  const accountStatus = getAccountStatus(user)

  const fetchDashboardSummary = useCallback(async () => {
    setIsSummaryLoading(true)
    setSummaryError('')

    try {
      const summary = await getDashboardSummary()
      setDashboardSummary({
        totalReports: summary?.totalReports ?? 0,
        latestScore: summary?.latestScore ?? null,
        recentReports: Array.isArray(summary?.recentReports)
          ? summary.recentReports
          : [],
      })
    } catch (error) {
      setSummaryError(error.message)
      setDashboardSummary({
        totalReports: 0,
        latestScore: null,
        recentReports: [],
      })
    } finally {
      setIsSummaryLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardSummary()
  }, [fetchDashboardSummary])

  const focusMainContent = () => {
    mainContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const focusProfileSummary = () => {
    profileRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    profileRef.current?.focus({ preventScroll: true })
  }

  const navigationItems = [
    ...(user?.role === 'admin'
      ? [
          {
            label: 'Admin Dashboard',
            href: '/admin',
            isActive: location.pathname === '/admin',
          },
        ]
      : []),
    {
      label: 'Dashboard',
      href: '/dashboard',
      isActive: location.pathname === '/dashboard',
    },
    {
      label: 'Reports',
      href: '/reports',
      isActive: location.pathname.startsWith('/reports'),
    },
    {
      label: 'Analyze Resume',
      onClick: focusMainContent,
    },
    {
      label: 'Profile',
      href: '/profile',
      isActive: location.pathname === '/profile',
    },
  ]

  const overviewCards = [
    {
      label: 'Total Reports',
      value: isSummaryLoading ? 'Loading' : `${dashboardSummary.totalReports ?? 0}`,
      supportingText:
        !isSummaryLoading && dashboardSummary.totalReports > 0
          ? 'Saved resume reports'
          : 'No reports generated yet',
      tone: 'teal',
    },
    {
      label: 'Latest Score',
      value:
        isSummaryLoading || dashboardSummary.latestScore === null
          ? 'Not available'
          : `${dashboardSummary.latestScore}/100`,
      supportingText:
        dashboardSummary.latestScore === null
          ? 'Analyze a resume to receive a score'
          : 'Newest saved resume score',
      tone: 'blue',
    },
    {
      label: 'Account Status',
      value: accountStatus,
      supportingText:
        user?.is_active === true
          ? 'Your account is ready'
          : 'Status comes from your profile',
      tone: 'green',
    },
    {
      label: 'Current Plan',
      value: 'Free',
      supportingText: 'Starter access',
      tone: 'slate',
    },
  ]

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

        <main className="dashboard-main" ref={mainContentRef}>
          <DashboardHeader
            accountStatus={accountStatus}
            roleLabel={roleLabel}
            userEmail={userEmail}
            userInitials={userInitials}
            userName={userName}
          />

          <section className="dashboard-welcome" aria-labelledby="dashboard-welcome-title">
            <div>
              <p className="eyebrow">Overview</p>
              <h2 id="dashboard-welcome-title">
                {firstName ? `Welcome back, ${firstName}` : 'Welcome back'}
              </h2>
              <p>
                This workspace is ready for your upcoming resume analysis tools.
                Uploads, scoring, and recruiter-focused insights will become
                available in later phases.
              </p>
            </div>
            {user?.is_active === true ? (
              <span className="dashboard-status-pill">Account Active</span>
            ) : null}
          </section>

          <section className="dashboard-overview-grid" aria-label="Dashboard overview">
            {overviewCards.map((card) => (
              <OverviewCard
                key={card.label}
                label={card.label}
                supportingText={card.supportingText}
                tone={card.tone}
                value={card.value}
              />
            ))}
          </section>

          <div className="dashboard-content-grid">
            <ResumeUploadPlaceholder onReportSaved={fetchDashboardSummary} />
            <ProfileSummary
              accountStatus={accountStatus}
              profileRef={profileRef}
              roleLabel={roleLabel}
              userEmail={userEmail}
              userInitials={userInitials}
              userName={userName}
            />
          </div>

          <div className="dashboard-summary-feedback" aria-live="polite">
            {isSummaryLoading ? (
              <p>Loading dashboard reports...</p>
            ) : null}
            {summaryError ? (
              <p role="alert">
                Dashboard data could not be loaded. Please refresh and try again.
              </p>
            ) : null}
          </div>

          {!isSummaryLoading && !summaryError && dashboardSummary.recentReports.length > 0 ? (
            <RecentReportsList reports={dashboardSummary.recentReports} />
          ) : null}

          {!isSummaryLoading && !summaryError && dashboardSummary.recentReports.length === 0 ? (
            <RecentReportsEmptyState />
          ) : null}

          <QuickActions onReviewProfile={focusProfileSummary} />
        </main>
      </div>
    </div>
  )
}

export default DashboardPage

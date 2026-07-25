import { useRef } from 'react'
import DashboardHeader from '../../components/dashboard/DashboardHeader.jsx'
import DashboardSidebar from '../../components/dashboard/DashboardSidebar.jsx'
import MobileNavigation from '../../components/dashboard/MobileNavigation.jsx'
import OverviewCard from '../../components/dashboard/OverviewCard.jsx'
import ProfileSummary from '../../components/dashboard/ProfileSummary.jsx'
import QuickActions from '../../components/dashboard/QuickActions.jsx'
import RecentReportsEmptyState from '../../components/dashboard/RecentReportsEmptyState.jsx'
import ResumeUploadPlaceholder from '../../components/dashboard/ResumeUploadPlaceholder.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

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
  const profileRef = useRef(null)
  const mainContentRef = useRef(null)

  const userName = getUserName(user)
  const userEmail = getUserEmail(user)
  const firstName = getFirstName(user)
  const userInitials = getInitials(user)
  const roleLabel = formatRole(user?.role)
  const accountStatus = getAccountStatus(user)

  const focusMainContent = () => {
    mainContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const focusProfileSummary = () => {
    profileRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    profileRef.current?.focus({ preventScroll: true })
  }

  const navigationItems = [
    {
      label: 'Overview',
      isActive: true,
      onClick: focusMainContent,
    },
    {
      label: 'Analyze Resume',
      isSoon: true,
    },
    {
      label: 'My Reports',
      isSoon: true,
    },
    {
      label: 'Profile',
      isSoon: true,
    },
  ]

  const overviewCards = [
    {
      label: 'Total Reports',
      value: '0',
      supportingText: 'No reports generated yet',
      tone: 'teal',
    },
    {
      label: 'Latest Score',
      value: 'Not available',
      supportingText: 'Analyze a resume to receive a score',
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
            <ResumeUploadPlaceholder />
            <ProfileSummary
              accountStatus={accountStatus}
              profileRef={profileRef}
              roleLabel={roleLabel}
              userEmail={userEmail}
              userInitials={userInitials}
              userName={userName}
            />
          </div>

          <RecentReportsEmptyState />

          <QuickActions onReviewProfile={focusProfileSummary} />
        </main>
      </div>
    </div>
  )
}

export default DashboardPage

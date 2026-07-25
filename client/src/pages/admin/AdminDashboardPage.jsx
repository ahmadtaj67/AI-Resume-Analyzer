import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminShell from '../../components/admin/AdminShell.jsx'
import OverviewCard from '../../components/dashboard/OverviewCard.jsx'
import { getAdminDashboard } from '../../services/adminService.js'

function AdminDashboardPage() {
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    const fetchStats = async () => {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const nextStats = await getAdminDashboard()

        if (isMounted) {
          setStats(nextStats)
        }
      } catch {
        if (isMounted) {
          setErrorMessage('Admin dashboard statistics could not be loaded. Please try again.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchStats()

    return () => {
      isMounted = false
    }
  }, [])

  const overviewCards = [
    {
      label: 'Total Users',
      value: isLoading ? 'Loading' : `${stats?.totalUsers ?? 0}`,
      supportingText: 'Registered platform accounts',
      tone: 'teal',
    },
    {
      label: 'Active Users',
      value: isLoading ? 'Loading' : `${stats?.activeUsers ?? 0}`,
      supportingText: 'Accounts allowed to sign in',
      tone: 'green',
    },
    {
      label: 'Total Reports',
      value: isLoading ? 'Loading' : `${stats?.totalReports ?? 0}`,
      supportingText: 'Saved resume analyses',
      tone: 'blue',
    },
  ]

  return (
    <AdminShell>
      <section className="reports-page-heading" aria-labelledby="admin-dashboard-title">
        <p className="eyebrow">Admin</p>
        <h1 id="admin-dashboard-title">Admin Dashboard</h1>
        <p>Monitor platform users and saved resume reports.</p>
      </section>

      <div className="reports-state-message" aria-live="polite">
        {isLoading ? <p>Loading admin statistics...</p> : null}
        {errorMessage ? <p role="alert">{errorMessage}</p> : null}
      </div>

      {!errorMessage ? (
        <section className="dashboard-overview-grid admin-overview-grid" aria-label="Admin overview">
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
      ) : null}

      <section className="dashboard-panel admin-actions-panel" aria-labelledby="admin-actions-title">
        <div className="dashboard-section-heading">
          <p className="eyebrow">Manage</p>
          <h2 id="admin-actions-title">Admin Tools</h2>
          <p>Review users, account status, and saved report activity.</p>
        </div>
        <div className="admin-action-links">
          <Link className="dashboard-primary-action" to="/admin/users">
            Manage Users
          </Link>
          <Link className="dashboard-secondary-action" to="/admin/reports">
            View Reports
          </Link>
        </div>
      </section>
    </AdminShell>
  )
}

export default AdminDashboardPage

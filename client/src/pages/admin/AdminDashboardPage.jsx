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
      label: 'Inactive Users',
      value: isLoading ? 'Loading' : `${stats?.inactiveUsers ?? 0}`,
      supportingText: 'Accounts blocked from sign in',
      tone: 'slate',
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
          <Link className="dashboard-secondary-action" to="/admin/analytics">
            View Analytics
          </Link>
          <Link className="dashboard-secondary-action" to="/admin/reports">
            View Reports
          </Link>
          <Link className="dashboard-secondary-action" to="/admin/settings">
            Platform Settings
          </Link>
        </div>
      </section>

      {!isLoading && !errorMessage ? (
        <div className="admin-dashboard-activity-grid">
          <section className="dashboard-panel" aria-labelledby="recent-admin-users-title">
            <div className="dashboard-section-heading">
              <p className="eyebrow">Recent</p>
              <h2 id="recent-admin-users-title">Recent Users</h2>
              <p>Newest registered platform accounts.</p>
            </div>
            {stats?.recentUsers?.length > 0 ? (
              <div className="admin-list-stack">
                {stats.recentUsers.map((user) => (
                  <article className="admin-list-card" key={user.id}>
                    <div>
                      <h2>{user.fullName}</h2>
                      <p>{user.email}</p>
                    </div>
                    <dl>
                      <div>
                        <dt>Role</dt>
                        <dd>{user.role}</dd>
                      </div>
                      <div>
                        <dt>Status</dt>
                        <dd>{user.isActive ? 'Active' : 'Inactive'}</dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
            ) : (
              <p className="admin-empty-state">No recent users yet.</p>
            )}
          </section>

          <section className="dashboard-panel" aria-labelledby="recent-admin-reports-title">
            <div className="dashboard-section-heading">
              <p className="eyebrow">Recent</p>
              <h2 id="recent-admin-reports-title">Recent Reports</h2>
              <p>Newest saved resume analyses.</p>
            </div>
            {stats?.recentReports?.length > 0 ? (
              <div className="admin-list-stack">
                {stats.recentReports.map((report) => (
                  <article className="admin-list-card" key={report.id}>
                    <div>
                      <h2>{report.fileName}</h2>
                      <p>{report.userId}</p>
                    </div>
                    <dl>
                      <div>
                        <dt>Score</dt>
                        <dd>{report.overallScore ?? 'N/A'}</dd>
                      </div>
                      <div>
                        <dt>Created</dt>
                        <dd>{new Date(report.createdAt).toLocaleDateString()}</dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
            ) : (
              <p className="admin-empty-state">No recent reports yet.</p>
            )}
          </section>
        </div>
      ) : null}
    </AdminShell>
  )
}

export default AdminDashboardPage

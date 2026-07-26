import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AdminShell from '../../components/admin/AdminShell.jsx'
import ReportsPagination from '../../components/reports/ReportsPagination.jsx'
import {
  getAdminUser,
  getAdminUserReports,
  restoreAdminUser,
  softDeleteAdminUser,
  updateAdminUserStatus,
} from '../../services/adminService.js'
import { formatDisplayDate } from '../../utils/dateFormat.js'

const ADMIN_REPORT_LIMIT = 5

const getStatusLabel = (user) => {
  if (user?.isDeleted) {
    return 'Deleted'
  }

  return user?.isActive ? 'Active' : 'Inactive'
}

function AdminUserDetailsPage() {
  const { userId } = useParams()
  const [user, setUser] = useState(null)
  const [reports, setReports] = useState([])
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

  const fetchUserDetails = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const [nextUser, reportResult] = await Promise.all([
        getAdminUser(userId),
        getAdminUserReports({
          userId,
          page,
          limit: ADMIN_REPORT_LIMIT,
        }),
      ])

      setUser(nextUser)
      setReports(Array.isArray(reportResult?.reports) ? reportResult.reports : [])
      setPagination(reportResult?.pagination || null)
    } catch (error) {
      setErrorMessage(error.message || 'User details could not be loaded.')
      setUser(null)
      setReports([])
      setPagination(null)
    } finally {
      setIsLoading(false)
    }
  }, [page, userId])

  useEffect(() => {
    fetchUserDetails()
  }, [fetchUserDetails])

  const runUserAction = async (action) => {
    setIsUpdating(true)
    setErrorMessage('')
    setStatusMessage('')

    try {
      const result = await action()

      setUser(result.user)
      setStatusMessage(result.message)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <AdminShell>
      <section className="reports-page-heading" aria-labelledby="admin-user-details-title">
        <p className="eyebrow">Admin</p>
        <h1 id="admin-user-details-title">User Details</h1>
        <p>Review account status and report activity.</p>
      </section>

      <nav className="reports-breadcrumbs" aria-label="Admin user navigation">
        <Link to="/admin/users">Users</Link>
        <Link to="/admin">Admin Dashboard</Link>
      </nav>

      <div className="reports-state-message" aria-live="polite">
        {isLoading ? <p>Loading user details...</p> : null}
        {statusMessage ? <p>{statusMessage}</p> : null}
        {errorMessage ? <p role="alert">{errorMessage}</p> : null}
      </div>

      {!isLoading && user ? (
        <>
          <section className="admin-user-details-grid" aria-label="User profile summary">
            <article className="dashboard-panel admin-user-profile-card">
              <div className="dashboard-section-heading">
                <p className="eyebrow">Profile</p>
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
                  <dd>{getStatusLabel(user)}</dd>
                </div>
                <div>
                  <dt>Joined</dt>
                  <dd>{formatDisplayDate(user.createdAt)}</dd>
                </div>
                <div>
                  <dt>Last Activity</dt>
                  <dd>{formatDisplayDate(user.lastActivity)}</dd>
                </div>
              </dl>
            </article>

            <article className="dashboard-panel admin-user-profile-card">
              <div className="dashboard-section-heading">
                <p className="eyebrow">Reports</p>
                <h2>{user.totalReports ?? 0}</h2>
                <p>Latest score: {user.latestScore ?? 'Not available'}</p>
              </div>
              <div className="admin-detail-actions">
                {user.isDeleted ? (
                  <button
                    className="dashboard-primary-action"
                    disabled={isUpdating}
                    onClick={() => runUserAction(() => restoreAdminUser(user.id))}
                    type="button"
                  >
                    {isUpdating ? 'Restoring...' : 'Restore User'}
                  </button>
                ) : (
                  <>
                    <button
                      className={
                        user.isActive
                          ? 'dashboard-secondary-action'
                          : 'dashboard-primary-action'
                      }
                      disabled={isUpdating}
                      onClick={() =>
                        runUserAction(() =>
                          updateAdminUserStatus({
                            userId: user.id,
                            isActive: !user.isActive,
                          }),
                        )
                      }
                      type="button"
                    >
                      {isUpdating
                        ? 'Updating...'
                        : user.isActive
                          ? 'Deactivate User'
                          : 'Activate User'}
                    </button>
                    <button
                      className="dashboard-secondary-action danger-action"
                      disabled={isUpdating}
                      onClick={() => setIsDeleteConfirmOpen(true)}
                      type="button"
                    >
                      Soft Delete User
                    </button>
                  </>
                )}
              </div>
            </article>
          </section>

          <section className="admin-table-panel" aria-labelledby="admin-user-reports-title">
            <div className="dashboard-section-heading">
              <p className="eyebrow">Activity</p>
              <h2 id="admin-user-reports-title">User Reports</h2>
              <p>Saved resume reports for this account.</p>
            </div>

            {reports.length > 0 ? (
              <ul className="admin-list">
                {reports.map((report) => (
                  <li className="admin-list-card" key={report.id}>
                    <div>
                      <h2 title={report.fileName}>{report.fileName}</h2>
                      <p>Report ID: {report.id}</p>
                    </div>
                    <dl>
                      <div>
                        <dt>Score</dt>
                        <dd>{report.overallScore ?? 'Not available'}</dd>
                      </div>
                      <div>
                        <dt>Saved</dt>
                        <dd>{formatDisplayDate(report.createdAt)}</dd>
                      </div>
                    </dl>
                    <Link className="dashboard-secondary-action" to={`/reports/${report.id}`}>
                      View Report
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="admin-empty-state">No saved reports for this user.</p>
            )}
          </section>

          <ReportsPagination onPageChange={setPage} pagination={pagination} />

          {isDeleteConfirmOpen ? (
            <div className="admin-confirm-backdrop" role="presentation">
              <section
                aria-labelledby="admin-detail-delete-title"
                aria-modal="true"
                className="admin-confirm-modal"
                role="dialog"
              >
                <h2 id="admin-detail-delete-title">Soft Delete User?</h2>
                <p>
                  {user.fullName} will be marked deleted and inactive. Their
                  saved resume reports will be preserved.
                </p>
                <div>
                  <button
                    className="dashboard-secondary-action"
                    onClick={() => setIsDeleteConfirmOpen(false)}
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    className="dashboard-primary-action"
                    disabled={isUpdating}
                    onClick={() =>
                      runUserAction(async () => {
                        const result = await softDeleteAdminUser(user.id)
                        setIsDeleteConfirmOpen(false)
                        return result
                      })
                    }
                    type="button"
                  >
                    {isUpdating ? 'Deleting...' : 'Confirm Delete'}
                  </button>
                </div>
              </section>
            </div>
          ) : null}
        </>
      ) : null}
    </AdminShell>
  )
}

export default AdminUserDetailsPage

import { useCallback, useEffect, useState } from 'react'
import AdminShell from '../../components/admin/AdminShell.jsx'
import ReportsPagination from '../../components/reports/ReportsPagination.jsx'
import {
  getAdminUsers,
  updateAdminUserStatus,
} from '../../services/adminService.js'
import { formatDisplayDate } from '../../utils/dateFormat.js'

const ADMIN_LIMIT = 10

function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [updatingUserId, setUpdatingUserId] = useState('')

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const result = await getAdminUsers({
        page,
        limit: ADMIN_LIMIT,
      })

      setUsers(Array.isArray(result?.users) ? result.users : [])
      setPagination(result?.pagination || null)
    } catch {
      setErrorMessage('Users could not be loaded. Please try again.')
      setUsers([])
      setPagination(null)
    } finally {
      setIsLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleStatusChange = async (user) => {
    if (updatingUserId) {
      return
    }

    setUpdatingUserId(user.id)
    setStatusMessage('')
    setErrorMessage('')

    try {
      const result = await updateAdminUserStatus({
        userId: user.id,
        isActive: !user.isActive,
      })

      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === result.user.id ? result.user : currentUser,
        ),
      )
      setStatusMessage(result.message || 'User status updated successfully.')
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setUpdatingUserId('')
    }
  }

  return (
    <AdminShell>
      <section className="reports-page-heading" aria-labelledby="admin-users-title">
        <p className="eyebrow">Admin</p>
        <h1 id="admin-users-title">Users</h1>
        <p>Review user accounts and manage active status.</p>
      </section>

      <div className="reports-state-message" aria-live="polite">
        {isLoading ? <p>Loading users...</p> : null}
        {statusMessage ? <p>{statusMessage}</p> : null}
        {errorMessage ? <p role="alert">{errorMessage}</p> : null}
      </div>

      {!isLoading && !errorMessage && users.length === 0 ? (
        <section className="reports-empty-state" aria-labelledby="admin-users-empty-title">
          <h2 id="admin-users-empty-title">No users found.</h2>
          <p>User accounts will appear here after registration.</p>
        </section>
      ) : null}

      {!isLoading && users.length > 0 ? (
        <>
          <section className="admin-table-panel" aria-label="Admin users list">
            <ul className="admin-list">
              {users.map((user) => (
                <li className="admin-list-card" key={user.id}>
                  <div>
                    <h2>{user.fullName}</h2>
                    <p title={user.email}>{user.email}</p>
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
                    <div>
                      <dt>Joined</dt>
                      <dd>{formatDisplayDate(user.createdAt)}</dd>
                    </div>
                  </dl>
                  <button
                    className={user.isActive ? 'dashboard-secondary-action' : 'dashboard-primary-action'}
                    disabled={updatingUserId === user.id}
                    onClick={() => handleStatusChange(user)}
                    type="button"
                  >
                    {updatingUserId === user.id
                      ? 'Updating...'
                      : user.isActive
                        ? 'Deactivate'
                        : 'Activate'}
                  </button>
                </li>
              ))}
            </ul>
          </section>
          <ReportsPagination
            onPageChange={setPage}
            pagination={pagination}
          />
        </>
      ) : null}
    </AdminShell>
  )
}

export default AdminUsersPage

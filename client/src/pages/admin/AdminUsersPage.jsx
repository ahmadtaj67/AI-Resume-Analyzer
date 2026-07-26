import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminShell from '../../components/admin/AdminShell.jsx'
import ReportsPagination from '../../components/reports/ReportsPagination.jsx'
import {
  getAdminUsers,
  restoreAdminUser,
  softDeleteAdminUser,
  updateAdminUserStatus,
} from '../../services/adminService.js'
import { formatDisplayDate } from '../../utils/dateFormat.js'

const ADMIN_LIMIT = 10
const userFilters = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Admin', value: 'admin' },
  { label: 'User', value: 'user' },
]

const getInitials = (user) => {
  const source = user?.fullName || user?.email || 'U'

  return source
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

const getStatusLabel = (user) => {
  if (user.isDeleted) {
    return 'Deleted'
  }

  return user.isActive ? 'Active' : 'Inactive'
}

function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [updatingUserId, setUpdatingUserId] = useState('')
  const [pendingDeleteUser, setPendingDeleteUser] = useState(null)

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const result = await getAdminUsers({
        page,
        limit: ADMIN_LIMIT,
        search,
        filter,
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
  }, [filter, page, search])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const updateUserInList = (nextUser) => {
    setUsers((currentUsers) =>
      currentUsers.map((currentUser) =>
        currentUser.id === nextUser.id ? nextUser : currentUser,
      ),
    )
  }

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    setPage(1)
    setSearch(searchInput.trim())
  }

  const handleFilterChange = (nextFilter) => {
    setPage(1)
    setFilter(nextFilter)
  }

  const handleStatusChange = async (user) => {
    if (updatingUserId || user.isDeleted) {
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

      updateUserInList(result.user)
      setStatusMessage(result.message || 'User status updated successfully.')
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setUpdatingUserId('')
    }
  }

  const handleRestore = async (user) => {
    if (updatingUserId) {
      return
    }

    setUpdatingUserId(user.id)
    setStatusMessage('')
    setErrorMessage('')

    try {
      const result = await restoreAdminUser(user.id)

      updateUserInList(result.user)
      setStatusMessage(result.message || 'User restored successfully.')
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setUpdatingUserId('')
    }
  }

  const handleDeleteConfirm = async () => {
    if (!pendingDeleteUser || updatingUserId) {
      return
    }

    setUpdatingUserId(pendingDeleteUser.id)
    setStatusMessage('')
    setErrorMessage('')

    try {
      const result = await softDeleteAdminUser(pendingDeleteUser.id)

      updateUserInList(result.user)
      setStatusMessage(result.message || 'User deleted successfully.')
      setPendingDeleteUser(null)
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
        <p>Search, review, and manage account access.</p>
      </section>

      <section className="admin-users-toolbar" aria-label="User search and filters">
        <form onSubmit={handleSearchSubmit}>
          <label htmlFor="admin-user-search">Search users</label>
          <div>
            <input
              id="admin-user-search"
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by name or email"
              type="search"
              value={searchInput}
            />
            <button className="dashboard-primary-action" type="submit">
              Search
            </button>
          </div>
        </form>

        <div className="admin-filter-tabs" role="group" aria-label="Filter users">
          {userFilters.map((item) => (
            <button
              aria-pressed={filter === item.value}
              className={filter === item.value ? 'is-active' : ''}
              key={item.value}
              onClick={() => handleFilterChange(item.value)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <div className="reports-state-message" aria-live="polite">
        {isLoading ? <p>Loading users...</p> : null}
        {statusMessage ? <p>{statusMessage}</p> : null}
        {errorMessage ? <p role="alert">{errorMessage}</p> : null}
      </div>

      {!isLoading && !errorMessage && users.length === 0 ? (
        <section className="reports-empty-state" aria-labelledby="admin-users-empty-title">
          <h2 id="admin-users-empty-title">No users found.</h2>
          <p>Try a different search term or filter.</p>
        </section>
      ) : null}

      {!isLoading && users.length > 0 ? (
        <>
          <section className="admin-table-panel" aria-label="Admin users table">
            <div className="admin-users-table">
              <div className="admin-users-row admin-users-row-header">
                <span>User</span>
                <span>Role</span>
                <span>Status</span>
                <span>Reports</span>
                <span>Latest Score</span>
                <span>Joined</span>
                <span>Actions</span>
              </div>

              {users.map((user) => (
                <article className="admin-users-row" key={user.id}>
                  <div className="admin-user-cell">
                    <span className="admin-user-avatar" aria-hidden="true">
                      {getInitials(user)}
                    </span>
                    <div>
                      <strong>{user.fullName}</strong>
                      <span title={user.email}>{user.email}</span>
                    </div>
                  </div>
                  <span className="admin-pill">{user.role}</span>
                  <span className={user.isDeleted ? 'admin-pill danger' : 'admin-pill'}>
                    {getStatusLabel(user)}
                  </span>
                  <span>{user.totalReports ?? 0}</span>
                  <span>{user.latestScore ?? 'N/A'}</span>
                  <span>{formatDisplayDate(user.createdAt)}</span>
                  <div className="admin-row-actions">
                    <Link className="dashboard-secondary-action" to={`/admin/users/${user.id}`}>
                      Details
                    </Link>
                    {user.isDeleted ? (
                      <button
                        className="dashboard-primary-action"
                        disabled={updatingUserId === user.id}
                        onClick={() => handleRestore(user)}
                        type="button"
                      >
                        {updatingUserId === user.id ? 'Restoring...' : 'Restore'}
                      </button>
                    ) : (
                      <>
                        <button
                          className={
                            user.isActive
                              ? 'dashboard-secondary-action'
                              : 'dashboard-primary-action'
                          }
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
                        <button
                          className="dashboard-secondary-action danger-action"
                          disabled={updatingUserId === user.id}
                          onClick={() => setPendingDeleteUser(user)}
                          type="button"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
          <ReportsPagination onPageChange={setPage} pagination={pagination} />
        </>
      ) : null}

      {pendingDeleteUser ? (
        <div className="admin-confirm-backdrop" role="presentation">
          <section
            aria-labelledby="admin-delete-title"
            aria-modal="true"
            className="admin-confirm-modal"
            role="dialog"
          >
            <h2 id="admin-delete-title">Soft Delete User?</h2>
            <p>
              {pendingDeleteUser.fullName} will be marked deleted and inactive.
              Their saved resume reports will be preserved.
            </p>
            <div>
              <button
                className="dashboard-secondary-action"
                onClick={() => setPendingDeleteUser(null)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="dashboard-primary-action"
                disabled={updatingUserId === pendingDeleteUser.id}
                onClick={handleDeleteConfirm}
                type="button"
              >
                {updatingUserId === pendingDeleteUser.id ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </AdminShell>
  )
}

export default AdminUsersPage

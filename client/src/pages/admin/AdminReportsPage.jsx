import { useCallback, useEffect, useState } from 'react'
import AdminShell from '../../components/admin/AdminShell.jsx'
import ReportsPagination from '../../components/reports/ReportsPagination.jsx'
import { getAdminReports } from '../../services/adminService.js'
import { formatDisplayDate } from '../../utils/dateFormat.js'

const ADMIN_LIMIT = 10

function AdminReportsPage() {
  const [reports, setReports] = useState([])
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const fetchReports = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const result = await getAdminReports({
        page,
        limit: ADMIN_LIMIT,
      })

      setReports(Array.isArray(result?.reports) ? result.reports : [])
      setPagination(result?.pagination || null)
    } catch {
      setErrorMessage('Reports could not be loaded. Please try again.')
      setReports([])
      setPagination(null)
    } finally {
      setIsLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  return (
    <AdminShell>
      <section className="reports-page-heading" aria-labelledby="admin-reports-title">
        <p className="eyebrow">Admin</p>
        <h1 id="admin-reports-title">Reports</h1>
        <p>Review saved resume report activity across the platform.</p>
      </section>

      <div className="reports-state-message" aria-live="polite">
        {isLoading ? <p>Loading reports...</p> : null}
        {errorMessage ? <p role="alert">{errorMessage}</p> : null}
      </div>

      {!isLoading && !errorMessage && reports.length === 0 ? (
        <section className="reports-empty-state" aria-labelledby="admin-reports-empty-title">
          <h2 id="admin-reports-empty-title">No reports found.</h2>
          <p>Saved resume reports will appear here after analysis.</p>
        </section>
      ) : null}

      {!isLoading && !errorMessage && reports.length > 0 ? (
        <>
          <section className="admin-table-panel" aria-label="Admin reports list">
            <ul className="admin-list">
              {reports.map((report) => (
                <li className="admin-list-card" key={report.id}>
                  <div>
                    <h2 title={report.fileName}>{report.fileName}</h2>
                    <p>User ID: {report.userId}</p>
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
                    <div>
                      <dt>Updated</dt>
                      <dd>{formatDisplayDate(report.updatedAt)}</dd>
                    </div>
                  </dl>
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

export default AdminReportsPage

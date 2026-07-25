import { Link } from 'react-router-dom'
import { formatDisplayDate } from '../../utils/dateFormat.js'

function RecentReportsList({ reports }) {
  return (
    <section className="dashboard-panel dashboard-reports-panel" aria-labelledby="recent-reports-title">
      <div className="dashboard-section-heading">
        <p className="eyebrow">Reports</p>
        <h2 id="recent-reports-title">Recent Reports</h2>
        <p>Your newest saved resume analysis reports appear here.</p>
        <Link className="dashboard-inline-link" to="/reports">
          View All Reports
        </Link>
      </div>

      <ul className="dashboard-reports-list" aria-label="Recent saved reports">
        {reports.map((report) => (
          <li key={report.id}>
            <article className="dashboard-report-item">
              <div>
                <strong title={report.fileName}>{report.fileName}</strong>
                <span>{formatDisplayDate(report.createdAt)}</span>
              </div>
              <dl>
                <div>
                  <dt>Score</dt>
                  <dd>{report.overallScore}/100</dd>
                </div>
                <div>
                  <dt>Model</dt>
                  <dd>{report.aiModel}</dd>
                </div>
              </dl>
              {report.id ? (
                <Link className="dashboard-secondary-action" to={`/reports/${report.id}`}>
                  View Report
                </Link>
              ) : (
                <p>Saved report</p>
              )}
            </article>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default RecentReportsList

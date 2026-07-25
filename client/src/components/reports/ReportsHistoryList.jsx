import { Link } from 'react-router-dom'
import { formatDisplayDate } from '../../utils/dateFormat.js'

function ReportsHistoryList({ reports }) {
  return (
    <ul className="reports-history-list" aria-label="Saved resume reports">
      {reports.map((report) => (
        <li key={report.id}>
          <article className="reports-history-card">
            <div>
              <h2 title={report.fileName}>{report.fileName}</h2>
              <p>Saved {formatDisplayDate(report.createdAt)}</p>
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
            <Link className="dashboard-primary-action" to={`/reports/${report.id}`}>
              View Report
            </Link>
          </article>
        </li>
      ))}
    </ul>
  )
}

export default ReportsHistoryList


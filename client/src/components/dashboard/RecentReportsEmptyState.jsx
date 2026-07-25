function RecentReportsEmptyState() {
  return (
    <section className="dashboard-panel dashboard-reports-panel" aria-labelledby="recent-reports-title">
      <div className="dashboard-section-heading">
        <p className="eyebrow">Reports</p>
        <h2 id="recent-reports-title">Recent Reports</h2>
        <p>Your analyzed resume reports will appear here when reporting is added.</p>
      </div>

      <div className="dashboard-empty-state">
        <div className="dashboard-empty-illustration" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <h3>You have not analyzed any resumes yet.</h3>
        <p>
          Resume reports, scoring, and recommendations are planned for a future
          phase.
        </p>
        <button className="dashboard-secondary-action" type="button" disabled>
          Reports Coming Soon
        </button>
      </div>
    </section>
  )
}

export default RecentReportsEmptyState

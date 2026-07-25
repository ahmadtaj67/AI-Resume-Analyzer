function RecentReportsEmptyState() {
  return (
    <section className="dashboard-panel dashboard-reports-panel" aria-labelledby="recent-reports-title">
      <div className="dashboard-section-heading">
        <p className="eyebrow">Reports</p>
        <h2 id="recent-reports-title">Recent Reports</h2>
        <p>Your saved resume analysis reports will appear here.</p>
      </div>

      <div className="dashboard-empty-state">
        <div className="dashboard-empty-illustration" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <h3>You have not analyzed any resumes yet.</h3>
        <p>
          Analyze a PDF resume to save your first report. The original PDF file
          is not permanently stored.
        </p>
        <button className="dashboard-secondary-action" type="button" disabled>
          No Reports Yet
        </button>
      </div>
    </section>
  )
}

export default RecentReportsEmptyState

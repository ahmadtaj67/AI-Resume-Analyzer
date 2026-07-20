function DashboardPage() {
  return (
    <section className="dashboard-page" aria-labelledby="dashboard-title">
      <div className="dashboard-hero">
        <p className="eyebrow">Development preview</p>
        <h1 id="dashboard-title">Welcome to AI Resume Analyzer</h1>
        <p>
          This dashboard will later contain resume analysis features, report
          history, and guided recruiter workflows.
        </p>
        <span className="development-badge">
          Dashboard features coming in future phases
        </span>
      </div>

      <div className="upload-placeholder" aria-label="Future upload placeholder">
        <div>
          <h2>Resume upload workspace</h2>
          <p>
            A secure PDF upload and AI analysis flow will be added in a later
            phase.
          </p>
        </div>
        <button className="secondary-button" type="button" disabled>
          Upload coming soon
        </button>
      </div>
    </section>
  )
}

export default DashboardPage

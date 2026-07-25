function ResumeUploadPlaceholder() {
  return (
    <section className="dashboard-panel dashboard-upload-panel" aria-labelledby="upload-placeholder-title">
      <div className="dashboard-section-heading">
        <p className="eyebrow">Resume analysis</p>
        <h2 id="upload-placeholder-title">Analyze Your Resume</h2>
        <p>
          A guided PDF upload and AI analysis workflow will become available in
          a later phase.
        </p>
      </div>

      <div className="dashboard-upload-dropzone" aria-label="Future upload area">
        <span aria-hidden="true">PDF</span>
        <strong>Upload workspace coming soon</strong>
        <p>PDF support will be added in a future phase.</p>
      </div>

      <button className="dashboard-primary-action" type="button" disabled>
        Upload Resume - Coming Soon
      </button>
    </section>
  )
}

export default ResumeUploadPlaceholder

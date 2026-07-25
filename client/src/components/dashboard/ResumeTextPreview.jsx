function ResumeTextPreview({ extractionResult, onClear }) {
  if (!extractionResult) {
    return null
  }

  const stats = [
    {
      label: 'Pages',
      value: extractionResult.pageCount ?? 'Not available',
    },
    {
      label: 'Words',
      value: extractionResult.wordCount ?? 0,
    },
    {
      label: 'Characters',
      value: extractionResult.characterCount ?? 0,
    },
  ]

  return (
    <section
      className="dashboard-text-preview"
      aria-labelledby="resume-text-preview-title"
    >
      <div className="dashboard-text-preview-heading">
        <div>
          <p className="eyebrow">Text extraction</p>
          <h3 id="resume-text-preview-title">Resume Text Extracted</h3>
          <p>
            Readable text was extracted from your PDF. AI analysis has not been
            performed yet.
          </p>
        </div>
        <button className="dashboard-secondary-action" type="button" onClick={onClear}>
          Clear Result
        </button>
      </div>

      <dl className="dashboard-extraction-stats" aria-label="Extraction summary">
        <div>
          <dt>File</dt>
          <dd title={extractionResult.fileName}>{extractionResult.fileName}</dd>
        </div>
        {stats.map((stat) => (
          <div key={stat.label}>
            <dt>{stat.label}</dt>
            <dd>{stat.value}</dd>
          </div>
        ))}
      </dl>

      <div
        className="dashboard-preview-box"
        aria-label="Extracted resume text preview"
        tabIndex="0"
      >
        <pre>{extractionResult.textPreview}</pre>
      </div>

      {extractionResult.isPreviewTruncated ? (
        <p className="dashboard-preview-note">
          Preview is limited for safety. Full analysis will be added in a later
          phase.
        </p>
      ) : null}
    </section>
  )
}

export default ResumeTextPreview

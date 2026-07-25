import ReportAnalysisContent from '../reports/ReportAnalysisContent.jsx'

function ResumeAnalysisResult({ result, onClear }) {
  if (!result?.analysis) {
    return null
  }

  const { analysis, extraction, file } = result

  return (
    <section
      className="dashboard-analysis-result"
      aria-labelledby="resume-analysis-result-title"
    >
      <div className="dashboard-analysis-heading">
        <div>
          <p className="eyebrow">Saved analysis</p>
          <h3 id="resume-analysis-result-title">AI Resume Analysis</h3>
          <p>
            This analysis has been saved to your report history. The original
            PDF file was not permanently stored.
          </p>
        </div>
        <button className="dashboard-secondary-action" type="button" onClick={onClear}>
          Analyze Another Resume
        </button>
      </div>

      <ReportAnalysisContent
        analysis={analysis}
        extraction={extraction}
        fileName={file?.fileName}
      />
    </section>
  )
}

export default ResumeAnalysisResult

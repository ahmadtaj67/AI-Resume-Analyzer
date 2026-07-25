const scoreLabels = [
  {
    max: 39,
    label: 'Needs significant improvement',
  },
  {
    max: 59,
    label: 'Developing',
  },
  {
    max: 79,
    label: 'Good foundation',
  },
  {
    max: 100,
    label: 'Strong resume',
  },
]

const atsCheckLabels = {
  hasContactInformation: 'Contact information',
  hasProfessionalSummary: 'Professional summary',
  hasSkillsSection: 'Skills section',
  hasExperienceSection: 'Experience section',
  hasEducationSection: 'Education section',
  usesActionVerbs: 'Action verbs',
  hasMeasurableAchievements: 'Measurable achievements',
}

const getScoreLabel = (score) =>
  scoreLabels.find((item) => score <= item.max)?.label || 'Needs review'

const formatFormattingQuality = (value) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return 'Needs review'
  }

  return value
    .trim()
    .split(/\s+/)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join(' ')
}

const renderList = (title, items, emptyText) => (
  <section className="dashboard-analysis-section" aria-label={title}>
    <h4>{title}</h4>
    {Array.isArray(items) && items.length > 0 ? (
      <ul>
        {items.map((item, index) => (
          <li key={`${title}-${item}-${index}`}>{item}</li>
        ))}
      </ul>
    ) : (
      <p>{emptyText}</p>
    )}
  </section>
)

function ResumeAnalysisResult({ result, onClear }) {
  if (!result?.analysis) {
    return null
  }

  const { analysis, extraction, file } = result
  const score = analysis.overallScore
  const scoreLabel = getScoreLabel(score)
  const atsChecks = analysis.atsChecks || {}

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

      <div className="dashboard-analysis-score-card" aria-label="Resume quality score">
        <div>
          <span>Resume quality score</span>
          <strong>{score}/100</strong>
          <p>{scoreLabel}</p>
        </div>
        <p>
          This score is an AI-generated resume quality estimate, not a hiring
          decision.
        </p>
      </div>

      <dl className="dashboard-analysis-meta" aria-label="Analyzed file summary">
        <div>
          <dt>File</dt>
          <dd title={file?.fileName}>{file?.fileName || 'Resume PDF'}</dd>
        </div>
        <div>
          <dt>Pages</dt>
          <dd>{extraction?.pageCount ?? 'Not available'}</dd>
        </div>
        <div>
          <dt>Words</dt>
          <dd>{extraction?.wordCount ?? 0}</dd>
        </div>
        <div>
          <dt>Characters</dt>
          <dd>{extraction?.characterCount ?? 0}</dd>
        </div>
      </dl>

      <section className="dashboard-analysis-summary" aria-label="Professional summary">
        <h4>Professional Summary</h4>
        <p>{analysis.professionalSummary || 'No summary returned.'}</p>
      </section>

      <div className="dashboard-analysis-grid">
        {renderList('Strengths', analysis.strengths, 'No clear strengths were returned.')}
        {renderList(
          'Areas To Improve',
          analysis.weaknesses,
          'No improvement areas were returned.',
        )}
        {renderList(
          'Detected Skills',
          analysis.detectedSkills,
          'No skills were detected from the resume text.',
        )}
        {renderList(
          'Missing Or Weak Sections',
          analysis.missingSections,
          'No missing sections were returned.',
        )}
        {renderList(
          'Actionable Suggestions',
          analysis.improvementSuggestions,
          'No suggestions were returned.',
        )}
      </div>

      <section className="dashboard-ats-checks" aria-label="ATS checks">
        <h4>ATS Checks</h4>
        <dl>
          {Object.entries(atsCheckLabels).map(([key, label]) => (
            <div key={key}>
              <dt>{label}</dt>
              <dd>{atsChecks[key] ? 'Present' : 'Missing or needs improvement'}</dd>
            </div>
          ))}
          <div>
            <dt>Formatting quality</dt>
            <dd>{formatFormattingQuality(atsChecks.formattingQuality)}</dd>
          </div>
        </dl>
      </section>
    </section>
  )
}

export default ResumeAnalysisResult

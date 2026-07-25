const scoreLabels = [
  { max: 39, label: 'Needs significant improvement' },
  { max: 59, label: 'Developing' },
  { max: 79, label: 'Good foundation' },
  { max: 100, label: 'Strong resume' },
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

const getSafeList = (items) => (Array.isArray(items) ? items : [])

const renderList = (title, items, emptyText) => {
  const safeItems = getSafeList(items)

  return (
    <section className="dashboard-analysis-section" aria-label={title}>
      <h4>{title}</h4>
      {safeItems.length > 0 ? (
        <ul>
          {safeItems.map((item, index) => (
            <li key={`${title}-${item}-${index}`}>{item}</li>
          ))}
        </ul>
      ) : (
        <p>{emptyText}</p>
      )}
    </section>
  )
}

function ReportAnalysisContent({ analysis, extraction, fileName }) {
  const safeAnalysis = analysis || {}
  const score = safeAnalysis.overallScore ?? 0
  const scoreLabel = getScoreLabel(score)
  const atsChecks = safeAnalysis.atsChecks || {}

  return (
    <>
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

      <dl className="dashboard-analysis-meta" aria-label="Report file summary">
        <div>
          <dt>File</dt>
          <dd title={fileName}>{fileName || 'Resume PDF'}</dd>
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
        <p>{safeAnalysis.professionalSummary || 'No summary saved for this report.'}</p>
      </section>

      <div className="dashboard-analysis-grid">
        {renderList('Strengths', safeAnalysis.strengths, 'No strengths were saved.')}
        {renderList(
          'Areas To Improve',
          safeAnalysis.weaknesses,
          'No improvement areas were saved.',
        )}
        {renderList(
          'Detected Skills',
          safeAnalysis.detectedSkills,
          'No skills were saved.',
        )}
        {renderList(
          'Missing Or Weak Sections',
          safeAnalysis.missingSections,
          'No missing sections were saved.',
        )}
        {renderList(
          'Actionable Suggestions',
          safeAnalysis.improvementSuggestions,
          'No suggestions were saved.',
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
    </>
  )
}

export default ReportAnalysisContent


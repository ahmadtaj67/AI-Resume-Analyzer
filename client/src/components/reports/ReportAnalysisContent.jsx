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

const sectionScoreLabels = {
  contact: 'Contact',
  summary: 'Summary',
  skills: 'Skills',
  experience: 'Experience',
  education: 'Education',
  projects: 'Projects',
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

const getSafeScore = (value) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0
  }

  return Math.min(100, Math.max(0, Math.round(value)))
}

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

const renderMetricCard = ({ label, value, supportingText }) => (
  <div className="premium-score-metric" key={label}>
    <span>{label}</span>
    <strong>{value}</strong>
    <p>{supportingText}</p>
  </div>
)

const renderProgressBar = ({ label, score }) => {
  const safeScore = getSafeScore(score)

  return (
    <div className="premium-section-score" key={label}>
      <div>
        <span>{label}</span>
        <strong>{safeScore}/100</strong>
      </div>
      <div
        className="premium-progress-track"
        role="progressbar"
        aria-label={`${label} score`}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={safeScore}
      >
        <span style={{ width: `${safeScore}%` }} />
      </div>
    </div>
  )
}

const renderStrengthRanking = (items) => {
  const safeItems = getSafeList(items)

  return (
    <section className="dashboard-analysis-section" aria-label="Strength ranking">
      <h4>Strength Ranking</h4>
      {safeItems.length > 0 ? (
        <ol className="premium-strength-ranking">
          {safeItems.map((item, index) => {
            const rank = item?.rank || index + 1
            const label = item?.label || `Strength ${rank}`
            const reason = item?.reason || 'Identified as a resume strength.'

            return (
              <li key={`${label}-${rank}`}>
                <span>{rank}</span>
                <div>
                  <strong>{label}</strong>
                  <p>{reason}</p>
                </div>
              </li>
            )
          })}
        </ol>
      ) : (
        <p>No ranked strengths were saved.</p>
      )}
    </section>
  )
}

function ReportAnalysisContent({ analysis, extraction, fileName }) {
  const safeAnalysis = analysis || {}
  const score = getSafeScore(safeAnalysis.overallScore)
  const atsScore = getSafeScore(safeAnalysis.atsScore ?? score)
  const hiringProbability = getSafeScore(safeAnalysis.hiringProbability ?? score)
  const scoreLabel = getScoreLabel(score)
  const atsChecks = safeAnalysis.atsChecks || {}
  const sectionScores = safeAnalysis.resumeSectionScores || {}

  return (
    <>
      <section className="premium-score-card" aria-label="Premium resume score summary">
        {renderMetricCard({
          label: 'Overall Score',
          value: `${score}/100`,
          supportingText: scoreLabel,
        })}
        {renderMetricCard({
          label: 'ATS Score',
          value: `${atsScore}/100`,
          supportingText: 'Applicant tracking readiness',
        })}
        {renderMetricCard({
          label: 'Resume Grade',
          value: safeAnalysis.resumeGrade || 'Not available',
          supportingText: 'Document quality grade',
        })}
        {renderMetricCard({
          label: 'Hiring Probability',
          value: `${hiringProbability}%`,
          supportingText: 'Resume-readiness estimate',
        })}
        <p className="premium-score-disclaimer">
          Scores are AI-generated resume quality estimates, not hiring decisions.
        </p>
      </section>

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

      <div className="premium-verdict-grid">
        <section className="dashboard-analysis-summary" aria-label="Recruiter verdict">
          <h4>Recruiter Verdict</h4>
          <p>
            {safeAnalysis.recruiterVerdict ||
              'No recruiter verdict was saved for this report.'}
          </p>
        </section>

        <section className="dashboard-analysis-summary" aria-label="Job readiness status">
          <h4>Job Readiness Status</h4>
          <p>{safeAnalysis.jobReadiness || 'No readiness status was saved.'}</p>
        </section>
      </div>

      <section className="dashboard-analysis-summary" aria-label="Professional summary">
        <h4>Professional Summary</h4>
        <p>{safeAnalysis.professionalSummary || 'No summary saved for this report.'}</p>
      </section>

      <section className="premium-section-scores" aria-label="Resume section scores">
        <h4>Resume Section Scores</h4>
        <div>
          {Object.entries(sectionScoreLabels).map(([key, label]) =>
            renderProgressBar({ label, score: sectionScores[key] }),
          )}
        </div>
      </section>

      <div className="dashboard-analysis-grid">
        {renderList('Strengths', safeAnalysis.strengths, 'No strengths were saved.')}
        {renderList(
          'Weaknesses',
          safeAnalysis.weaknesses,
          'No weaknesses were saved.',
        )}
        {renderList(
          'Missing Skills',
          safeAnalysis.missingSkills,
          'No missing skills were saved.',
        )}
        {renderList(
          'Recommended Skills',
          safeAnalysis.recommendedSkills,
          'No recommended skills were saved.',
        )}
        {renderList(
          'Priority Improvements',
          safeAnalysis.priorityImprovements,
          'No priority improvements were saved.',
        )}
        {renderStrengthRanking(safeAnalysis.strengthRanking)}
        {renderList(
          'Detected Skills',
          safeAnalysis.detectedSkills,
          'No detected skills were saved.',
        )}
        {renderList(
          'Missing Or Weak Sections',
          safeAnalysis.missingSections,
          'No missing sections were saved.',
        )}
      </div>

      <section className="dashboard-ats-checks" aria-label="ATS checklist">
        <h4>ATS Checklist</h4>
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

      <section className="dashboard-analysis-summary" aria-label="Final recommendation">
        <h4>Final Recommendation</h4>
        <p>
          {safeAnalysis.finalRecommendation ||
            'No final recommendation was saved for this report.'}
        </p>
      </section>
    </>
  )
}

export default ReportAnalysisContent

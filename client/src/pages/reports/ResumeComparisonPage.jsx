import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import DashboardHeader from '../../components/dashboard/DashboardHeader.jsx'
import DashboardSidebar from '../../components/dashboard/DashboardSidebar.jsx'
import MobileNavigation from '../../components/dashboard/MobileNavigation.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import {
  compareReports,
  getReportComparisonOptions,
} from '../../services/resumeService.js'
import { formatDisplayDate } from '../../utils/dateFormat.js'

const sectionLabels = {
  contact: 'Contact',
  summary: 'Summary',
  skills: 'Skills',
  experience: 'Experience',
  education: 'Education',
  projects: 'Projects',
}

const getInitials = (user) => {
  const fullName = user?.full_name?.trim()

  if (fullName) {
    return fullName
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('')
  }

  return user?.email?.charAt(0).toUpperCase() || 'U'
}

const getNavigationItems = (pathname, user) => [
  ...(user?.role === 'admin'
    ? [
        {
          label: 'Admin Dashboard',
          href: '/admin',
          isActive: pathname === '/admin',
        },
      ]
    : []),
  {
    label: 'Dashboard',
    href: '/dashboard',
    isActive: pathname === '/dashboard',
  },
  {
    label: 'Reports',
    href: '/reports',
    isActive: pathname === '/reports' || pathname.startsWith('/reports/'),
  },
  {
    label: 'Compare',
    href: '/compare',
    isActive: pathname === '/compare',
  },
  {
    label: 'Profile',
    href: '/profile',
    isActive: pathname === '/profile',
  },
]

const formatDifference = (value, suffix = '') => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '0'
  }

  const prefix = value > 0 ? '+' : ''
  return `${prefix}${value}${suffix}`
}

const getDifferenceClassName = (value) => {
  if (value > 0) {
    return 'comparison-difference positive'
  }

  if (value < 0) {
    return 'comparison-difference negative'
  }

  return 'comparison-difference'
}

const renderList = (title, items, emptyText) => {
  const safeItems = Array.isArray(items) ? items : []

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

const renderMetricCard = ({ label, previousValue, currentValue, difference, suffix = '' }) => (
  <article className="comparison-metric-card">
    <span>{label}</span>
    <div>
      <p>
        Previous <strong>{previousValue}</strong>
      </p>
      <p>
        Current <strong>{currentValue}</strong>
      </p>
    </div>
    <strong className={getDifferenceClassName(difference)}>
      {formatDifference(difference, suffix)}
    </strong>
  </article>
)

function ResumeComparisonPage() {
  const { logout, user } = useAuth()
  const location = useLocation()
  const [reports, setReports] = useState([])
  const [previousReportId, setPreviousReportId] = useState('')
  const [currentReportId, setCurrentReportId] = useState('')
  const [comparison, setComparison] = useState(null)
  const [isLoadingOptions, setIsLoadingOptions] = useState(true)
  const [isComparing, setIsComparing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  const userName = user?.full_name?.trim() || 'User'
  const userEmail = user?.email?.trim() || 'Email not available'
  const userInitials = getInitials(user)
  const navigationItems = getNavigationItems(location.pathname, user)

  useEffect(() => {
    let isMounted = true

    const fetchOptions = async () => {
      setIsLoadingOptions(true)
      setErrorMessage('')

      try {
        const nextReports = await getReportComparisonOptions()

        if (isMounted) {
          const safeReports = Array.isArray(nextReports) ? nextReports : []
          setReports(safeReports)
          setPreviousReportId(safeReports[1]?.id || safeReports[0]?.id || '')
          setCurrentReportId(safeReports[0]?.id || '')
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message)
          setReports([])
        }
      } finally {
        if (isMounted) {
          setIsLoadingOptions(false)
        }
      }
    }

    fetchOptions()

    return () => {
      isMounted = false
    }
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (isComparing) {
      return
    }

    setComparison(null)
    setErrorMessage('')
    setStatusMessage('')

    if (!previousReportId || !currentReportId) {
      setErrorMessage('Please select two reports to compare.')
      return
    }

    if (previousReportId === currentReportId) {
      setErrorMessage('Please select two different reports to compare.')
      return
    }

    setIsComparing(true)

    try {
      const result = await compareReports({
        previousReportId,
        currentReportId,
      })

      setComparison(result.comparison)
      setStatusMessage(result.message || 'Resume comparison completed successfully.')
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsComparing(false)
    }
  }

  const scores = comparison?.scores || {}
  const skills = comparison?.skills || {}

  return (
    <div className="dashboard-shell">
      <DashboardSidebar
        navigationItems={navigationItems}
        onLogout={logout}
        userEmail={userEmail}
        userInitials={userInitials}
        userName={userName}
      />

      <div className="dashboard-main-shell">
        <MobileNavigation
          navigationItems={navigationItems}
          onLogout={logout}
          userInitials={userInitials}
        />

        <main className="dashboard-main reports-page-main">
          <DashboardHeader
            accountStatus={user?.is_active ? 'Active' : 'Not available'}
            roleLabel="User"
            userEmail={userEmail}
            userInitials={userInitials}
            userName={userName}
          />

          <section className="reports-page-heading" aria-labelledby="resume-comparison-title">
            <p className="eyebrow">Reports</p>
            <h1 id="resume-comparison-title">Resume Comparison</h1>
            <p>Compare two saved AI resume reports and review what changed.</p>
          </section>

          <form
            aria-busy={isComparing}
            className="comparison-form dashboard-panel"
            onSubmit={handleSubmit}
          >
            <div>
              <label htmlFor="previous-report">Previous Report</label>
              <select
                disabled={isLoadingOptions || isComparing}
                id="previous-report"
                onChange={(event) => setPreviousReportId(event.target.value)}
                value={previousReportId}
              >
                <option value="">Select previous report</option>
                {reports.map((report) => (
                  <option key={report.id} value={report.id}>
                    {report.fileName} - {formatDisplayDate(report.createdAt)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="current-report">Current Report</label>
              <select
                disabled={isLoadingOptions || isComparing}
                id="current-report"
                onChange={(event) => setCurrentReportId(event.target.value)}
                value={currentReportId}
              >
                <option value="">Select current report</option>
                {reports.map((report) => (
                  <option key={report.id} value={report.id}>
                    {report.fileName} - {formatDisplayDate(report.createdAt)}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="dashboard-primary-action"
              disabled={isLoadingOptions || isComparing || reports.length < 2}
              type="submit"
            >
              {isComparing ? 'Comparing...' : 'Compare Reports'}
            </button>
          </form>

          <div className="reports-state-message" aria-live="polite">
            {isLoadingOptions ? <p>Loading comparison options...</p> : null}
            {statusMessage ? <p>{statusMessage}</p> : null}
            {errorMessage ? (
              <div className="state-message-actions" role="alert">
                <p>{errorMessage}</p>
                <button
                  className="dashboard-secondary-action"
                  onClick={() => window.location.reload()}
                  type="button"
                >
                  Retry
                </button>
              </div>
            ) : null}
          </div>

          {isLoadingOptions ? (
            <section className="dashboard-panel dashboard-skeleton-stack" aria-label="Loading comparison reports">
              <div className="dashboard-skeleton-line" />
              <div className="dashboard-skeleton-line" />
              <div className="dashboard-skeleton-line" />
            </section>
          ) : null}

          {!isLoadingOptions && reports.length < 2 ? (
            <section className="reports-empty-state" aria-labelledby="comparison-empty-title">
              <h2 id="comparison-empty-title">Two saved reports are required.</h2>
              <p>Analyze another resume version before running a comparison.</p>
              <Link className="dashboard-primary-action" to="/dashboard">
                Analyze a Resume
              </Link>
            </section>
          ) : null}

          {comparison ? (
            <article className="dashboard-analysis-result" aria-label="Resume comparison result">
              <div className="dashboard-analysis-heading">
                <div>
                  <p className="eyebrow">Stateless comparison</p>
                  <h2>Comparison Result</h2>
                  <p>
                    This comparison reads saved reports only. No new report record
                    was created.
                  </p>
                </div>
              </div>

              <section className="comparison-metrics-grid" aria-label="Score comparison">
                {renderMetricCard({
                  label: 'Overall Score',
                  previousValue: `${scores.previousOverallScore}/100`,
                  currentValue: `${scores.currentOverallScore}/100`,
                  difference: scores.scoreDifference,
                })}
                {renderMetricCard({
                  label: 'ATS Score',
                  previousValue: `${scores.previousAtsScore}/100`,
                  currentValue: `${scores.currentAtsScore}/100`,
                  difference: scores.atsDifference,
                })}
                {renderMetricCard({
                  label: 'Resume Grade',
                  previousValue: scores.previousResumeGrade,
                  currentValue: scores.currentResumeGrade,
                  difference: 0,
                })}
                {renderMetricCard({
                  label: 'Hiring Probability',
                  previousValue: `${scores.previousHiringProbability}%`,
                  currentValue: `${scores.currentHiringProbability}%`,
                  difference: scores.hiringProbabilityDifference,
                  suffix: '%',
                })}
              </section>

              <div className="dashboard-analysis-grid">
                {renderList('Added Skills', skills.newSkillsAdded, 'No newly added skills detected.')}
                {renderList('Removed Skills', skills.skillsRemoved, 'No removed skills detected.')}
                {renderList(
                  'Newly Recommended Skills',
                  skills.newlyRecommendedSkills,
                  'No newly recommended skills detected.',
                )}
                {renderList(
                  'Missing Skills Resolved',
                  skills.missingSkillsResolved,
                  'No resolved missing skills detected.',
                )}
                {renderList(
                  'Remaining Missing Skills',
                  skills.newMissingSkills,
                  'No new missing skills detected.',
                )}
                {renderList(
                  'Biggest Improvements',
                  comparison.biggestImprovements,
                  'No major improvements identified.',
                )}
              </div>

              <section className="comparison-section-table" aria-label="Section comparison">
                <h3>Section-by-Section Comparison</h3>
                <div>
                  <span>Section</span>
                  <span>Previous</span>
                  <span>Current</span>
                  <span>Difference</span>
                </div>
                {comparison.sectionComparison?.map((section) => (
                  <div key={section.section}>
                    <strong>{sectionLabels[section.section] || section.section}</strong>
                    <span>{section.previousScore}/100</span>
                    <span>{section.currentScore}/100</span>
                    <span className={getDifferenceClassName(section.difference)}>
                      {formatDifference(section.difference)}
                    </span>
                  </div>
                ))}
              </section>

              <section className="dashboard-analysis-summary" aria-label="AI improvement summary">
                <h4>AI Improvement Summary</h4>
                <p>{comparison.aiSummary}</p>
                {!comparison.metadata?.aiGenerated ? (
                  <p>
                    AI narrative was unavailable, so this summary was generated
                    from saved report data.
                  </p>
                ) : null}
              </section>

              {renderList(
                'Remaining Weaknesses',
                comparison.remainingWeaknesses,
                'No remaining weaknesses were identified.',
              )}

              <section className="dashboard-analysis-summary" aria-label="Final recommendation">
                <h4>Final Recommendation</h4>
                <p>{comparison.finalRecommendation}</p>
              </section>
            </article>
          ) : null}
        </main>
      </div>
    </div>
  )
}

export default ResumeComparisonPage

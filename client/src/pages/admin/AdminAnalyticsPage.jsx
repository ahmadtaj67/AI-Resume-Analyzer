import { useEffect, useMemo, useState } from 'react'
import AdminShell from '../../components/admin/AdminShell.jsx'
import OverviewCard from '../../components/dashboard/OverviewCard.jsx'
import {
  getAdminAnalyticsOverview,
  getAdminAnalyticsSkills,
  getAdminAnalyticsTrends,
} from '../../services/adminService.js'
import { formatDisplayDate } from '../../utils/dateFormat.js'

const chartWidth = 640
const chartHeight = 220
const chartPadding = 28

const formatMetric = (value, fallback = 'N/A') =>
  typeof value === 'number' && Number.isFinite(value) ? `${value}` : fallback

const formatScore = (value) =>
  typeof value === 'number' && Number.isFinite(value) ? `${value}/100` : 'N/A'

const getChartMax = (items, key) =>
  Math.max(1, ...items.map((item) => Number(item[key]) || 0))

const buildLinePoints = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return ''
  }

  const maxCount = getChartMax(items, 'count')
  const usableWidth = chartWidth - chartPadding * 2
  const usableHeight = chartHeight - chartPadding * 2

  return items
    .map((item, index) => {
      const x =
        chartPadding +
        (items.length === 1 ? usableWidth / 2 : (index / (items.length - 1)) * usableWidth)
      const y = chartHeight - chartPadding - ((Number(item.count) || 0) / maxCount) * usableHeight

      return `${x},${y}`
    })
    .join(' ')
}

const renderLineChart = (items) => {
  const safeItems = Array.isArray(items) ? items : []
  const points = buildLinePoints(safeItems)

  return (
    <div className="admin-chart-box" aria-label="Reports trend line chart">
      {safeItems.length > 0 ? (
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img">
          <title>Daily report submissions for the last 30 days</title>
          <polyline className="admin-chart-line" points={points} />
          {safeItems.map((item, index) => {
            const [x, y] = points.split(' ')[index].split(',')

            return (
              <circle
                className="admin-chart-point"
                cx={x}
                cy={y}
                key={`${item.date}-${index}`}
                r="4"
              />
            )
          })}
        </svg>
      ) : (
        <p>No daily trend data available.</p>
      )}
    </div>
  )
}

const renderBarChart = (items) => {
  const safeItems = Array.isArray(items) ? items : []
  const maxTotal = getChartMax(safeItems, 'total')

  return (
    <div className="admin-bar-chart" aria-label="Reports distribution bar chart">
      {safeItems.length > 0 ? (
        safeItems.map((item) => {
          const total = Number(item.total) || 0
          const height = Math.max(4, Math.round((total / maxTotal) * 100))

          return (
            <div className="admin-bar-item" key={item.period}>
              <div>
                <span style={{ height: `${height}%` }} />
              </div>
              <strong>{total}</strong>
              <small>{item.period}</small>
            </div>
          )
        })
      ) : (
        <p>No monthly distribution data available.</p>
      )}
    </div>
  )
}

const renderSkillList = (title, items, emptyText) => {
  const safeItems = Array.isArray(items) ? items : []

  return (
    <section className="dashboard-analysis-section" aria-label={title}>
      <h4>{title}</h4>
      {safeItems.length > 0 ? (
        <ul className="admin-skill-list">
          {safeItems.map((item) => (
            <li key={item.skill}>
              <span>{item.skill}</span>
              <strong>{item.count}</strong>
            </li>
          ))}
        </ul>
      ) : (
        <p>{emptyText}</p>
      )}
    </section>
  )
}

function AdminAnalyticsPage() {
  const [overview, setOverview] = useState(null)
  const [trends, setTrends] = useState(null)
  const [skills, setSkills] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    const fetchAnalytics = async () => {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const [nextOverview, nextTrends, nextSkills] = await Promise.all([
          getAdminAnalyticsOverview(),
          getAdminAnalyticsTrends(),
          getAdminAnalyticsSkills(),
        ])

        if (isMounted) {
          setOverview(nextOverview)
          setTrends(nextTrends)
          setSkills(nextSkills)
        }
      } catch {
        if (isMounted) {
          setErrorMessage('Admin analytics could not be loaded. Please try again.')
          setOverview(null)
          setTrends(null)
          setSkills(null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchAnalytics()

    return () => {
      isMounted = false
    }
  }, [])

  const overviewCards = useMemo(
    () => [
      {
        label: 'Total Users',
        value: isLoading ? 'Loading' : formatMetric(overview?.totals?.totalUsers, '0'),
        supportingText: `${formatMetric(overview?.totals?.activeUsers, '0')} active accounts`,
        tone: 'teal',
      },
      {
        label: 'Total Reports',
        value: isLoading ? 'Loading' : formatMetric(overview?.totals?.totalReports, '0'),
        supportingText: 'Saved resume analyses',
        tone: 'blue',
      },
      {
        label: 'Average Resume Score',
        value: isLoading ? 'Loading' : formatScore(overview?.averages?.resumeScore),
        supportingText: 'Across saved reports',
        tone: 'green',
      },
      {
        label: 'Average ATS Score',
        value: isLoading ? 'Loading' : formatScore(overview?.averages?.atsScore),
        supportingText: 'From premium analysis fields',
        tone: 'slate',
      },
    ],
    [isLoading, overview],
  )

  const growthCards = [
    {
      label: 'Today',
      value: formatMetric(overview?.growth?.reportsToday, '0'),
      supportingText: 'Reports created today',
      tone: 'teal',
    },
    {
      label: 'This Week',
      value: formatMetric(overview?.growth?.reportsThisWeek, '0'),
      supportingText: 'Reports created this week',
      tone: 'blue',
    },
    {
      label: 'This Month',
      value: formatMetric(overview?.growth?.reportsThisMonth, '0'),
      supportingText: 'Reports created this month',
      tone: 'green',
    },
  ]

  return (
    <AdminShell>
      <section className="reports-page-heading" aria-labelledby="admin-analytics-title">
        <p className="eyebrow">Admin</p>
        <h1 id="admin-analytics-title">Analytics</h1>
        <p>Track resume analysis activity, score quality, and skill trends.</p>
      </section>

      <div className="reports-state-message" aria-live="polite">
        {isLoading ? <p>Loading analytics...</p> : null}
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

      {isLoading ? (
        <section className="dashboard-panel dashboard-skeleton-stack" aria-label="Loading analytics dashboard">
          <div className="dashboard-skeleton-line" />
          <div className="dashboard-skeleton-line" />
          <div className="dashboard-skeleton-line" />
        </section>
      ) : null}

      {!errorMessage ? (
        <>
          <section className="dashboard-overview-grid admin-overview-grid" aria-label="Analytics overview">
            {overviewCards.map((card) => (
              <OverviewCard
                key={card.label}
                label={card.label}
                supportingText={card.supportingText}
                tone={card.tone}
                value={card.value}
              />
            ))}
          </section>

          <section className="dashboard-overview-grid admin-growth-grid" aria-label="Growth metrics">
            {growthCards.map((card) => (
              <OverviewCard
                key={card.label}
                label={card.label}
                supportingText={card.supportingText}
                tone={card.tone}
                value={isLoading ? 'Loading' : card.value}
              />
            ))}
          </section>

          <div className="admin-analytics-grid">
            <section className="dashboard-panel" aria-labelledby="reports-trend-title">
              <div className="dashboard-section-heading">
                <p className="eyebrow">Trend</p>
                <h2 id="reports-trend-title">Reports Trend</h2>
                <p>Daily report submissions for the last 30 days.</p>
              </div>
              {renderLineChart(trends?.dailyReports)}
            </section>

            <section className="dashboard-panel" aria-labelledby="reports-distribution-title">
              <div className="dashboard-section-heading">
                <p className="eyebrow">Distribution</p>
                <h2 id="reports-distribution-title">Reports Distribution</h2>
                <p>Monthly report submission volume.</p>
              </div>
              {renderBarChart(trends?.monthlyReports)}
            </section>
          </div>

          <div className="dashboard-analysis-grid">
            {renderSkillList(
              'Top Skills',
              skills?.topDetectedSkills,
              'No detected skill data available yet.',
            )}
            {renderSkillList(
              'Missing Skills',
              skills?.mostMissingSkills,
              'No missing skill data available yet.',
            )}
            {renderSkillList(
              'Recommended Skills',
              skills?.mostRecommendedSkills,
              'No recommended skill data available yet.',
            )}
          </div>

          <section className="dashboard-panel" aria-labelledby="quick-insights-title">
            <div className="dashboard-section-heading">
              <p className="eyebrow">Insights</p>
              <h2 id="quick-insights-title">Quick Insights</h2>
              <p>High-signal resume quality snapshots from saved reports.</p>
            </div>

            <div className="admin-insights-grid">
              <article>
                <span>Average Hiring Probability</span>
                <strong>
                  {formatMetric(overview?.quickInsights?.averageHiringProbability)}%
                </strong>
              </article>
              <article>
                <span>Most Common Resume Grade</span>
                <strong>{overview?.quickInsights?.mostCommonResumeGrade || 'N/A'}</strong>
              </article>
            </div>

            {overview?.quickInsights?.bestPerformingResumes?.length > 0 ? (
              <ul className="admin-list">
                {overview.quickInsights.bestPerformingResumes.map((report) => (
                  <li className="admin-list-card" key={report.id}>
                    <div>
                      <h2 title={report.fileName}>{report.fileName}</h2>
                      <p>{formatDisplayDate(report.createdAt)}</p>
                    </div>
                    <dl>
                      <div>
                        <dt>Score</dt>
                        <dd>{report.overallScore ?? 'N/A'}</dd>
                      </div>
                      <div>
                        <dt>ATS</dt>
                        <dd>{report.atsScore ?? 'N/A'}</dd>
                      </div>
                    </dl>
                    <p className="admin-empty-state">Saved report</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="admin-empty-state">No best-performing reports available yet.</p>
            )}
          </section>
        </>
      ) : null}
    </AdminShell>
  )
}

export default AdminAnalyticsPage

import supabase from '../config/supabase.js'
import { buildPaginationMeta } from '../utils/pagination.js'

const createAdminError = (message) => {
  const error = new Error(message)
  error.statusCode = 500
  error.expose = true
  return error
}

const createHttpError = (statusCode, message) => {
  const error = new Error(message)
  error.statusCode = statusCode
  error.expose = true
  return error
}

const normalizeSearchTerm = (value) =>
  typeof value === 'string' ? value.replace(/[%_(),]/g, '').trim().slice(0, 80) : ''

const normalizeUserFilter = (value) => {
  const normalizedValue = typeof value === 'string' ? value.trim().toLowerCase() : 'all'
  const allowedFilters = new Set(['all', 'active', 'inactive', 'admin', 'user'])

  return allowedFilters.has(normalizedValue) ? normalizedValue : 'all'
}

const getLastActivity = ({ user, latestReport }) => {
  const activityValues = [user.updated_at, latestReport?.created_at]
    .filter(Boolean)
    .map((value) => new Date(value).getTime())
    .filter(Number.isFinite)

  if (activityValues.length === 0) {
    return user.created_at
  }

  return new Date(Math.max(...activityValues)).toISOString()
}

const mapUserRow = (user, reportSummary = {}) => {
  const latestReport = reportSummary.latestReport || null

  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    role: user.role,
    isActive: user.is_active,
    isDeleted: Boolean(user.deleted_at),
    deletedAt: user.deleted_at,
    totalReports: reportSummary.totalReports || 0,
    latestScore: latestReport?.overall_score ?? null,
    lastActivity: getLastActivity({ user, latestReport }),
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  }
}

const mapReportRow = (report) => ({
  id: report.id,
  userId: report.user_id,
  fileName: report.original_file_name,
  overallScore: report.overall_score,
  createdAt: report.created_at,
  updatedAt: report.updated_at,
})

const getStartOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate())

const getStartOfWeek = (date) => {
  const start = getStartOfDay(date)
  const day = start.getDay()
  const diff = day === 0 ? 6 : day - 1

  start.setDate(start.getDate() - diff)
  return start
}

const getStartOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1)

const formatDateKey = (date) => date.toISOString().slice(0, 10)

const formatMonthKey = (date) =>
  `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}`

const normalizeAnalyticsScore = (value) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null
  }

  return Math.min(100, Math.max(0, Math.round(value)))
}

const normalizeAnalyticsList = (value) =>
  Array.isArray(value)
    ? value
        .filter((item) => typeof item === 'string')
        .map((item) => item.trim())
        .filter(Boolean)
    : []

const incrementSkillMap = (map, items) => {
  normalizeAnalyticsList(items).forEach((item) => {
    const key = item.toLowerCase()
    const current = map.get(key) || {
      skill: item,
      count: 0,
    }

    current.count += 1
    map.set(key, current)
  })
}

const mapTopItems = (map, limit = 10) =>
  [...map.values()]
    .sort((first, second) => second.count - first.count || first.skill.localeCompare(second.skill))
    .slice(0, limit)

const getAverageScore = (values) => {
  const safeValues = values.filter((value) => typeof value === 'number' && Number.isFinite(value))

  if (safeValues.length === 0) {
    return null
  }

  return Math.round(safeValues.reduce((total, value) => total + value, 0) / safeValues.length)
}

const countReportsSince = (reports, startDate) =>
  reports.filter((report) => new Date(report.created_at) >= startDate).length

const getReportAnalyticsRows = async () => {
  const { data, error } = await supabase
    .from('resume_reports')
    .select('id, original_file_name, overall_score, analysis_result, created_at')
    .order('created_at', { ascending: true })

  if (error) {
    throw createAdminError('Analytics data could not be loaded. Please try again.')
  }

  return data || []
}

const buildDailyTrend = (reports) => {
  const today = getStartOfDay(new Date())
  const dailyCounts = new Map()

  for (let index = 29; index >= 0; index -= 1) {
    const day = new Date(today)
    day.setDate(today.getDate() - index)
    dailyCounts.set(formatDateKey(day), 0)
  }

  reports.forEach((report) => {
    const key = formatDateKey(new Date(report.created_at))

    if (dailyCounts.has(key)) {
      dailyCounts.set(key, dailyCounts.get(key) + 1)
    }
  })

  return [...dailyCounts.entries()].map(([date, count]) => ({ date, count }))
}

const buildGroupedTrend = ({ reports, count, getPeriodStart, getLabel }) => {
  const now = new Date()
  const groups = new Map()

  for (let index = count - 1; index >= 0; index -= 1) {
    const periodDate = getPeriodStart(now, index)
    groups.set(getLabel(periodDate), 0)
  }

  reports.forEach((report) => {
    const reportDate = new Date(report.created_at)
    const key = getLabel(reportDate)

    if (groups.has(key)) {
      groups.set(key, groups.get(key) + 1)
    }
  })

  return [...groups.entries()].map(([period, total]) => ({ period, total }))
}

const getGradeCounts = (reports) =>
  reports.reduce((counts, report) => {
    const grade = report.analysis_result?.resumeGrade

    if (typeof grade === 'string' && grade.trim()) {
      counts[grade.trim().toUpperCase()] = (counts[grade.trim().toUpperCase()] || 0) + 1
    }

    return counts
  }, {})

const getMostCommonGrade = (reports) => {
  const gradeCounts = getGradeCounts(reports)
  const [grade] = Object.entries(gradeCounts).sort(
    ([firstGrade, firstCount], [secondGrade, secondCount]) =>
      secondCount - firstCount || firstGrade.localeCompare(secondGrade),
  )[0] || []

  return grade || null
}

const mapBestPerformingReports = (reports) =>
  reports
    .filter((report) => typeof report.overall_score === 'number')
    .sort((first, second) => second.overall_score - first.overall_score)
    .slice(0, 5)
    .map((report) => ({
      id: report.id,
      fileName: report.original_file_name,
      overallScore: report.overall_score,
      atsScore: normalizeAnalyticsScore(report.analysis_result?.atsScore),
      createdAt: report.created_at,
    }))

const countRows = async (tableName, filters = []) => {
  let query = supabase.from(tableName).select('id', { count: 'exact', head: true })

  filters.forEach(([column, value]) => {
    query = query.eq(column, value)
  })

  const { count, error } = await query

  if (error) {
    throw createAdminError('Admin statistics could not be loaded. Please try again.')
  }

  return count || 0
}

const applyUserFilters = (query, { search = '', filter = 'all' } = {}) => {
  const normalizedSearch = normalizeSearchTerm(search)
  const normalizedFilter = normalizeUserFilter(filter)
  let nextQuery = query

  if (normalizedSearch) {
    nextQuery = nextQuery.or(
      `full_name.ilike.%${normalizedSearch}%,email.ilike.%${normalizedSearch}%`,
    )
  }

  if (normalizedFilter === 'active') {
    nextQuery = nextQuery.eq('is_active', true).is('deleted_at', null)
  }

  if (normalizedFilter === 'inactive') {
    nextQuery = nextQuery.or('is_active.eq.false,deleted_at.not.is.null')
  }

  if (normalizedFilter === 'admin' || normalizedFilter === 'user') {
    nextQuery = nextQuery.eq('role', normalizedFilter)
  }

  return nextQuery
}

const getReportSummariesForUsers = async (userIds) => {
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return new Map()
  }

  const { data, error } = await supabase
    .from('resume_reports')
    .select('id, user_id, original_file_name, overall_score, created_at, updated_at')
    .in('user_id', userIds)
    .order('created_at', { ascending: false })

  if (error) {
    throw createAdminError('User report summaries could not be loaded. Please try again.')
  }

  return data.reduce((summaries, report) => {
    const summary = summaries.get(report.user_id) || {
      totalReports: 0,
      latestReport: null,
    }

    summary.totalReports += 1

    if (!summary.latestReport) {
      summary.latestReport = report
    }

    summaries.set(report.user_id, summary)
    return summaries
  }, new Map())
}

const getUserById = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, is_active, deleted_at, created_at, updated_at')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw createAdminError('User could not be loaded. Please try again.')
  }

  if (!data) {
    throw createHttpError(404, 'User not found.')
  }

  return data
}

export const getAdminDashboardStats = async () => {
  const [totalUsers, activeUsers, inactiveUsers, totalReports] = await Promise.all([
    countRows('profiles'),
    countRows('profiles', [['is_active', true]]),
    countRows('profiles', [['is_active', false]]),
    countRows('resume_reports'),
  ])

  const [{ data: recentUsers, error: recentUsersError }, { data: recentReports, error: recentReportsError }] =
    await Promise.all([
      supabase
        .from('profiles')
        .select('id, full_name, email, role, is_active, deleted_at, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('resume_reports')
        .select('id, user_id, original_file_name, overall_score, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(5),
    ])

  if (recentUsersError || recentReportsError) {
    throw createAdminError('Admin dashboard activity could not be loaded. Please try again.')
  }

  return {
    totalUsers,
    activeUsers,
    inactiveUsers,
    totalReports,
    recentUsers: recentUsers.map((user) => mapUserRow(user)),
    recentReports: recentReports.map(mapReportRow),
  }
}

export const getAdminAnalyticsOverview = async () => {
  const now = new Date()
  const [totalUsers, activeUsers, inactiveUsers, totalReports, reports] = await Promise.all([
    countRows('profiles'),
    countRows('profiles', [['is_active', true]]),
    countRows('profiles', [['is_active', false]]),
    countRows('resume_reports'),
    getReportAnalyticsRows(),
  ])
  const overallScores = reports
    .map((report) => normalizeAnalyticsScore(report.overall_score))
    .filter((score) => score !== null)
  const atsScores = reports
    .map((report) => normalizeAnalyticsScore(report.analysis_result?.atsScore))
    .filter((score) => score !== null)
  const hiringProbabilities = reports
    .map((report) => normalizeAnalyticsScore(report.analysis_result?.hiringProbability))
    .filter((score) => score !== null)

  return {
    totals: {
      totalUsers,
      activeUsers,
      inactiveUsers,
      totalReports,
    },
    averages: {
      resumeScore: getAverageScore(overallScores),
      atsScore: getAverageScore(atsScores),
      hiringProbability: getAverageScore(hiringProbabilities),
    },
    growth: {
      reportsToday: countReportsSince(reports, getStartOfDay(now)),
      reportsThisWeek: countReportsSince(reports, getStartOfWeek(now)),
      reportsThisMonth: countReportsSince(reports, getStartOfMonth(now)),
    },
    quickInsights: {
      bestPerformingResumes: mapBestPerformingReports(reports),
      averageHiringProbability: getAverageScore(hiringProbabilities),
      mostCommonResumeGrade: getMostCommonGrade(reports),
    },
  }
}

export const getAdminAnalyticsTrends = async () => {
  const reports = await getReportAnalyticsRows()

  return {
    dailyReports: buildDailyTrend(reports),
    weeklyReports: buildGroupedTrend({
      reports,
      count: 8,
      getPeriodStart: (date, offset) => {
        const start = getStartOfWeek(date)
        start.setDate(start.getDate() - offset * 7)
        return start
      },
      getLabel: (date) => formatDateKey(getStartOfWeek(date)),
    }),
    monthlyReports: buildGroupedTrend({
      reports,
      count: 6,
      getPeriodStart: (date, offset) =>
        new Date(date.getFullYear(), date.getMonth() - offset, 1),
      getLabel: (date) => formatMonthKey(date),
    }),
  }
}

export const getAdminAnalyticsSkills = async () => {
  const reports = await getReportAnalyticsRows()
  const detectedSkills = new Map()
  const missingSkills = new Map()
  const recommendedSkills = new Map()

  reports.forEach((report) => {
    incrementSkillMap(detectedSkills, report.analysis_result?.detectedSkills)
    incrementSkillMap(missingSkills, report.analysis_result?.missingSkills)
    incrementSkillMap(recommendedSkills, report.analysis_result?.recommendedSkills)
  })

  return {
    topDetectedSkills: mapTopItems(detectedSkills),
    mostMissingSkills: mapTopItems(missingSkills),
    mostRecommendedSkills: mapTopItems(recommendedSkills),
  }
}

export const getAdminUsers = async ({ page, limit, from, to, search, filter }) => {
  const countQuery = applyUserFilters(
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    { search, filter },
  )
  const { count, error: countError } = await countQuery

  if (countError) {
    throw createAdminError('Users could not be loaded. Please try again.')
  }

  const totalItems = count || 0

  if (from >= totalItems) {
    return {
      users: [],
      pagination: buildPaginationMeta({ page, limit, totalItems }),
    }
  }

  const usersQuery = applyUserFilters(
    supabase
      .from('profiles')
      .select('id, full_name, email, role, is_active, deleted_at, created_at, updated_at'),
    { search, filter },
  )
  const { data, error } = await usersQuery
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    throw createAdminError('Users could not be loaded. Please try again.')
  }

  const reportSummaries = await getReportSummariesForUsers(data.map((user) => user.id))

  return {
    users: data.map((user) => mapUserRow(user, reportSummaries.get(user.id))),
    pagination: buildPaginationMeta({ page, limit, totalItems }),
  }
}

export const getAdminUserDetails = async (userId) => {
  const user = await getUserById(userId)
  const reportSummaries = await getReportSummariesForUsers([userId])

  return mapUserRow(user, reportSummaries.get(userId))
}

export const getAdminUserReports = async ({ userId, page, limit, from, to }) => {
  await getUserById(userId)

  const { count, error: countError } = await supabase
    .from('resume_reports')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (countError) {
    throw createAdminError('User reports could not be loaded. Please try again.')
  }

  const totalItems = count || 0

  if (from >= totalItems) {
    return {
      reports: [],
      pagination: buildPaginationMeta({ page, limit, totalItems }),
    }
  }

  const { data, error } = await supabase
    .from('resume_reports')
    .select('id, user_id, original_file_name, overall_score, created_at, updated_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    throw createAdminError('User reports could not be loaded. Please try again.')
  }

  return {
    reports: data.map(mapReportRow),
    pagination: buildPaginationMeta({ page, limit, totalItems }),
  }
}

export const getAdminReports = async ({ page, limit, from, to }) => {
  const { count, error: countError } = await supabase
    .from('resume_reports')
    .select('id', { count: 'exact', head: true })

  if (countError) {
    throw createAdminError('Reports could not be loaded. Please try again.')
  }

  const totalItems = count || 0

  if (from >= totalItems) {
    return {
      reports: [],
      pagination: buildPaginationMeta({ page, limit, totalItems }),
    }
  }

  const { data, error } = await supabase
    .from('resume_reports')
    .select('id, user_id, original_file_name, overall_score, created_at, updated_at')
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    throw createAdminError('Reports could not be loaded. Please try again.')
  }

  return {
    reports: data.map(mapReportRow),
    pagination: buildPaginationMeta({ page, limit, totalItems }),
  }
}

export const updateUserActiveStatus = async ({ adminUserId, targetUserId, isActive }) => {
  if (adminUserId === targetUserId) {
    throw createHttpError(400, 'Admins cannot deactivate their own account from this panel.')
  }

  if (typeof isActive !== 'boolean') {
    throw createHttpError(400, 'isActive must be true or false.')
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      is_active: isActive,
      deleted_at: null,
    })
    .eq('id', targetUserId)
    .select('id, full_name, email, role, is_active, deleted_at, created_at, updated_at')
    .maybeSingle()

  if (error) {
    throw createAdminError('User status could not be updated. Please try again.')
  }

  if (!data) {
    throw createHttpError(404, 'User not found.')
  }

  const reportSummaries = await getReportSummariesForUsers([targetUserId])

  return mapUserRow(data, reportSummaries.get(targetUserId))
}

export const softDeleteAdminUser = async ({ adminUserId, targetUserId }) => {
  if (adminUserId === targetUserId) {
    throw createHttpError(400, 'Admins cannot delete their own account from this panel.')
  }

  await getUserById(targetUserId)

  const { data, error } = await supabase
    .from('profiles')
    .update({
      is_active: false,
      deleted_at: new Date().toISOString(),
    })
    .eq('id', targetUserId)
    .select('id, full_name, email, role, is_active, deleted_at, created_at, updated_at')
    .maybeSingle()

  if (error || !data) {
    throw createAdminError('User could not be deleted. Please try again.')
  }

  const reportSummaries = await getReportSummariesForUsers([targetUserId])

  return mapUserRow(data, reportSummaries.get(targetUserId))
}

export const restoreSoftDeletedAdminUser = async ({ targetUserId }) => {
  await getUserById(targetUserId)

  const { data, error } = await supabase
    .from('profiles')
    .update({
      is_active: true,
      deleted_at: null,
    })
    .eq('id', targetUserId)
    .select('id, full_name, email, role, is_active, deleted_at, created_at, updated_at')
    .maybeSingle()

  if (error || !data) {
    throw createAdminError('User could not be restored. Please try again.')
  }

  const reportSummaries = await getReportSummariesForUsers([targetUserId])

  return mapUserRow(data, reportSummaries.get(targetUserId))
}

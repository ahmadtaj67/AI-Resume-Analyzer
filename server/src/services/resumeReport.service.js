import supabase from '../config/supabase.js'
import { buildPaginationMeta } from '../utils/pagination.js'

const DEFAULT_RECENT_REPORT_LIMIT = 5

const createReportError = (message) => {
  const error = new Error(message)
  error.statusCode = 500
  error.expose = true
  return error
}

const mapReportRow = (report) => ({
  id: report.id,
  fileName: report.original_file_name,
  overallScore: report.overall_score,
  aiModel: report.analysis_result?.metadata?.aiModel || 'Not available',
  createdAt: report.created_at,
})

const mapComparisonOptionRow = (report) => ({
  id: report.id,
  fileName: report.original_file_name,
  overallScore: report.overall_score,
  createdAt: report.created_at,
})

const normalizeArray = (value) => (Array.isArray(value) ? value : [])

const normalizeScore = (value, fallback = 0) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback
  }

  return Math.min(100, Math.max(0, Math.round(value)))
}

const getGradeFromScore = (score) => {
  if (score >= 95) {
    return 'A+'
  }

  if (score >= 85) {
    return 'A'
  }

  if (score >= 70) {
    return 'B'
  }

  if (score >= 55) {
    return 'C'
  }

  return 'D'
}

const getReadinessFromScore = (score) => {
  if (score >= 85) {
    return 'Interview-ready'
  }

  if (score >= 70) {
    return 'Nearly ready'
  }

  if (score >= 55) {
    return 'Needs targeted improvements'
  }

  return 'Not ready yet'
}

const normalizeString = (value, fallback = '') =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback

const normalizeAtsChecks = (value) => {
  const checks = value && typeof value === 'object' ? value : {}

  return {
    hasContactInformation: checks.hasContactInformation === true,
    hasProfessionalSummary: checks.hasProfessionalSummary === true,
    hasSkillsSection: checks.hasSkillsSection === true,
    hasExperienceSection: checks.hasExperienceSection === true,
    hasEducationSection: checks.hasEducationSection === true,
    usesActionVerbs: checks.usesActionVerbs === true,
    hasMeasurableAchievements: checks.hasMeasurableAchievements === true,
    formattingQuality:
      typeof checks.formattingQuality === 'string' ? checks.formattingQuality : 'poor',
  }
}

const deriveAtsScore = (checks, fallbackScore) => {
  const checklistValues = [
    checks.hasContactInformation,
    checks.hasProfessionalSummary,
    checks.hasSkillsSection,
    checks.hasExperienceSection,
    checks.hasEducationSection,
    checks.usesActionVerbs,
    checks.hasMeasurableAchievements,
  ]
  const completedScore = Math.round(
    (checklistValues.filter(Boolean).length / checklistValues.length) * 85,
  )
  const formattingBonus = {
    excellent: 15,
    good: 11,
    fair: 6,
    poor: 0,
  }[checks.formattingQuality] ?? 0

  return normalizeScore(completedScore + formattingBonus, fallbackScore)
}

const normalizeStrengthRanking = (value, strengths) => {
  if (Array.isArray(value)) {
    return value
      .filter((item) => item && typeof item === 'object' && !Array.isArray(item))
      .map((item, index) => ({
        rank: Math.max(1, Math.min(8, normalizeScore(item.rank, index + 1))),
        label: normalizeString(item.label, `Strength ${index + 1}`),
        reason: normalizeString(item.reason, 'Identified as a resume strength.'),
      }))
      .slice(0, 8)
  }

  return strengths.slice(0, 6).map((strength, index) => ({
    rank: index + 1,
    label: strength,
    reason: 'Identified as a resume strength.',
  }))
}

const normalizeSectionScores = ({ value, atsChecks, overallScore }) => {
  const scores = value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  const fallbackScores = {
    contact: atsChecks.hasContactInformation ? 90 : 35,
    summary: atsChecks.hasProfessionalSummary ? 85 : 35,
    skills: atsChecks.hasSkillsSection ? 85 : 40,
    experience: atsChecks.hasExperienceSection ? 85 : 40,
    education: atsChecks.hasEducationSection ? 85 : 40,
    projects: overallScore,
  }

  return Object.entries(fallbackScores).reduce((sectionScores, [key, fallback]) => {
    sectionScores[key] = normalizeScore(scores[key], fallback)
    return sectionScores
  }, {})
}

const mapReportDetailsRow = (report) => {
  const result = report.analysis_result || {}
  const overallScore = normalizeScore(report.overall_score)
  const strengths = normalizeArray(result.strengths)
  const weaknesses = normalizeArray(result.weaknesses)
  const missingSections = normalizeArray(result.missingSections)
  const improvementSuggestions = normalizeArray(result.improvementSuggestions)
  const atsChecks = normalizeAtsChecks(result.atsChecks)
  const atsScore = normalizeScore(result.atsScore, deriveAtsScore(atsChecks, overallScore))

  return {
    id: report.id,
    fileName: report.original_file_name,
    overallScore,
    aiModel: result.metadata?.aiModel || 'Not available',
    createdAt: report.created_at,
    updatedAt: report.updated_at,
    extraction: {
      pageCount: result.extraction?.pageCount ?? null,
      wordCount: result.extraction?.wordCount ?? 0,
      characterCount: result.extraction?.characterCount ?? 0,
    },
    analysis: {
      overallScore,
      professionalSummary: normalizeString(result.professionalSummary),
      atsScore,
      resumeGrade: normalizeString(result.resumeGrade, getGradeFromScore(overallScore)),
      hiringProbability: normalizeScore(
        result.hiringProbability,
        Math.round(overallScore * 0.7 + atsScore * 0.3),
      ),
      recruiterVerdict: normalizeString(
        result.recruiterVerdict,
        'This saved report was created before recruiter verdicts were added.',
      ),
      jobReadiness: normalizeString(result.jobReadiness, getReadinessFromScore(overallScore)),
      strengths,
      weaknesses,
      detectedSkills: normalizeArray(result.detectedSkills),
      missingSkills: normalizeArray(result.missingSkills),
      recommendedSkills: normalizeArray(result.recommendedSkills),
      priorityImprovements: normalizeArray(result.priorityImprovements).length
        ? normalizeArray(result.priorityImprovements)
        : improvementSuggestions,
      strengthRanking: normalizeStrengthRanking(result.strengthRanking, strengths),
      missingSections,
      improvementSuggestions,
      atsChecks,
      resumeSectionScores: normalizeSectionScores({
        value: result.resumeSectionScores,
        atsChecks,
        overallScore,
      }),
      finalRecommendation: normalizeString(
        result.finalRecommendation,
        improvementSuggestions[0] || 'Review the saved analysis and improve the highest-risk gaps first.',
      ),
    },
  }
}

export const createResumeReport = async ({
  userId,
  fileName,
  aiModel,
  overallScore,
  reportJson,
}) => {
  const { data, error } = await supabase
    .from('resume_reports')
    .insert({
      user_id: userId,
      original_file_name: fileName,
      stored_file_url: null,
      resume_text: null,
      overall_score: overallScore,
      analysis_result: {
        ...reportJson,
        metadata: {
          aiModel,
        },
      },
    })
    .select('id, original_file_name, overall_score, analysis_result, created_at')
    .single()

  if (error || !data) {
    throw createReportError('The analysis could not be saved. Please try again.')
  }

  return mapReportRow(data)
}

export const getRecentUserReports = async (
  userId,
  limit = DEFAULT_RECENT_REPORT_LIMIT,
) => {
  const safeLimit = Number.isInteger(limit) && limit > 0 ? limit : DEFAULT_RECENT_REPORT_LIMIT

  const { data, error } = await supabase
    .from('resume_reports')
    .select('id, original_file_name, overall_score, analysis_result, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(safeLimit)

  if (error) {
    throw createReportError('Dashboard data could not be loaded. Please refresh and try again.')
  }

  return data.map(mapReportRow)
}

export const getUserReportSummary = async (userId) => {
  const { count, error: countError } = await supabase
    .from('resume_reports')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (countError) {
    throw createReportError('Dashboard data could not be loaded. Please refresh and try again.')
  }

  const recentReports = await getRecentUserReports(userId)

  return {
    totalReports: count || 0,
    latestScore: recentReports[0]?.overallScore ?? null,
    recentReports,
  }
}

export const getPaginatedUserReports = async ({ userId, page, limit, from, to }) => {
  const { count, error: countError } = await supabase
    .from('resume_reports')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (countError) {
    throw createReportError('Your report history could not be loaded. Please try again.')
  }

  const totalItems = count || 0

  if (from >= totalItems) {
    return {
      reports: [],
      pagination: buildPaginationMeta({
        page,
        limit,
        totalItems,
      }),
    }
  }

  const { data, error } = await supabase
    .from('resume_reports')
    .select('id, original_file_name, overall_score, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    throw createReportError('Your report history could not be loaded. Please try again.')
  }

  return {
    reports: data.map(mapReportRow),
    pagination: buildPaginationMeta({
      page,
      limit,
      totalItems,
    }),
  }
}

export const getUserReportComparisonOptions = async (userId) => {
  const { data, error } = await supabase
    .from('resume_reports')
    .select('id, original_file_name, overall_score, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw createReportError('Comparison options could not be loaded. Please try again.')
  }

  return data.map(mapComparisonOptionRow)
}

export const getUserReportById = async ({ userId, reportId }) => {
  const { data, error } = await supabase
    .from('resume_reports')
    .select('id, original_file_name, overall_score, analysis_result, created_at, updated_at')
    .eq('id', reportId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    throw createReportError('The report could not be loaded. Please try again.')
  }

  return data ? mapReportDetailsRow(data) : null
}

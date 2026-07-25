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

const normalizeArray = (value) => (Array.isArray(value) ? value : [])

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

const mapReportDetailsRow = (report) => {
  const result = report.analysis_result || {}

  return {
    id: report.id,
    fileName: report.original_file_name,
    overallScore: report.overall_score,
    aiModel: result.metadata?.aiModel || 'Not available',
    createdAt: report.created_at,
    updatedAt: report.updated_at,
    extraction: {
      pageCount: result.extraction?.pageCount ?? null,
      wordCount: result.extraction?.wordCount ?? 0,
      characterCount: result.extraction?.characterCount ?? 0,
    },
    analysis: {
      overallScore: report.overall_score,
      professionalSummary:
        typeof result.professionalSummary === 'string'
          ? result.professionalSummary
          : '',
      strengths: normalizeArray(result.strengths),
      weaknesses: normalizeArray(result.weaknesses),
      detectedSkills: normalizeArray(result.detectedSkills),
      missingSections: normalizeArray(result.missingSections),
      improvementSuggestions: normalizeArray(result.improvementSuggestions),
      atsChecks: normalizeAtsChecks(result.atsChecks),
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

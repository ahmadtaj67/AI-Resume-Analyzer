import supabase from '../config/supabase.js'

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


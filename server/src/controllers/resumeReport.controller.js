import { getUserReportSummary } from '../services/resumeReport.service.js'

const createHttpError = (statusCode, message) => {
  const error = new Error(message)
  error.statusCode = statusCode
  error.expose = true
  return error
}

export const getDashboardSummary = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      throw createHttpError(401, 'Authentication required')
    }

    const summary = await getUserReportSummary(req.user.id)

    res.status(200).json({
      success: true,
      message: 'Dashboard summary retrieved successfully.',
      data: summary,
    })
  } catch (error) {
    next(error)
  }
}


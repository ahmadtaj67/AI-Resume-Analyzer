import { compareUserReports } from '../services/resumeComparison.service.js'
import { getUserReportComparisonOptions } from '../services/resumeReport.service.js'
import { isValidUuid } from '../utils/idValidation.js'

const createHttpError = (statusCode, message) => {
  const error = new Error(message)
  error.statusCode = statusCode
  error.expose = true
  return error
}

const readReportId = (value) => (typeof value === 'string' ? value.trim() : '')

export const getReportComparisonOptions = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      throw createHttpError(401, 'Authentication required')
    }

    const reports = await getUserReportComparisonOptions(req.user.id)

    res.status(200).json({
      success: true,
      message: 'Report comparison options retrieved successfully.',
      data: {
        reports,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const compareReports = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      throw createHttpError(401, 'Authentication required')
    }

    const previousReportId = readReportId(req.body?.previousReportId)
    const currentReportId = readReportId(req.body?.currentReportId)

    if (!isValidUuid(previousReportId) || !isValidUuid(currentReportId)) {
      throw createHttpError(400, 'Please select two valid reports to compare.')
    }

    const comparison = await compareUserReports({
      userId: req.user.id,
      previousReportId,
      currentReportId,
    })

    res.status(200).json({
      success: true,
      message: 'Resume comparison completed successfully.',
      data: {
        comparison,
      },
    })
  } catch (error) {
    next(error)
  }
}

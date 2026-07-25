import {
  getPaginatedUserReports,
  getUserReportById,
  getUserReportSummary,
} from '../services/resumeReport.service.js'
import { isValidUuid } from '../utils/idValidation.js'
import { getPaginationParams } from '../utils/pagination.js'

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

export const getReportsHistory = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      throw createHttpError(401, 'Authentication required')
    }

    const paginationParams = getPaginationParams(req.query)
    const result = await getPaginatedUserReports({
      userId: req.user.id,
      ...paginationParams,
    })

    res.status(200).json({
      success: true,
      message: 'Report history retrieved successfully.',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

export const getReportById = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      throw createHttpError(401, 'Authentication required')
    }

    const reportId = req.params.reportId?.trim()

    if (!isValidUuid(reportId)) {
      throw createHttpError(404, 'Report not found.')
    }

    const report = await getUserReportById({
      userId: req.user.id,
      reportId,
    })

    if (!report) {
      throw createHttpError(404, 'Report not found.')
    }

    res.status(200).json({
      success: true,
      message: 'Report retrieved successfully.',
      data: {
        report,
      },
    })
  } catch (error) {
    next(error)
  }
}

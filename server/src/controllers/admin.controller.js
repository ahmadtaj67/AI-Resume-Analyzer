import {
  getAdminDashboardStats,
  getAdminReports,
  getAdminUsers,
  updateUserActiveStatus,
} from '../services/admin.service.js'
import { isValidUuid } from '../utils/idValidation.js'
import { getPaginationParams } from '../utils/pagination.js'

const createHttpError = (statusCode, message) => {
  const error = new Error(message)
  error.statusCode = statusCode
  error.expose = true
  return error
}

export const getAdminDashboard = async (req, res, next) => {
  try {
    const stats = await getAdminDashboardStats()

    res.status(200).json({
      success: true,
      message: 'Admin dashboard statistics retrieved successfully.',
      data: {
        stats,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const getAdminUsersList = async (req, res, next) => {
  try {
    const result = await getAdminUsers(getPaginationParams(req.query))

    res.status(200).json({
      success: true,
      message: 'Admin users retrieved successfully.',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

export const getAdminReportsList = async (req, res, next) => {
  try {
    const result = await getAdminReports(getPaginationParams(req.query))

    res.status(200).json({
      success: true,
      message: 'Admin reports retrieved successfully.',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

export const updateAdminUserStatus = async (req, res, next) => {
  try {
    const userId = req.params.userId?.trim()

    if (!isValidUuid(userId)) {
      throw createHttpError(404, 'User not found.')
    }

    const user = await updateUserActiveStatus({
      adminUserId: req.user.id,
      targetUserId: userId,
      isActive: req.body?.isActive,
    })

    res.status(200).json({
      success: true,
      message: 'User status updated successfully.',
      data: {
        user,
      },
    })
  } catch (error) {
    next(error)
  }
}

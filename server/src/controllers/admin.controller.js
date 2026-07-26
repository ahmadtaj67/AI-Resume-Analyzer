import {
  getAdminAnalyticsOverview,
  getAdminAnalyticsSkills,
  getAdminAnalyticsTrends,
  getAdminDashboardStats,
  getAdminReports,
  getAdminUserDetails,
  getAdminUserReports,
  getAdminUsers,
  restoreSoftDeletedAdminUser,
  softDeleteAdminUser,
  updateUserActiveStatus,
} from '../services/admin.service.js'
import {
  getAdminSettings as getSettings,
  updateAdminSettings as updateSettings,
} from './settings.controller.js'
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

export const getAdminAnalyticsOverviewData = async (req, res, next) => {
  try {
    const overview = await getAdminAnalyticsOverview()

    res.status(200).json({
      success: true,
      message: 'Admin analytics overview retrieved successfully.',
      data: {
        overview,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const getAdminAnalyticsTrendsData = async (req, res, next) => {
  try {
    const trends = await getAdminAnalyticsTrends()

    res.status(200).json({
      success: true,
      message: 'Admin analytics trends retrieved successfully.',
      data: {
        trends,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const getAdminAnalyticsSkillsData = async (req, res, next) => {
  try {
    const skills = await getAdminAnalyticsSkills()

    res.status(200).json({
      success: true,
      message: 'Admin analytics skills retrieved successfully.',
      data: {
        skills,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const getAdminUsersList = async (req, res, next) => {
  try {
    const result = await getAdminUsers({
      ...getPaginationParams(req.query),
      search: req.query?.search,
      filter: req.query?.filter,
    })

    res.status(200).json({
      success: true,
      message: 'Admin users retrieved successfully.',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

export const getAdminUser = async (req, res, next) => {
  try {
    const userId = req.params.userId?.trim()

    if (!isValidUuid(userId)) {
      throw createHttpError(404, 'User not found.')
    }

    const user = await getAdminUserDetails(userId)

    res.status(200).json({
      success: true,
      message: 'Admin user details retrieved successfully.',
      data: {
        user,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const getAdminUserReportsList = async (req, res, next) => {
  try {
    const userId = req.params.userId?.trim()

    if (!isValidUuid(userId)) {
      throw createHttpError(404, 'User not found.')
    }

    const result = await getAdminUserReports({
      userId,
      ...getPaginationParams(req.query),
    })

    res.status(200).json({
      success: true,
      message: 'Admin user reports retrieved successfully.',
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

    const user =
      req.body?.isDeleted === false
        ? await restoreSoftDeletedAdminUser({ targetUserId: userId })
        : await updateUserActiveStatus({
            adminUserId: req.user.id,
            targetUserId: userId,
            isActive: req.body?.isActive,
          })

    res.status(200).json({
      success: true,
      message: req.body?.isDeleted === false
        ? 'User restored successfully.'
        : 'User status updated successfully.',
      data: {
        user,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const deleteAdminUser = async (req, res, next) => {
  try {
    const userId = req.params.userId?.trim()

    if (!isValidUuid(userId)) {
      throw createHttpError(404, 'User not found.')
    }

    const user = await softDeleteAdminUser({
      adminUserId: req.user.id,
      targetUserId: userId,
    })

    res.status(200).json({
      success: true,
      message: 'User deleted successfully. Reports were preserved.',
      data: {
        user,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const getAdminSettings = getSettings

export const updateAdminSettings = updateSettings

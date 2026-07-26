import {
  getPlatformSettings,
  updatePlatformSettings,
} from '../services/settings.service.js'

const buildPublicSettings = (settings) => ({
  platformName: settings.platformName,
  platformTagline: settings.platformTagline,
  dashboardWelcomeTitle: settings.dashboardWelcomeTitle,
  dashboardWelcomeMessage: settings.dashboardWelcomeMessage,
  announcement: settings.announcement,
  resumeUploadInstructions: settings.resumeUploadInstructions,
  currentPlanName: settings.currentPlanName,
  maintenanceMessage: settings.maintenanceMessage,
  maintenanceMode: settings.maintenanceMode,
  updatedAt: settings.updatedAt,
})

const createHttpError = (statusCode, message) => {
  const error = new Error(message)
  error.statusCode = statusCode
  error.expose = true
  return error
}

export const getPublicSettings = async (req, res, next) => {
  try {
    const settings = await getPlatformSettings()

    res.status(200).json({
      success: true,
      message: 'Platform settings retrieved successfully.',
      data: {
        settings: buildPublicSettings(settings),
      },
    })
  } catch (error) {
    next(error)
  }
}

export const getAdminSettings = async (req, res, next) => {
  try {
    const settings = await getPlatformSettings()

    res.status(200).json({
      success: true,
      message: 'Admin settings retrieved successfully.',
      data: {
        settings,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const updateAdminSettings = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      throw createHttpError(401, 'Authentication required')
    }

    const settings = await updatePlatformSettings({
      adminUserId: req.user.id,
      settings: req.body,
    })

    res.status(200).json({
      success: true,
      message: 'Platform settings updated successfully.',
      data: {
        settings,
      },
    })
  } catch (error) {
    next(error)
  }
}

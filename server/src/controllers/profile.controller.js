import {
  changeProfilePassword,
  getProfileById,
  updateProfileById,
} from '../services/profile.service.js'

const createHttpError = (statusCode, message) => {
  const error = new Error(message)
  error.statusCode = statusCode
  error.expose = true
  return error
}

const getAuthenticatedUserId = (req) => {
  if (!req.user?.id) {
    throw createHttpError(401, 'Authentication required')
  }

  return req.user.id
}

export const getProfile = async (req, res, next) => {
  try {
    const profile = await getProfileById(getAuthenticatedUserId(req))

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully.',
      data: {
        profile,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const updateProfile = async (req, res, next) => {
  try {
    const profile = await updateProfileById({
      userId: getAuthenticatedUserId(req),
      fullName: req.body?.fullName,
    })

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        profile,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const updateProfilePassword = async (req, res, next) => {
  try {
    await changeProfilePassword({
      userId: getAuthenticatedUserId(req),
      currentPassword: req.body?.currentPassword,
      newPassword: req.body?.newPassword,
    })

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    })
  } catch (error) {
    next(error)
  }
}

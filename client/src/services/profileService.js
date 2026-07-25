import apiClient from './apiClient.js'
import { normalizeApiError } from '../utils/apiError.js'

const createSafeApiError = (error) => {
  const normalizedError = normalizeApiError(error)
  const safeError = new Error(normalizedError.message)

  safeError.status = normalizedError.status
  safeError.isNetworkError = normalizedError.isNetworkError
  safeError.isTimeout = normalizedError.isTimeout

  return safeError
}

export const getProfile = async () => {
  try {
    const response = await apiClient.get('/profile')

    return response.data.data?.profile
  } catch (error) {
    throw createSafeApiError(error)
  }
}

export const updateProfile = async ({ fullName }) => {
  try {
    const response = await apiClient.put('/profile', {
      fullName,
    })

    return {
      message: response.data.message,
      profile: response.data.data?.profile,
    }
  } catch (error) {
    throw createSafeApiError(error)
  }
}

export const changePassword = async ({ currentPassword, newPassword }) => {
  try {
    const response = await apiClient.put('/profile/password', {
      currentPassword,
      newPassword,
    })

    return {
      message: response.data.message,
    }
  } catch (error) {
    throw createSafeApiError(error)
  }
}

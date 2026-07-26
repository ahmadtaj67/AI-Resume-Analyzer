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

export const getPublicSettings = async () => {
  try {
    const response = await apiClient.get('/settings/public')

    return response.data.data?.settings
  } catch (error) {
    throw createSafeApiError(error)
  }
}

export const getAdminSettings = async () => {
  try {
    const response = await apiClient.get('/admin/settings')

    return response.data.data?.settings
  } catch (error) {
    throw createSafeApiError(error)
  }
}

export const updateAdminSettings = async (settings) => {
  try {
    const response = await apiClient.put('/admin/settings', settings)

    return {
      message: response.data.message,
      settings: response.data.data?.settings,
    }
  } catch (error) {
    throw createSafeApiError(error)
  }
}

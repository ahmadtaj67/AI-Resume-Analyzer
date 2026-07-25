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

export const getAdminDashboard = async () => {
  try {
    const response = await apiClient.get('/admin/dashboard')

    return response.data.data?.stats
  } catch (error) {
    throw createSafeApiError(error)
  }
}

export const getAdminUsers = async ({ page = 1, limit = 10 } = {}) => {
  try {
    const response = await apiClient.get('/admin/users', {
      params: {
        page,
        limit,
      },
    })

    return response.data.data
  } catch (error) {
    throw createSafeApiError(error)
  }
}

export const getAdminReports = async ({ page = 1, limit = 10 } = {}) => {
  try {
    const response = await apiClient.get('/admin/reports', {
      params: {
        page,
        limit,
      },
    })

    return response.data.data
  } catch (error) {
    throw createSafeApiError(error)
  }
}

export const updateAdminUserStatus = async ({ userId, isActive }) => {
  try {
    const response = await apiClient.put(`/admin/users/${encodeURIComponent(userId)}/status`, {
      isActive,
    })

    return {
      message: response.data.message,
      user: response.data.data?.user,
    }
  } catch (error) {
    throw createSafeApiError(error)
  }
}

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

export const getAdminAnalyticsOverview = async () => {
  try {
    const response = await apiClient.get('/admin/analytics/overview')

    return response.data.data?.overview
  } catch (error) {
    throw createSafeApiError(error)
  }
}

export const getAdminAnalyticsTrends = async () => {
  try {
    const response = await apiClient.get('/admin/analytics/trends')

    return response.data.data?.trends
  } catch (error) {
    throw createSafeApiError(error)
  }
}

export const getAdminAnalyticsSkills = async () => {
  try {
    const response = await apiClient.get('/admin/analytics/skills')

    return response.data.data?.skills
  } catch (error) {
    throw createSafeApiError(error)
  }
}

export const getAdminUsers = async ({
  page = 1,
  limit = 10,
  search = '',
  filter = 'all',
} = {}) => {
  try {
    const response = await apiClient.get('/admin/users', {
      params: {
        page,
        limit,
        search,
        filter,
      },
    })

    return response.data.data
  } catch (error) {
    throw createSafeApiError(error)
  }
}

export const getAdminUser = async (userId) => {
  try {
    const response = await apiClient.get(`/admin/users/${encodeURIComponent(userId)}`)

    return response.data.data?.user
  } catch (error) {
    throw createSafeApiError(error)
  }
}

export const getAdminUserReports = async ({ userId, page = 1, limit = 10 } = {}) => {
  try {
    const response = await apiClient.get(
      `/admin/users/${encodeURIComponent(userId)}/reports`,
      {
        params: {
          page,
          limit,
        },
      },
    )

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
    const response = await apiClient.patch(`/admin/users/${encodeURIComponent(userId)}/status`, {
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

export const restoreAdminUser = async (userId) => {
  try {
    const response = await apiClient.patch(`/admin/users/${encodeURIComponent(userId)}/status`, {
      isDeleted: false,
    })

    return {
      message: response.data.message,
      user: response.data.data?.user,
    }
  } catch (error) {
    throw createSafeApiError(error)
  }
}

export const softDeleteAdminUser = async (userId) => {
  try {
    const response = await apiClient.delete(`/admin/users/${encodeURIComponent(userId)}`)

    return {
      message: response.data.message,
      user: response.data.data?.user,
    }
  } catch (error) {
    throw createSafeApiError(error)
  }
}

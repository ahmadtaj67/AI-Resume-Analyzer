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

export const registerUser = async ({ fullName, email, password }) => {
  try {
    const response = await apiClient.post('/auth/register', {
      fullName,
      email,
      password,
    })

    return {
      message: response.data.message,
      user: response.data.data?.user,
    }
  } catch (error) {
    throw createSafeApiError(error)
  }
}

export const loginUser = async ({ email, password }) => {
  try {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    })

    return {
      accessToken: response.data.data?.accessToken,
      message: response.data.message,
      user: response.data.data?.user,
    }
  } catch (error) {
    throw createSafeApiError(error)
  }
}

export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get('/auth/me')

    return response.data.data?.user
  } catch (error) {
    throw createSafeApiError(error)
  }
}

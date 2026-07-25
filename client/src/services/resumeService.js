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

export const uploadResume = async (file) => {
  try {
    const formData = new FormData()
    formData.append('resume', file)

    const response = await apiClient.post('/resumes/upload', formData)

    return {
      message: response.data.message,
      file: response.data.data,
    }
  } catch (error) {
    throw createSafeApiError(error)
  }
}

export const extractResumeText = async (file) => {
  try {
    const formData = new FormData()
    formData.append('resume', file)

    const response = await apiClient.post('/resumes/extract-text', formData)

    return {
      message: response.data.message,
      extraction: response.data.data,
    }
  } catch (error) {
    throw createSafeApiError(error)
  }
}

export const analyzeResume = async (file) => {
  try {
    const formData = new FormData()
    formData.append('resume', file)

    const response = await apiClient.post('/resumes/analyze', formData)

    return {
      message: response.data.message,
      result: response.data.data,
    }
  } catch (error) {
    throw createSafeApiError(error)
  }
}

export const getDashboardSummary = async () => {
  try {
    const response = await apiClient.get('/resumes/dashboard-summary')

    return response.data.data
  } catch (error) {
    throw createSafeApiError(error)
  }
}

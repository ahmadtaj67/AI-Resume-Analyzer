import axios from 'axios'
import { getStoredToken } from '../utils/authStorage.js'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

if (!apiBaseUrl && import.meta.env.DEV) {
  throw new Error('Missing frontend API configuration: VITE_API_BASE_URL')
}

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken()

  if (config.method?.toLowerCase() === 'get') {
    config.headers['Cache-Control'] = 'no-cache'
    config.headers.Pragma = 'no-cache'
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default apiClient

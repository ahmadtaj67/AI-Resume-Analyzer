import axios from 'axios'

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

export default apiClient

const AUTH_TOKEN_KEY = 'ai_resume_analyzer_access_token'

const getStorage = (storageName) => {
  try {
    return window[storageName]
  } catch {
    return null
  }
}

export const getStoredToken = () => {
  const sessionStorage = getStorage('sessionStorage')
  const localStorage = getStorage('localStorage')

  return (
    sessionStorage?.getItem(AUTH_TOKEN_KEY) ||
    localStorage?.getItem(AUTH_TOKEN_KEY) ||
    null
  )
}

export const storeToken = (token, rememberMe) => {
  if (typeof token !== 'string' || token.length === 0) {
    throw new Error('A valid access token is required')
  }

  removeStoredToken()

  const targetStorage = getStorage(rememberMe ? 'localStorage' : 'sessionStorage')
  targetStorage?.setItem(AUTH_TOKEN_KEY, token)
}

export const removeStoredToken = () => {
  getStorage('sessionStorage')?.removeItem(AUTH_TOKEN_KEY)
  getStorage('localStorage')?.removeItem(AUTH_TOKEN_KEY)
}

export const authTokenStorageKey = AUTH_TOKEN_KEY

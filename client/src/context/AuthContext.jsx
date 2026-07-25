import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  getStoredToken,
  removeStoredToken,
  storeToken,
} from '../utils/authStorage.js'
import {
  getCurrentUser,
  loginUser as loginUserService,
} from '../services/authService.js'

const AuthContext = createContext(null)

const createInitialState = () => ({
  user: null,
  isAuthenticated: false,
})

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(createInitialState)
  const [isInitializing, setIsInitializing] = useState(true)

  const resetAuthState = useCallback(() => {
    setAuthState(createInitialState())
  }, [])

  const restoreSession = useCallback(async () => {
    const token = getStoredToken()

    if (!token) {
      resetAuthState()
      setIsInitializing(false)
      return
    }

    try {
      const verifiedUser = await getCurrentUser()
      setAuthState({
        user: verifiedUser,
        isAuthenticated: true,
      })
    } catch {
      removeStoredToken()
      resetAuthState()
    } finally {
      setIsInitializing(false)
    }
  }, [resetAuthState])

  useEffect(() => {
    let isMounted = true

    const initialize = async () => {
      const token = getStoredToken()

      if (!token) {
        if (isMounted) {
          resetAuthState()
          setIsInitializing(false)
        }
        return
      }

      try {
        const verifiedUser = await getCurrentUser()

        if (isMounted) {
          setAuthState({
            user: verifiedUser,
            isAuthenticated: true,
          })
        }
      } catch {
        removeStoredToken()

        if (isMounted) {
          resetAuthState()
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false)
        }
      }
    }

    initialize()

    return () => {
      isMounted = false
    }
  }, [resetAuthState])

  const login = useCallback(
    async (credentials, rememberMe) => {
      const loginResult = await loginUserService(credentials)

      if (!loginResult.accessToken || !loginResult.user) {
        throw new Error('Something went wrong. Please try again.')
      }

      storeToken(loginResult.accessToken, rememberMe)

      try {
        const verifiedUser = await getCurrentUser()

        setAuthState({
          user: verifiedUser,
          isAuthenticated: true,
        })

        return {
          success: true,
          user: verifiedUser,
        }
      } catch (error) {
        removeStoredToken()
        resetAuthState()
        throw error
      }
    },
    [resetAuthState],
  )

  const logout = useCallback(() => {
    removeStoredToken()
    resetAuthState()
  }, [resetAuthState])

  const value = useMemo(
    () => ({
      user: authState.user,
      isAuthenticated: authState.isAuthenticated,
      isInitializing,
      login,
      logout,
      restoreSession,
    }),
    [authState.isAuthenticated, authState.user, isInitializing, login, logout, restoreSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}

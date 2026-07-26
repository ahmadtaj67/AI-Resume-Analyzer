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
  registerUser as registerUserService,
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

  const authenticateWithToken = useCallback(
    async (authResult, rememberMe) => {
      if (!authResult.accessToken || !authResult.user) {
        throw new Error('Something went wrong. Please try again.')
      }

      storeToken(authResult.accessToken, rememberMe)

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

  const login = useCallback(
    async (credentials, rememberMe) => {
      const loginResult = await loginUserService(credentials)

      return authenticateWithToken(loginResult, rememberMe)
    },
    [authenticateWithToken],
  )

  const register = useCallback(
    async (registrationData) => {
      const registerResult = await registerUserService(registrationData)

      return authenticateWithToken(registerResult, false)
    },
    [authenticateWithToken],
  )

  const logout = useCallback(() => {
    removeStoredToken()
    resetAuthState()
  }, [resetAuthState])

  const updateUser = useCallback((user) => {
    if (!user) {
      return
    }

    setAuthState({
      user,
      isAuthenticated: true,
    })
  }, [])

  const value = useMemo(
    () => ({
      user: authState.user,
      isAuthenticated: authState.isAuthenticated,
      isInitializing,
      login,
      logout,
      register,
      restoreSession,
      updateUser,
    }),
    [
      authState.isAuthenticated,
      authState.user,
      isInitializing,
      login,
      logout,
      register,
      restoreSession,
      updateUser,
    ],
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

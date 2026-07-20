import supabase from '../config/supabase.js'
import { verifyAccessToken } from '../utils/token.js'

const createHttpError = (statusCode, message) => {
  const error = new Error(message)
  error.statusCode = statusCode
  error.expose = true
  return error
}

const buildSafeUser = (profile) => ({
  id: profile.id,
  full_name: profile.full_name,
  email: profile.email,
  role: profile.role,
  is_active: profile.is_active,
  created_at: profile.created_at,
})

const getBearerToken = (authorizationHeader) => {
  if (!authorizationHeader) {
    throw createHttpError(401, 'Authentication required')
  }

  const parts = authorizationHeader.split(' ')

  if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
    throw createHttpError(401, 'Authentication required')
  }

  return parts[1]
}

export const authenticate = async (req, res, next) => {
  try {
    const token = getBearerToken(req.get('Authorization'))
    const decodedToken = verifyAccessToken(token)

    if (!decodedToken.sub) {
      throw createHttpError(401, 'Invalid or expired token')
    }

    const { data: profile, error: lookupError } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, is_active, created_at')
      .eq('id', decodedToken.sub)
      .maybeSingle()

    if (lookupError) {
      throw createHttpError(500, 'Unable to authenticate user')
    }

    if (!profile) {
      throw createHttpError(401, 'Authentication required')
    }

    if (!profile.is_active) {
      throw createHttpError(403, 'Your account is inactive. Please contact support.')
    }

    req.user = buildSafeUser(profile)
    next()
  } catch (error) {
    if (error.message === 'Invalid or expired access token') {
      next(createHttpError(401, 'Invalid or expired token'))
      return
    }

    next(error)
  }
}

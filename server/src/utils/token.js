import jwt from 'jsonwebtoken'
import authConfig from '../config/auth.js'

const SENSITIVE_TOKEN_FIELDS = new Set([
  'password',
  'passwordHash',
  'password_hash',
  'token',
  'secret',
])

const validatePayload = (payload) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Token payload must be an object')
  }

  const sensitiveField = Object.keys(payload).find((key) =>
    SENSITIVE_TOKEN_FIELDS.has(key),
  )

  if (sensitiveField) {
    throw new Error(`Token payload cannot include sensitive field: ${sensitiveField}`)
  }
}

export const generateAccessToken = (payload) => {
  validatePayload(payload)

  return jwt.sign(payload, authConfig.jwtSecret, {
    algorithm: 'HS256',
    expiresIn: authConfig.jwtExpiresIn,
  })
}

export const verifyAccessToken = (token) => {
  if (typeof token !== 'string' || token.trim().length === 0) {
    throw new Error('Access token is required')
  }

  try {
    return jwt.verify(token, authConfig.jwtSecret, {
      algorithms: ['HS256'],
    })
  } catch {
    throw new Error('Invalid or expired access token')
  }
}

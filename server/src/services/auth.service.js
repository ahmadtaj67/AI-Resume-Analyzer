import supabase from '../config/supabase.js'
import { comparePassword, hashPassword } from '../utils/password.js'
import { generateAccessToken } from '../utils/token.js'
import {
  normalizeEmail,
  validateEmail,
  validateFullName,
  validatePassword,
} from '../utils/authValidation.js'

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

const buildAuthResult = (profile) => ({
  accessToken: generateAccessToken({
    sub: profile.id,
    role: profile.role,
  }),
  user: buildSafeUser(profile),
})

const isUniqueEmailError = (error) =>
  error?.code === '23505' ||
  error?.message?.toLowerCase().includes('profiles_email_lower_unique_idx') ||
  error?.message?.toLowerCase().includes('duplicate key')

const INVALID_CREDENTIALS_MESSAGE = 'Invalid email or password'

export const registerUser = async ({ fullName, email, password }) => {
  const normalizedEmail = normalizeEmail(email)
  const trimmedFullName = typeof fullName === 'string' ? fullName.trim() : ''

  if (!validateFullName(fullName)) {
    throw createHttpError(400, 'Full name must be between 2 and 80 characters')
  }

  if (!validateEmail(normalizedEmail)) {
    throw createHttpError(400, 'A valid email address is required')
  }

  if (!validatePassword(password)) {
    throw createHttpError(
      400,
      'Password must be at least 6 characters',
    )
  }

  const { data: existingProfile, error: lookupError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (lookupError) {
    throw createHttpError(500, 'Unable to create account')
  }

  if (existingProfile) {
    throw createHttpError(409, 'An account with this email already exists')
  }

  const passwordHash = await hashPassword(password)

  const { data: newProfile, error: insertError } = await supabase
    .from('profiles')
    .insert({
      full_name: trimmedFullName,
      email: normalizedEmail,
      password_hash: passwordHash,
      role: 'user',
      is_active: true,
    })
    .select('id, full_name, email, role, is_active, created_at')
    .single()

  if (insertError) {
    if (isUniqueEmailError(insertError)) {
      throw createHttpError(409, 'An account with this email already exists')
    }

    throw createHttpError(500, 'Unable to create account')
  }

  if (!newProfile.is_active || newProfile.role !== 'user') {
    throw createHttpError(500, 'Unable to create account')
  }

  return buildAuthResult(newProfile)
}

export const loginUser = async ({ email, password }) => {
  const normalizedEmail = normalizeEmail(email)

  if (!validateEmail(normalizedEmail)) {
    throw createHttpError(400, 'A valid email address is required')
  }

  if (typeof password !== 'string' || password.length === 0) {
    throw createHttpError(400, 'Password is required')
  }

  const { data: profile, error: lookupError } = await supabase
    .from('profiles')
    .select('id, full_name, email, password_hash, role, is_active, created_at')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (lookupError) {
    throw createHttpError(500, 'Unable to login')
  }

  if (!profile) {
    throw createHttpError(401, INVALID_CREDENTIALS_MESSAGE)
  }

  if (!profile.is_active) {
    throw createHttpError(403, 'Your account is inactive. Please contact support.')
  }

  const passwordMatches = await comparePassword(password, profile.password_hash)

  if (!passwordMatches) {
    throw createHttpError(401, INVALID_CREDENTIALS_MESSAGE)
  }

  return buildAuthResult(profile)
}

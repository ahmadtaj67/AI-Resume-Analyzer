import supabase from '../config/supabase.js'
import { hashPassword } from '../utils/password.js'
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

const isUniqueEmailError = (error) =>
  error?.code === '23505' ||
  error?.message?.toLowerCase().includes('profiles_email_lower_unique_idx') ||
  error?.message?.toLowerCase().includes('duplicate key')

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
      'Password must be at least 8 characters and include uppercase, lowercase, and number characters',
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

  return buildSafeUser(newProfile)
}

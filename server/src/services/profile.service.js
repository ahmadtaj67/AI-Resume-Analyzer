import supabase from '../config/supabase.js'
import { comparePassword, hashPassword } from '../utils/password.js'
import { validateFullName, validatePassword } from '../utils/authValidation.js'

const createHttpError = (statusCode, message) => {
  const error = new Error(message)
  error.statusCode = statusCode
  error.expose = true
  return error
}

const buildSafeProfile = (profile) => ({
  id: profile.id,
  full_name: profile.full_name,
  email: profile.email,
  role: profile.role,
  is_active: profile.is_active,
  created_at: profile.created_at,
  updated_at: profile.updated_at,
})

export const getProfileById = async (userId) => {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, is_active, created_at, updated_at')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw createHttpError(500, 'Profile could not be loaded. Please try again.')
  }

  if (!profile) {
    throw createHttpError(404, 'Profile not found.')
  }

  return buildSafeProfile(profile)
}

export const updateProfileById = async ({ userId, fullName }) => {
  const trimmedFullName = typeof fullName === 'string' ? fullName.trim() : ''

  if (!validateFullName(fullName)) {
    throw createHttpError(400, 'Full name must be between 2 and 80 characters')
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .update({
      full_name: trimmedFullName,
    })
    .eq('id', userId)
    .select('id, full_name, email, role, is_active, created_at, updated_at')
    .single()

  if (error || !profile) {
    throw createHttpError(500, 'Profile could not be updated. Please try again.')
  }

  return buildSafeProfile(profile)
}

export const changeProfilePassword = async ({
  userId,
  currentPassword,
  newPassword,
}) => {
  if (typeof currentPassword !== 'string' || currentPassword.length === 0) {
    throw createHttpError(400, 'Current password is required')
  }

  if (!validatePassword(newPassword)) {
    throw createHttpError(
      400,
      'New password must be at least 8 characters and include uppercase, lowercase, and number characters',
    )
  }

  if (currentPassword === newPassword) {
    throw createHttpError(400, 'New password must be different from your current password')
  }

  const { data: profile, error: lookupError } = await supabase
    .from('profiles')
    .select('id, password_hash')
    .eq('id', userId)
    .maybeSingle()

  if (lookupError) {
    throw createHttpError(500, 'Password could not be changed. Please try again.')
  }

  if (!profile) {
    throw createHttpError(404, 'Profile not found.')
  }

  const passwordMatches = await comparePassword(currentPassword, profile.password_hash)

  if (!passwordMatches) {
    throw createHttpError(400, 'Current password is incorrect')
  }

  const passwordHash = await hashPassword(newPassword)
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      password_hash: passwordHash,
    })
    .eq('id', userId)

  if (updateError) {
    throw createHttpError(500, 'Password could not be changed. Please try again.')
  }
}

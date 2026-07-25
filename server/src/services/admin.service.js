import supabase from '../config/supabase.js'
import { buildPaginationMeta } from '../utils/pagination.js'

const createAdminError = (message) => {
  const error = new Error(message)
  error.statusCode = 500
  error.expose = true
  return error
}

const createHttpError = (statusCode, message) => {
  const error = new Error(message)
  error.statusCode = statusCode
  error.expose = true
  return error
}

const mapUserRow = (user) => ({
  id: user.id,
  fullName: user.full_name,
  email: user.email,
  role: user.role,
  isActive: user.is_active,
  createdAt: user.created_at,
  updatedAt: user.updated_at,
})

const mapReportRow = (report) => ({
  id: report.id,
  userId: report.user_id,
  fileName: report.original_file_name,
  overallScore: report.overall_score,
  createdAt: report.created_at,
  updatedAt: report.updated_at,
})

const countRows = async (tableName, filters = []) => {
  let query = supabase.from(tableName).select('id', { count: 'exact', head: true })

  filters.forEach(([column, value]) => {
    query = query.eq(column, value)
  })

  const { count, error } = await query

  if (error) {
    throw createAdminError('Admin statistics could not be loaded. Please try again.')
  }

  return count || 0
}

export const getAdminDashboardStats = async () => {
  const [totalUsers, activeUsers, totalReports] = await Promise.all([
    countRows('profiles'),
    countRows('profiles', [['is_active', true]]),
    countRows('resume_reports'),
  ])

  return {
    totalUsers,
    activeUsers,
    totalReports,
  }
}

export const getAdminUsers = async ({ page, limit, from, to }) => {
  const { count, error: countError } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })

  if (countError) {
    throw createAdminError('Users could not be loaded. Please try again.')
  }

  const totalItems = count || 0

  if (from >= totalItems) {
    return {
      users: [],
      pagination: buildPaginationMeta({ page, limit, totalItems }),
    }
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, is_active, created_at, updated_at')
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    throw createAdminError('Users could not be loaded. Please try again.')
  }

  return {
    users: data.map(mapUserRow),
    pagination: buildPaginationMeta({ page, limit, totalItems }),
  }
}

export const getAdminReports = async ({ page, limit, from, to }) => {
  const { count, error: countError } = await supabase
    .from('resume_reports')
    .select('id', { count: 'exact', head: true })

  if (countError) {
    throw createAdminError('Reports could not be loaded. Please try again.')
  }

  const totalItems = count || 0

  if (from >= totalItems) {
    return {
      reports: [],
      pagination: buildPaginationMeta({ page, limit, totalItems }),
    }
  }

  const { data, error } = await supabase
    .from('resume_reports')
    .select('id, user_id, original_file_name, overall_score, created_at, updated_at')
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    throw createAdminError('Reports could not be loaded. Please try again.')
  }

  return {
    reports: data.map(mapReportRow),
    pagination: buildPaginationMeta({ page, limit, totalItems }),
  }
}

export const updateUserActiveStatus = async ({ adminUserId, targetUserId, isActive }) => {
  if (adminUserId === targetUserId) {
    throw createHttpError(400, 'Admins cannot deactivate their own account from this panel.')
  }

  if (typeof isActive !== 'boolean') {
    throw createHttpError(400, 'isActive must be true or false.')
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      is_active: isActive,
    })
    .eq('id', targetUserId)
    .select('id, full_name, email, role, is_active, created_at, updated_at')
    .maybeSingle()

  if (error) {
    throw createAdminError('User status could not be updated. Please try again.')
  }

  if (!data) {
    throw createHttpError(404, 'User not found.')
  }

  return mapUserRow(data)
}

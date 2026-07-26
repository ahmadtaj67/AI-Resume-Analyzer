import supabase from '../config/supabase.js'

const SETTINGS_ID = true

const DEFAULT_SETTINGS = {
  platformName: 'AI Resume Analyzer',
  platformTagline: 'Smart Career Insights',
  dashboardWelcomeTitle: 'Welcome back',
  dashboardWelcomeMessage:
    'This workspace is ready for your upcoming resume analysis tools. Uploads, scoring, and recruiter-focused insights will become available in later phases.',
  announcement: '',
  resumeUploadInstructions:
    'Select one PDF resume for AI analysis. The validated report will be saved to your report history.',
  currentPlanName: 'Free',
  maintenanceMessage: '',
  maintenanceMode: false,
}

const TEXT_FIELDS = {
  platformName: { column: 'platform_name', maxLength: 80 },
  platformTagline: { column: 'platform_tagline', maxLength: 140 },
  dashboardWelcomeTitle: { column: 'dashboard_welcome_title', maxLength: 120 },
  dashboardWelcomeMessage: { column: 'dashboard_welcome_message', maxLength: 500 },
  announcement: { column: 'announcement', maxLength: 300 },
  resumeUploadInstructions: { column: 'resume_upload_instructions', maxLength: 400 },
  currentPlanName: { column: 'current_plan_name', maxLength: 60 },
  maintenanceMessage: { column: 'maintenance_message', maxLength: 300 },
}

const ALLOWED_FIELDS = new Set([...Object.keys(TEXT_FIELDS), 'maintenanceMode'])

const createHttpError = (statusCode, message) => {
  const error = new Error(message)
  error.statusCode = statusCode
  error.expose = true
  return error
}

const createSettingsError = (message) => createHttpError(500, message)

const mapSettingsRow = (row) => ({
  platformName: row?.platform_name ?? DEFAULT_SETTINGS.platformName,
  platformTagline: row?.platform_tagline ?? DEFAULT_SETTINGS.platformTagline,
  dashboardWelcomeTitle:
    row?.dashboard_welcome_title ?? DEFAULT_SETTINGS.dashboardWelcomeTitle,
  dashboardWelcomeMessage:
    row?.dashboard_welcome_message ?? DEFAULT_SETTINGS.dashboardWelcomeMessage,
  announcement: row?.announcement ?? DEFAULT_SETTINGS.announcement,
  resumeUploadInstructions:
    row?.resume_upload_instructions ?? DEFAULT_SETTINGS.resumeUploadInstructions,
  currentPlanName: row?.current_plan_name ?? DEFAULT_SETTINGS.currentPlanName,
  maintenanceMessage: row?.maintenance_message ?? DEFAULT_SETTINGS.maintenanceMessage,
  maintenanceMode: row?.maintenance_mode ?? DEFAULT_SETTINGS.maintenanceMode,
  updatedAt: row?.updated_at ?? null,
  updatedBy: row?.updated_by ?? null,
})

const sanitizeText = (field, value, maxLength) => {
  if (typeof value !== 'string') {
    throw createHttpError(400, `${field} must be text.`)
  }

  const trimmedValue = value.trim()

  if (trimmedValue.length > maxLength) {
    throw createHttpError(400, `${field} must be ${maxLength} characters or fewer.`)
  }

  if (/[<>]/.test(trimmedValue)) {
    throw createHttpError(400, `${field} cannot contain HTML or script-like markup.`)
  }

  return trimmedValue
}

export const getDefaultSettings = () => ({ ...DEFAULT_SETTINGS })

export const getPlatformSettings = async () => {
  const { data, error } = await supabase
    .from('platform_settings')
    .select(
      'platform_name, platform_tagline, dashboard_welcome_title, dashboard_welcome_message, announcement, resume_upload_instructions, current_plan_name, maintenance_message, maintenance_mode, updated_at, updated_by',
    )
    .eq('id', SETTINGS_ID)
    .maybeSingle()

  if (error) {
    throw createSettingsError('Platform settings could not be loaded.')
  }

  return mapSettingsRow(data)
}

export const updatePlatformSettings = async ({ adminUserId, settings }) => {
  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
    throw createHttpError(400, 'Settings payload is required.')
  }

  const unknownFields = Object.keys(settings).filter((field) => !ALLOWED_FIELDS.has(field))

  if (unknownFields.length > 0) {
    throw createHttpError(400, 'Unknown settings fields are not allowed.')
  }

  const updatePayload = {}

  Object.entries(TEXT_FIELDS).forEach(([field, config]) => {
    if (Object.prototype.hasOwnProperty.call(settings, field)) {
      updatePayload[config.column] = sanitizeText(field, settings[field], config.maxLength)
    }
  })

  if (Object.prototype.hasOwnProperty.call(settings, 'maintenanceMode')) {
    if (typeof settings.maintenanceMode !== 'boolean') {
      throw createHttpError(400, 'maintenanceMode must be true or false.')
    }

    updatePayload.maintenance_mode = settings.maintenanceMode
  }

  if (Object.keys(updatePayload).length === 0) {
    throw createHttpError(400, 'At least one supported setting is required.')
  }

  updatePayload.updated_by = adminUserId

  const { data, error } = await supabase
    .from('platform_settings')
    .update(updatePayload)
    .eq('id', SETTINGS_ID)
    .select(
      'platform_name, platform_tagline, dashboard_welcome_title, dashboard_welcome_message, announcement, resume_upload_instructions, current_plan_name, maintenance_message, maintenance_mode, updated_at, updated_by',
    )
    .single()

  if (error || !data) {
    throw createSettingsError('Platform settings could not be saved.')
  }

  return mapSettingsRow(data)
}

import { useCallback, useEffect, useState } from 'react'
import AdminShell from '../../components/admin/AdminShell.jsx'
import AuthField from '../../components/auth/AuthField.jsx'
import { useSettings } from '../../hooks/useSettings.js'
import {
  getAdminSettings,
  updateAdminSettings,
} from '../../services/settingsService.js'

const SETTINGS_FIELDS = [
  { name: 'platformName', label: 'Platform name', maxLength: 80 },
  { name: 'platformTagline', label: 'Platform tagline', maxLength: 140 },
  { name: 'dashboardWelcomeTitle', label: 'Dashboard welcome title', maxLength: 120 },
  { name: 'dashboardWelcomeMessage', label: 'Dashboard welcome message', maxLength: 500 },
  { name: 'announcement', label: 'Announcement', maxLength: 300 },
  { name: 'resumeUploadInstructions', label: 'Resume upload instructions', maxLength: 400 },
  { name: 'currentPlanName', label: 'Current plan name', maxLength: 60 },
  { name: 'maintenanceMessage', label: 'Maintenance message', maxLength: 300 },
]

const emptySettings = {
  platformName: '',
  platformTagline: '',
  dashboardWelcomeTitle: '',
  dashboardWelcomeMessage: '',
  announcement: '',
  resumeUploadInstructions: '',
  currentPlanName: '',
  maintenanceMessage: '',
  maintenanceMode: false,
}

const mergeFormSettings = (settings) => ({
  ...emptySettings,
  ...(settings && typeof settings === 'object' ? settings : {}),
})

function AdminSettingsPage() {
  const { applySettings, refreshSettings } = useSettings()
  const [formValues, setFormValues] = useState(emptySettings)
  const [lastSavedValues, setLastSavedValues] = useState(emptySettings)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const loadSettings = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const settings = mergeFormSettings(await getAdminSettings())
      setFormValues(settings)
      setLastSavedValues(settings)
      applySettings(settings)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }, [applySettings])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const validateForm = () => {
    const nextErrors = {}

    SETTINGS_FIELDS.forEach((field) => {
      const value = formValues[field.name]

      if (typeof value !== 'string') {
        nextErrors[field.name] = `${field.label} must be text.`
        return
      }

      const trimmedValue = value.trim()

      if (
        field.name !== 'announcement' &&
        field.name !== 'maintenanceMessage' &&
        trimmedValue.length === 0
      ) {
        nextErrors[field.name] = `${field.label} is required.`
      }

      if (trimmedValue.length > field.maxLength) {
        nextErrors[field.name] = `${field.label} must be ${field.maxLength} characters or fewer.`
      }

      if (/[<>]/.test(trimmedValue)) {
        nextErrors[field.name] = `${field.label} cannot contain HTML or script-like markup.`
      }
    })

    return nextErrors
  }

  const handleChange = (event) => {
    const { checked, name, type, value } = event.target
    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleReset = () => {
    setFormValues(lastSavedValues)
    setErrors({})
    setErrorMessage('')
    setSuccessMessage('Form reset to the last saved settings.')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isSaving) {
      return
    }

    setErrors({})
    setErrorMessage('')
    setSuccessMessage('')

    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSaving(true)

    try {
      const result = await updateAdminSettings(formValues)
      const savedSettings = mergeFormSettings(result.settings)

      setFormValues(savedSettings)
      setLastSavedValues(savedSettings)
      applySettings(savedSettings)
      await refreshSettings()
      setSuccessMessage(result.message || 'Platform settings updated successfully.')
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AdminShell>
      <section className="reports-page-heading" aria-labelledby="admin-settings-title">
        <p className="eyebrow">Admin</p>
        <h1 id="admin-settings-title">Platform Settings</h1>
        <p>Update safe display content without rebuilding or redeploying the app.</p>
      </section>

      <div className="reports-state-message" aria-live="polite">
        {isLoading ? <p>Loading platform settings...</p> : null}
      </div>

      {!isLoading ? (
        <section className="dashboard-panel admin-settings-panel" aria-labelledby="settings-form-title">
          <form className="profile-form admin-settings-form" onSubmit={handleSubmit} noValidate>
            <div className="dashboard-section-heading">
              <p className="eyebrow">Content</p>
              <h2 id="settings-form-title">Display Settings</h2>
              <p>Only plain text settings are supported. Code, secrets, and HTML are rejected.</p>
            </div>

            {successMessage ? (
              <div className="form-alert form-alert-success" role="status" aria-live="polite">
                {successMessage}
              </div>
            ) : null}

            {errorMessage ? (
              <div className="form-alert form-alert-error" role="alert" aria-live="polite">
                {errorMessage}
              </div>
            ) : null}

            {SETTINGS_FIELDS.map((field) => (
              <AuthField
                disabled={isSaving}
                error={errors[field.name]}
                id={`settings-${field.name}`}
                key={field.name}
                label={field.label}
                maxLength={field.maxLength}
                name={field.name}
                onChange={handleChange}
                value={formValues[field.name]}
              />
            ))}

            <label className="checkbox-row" htmlFor="settings-maintenance-mode">
              <input
                checked={formValues.maintenanceMode}
                disabled={isSaving}
                id="settings-maintenance-mode"
                name="maintenanceMode"
                onChange={handleChange}
                type="checkbox"
              />
              <span>Enable maintenance message on user dashboard</span>
            </label>

            <div className="admin-settings-actions">
              <button className="dashboard-primary-action" disabled={isSaving} type="submit">
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
              <button
                className="dashboard-secondary-action"
                disabled={isSaving}
                onClick={handleReset}
                type="button"
              >
                Reset to Last Saved
              </button>
            </div>
          </form>
        </section>
      ) : null}
    </AdminShell>
  )
}

export default AdminSettingsPage

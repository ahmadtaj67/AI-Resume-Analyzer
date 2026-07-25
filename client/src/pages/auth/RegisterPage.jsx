import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthField from '../../components/auth/AuthField.jsx'
import PasswordField from '../../components/auth/PasswordField.jsx'
import { registerUser } from '../../services/authService.js'

const initialFormValues = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptedTerms: false,
}

function RegisterPage() {
  const navigate = useNavigate()
  const [formValues, setFormValues] = useState(initialFormValues)
  const [errors, setErrors] = useState({})
  const [formMessage, setFormMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (event) => {
    const { checked, name, type, value } = event.target
    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const validateForm = () => {
    const nextErrors = {}

    if (!formValues.fullName.trim()) {
      nextErrors.fullName = 'Full name is required.'
    }

    if (!formValues.email.trim()) {
      nextErrors.email = 'Email is required.'
    }

    if (!formValues.password) {
      nextErrors.password = 'Password is required.'
    }

    if (!formValues.confirmPassword) {
      nextErrors.confirmPassword = 'Confirm your password.'
    } else if (formValues.password !== formValues.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords must match.'
    }

    if (!formValues.acceptedTerms) {
      nextErrors.acceptedTerms = 'You must accept the terms to continue.'
    }

    return nextErrors
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isSubmitting) {
      return
    }

    setErrors({})
    setFormMessage('')

    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSubmitting(true)

    try {
      await registerUser({
        fullName: formValues.fullName.trim(),
        email: formValues.email.trim(),
        password: formValues.password,
      })

      navigate('/login', {
        replace: true,
        state: {
          message: 'Account created successfully. Please sign in.',
        },
      })
    } catch (error) {
      setFormMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="form-heading">
        <p className="eyebrow">Create account</p>
        <h2>Start your analysis workspace</h2>
        <p>This screen is UI-only for now. Account creation connects later.</p>
      </div>

      {formMessage ? (
        <div className="form-alert form-alert-error" role="alert" aria-live="polite">
          {formMessage}
        </div>
      ) : null}

      <AuthField
        autoComplete="name"
        error={errors.fullName}
        disabled={isSubmitting}
        id="register-full-name"
        label="Full name"
        name="fullName"
        onChange={handleChange}
        placeholder="Alex Morgan"
        value={formValues.fullName}
      />

      <AuthField
        autoComplete="email"
        error={errors.email}
        disabled={isSubmitting}
        id="register-email"
        label="Email"
        name="email"
        onChange={handleChange}
        placeholder="you@example.com"
        type="email"
        value={formValues.email}
      />

      <PasswordField
        autoComplete="new-password"
        error={errors.password}
        disabled={isSubmitting}
        id="register-password"
        label="Password"
        name="password"
        onChange={handleChange}
        onToggleVisibility={() => setShowPassword((isVisible) => !isVisible)}
        placeholder="Create a password"
        showPassword={showPassword}
        toggleLabel={showPassword ? 'Hide password' : 'Show password'}
        value={formValues.password}
      />

      <PasswordField
        autoComplete="new-password"
        error={errors.confirmPassword}
        disabled={isSubmitting}
        id="confirm-password"
        label="Confirm password"
        name="confirmPassword"
        onChange={handleChange}
        onToggleVisibility={() =>
          setShowConfirmPassword((isVisible) => !isVisible)
        }
        placeholder="Confirm your password"
        showPassword={showConfirmPassword}
        toggleLabel={showConfirmPassword ? 'Hide password' : 'Show password'}
        value={formValues.confirmPassword}
      />

      <div>
        <label className="checkbox-row" htmlFor="terms">
          <input
            checked={formValues.acceptedTerms}
            disabled={isSubmitting}
            id="terms"
            name="acceptedTerms"
            onChange={handleChange}
            type="checkbox"
          />
          <span>I agree to the terms and privacy policy.</span>
        </label>
        {errors.acceptedTerms ? (
          <p className="field-error">{errors.acceptedTerms}</p>
        ) : null}
      </div>

      <button className="primary-button" disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Creating account...' : 'Create account'}
      </button>

      <p className="auth-switch">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </form>
  )
}

export default RegisterPage

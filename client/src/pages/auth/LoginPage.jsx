import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthField from '../../components/auth/AuthField.jsx'
import PasswordField from '../../components/auth/PasswordField.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

function LoginPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })
  const [errors, setErrors] = useState({})
  const [formMessage, setFormMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message)
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location.pathname, location.state, navigate])

  const handleChange = (event) => {
    const { checked, name, type, value } = event.target
    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const validateForm = () => {
    const nextErrors = {}

    if (!formValues.email.trim()) {
      nextErrors.email = 'Email is required.'
    }

    if (!formValues.password) {
      nextErrors.password = 'Password is required.'
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
    setSuccessMessage('')

    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSubmitting(true)

    try {
      await login(
        {
          email: formValues.email.trim(),
          password: formValues.password,
        },
        formValues.rememberMe,
      )
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setFormMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="form-heading">
        <p className="eyebrow">Welcome back</p>
        <h2>Sign in to your workspace</h2>
        <p>Use your account credentials to verify your session.</p>
      </div>

      {successMessage ? (
        <div className="form-alert form-alert-success" role="status" aria-live="polite">
          {successMessage}
        </div>
      ) : null}

      {formMessage ? (
        <div className="form-alert form-alert-error" role="alert" aria-live="polite">
          {formMessage}
        </div>
      ) : null}

      <AuthField
        autoComplete="email"
        disabled={isSubmitting}
        error={errors.email}
        id="login-email"
        label="Email"
        name="email"
        onChange={handleChange}
        placeholder="you@example.com"
        type="email"
        value={formValues.email}
      />

      <PasswordField
        autoComplete="current-password"
        disabled={isSubmitting}
        error={errors.password}
        id="login-password"
        label="Password"
        name="password"
        onChange={handleChange}
        onToggleVisibility={() => setShowPassword((isVisible) => !isVisible)}
        placeholder="Enter your password"
        showPassword={showPassword}
        toggleLabel={showPassword ? 'Hide password' : 'Show password'}
        value={formValues.password}
      />

      <label className="checkbox-row" htmlFor="remember-me">
        <input
          checked={formValues.rememberMe}
          disabled={isSubmitting}
          id="remember-me"
          name="rememberMe"
          onChange={handleChange}
          type="checkbox"
        />
        <span>Remember me</span>
      </label>

      <button className="primary-button" disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Signing in...' : 'Sign in'}
      </button>

      <p className="auth-switch">
        New to AI Resume Analyzer? <Link to="/register">Create an account</Link>
      </p>
    </form>
  )
}

export default LoginPage

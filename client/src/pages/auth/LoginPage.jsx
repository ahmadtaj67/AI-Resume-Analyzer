import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthField from '../../components/auth/AuthField.jsx'
import PasswordField from '../../components/auth/PasswordField.jsx'

function LoginPage() {
  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (event) => {
    const { checked, name, type, value } = event.target
    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="form-heading">
        <p className="eyebrow">Welcome back</p>
        <h2>Sign in to your workspace</h2>
        <p>Authentication wiring will be connected to the API in a later phase.</p>
      </div>

      <div className="form-alert" role="status" aria-live="polite">
        Future API errors will appear here.
      </div>

      <AuthField
        autoComplete="email"
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
          id="remember-me"
          name="rememberMe"
          onChange={handleChange}
          type="checkbox"
        />
        <span>Remember me</span>
      </label>

      <button className="primary-button" type="submit">
        Sign in
      </button>

      <p className="auth-switch">
        New to AI Resume Analyzer? <Link to="/register">Create an account</Link>
      </p>
    </form>
  )
}

export default LoginPage

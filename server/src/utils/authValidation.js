const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const normalizeEmail = (email) => {
  if (typeof email !== 'string') {
    return ''
  }

  return email.trim().toLowerCase()
}

export const validateEmail = (email) => {
  const normalizedEmail = normalizeEmail(email)

  return EMAIL_REGEX.test(normalizedEmail)
}

export const validatePassword = (password) => {
  if (typeof password !== 'string') {
    return false
  }

  const hasMinimumLength = password.length >= 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)

  return hasMinimumLength && hasUppercase && hasLowercase && hasNumber
}

export const validateFullName = (fullName) => {
  if (typeof fullName !== 'string') {
    return false
  }

  const trimmedName = fullName.trim()

  return trimmedName.length >= 2 && trimmedName.length <= 80
}

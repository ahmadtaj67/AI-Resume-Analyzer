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

  return password.length >= 6
}

export const validateFullName = (fullName) => {
  if (typeof fullName !== 'string') {
    return false
  }

  const trimmedName = fullName.trim()

  return trimmedName.length >= 2 && trimmedName.length <= 80
}

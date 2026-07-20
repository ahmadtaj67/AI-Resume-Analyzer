import bcrypt from 'bcryptjs'
import authConfig from '../config/auth.js'

const validatePlainPasswordInput = (plainPassword) => {
  if (typeof plainPassword !== 'string' || plainPassword.length === 0) {
    throw new Error('Password must be a non-empty string')
  }
}

export const hashPassword = async (plainPassword) => {
  validatePlainPasswordInput(plainPassword)

  try {
    return await bcrypt.hash(plainPassword, authConfig.bcryptSaltRounds)
  } catch {
    throw new Error('Unable to hash password')
  }
}

export const comparePassword = async (plainPassword, passwordHash) => {
  validatePlainPasswordInput(plainPassword)

  if (typeof passwordHash !== 'string' || passwordHash.length === 0) {
    throw new Error('Password hash must be a non-empty string')
  }

  try {
    return await bcrypt.compare(plainPassword, passwordHash)
  } catch {
    throw new Error('Unable to compare password')
  }
}

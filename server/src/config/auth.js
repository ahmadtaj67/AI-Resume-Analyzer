const DEFAULT_JWT_EXPIRES_IN = '7d'
const DEFAULT_BCRYPT_SALT_ROUNDS = 12
const MIN_SALT_ROUNDS = 10
const MAX_SALT_ROUNDS = 15

const parseSaltRounds = (value) => {
  if (!value) {
    return DEFAULT_BCRYPT_SALT_ROUNDS
  }

  const saltRounds = Number(value)

  if (!Number.isInteger(saltRounds)) {
    throw new Error('BCRYPT_SALT_ROUNDS must be an integer')
  }

  if (saltRounds < MIN_SALT_ROUNDS || saltRounds > MAX_SALT_ROUNDS) {
    throw new Error('BCRYPT_SALT_ROUNDS must be between 10 and 15')
  }

  return saltRounds
}

if (!process.env.JWT_SECRET) {
  throw new Error('Missing required authentication configuration: JWT_SECRET')
}

const authConfig = {
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || DEFAULT_JWT_EXPIRES_IN,
  bcryptSaltRounds: parseSaltRounds(process.env.BCRYPT_SALT_ROUNDS),
}

export default authConfig

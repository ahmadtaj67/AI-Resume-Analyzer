const DEFAULT_PORT = 5000
const DEFAULT_CLIENT_URL = 'http://localhost:5173'
const VALID_NODE_ENV_VALUES = new Set(['development', 'production', 'test'])

const readNodeEnv = () => {
  const nodeEnv = process.env.NODE_ENV?.trim() || 'development'

  if (!VALID_NODE_ENV_VALUES.has(nodeEnv)) {
    throw new Error('NODE_ENV must be development, production, or test')
  }

  return nodeEnv
}

const readPort = () => {
  const parsedPort = Number.parseInt(process.env.PORT, 10)

  if (!process.env.PORT) {
    return DEFAULT_PORT
  }

  if (!Number.isInteger(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
    throw new Error('PORT must be a valid TCP port number')
  }

  return parsedPort
}

const parseCsv = (value) =>
  typeof value === 'string'
    ? value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : []

const readClientOrigins = (nodeEnv) => {
  const origins = [
    ...parseCsv(process.env.CLIENT_URL),
    ...parseCsv(process.env.CORS_ORIGINS),
  ]

  if (origins.length > 0) {
    return [...new Set(origins)]
  }

  if (nodeEnv === 'production') {
    throw new Error('CLIENT_URL or CORS_ORIGINS is required in production')
  }

  return [DEFAULT_CLIENT_URL]
}

const readRequiredEnv = (name) => {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

const nodeEnv = readNodeEnv()

const serverConfig = {
  nodeEnv,
  isDevelopment: nodeEnv !== 'production',
  isProduction: nodeEnv === 'production',
  port: readPort(),
  clientOrigins: readClientOrigins(nodeEnv),
}

export const validateEnvironment = () => {
  readRequiredEnv('SUPABASE_URL')
  readRequiredEnv('SUPABASE_SECRET_KEY')
  readRequiredEnv('JWT_SECRET')
}

export default serverConfig

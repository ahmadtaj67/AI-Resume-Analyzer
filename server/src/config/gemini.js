import { GoogleGenAI } from '@google/genai'

const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash'
const DEFAULT_MAX_OUTPUT_TOKENS = 4096
const DEFAULT_MAX_AI_RESUME_TEXT_CHARACTERS = 30000

let geminiClient = null

const createConfigurationError = () => {
  const error = new Error('AI analysis is not configured on the server.')
  error.statusCode = 503
  error.expose = true
  return error
}

const readPositiveInteger = (value, fallbackValue) => {
  const parsedValue = Number.parseInt(value, 10)

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return fallbackValue
  }

  return parsedValue
}

export const getGeminiModel = () => {
  const configuredModel = process.env.GEMINI_MODEL?.trim()
  return configuredModel || DEFAULT_GEMINI_MODEL
}

export const getGeminiMaxOutputTokens = () =>
  readPositiveInteger(process.env.GEMINI_MAX_OUTPUT_TOKENS, DEFAULT_MAX_OUTPUT_TOKENS)

export const getMaxAiResumeTextCharacters = () =>
  readPositiveInteger(
    process.env.MAX_AI_RESUME_TEXT_CHARACTERS,
    DEFAULT_MAX_AI_RESUME_TEXT_CHARACTERS,
  )

export const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY?.trim()

  if (!apiKey) {
    throw createConfigurationError()
  }

  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey })
  }

  return geminiClient
}

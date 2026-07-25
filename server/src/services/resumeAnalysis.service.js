import {
  getGeminiClient,
  getGeminiMaxOutputTokens,
  getGeminiModel,
  getMaxAiResumeTextCharacters,
} from '../config/gemini.js'
import {
  buildResumeAnalysisPrompt,
  resumeAnalysisSystemInstruction,
} from '../prompts/resumeAnalysis.prompt.js'
import {
  parseAnalysisJson,
  resumeAnalysisResponseSchema,
  validateResumeAnalysis,
} from '../utils/resumeAnalysisSchema.js'

const MIN_AI_TEXT_CHARACTERS = 20

const createAnalysisError = (statusCode, message) => {
  const error = new Error(message)
  error.statusCode = statusCode
  error.expose = true
  return error
}

const normalizeProviderError = (error) => {
  if (error?.statusCode && error.expose) {
    return error
  }

  const message = `${error?.message || ''}`.toLowerCase()
  const status = Number(error?.status || error?.code)

  if (status === 429 || message.includes('quota') || message.includes('rate limit')) {
    return createAnalysisError(
      429,
      'AI analysis is temporarily unavailable due to usage limits. Please try again later.',
    )
  }

  if (
    status === 400 ||
    status === 401 ||
    status === 403 ||
    status === 404 ||
    message.includes('api key') ||
    message.includes('permission') ||
    message.includes('model')
  ) {
    return createAnalysisError(503, 'AI analysis is temporarily unavailable. Please try again.')
  }

  return createAnalysisError(503, 'AI analysis is temporarily unavailable. Please try again.')
}

const getResponseText = (response) => {
  if (typeof response?.text === 'string') {
    return response.text
  }

  if (typeof response?.text === 'function') {
    return response.text()
  }

  return ''
}

export const analyzeResumeText = async (resumeText) => {
  if (typeof resumeText !== 'string' || resumeText.trim().length < MIN_AI_TEXT_CHARACTERS) {
    throw createAnalysisError(
      422,
      'No readable text was found in this PDF. It may be a scanned or image-only document.',
    )
  }

  const limitedResumeText = resumeText.slice(0, getMaxAiResumeTextCharacters())

  try {
    const ai = getGeminiClient()
    const response = await ai.models.generateContent({
      model: getGeminiModel(),
      contents: buildResumeAnalysisPrompt(limitedResumeText),
      config: {
        systemInstruction: resumeAnalysisSystemInstruction,
        responseMimeType: 'application/json',
        responseSchema: resumeAnalysisResponseSchema,
        maxOutputTokens: getGeminiMaxOutputTokens(),
        temperature: 0.2,
      },
    })

    const responseText = getResponseText(response)
    const parsedAnalysis = parseAnalysisJson(responseText)

    return {
      analysis: validateResumeAnalysis(parsedAnalysis),
      model: getGeminiModel(),
      inputCharacterCount: limitedResumeText.length,
      isInputTruncated: resumeText.length > limitedResumeText.length,
    }
  } catch (error) {
    if (error?.statusCode === 502) {
      throw error
    }

    throw normalizeProviderError(error)
  }
}


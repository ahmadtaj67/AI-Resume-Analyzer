import { Type } from '@google/genai'
import {
  getGeminiClient,
  getGeminiMaxOutputTokens,
  getGeminiModel,
} from '../config/gemini.js'
import {
  buildResumeComparisonPrompt,
  resumeComparisonSystemInstruction,
} from '../prompts/resumeComparison.prompt.js'
import { getUserReportById } from './resumeReport.service.js'

const sectionKeys = ['contact', 'summary', 'skills', 'experience', 'education', 'projects']

const comparisonNarrativeSchema = {
  type: Type.OBJECT,
  properties: {
    aiSummary: { type: Type.STRING },
    biggestImprovements: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    remainingWeaknesses: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    finalRecommendation: { type: Type.STRING },
  },
  required: ['aiSummary', 'biggestImprovements', 'remainingWeaknesses', 'finalRecommendation'],
}

const createComparisonError = (statusCode, message) => {
  const error = new Error(message)
  error.statusCode = statusCode
  error.expose = true
  return error
}

const normalizeList = (value) =>
  Array.isArray(value)
    ? value
        .filter((item) => typeof item === 'string')
        .map((item) => item.trim())
        .filter(Boolean)
    : []

const normalizeText = (value, fallback = '') =>
  typeof value === 'string' && value.trim() ? value.trim() : fallback

const normalizeScore = (value) =>
  typeof value === 'number' && Number.isFinite(value)
    ? Math.min(100, Math.max(0, Math.round(value)))
    : 0

const getDifference = (previousValue, currentValue) =>
  normalizeScore(currentValue) - normalizeScore(previousValue)

const getListDifference = (sourceItems, comparisonItems) => {
  const comparisonSet = new Set(normalizeList(comparisonItems).map((item) => item.toLowerCase()))

  return normalizeList(sourceItems).filter((item) => !comparisonSet.has(item.toLowerCase()))
}

const getSectionComparison = (previousAnalysis, currentAnalysis) =>
  sectionKeys.map((section) => {
    const previousScore = normalizeScore(previousAnalysis.resumeSectionScores?.[section])
    const currentScore = normalizeScore(currentAnalysis.resumeSectionScores?.[section])

    return {
      section,
      previousScore,
      currentScore,
      difference: currentScore - previousScore,
    }
  })

const buildCalculatedComparison = ({ previousReport, currentReport }) => {
  const previousAnalysis = previousReport.analysis || {}
  const currentAnalysis = currentReport.analysis || {}
  const previousHiringProbability = normalizeScore(previousAnalysis.hiringProbability)
  const currentHiringProbability = normalizeScore(currentAnalysis.hiringProbability)

  return {
    previousReport: {
      id: previousReport.id,
      fileName: previousReport.fileName,
      createdAt: previousReport.createdAt,
    },
    currentReport: {
      id: currentReport.id,
      fileName: currentReport.fileName,
      createdAt: currentReport.createdAt,
    },
    scores: {
      previousOverallScore: normalizeScore(previousAnalysis.overallScore),
      currentOverallScore: normalizeScore(currentAnalysis.overallScore),
      scoreDifference: getDifference(
        previousAnalysis.overallScore,
        currentAnalysis.overallScore,
      ),
      previousAtsScore: normalizeScore(previousAnalysis.atsScore),
      currentAtsScore: normalizeScore(currentAnalysis.atsScore),
      atsDifference: getDifference(previousAnalysis.atsScore, currentAnalysis.atsScore),
      previousResumeGrade: normalizeText(previousAnalysis.resumeGrade, 'N/A'),
      currentResumeGrade: normalizeText(currentAnalysis.resumeGrade, 'N/A'),
      previousHiringProbability,
      currentHiringProbability,
      hiringProbabilityDifference: currentHiringProbability - previousHiringProbability,
    },
    skills: {
      newSkillsAdded: getListDifference(
        currentAnalysis.detectedSkills,
        previousAnalysis.detectedSkills,
      ),
      skillsRemoved: getListDifference(
        previousAnalysis.detectedSkills,
        currentAnalysis.detectedSkills,
      ),
      newlyRecommendedSkills: getListDifference(
        currentAnalysis.recommendedSkills,
        previousAnalysis.recommendedSkills,
      ),
      missingSkillsResolved: getListDifference(
        previousAnalysis.missingSkills,
        currentAnalysis.missingSkills,
      ),
      newMissingSkills: getListDifference(
        currentAnalysis.missingSkills,
        previousAnalysis.missingSkills,
      ),
    },
    sectionComparison: getSectionComparison(previousAnalysis, currentAnalysis),
  }
}

const parseNarrativeJson = (responseText) => {
  if (typeof responseText !== 'string' || !responseText.trim()) {
    throw new Error('Empty AI comparison response')
  }

  return JSON.parse(responseText)
}

const validateNarrative = (value, fallback) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return fallback
  }

  return {
    aiSummary: normalizeText(value.aiSummary, fallback.aiSummary),
    biggestImprovements: normalizeList(value.biggestImprovements).slice(0, 6),
    remainingWeaknesses: normalizeList(value.remainingWeaknesses).slice(0, 6),
    finalRecommendation: normalizeText(value.finalRecommendation, fallback.finalRecommendation),
  }
}

const buildFallbackNarrative = (comparison) => {
  const scoreDifference = comparison.scores.scoreDifference
  const atsDifference = comparison.scores.atsDifference

  return {
    aiSummary:
      scoreDifference >= 0
        ? `The current resume improved by ${scoreDifference} overall score points and changed by ${atsDifference} ATS points.`
        : `The current resume dropped by ${Math.abs(scoreDifference)} overall score points and changed by ${atsDifference} ATS points.`,
    biggestImprovements: [
      ...comparison.skills.newSkillsAdded.slice(0, 3).map((skill) => `Added ${skill}.`),
      ...comparison.sectionComparison
        .filter((section) => section.difference > 0)
        .slice(0, 3)
        .map((section) => `Improved ${section.section} by ${section.difference} points.`),
    ].slice(0, 6),
    remainingWeaknesses: [
      ...comparison.skills.newMissingSkills.slice(0, 3),
      ...comparison.sectionComparison
        .filter((section) => section.currentScore < 70)
        .slice(0, 3)
        .map((section) => `${section.section} still needs improvement.`),
    ].slice(0, 6),
    finalRecommendation:
      'Focus on the lowest section scores and keep adding measurable achievements before the next version.',
  }
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

const getAiNarrative = async ({ previousReport, currentReport, comparison }) => {
  const fallback = buildFallbackNarrative(comparison)

  try {
    const ai = getGeminiClient()
    const response = await ai.models.generateContent({
      model: getGeminiModel(),
      contents: buildResumeComparisonPrompt({
        previousReport,
        currentReport,
        metrics: comparison,
      }),
      config: {
        systemInstruction: resumeComparisonSystemInstruction,
        responseMimeType: 'application/json',
        responseSchema: comparisonNarrativeSchema,
        maxOutputTokens: getGeminiMaxOutputTokens(),
      },
    })
    const parsedNarrative = parseNarrativeJson(getResponseText(response))

    return {
      ...validateNarrative(parsedNarrative, fallback),
      isAiGenerated: true,
    }
  } catch (error) {
    console.error('Gemini resume comparison failed', {
      message: error?.message,
      stack: error?.stack,
      status: error?.status,
      statusCode: error?.statusCode,
      code: error?.code,
      response: error?.response,
      responseData: error?.response?.data,
      responseBody: error?.response?.body,
      details: error?.details,
      cause: error?.cause,
    })

    return {
      ...fallback,
      isAiGenerated: false,
    }
  }
}

export const compareUserReports = async ({ userId, previousReportId, currentReportId }) => {
  if (previousReportId === currentReportId) {
    throw createComparisonError(400, 'Please select two different reports to compare.')
  }

  const [previousReport, currentReport] = await Promise.all([
    getUserReportById({ userId, reportId: previousReportId }),
    getUserReportById({ userId, reportId: currentReportId }),
  ])

  if (!previousReport || !currentReport) {
    throw createComparisonError(404, 'One or both reports could not be found.')
  }

  const comparison = buildCalculatedComparison({ previousReport, currentReport })
  const narrative = await getAiNarrative({ previousReport, currentReport, comparison })

  return {
    ...comparison,
    aiSummary: narrative.aiSummary,
    biggestImprovements: narrative.biggestImprovements,
    remainingWeaknesses: narrative.remainingWeaknesses,
    finalRecommendation: narrative.finalRecommendation,
    metadata: {
      aiGenerated: narrative.isAiGenerated,
      model: narrative.isAiGenerated ? getGeminiModel() : null,
      isStateless: true,
    },
  }
}

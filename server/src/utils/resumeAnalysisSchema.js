import { Type } from '@google/genai'

export const formattingQualityValues = ['poor', 'fair', 'good', 'excellent']

export const resumeAnalysisResponseSchema = {
  type: Type.OBJECT,
  properties: {
    overallScore: {
      type: Type.INTEGER,
      minimum: 0,
      maximum: 100,
    },
    professionalSummary: {
      type: Type.STRING,
    },
    strengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    weaknesses: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    detectedSkills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    missingSections: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    improvementSuggestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    atsChecks: {
      type: Type.OBJECT,
      properties: {
        hasContactInformation: { type: Type.BOOLEAN },
        hasProfessionalSummary: { type: Type.BOOLEAN },
        hasSkillsSection: { type: Type.BOOLEAN },
        hasExperienceSection: { type: Type.BOOLEAN },
        hasEducationSection: { type: Type.BOOLEAN },
        usesActionVerbs: { type: Type.BOOLEAN },
        hasMeasurableAchievements: { type: Type.BOOLEAN },
        formattingQuality: {
          type: Type.STRING,
          enum: formattingQualityValues,
        },
      },
      required: [
        'hasContactInformation',
        'hasProfessionalSummary',
        'hasSkillsSection',
        'hasExperienceSection',
        'hasEducationSection',
        'usesActionVerbs',
        'hasMeasurableAchievements',
        'formattingQuality',
      ],
    },
  },
  required: [
    'overallScore',
    'professionalSummary',
    'strengths',
    'weaknesses',
    'detectedSkills',
    'missingSections',
    'improvementSuggestions',
    'atsChecks',
  ],
}

const createInvalidAnalysisError = () => {
  const error = new Error('AI analysis returned an invalid response. Please try again.')
  error.statusCode = 502
  error.expose = true
  return error
}

const normalizeString = (value) => {
  if (typeof value !== 'string') {
    throw createInvalidAnalysisError()
  }

  return value.replace(/\u0000/g, '').replace(/[ \t]+/g, ' ').trim()
}

const normalizeStringArray = (value, maxItems) => {
  if (!Array.isArray(value)) {
    throw createInvalidAnalysisError()
  }

  return value
    .map((item) => normalizeString(item))
    .filter(Boolean)
    .slice(0, maxItems)
}

const normalizeDetectedSkills = (value) => {
  const seenSkills = new Set()

  return normalizeStringArray(value, 20).filter((skill) => {
    const normalizedSkill = skill.toLowerCase()

    if (seenSkills.has(normalizedSkill)) {
      return false
    }

    seenSkills.add(normalizedSkill)
    return true
  })
}

const normalizeScore = (value) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw createInvalidAnalysisError()
  }

  return Math.min(100, Math.max(0, Math.round(value)))
}

const normalizeBoolean = (value) => {
  if (typeof value !== 'boolean') {
    throw createInvalidAnalysisError()
  }

  return value
}

const normalizeFormattingQuality = (value) => {
  const normalizedValue = normalizeString(value).toLowerCase()

  if (!formattingQualityValues.includes(normalizedValue)) {
    throw createInvalidAnalysisError()
  }

  return normalizedValue
}

const normalizeAtsChecks = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw createInvalidAnalysisError()
  }

  return {
    hasContactInformation: normalizeBoolean(value.hasContactInformation),
    hasProfessionalSummary: normalizeBoolean(value.hasProfessionalSummary),
    hasSkillsSection: normalizeBoolean(value.hasSkillsSection),
    hasExperienceSection: normalizeBoolean(value.hasExperienceSection),
    hasEducationSection: normalizeBoolean(value.hasEducationSection),
    usesActionVerbs: normalizeBoolean(value.usesActionVerbs),
    hasMeasurableAchievements: normalizeBoolean(value.hasMeasurableAchievements),
    formattingQuality: normalizeFormattingQuality(value.formattingQuality),
  }
}

export const parseAnalysisJson = (responseText) => {
  if (typeof responseText !== 'string' || responseText.trim().length === 0) {
    throw createInvalidAnalysisError()
  }

  try {
    return JSON.parse(responseText)
  } catch {
    throw createInvalidAnalysisError()
  }
}

export const validateResumeAnalysis = (analysis) => {
  if (!analysis || typeof analysis !== 'object' || Array.isArray(analysis)) {
    throw createInvalidAnalysisError()
  }

  return {
    overallScore: normalizeScore(analysis.overallScore),
    professionalSummary: normalizeString(analysis.professionalSummary),
    strengths: normalizeStringArray(analysis.strengths, 6),
    weaknesses: normalizeStringArray(analysis.weaknesses, 6),
    detectedSkills: normalizeDetectedSkills(analysis.detectedSkills),
    missingSections: normalizeStringArray(analysis.missingSections, 8),
    improvementSuggestions: normalizeStringArray(analysis.improvementSuggestions, 8),
    atsChecks: normalizeAtsChecks(analysis.atsChecks),
  }
}


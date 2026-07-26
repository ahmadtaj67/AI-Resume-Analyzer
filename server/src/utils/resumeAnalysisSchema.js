import { Type } from '@google/genai'

export const formattingQualityValues = ['poor', 'fair', 'good', 'excellent']
export const resumeGradeValues = ['A+', 'A', 'B', 'C', 'D']
export const sectionScoreKeys = [
  'contact',
  'summary',
  'skills',
  'experience',
  'education',
  'projects',
]

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
    atsScore: {
      type: Type.INTEGER,
      minimum: 0,
      maximum: 100,
    },
    resumeGrade: {
      type: Type.STRING,
      enum: resumeGradeValues,
    },
    hiringProbability: {
      type: Type.INTEGER,
      minimum: 0,
      maximum: 100,
    },
    recruiterVerdict: {
      type: Type.STRING,
    },
    jobReadiness: {
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
    missingSkills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    recommendedSkills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    priorityImprovements: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    strengthRanking: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          rank: {
            type: Type.INTEGER,
            minimum: 1,
            maximum: 8,
          },
          label: {
            type: Type.STRING,
          },
          reason: {
            type: Type.STRING,
          },
        },
        required: ['rank', 'label', 'reason'],
      },
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
    resumeSectionScores: {
      type: Type.OBJECT,
      properties: {
        contact: {
          type: Type.INTEGER,
          minimum: 0,
          maximum: 100,
        },
        summary: {
          type: Type.INTEGER,
          minimum: 0,
          maximum: 100,
        },
        skills: {
          type: Type.INTEGER,
          minimum: 0,
          maximum: 100,
        },
        experience: {
          type: Type.INTEGER,
          minimum: 0,
          maximum: 100,
        },
        education: {
          type: Type.INTEGER,
          minimum: 0,
          maximum: 100,
        },
        projects: {
          type: Type.INTEGER,
          minimum: 0,
          maximum: 100,
        },
      },
      required: sectionScoreKeys,
    },
    finalRecommendation: {
      type: Type.STRING,
    },
  },
  required: [
    'overallScore',
    'professionalSummary',
    'atsScore',
    'resumeGrade',
    'hiringProbability',
    'recruiterVerdict',
    'jobReadiness',
    'strengths',
    'weaknesses',
    'detectedSkills',
    'missingSkills',
    'recommendedSkills',
    'priorityImprovements',
    'strengthRanking',
    'missingSections',
    'improvementSuggestions',
    'atsChecks',
    'resumeSectionScores',
    'finalRecommendation',
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

const normalizeResumeGrade = (value) => {
  const normalizedValue = normalizeString(value).toUpperCase()

  if (!resumeGradeValues.includes(normalizedValue)) {
    throw createInvalidAnalysisError()
  }

  return normalizedValue
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

const normalizeStrengthRanking = (value) => {
  if (!Array.isArray(value)) {
    throw createInvalidAnalysisError()
  }

  return value
    .map((item, index) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        throw createInvalidAnalysisError()
      }

      return {
        rank: Math.max(1, Math.min(8, normalizeScore(item.rank || index + 1))),
        label: normalizeString(item.label),
        reason: normalizeString(item.reason),
      }
    })
    .filter((item) => item.label && item.reason)
    .slice(0, 8)
}

const normalizeResumeSectionScores = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw createInvalidAnalysisError()
  }

  return sectionScoreKeys.reduce((scores, key) => {
    scores[key] = normalizeScore(value[key])
    return scores
  }, {})
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
    atsScore: normalizeScore(analysis.atsScore),
    resumeGrade: normalizeResumeGrade(analysis.resumeGrade),
    hiringProbability: normalizeScore(analysis.hiringProbability),
    recruiterVerdict: normalizeString(analysis.recruiterVerdict),
    jobReadiness: normalizeString(analysis.jobReadiness),
    strengths: normalizeStringArray(analysis.strengths, 6),
    weaknesses: normalizeStringArray(analysis.weaknesses, 6),
    detectedSkills: normalizeDetectedSkills(analysis.detectedSkills),
    missingSkills: normalizeStringArray(analysis.missingSkills, 10),
    recommendedSkills: normalizeStringArray(analysis.recommendedSkills, 10),
    priorityImprovements: normalizeStringArray(analysis.priorityImprovements, 8),
    strengthRanking: normalizeStrengthRanking(analysis.strengthRanking),
    missingSections: normalizeStringArray(analysis.missingSections, 8),
    improvementSuggestions: normalizeStringArray(analysis.improvementSuggestions, 8),
    atsChecks: normalizeAtsChecks(analysis.atsChecks),
    resumeSectionScores: normalizeResumeSectionScores(analysis.resumeSectionScores),
    finalRecommendation: normalizeString(analysis.finalRecommendation),
  }
}

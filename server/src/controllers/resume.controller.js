import { sanitizeFileName } from '../utils/resumeValidation.js'
import { extractPdfText } from '../utils/pdfTextExtractor.js'
import { analyzeResumeText } from '../services/resumeAnalysis.service.js'
import { createResumeReport } from '../services/resumeReport.service.js'

const createHttpError = (statusCode, message) => {
  const error = new Error(message)
  error.statusCode = statusCode
  error.expose = true
  return error
}

export const validateResumeUpload = (req, res, next) => {
  try {
    if (!req.user) {
      throw createHttpError(401, 'Authentication required')
    }

    if (!req.file) {
      throw createHttpError(400, 'Please upload one PDF resume using the resume field.')
    }

    res.status(200).json({
      success: true,
      message: 'Resume PDF received and validated successfully.',
      data: {
        fileName: sanitizeFileName(req.file.originalname),
        mimeType: req.file.mimetype,
        size: req.file.size,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const extractResumeText = async (req, res, next) => {
  try {
    if (!req.user) {
      throw createHttpError(401, 'Authentication required')
    }

    if (!req.file) {
      throw createHttpError(400, 'Please upload one PDF resume using the resume field.')
    }

    const extractionResult = await extractPdfText(req.file.buffer)

    res.status(200).json({
      success: true,
      message: 'Resume text extracted successfully.',
      data: {
        fileName: sanitizeFileName(req.file.originalname),
        mimeType: req.file.mimetype,
        size: req.file.size,
        pageCount: extractionResult.pageCount,
        wordCount: extractionResult.wordCount,
        characterCount: extractionResult.characterCount,
        textPreview: extractionResult.preview,
        isPreviewTruncated: extractionResult.isPreviewTruncated,
        isTextReadable: extractionResult.isTextReadable,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const analyzeResume = async (req, res, next) => {
  try {
    if (!req.user) {
      throw createHttpError(401, 'Authentication required')
    }

    if (!req.file) {
      throw createHttpError(400, 'Please upload one PDF resume using the resume field.')
    }

    const fileName = sanitizeFileName(req.file.originalname)
    const extractionResult = await extractPdfText(req.file.buffer)
    const analysisResult = await analyzeResumeText(extractionResult.text)
    const extractionSummary = {
      pageCount: extractionResult.pageCount,
      wordCount: extractionResult.wordCount,
      characterCount: extractionResult.characterCount,
    }
    const reportJson = {
      professionalSummary: analysisResult.analysis.professionalSummary,
      strengths: analysisResult.analysis.strengths,
      weaknesses: analysisResult.analysis.weaknesses,
      detectedSkills: analysisResult.analysis.detectedSkills,
      missingSections: analysisResult.analysis.missingSections,
      improvementSuggestions: analysisResult.analysis.improvementSuggestions,
      atsChecks: analysisResult.analysis.atsChecks,
      extraction: extractionSummary,
    }
    const savedReport = await createResumeReport({
      userId: req.user.id,
      fileName,
      aiModel: analysisResult.model,
      overallScore: analysisResult.analysis.overallScore,
      reportJson,
    })

    res.status(200).json({
      success: true,
      message: 'Resume analyzed and report saved successfully.',
      data: {
        report: savedReport,
        file: {
          fileName,
          mimeType: req.file.mimetype,
          size: req.file.size,
        },
        extraction: {
          ...extractionSummary,
          isTextTruncated: extractionResult.isTextTruncated,
        },
        analysis: analysisResult.analysis,
        metadata: {
          model: analysisResult.model,
          inputCharacterCount: analysisResult.inputCharacterCount,
          isInputTruncated: analysisResult.isInputTruncated,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

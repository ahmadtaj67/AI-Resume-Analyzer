import { sanitizeFileName } from '../utils/resumeValidation.js'
import { extractPdfText } from '../utils/pdfTextExtractor.js'

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

import { PDFParse } from 'pdf-parse'

const DEFAULT_MAX_EXTRACTED_TEXT_CHARACTERS = 50000
const DEFAULT_EXTRACTED_TEXT_PREVIEW_CHARACTERS = 3000
const MIN_MEANINGFUL_TEXT_CHARACTERS = 20

const createExtractionError = (statusCode, message) => {
  const error = new Error(message)
  error.statusCode = statusCode
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

export const getMaxExtractedTextCharacters = () =>
  readPositiveInteger(
    process.env.MAX_EXTRACTED_TEXT_CHARACTERS,
    DEFAULT_MAX_EXTRACTED_TEXT_CHARACTERS,
  )

export const getExtractedTextPreviewCharacters = () => {
  const maxCharacters = getMaxExtractedTextCharacters()
  const previewCharacters = readPositiveInteger(
    process.env.EXTRACTED_TEXT_PREVIEW_CHARACTERS,
    DEFAULT_EXTRACTED_TEXT_PREVIEW_CHARACTERS,
  )

  return Math.min(previewCharacters, maxCharacters)
}

export const cleanExtractedText = (text) => {
  if (typeof text !== 'string') {
    return ''
  }

  return text
    .replace(/\u0000/g, '')
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

const countWords = (text) => {
  const words = text.match(/\b[\p{L}\p{N}'-]+\b/gu)
  return words ? words.length : 0
}

const normalizeParserError = (error) => {
  const message = `${error?.message || ''}`.toLowerCase()

  if (message.includes('password') || message.includes('encrypted')) {
    return createExtractionError(
      422,
      'Password-protected PDFs are not supported. Please upload an unlocked PDF.',
    )
  }

  return createExtractionError(
    422,
    'The selected PDF could not be read. Please upload a valid PDF file.',
  )
}

export const extractPdfText = async (pdfBuffer) => {
  if (!Buffer.isBuffer(pdfBuffer) || pdfBuffer.length === 0) {
    throw createExtractionError(
      400,
      'Please upload one PDF resume using the resume field.',
    )
  }

  const parser = new PDFParse({ data: pdfBuffer })

  try {
    const parsedPdf = await parser.getText()
    const pdfInfo = await parser.getInfo().catch(() => null)
    const maxCharacters = getMaxExtractedTextCharacters()
    const previewCharacters = getExtractedTextPreviewCharacters()
    const cleanedText = cleanExtractedText(parsedPdf.text)

    if (cleanedText.length < MIN_MEANINGFUL_TEXT_CHARACTERS) {
      throw createExtractionError(
        422,
        'No readable text was found in this PDF. It may be a scanned or image-only document.',
      )
    }

    const limitedText = cleanedText.slice(0, maxCharacters)
    const preview = limitedText.slice(0, previewCharacters)

    return {
      text: limitedText,
      preview,
      pageCount: Number.isFinite(pdfInfo?.total)
        ? pdfInfo.total
        : Number.isFinite(parsedPdf.total)
          ? parsedPdf.total
          : null,
      wordCount: countWords(limitedText),
      characterCount: limitedText.length,
      isTextReadable: true,
      isPreviewTruncated: cleanedText.length > preview.length,
      isTextTruncated: cleanedText.length > limitedText.length,
    }
  } catch (error) {
    if (error.expose) {
      throw error
    }

    throw normalizeParserError(error)
  } finally {
    await parser.destroy().catch(() => {})
  }
}

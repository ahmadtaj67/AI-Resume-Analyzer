const DEFAULT_MAX_RESUME_FILE_SIZE_MB = 5
const BYTES_PER_MB = 1024 * 1024
const PDF_MIME_TYPE = 'application/pdf'
const PDF_EXTENSION = '.pdf'

export const getMaxResumeFileSizeMb = () => {
  const configuredValue = Number(process.env.MAX_RESUME_FILE_SIZE_MB)

  if (!Number.isFinite(configuredValue) || configuredValue <= 0) {
    return DEFAULT_MAX_RESUME_FILE_SIZE_MB
  }

  return configuredValue
}

export const getMaxResumeFileSizeBytes = () =>
  Math.round(getMaxResumeFileSizeMb() * BYTES_PER_MB)

export const isPdfMimeType = (mimeType) => mimeType === PDF_MIME_TYPE

export const hasPdfExtension = (fileName) => {
  if (typeof fileName !== 'string') {
    return false
  }

  return fileName.toLowerCase().endsWith(PDF_EXTENSION)
}

export const isAllowedResumeFile = ({ mimeType, originalName }) =>
  isPdfMimeType(mimeType) && hasPdfExtension(originalName)

export const sanitizeFileName = (fileName) => {
  if (typeof fileName !== 'string') {
    return 'resume.pdf'
  }

  return fileName.replace(/[\\/]/g, '').trim() || 'resume.pdf'
}

export const resumeUploadConfig = {
  allowedMimeType: PDF_MIME_TYPE,
  allowedExtension: PDF_EXTENSION,
  maxFileSizeMb: getMaxResumeFileSizeMb(),
  maxFileSizeBytes: getMaxResumeFileSizeBytes(),
}

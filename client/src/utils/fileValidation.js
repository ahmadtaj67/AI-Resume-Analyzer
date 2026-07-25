const MAX_RESUME_FILE_SIZE_MB = 5
const MAX_RESUME_FILE_SIZE_BYTES = MAX_RESUME_FILE_SIZE_MB * 1024 * 1024
const PDF_MIME_TYPE = 'application/pdf'

export const formatFileSize = (sizeInBytes) => {
  if (!Number.isFinite(sizeInBytes) || sizeInBytes <= 0) {
    return '0 KB'
  }

  if (sizeInBytes >= 1024 * 1024) {
    return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return `${Math.ceil(sizeInBytes / 1024)} KB`
}

export const validateResumeFile = (file) => {
  if (!file) {
    return {
      isValid: false,
      error: 'Please select one PDF resume.',
    }
  }

  const hasPdfExtension =
    typeof file.name === 'string' && file.name.toLowerCase().endsWith('.pdf')

  if (file.type !== PDF_MIME_TYPE || !hasPdfExtension) {
    return {
      isValid: false,
      error: 'Only PDF resume files are allowed.',
    }
  }

  if (file.size > MAX_RESUME_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: `Resume PDF must be ${MAX_RESUME_FILE_SIZE_MB} MB or smaller.`,
    }
  }

  return {
    isValid: true,
    error: '',
  }
}

export const resumeFileRules = {
  maxSizeMb: MAX_RESUME_FILE_SIZE_MB,
  maxSizeBytes: MAX_RESUME_FILE_SIZE_BYTES,
  allowedMimeType: PDF_MIME_TYPE,
}

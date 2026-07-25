import multer from 'multer'
import {
  getMaxResumeFileSizeBytes,
  getMaxResumeFileSizeMb,
  hasPdfExtension,
  isPdfMimeType,
} from '../utils/resumeValidation.js'

const createUploadError = (statusCode, message) => {
  const error = new Error(message)
  error.statusCode = statusCode
  error.expose = true
  return error
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: getMaxResumeFileSizeBytes(),
    files: 1,
  },
  fileFilter: (req, file, callback) => {
    if (!isPdfMimeType(file.mimetype) || !hasPdfExtension(file.originalname)) {
      callback(createUploadError(400, 'Only PDF resume files are allowed.'))
      return
    }

    callback(null, true)
  },
})

export const uploadSingleResume = (req, res, next) => {
  upload.single('resume')(req, res, (error) => {
    if (!error) {
      next()
      return
    }

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        next(
          createUploadError(
            413,
            `Resume PDF must be ${getMaxResumeFileSizeMb()} MB or smaller.`,
          ),
        )
        return
      }

      if (error.code === 'LIMIT_FILE_COUNT' || error.code === 'LIMIT_UNEXPECTED_FILE') {
        next(createUploadError(400, 'Upload exactly one resume file using the resume field.'))
        return
      }
    }

    next(error)
  })
}

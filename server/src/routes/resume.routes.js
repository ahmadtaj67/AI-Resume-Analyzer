import { Router } from 'express'
import { validateResumeUpload } from '../controllers/resume.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { uploadSingleResume } from '../middleware/resumeUpload.middleware.js'

const router = Router()

router.post('/upload', authenticate, uploadSingleResume, validateResumeUpload)

export default router

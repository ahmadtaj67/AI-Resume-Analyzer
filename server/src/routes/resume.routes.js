import { Router } from 'express'
import {
  analyzeResume,
  extractResumeText,
  validateResumeUpload,
} from '../controllers/resume.controller.js'
import { getDashboardSummary } from '../controllers/resumeReport.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { uploadSingleResume } from '../middleware/resumeUpload.middleware.js'

const router = Router()

router.post('/upload', authenticate, uploadSingleResume, validateResumeUpload)
router.post('/extract-text', authenticate, uploadSingleResume, extractResumeText)
router.post('/analyze', authenticate, uploadSingleResume, analyzeResume)
router.get('/dashboard-summary', authenticate, getDashboardSummary)

export default router

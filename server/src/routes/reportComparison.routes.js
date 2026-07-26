import { Router } from 'express'
import {
  compareReports,
  getReportComparisonOptions,
} from '../controllers/reportComparison.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = Router()

router.get('/compare/options', authenticate, getReportComparisonOptions)
router.post('/compare', authenticate, compareReports)

export default router

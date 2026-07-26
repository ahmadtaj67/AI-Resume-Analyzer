import { Router } from 'express'
import {
  deleteAdminUser,
  getAdminAnalyticsOverviewData,
  getAdminAnalyticsSkillsData,
  getAdminAnalyticsTrendsData,
  getAdminDashboard,
  getAdminReportsList,
  getAdminSettings,
  getAdminUser,
  getAdminUserReportsList,
  getAdminUsersList,
  updateAdminSettings,
  updateAdminUserStatus,
} from '../controllers/admin.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { requireAdmin } from '../middleware/admin.middleware.js'

const router = Router()

router.use(authenticate, requireAdmin)

router.get('/dashboard', getAdminDashboard)
router.get('/analytics/overview', getAdminAnalyticsOverviewData)
router.get('/analytics/trends', getAdminAnalyticsTrendsData)
router.get('/analytics/skills', getAdminAnalyticsSkillsData)
router.get('/users', getAdminUsersList)
router.get('/users/:userId', getAdminUser)
router.get('/users/:userId/reports', getAdminUserReportsList)
router.get('/reports', getAdminReportsList)
router.get('/settings', getAdminSettings)
router.put('/settings', updateAdminSettings)
router.put('/users/:userId/status', updateAdminUserStatus)
router.patch('/users/:userId/status', updateAdminUserStatus)
router.delete('/users/:userId', deleteAdminUser)

export default router

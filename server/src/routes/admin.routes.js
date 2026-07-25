import { Router } from 'express'
import {
  getAdminDashboard,
  getAdminReportsList,
  getAdminUsersList,
  updateAdminUserStatus,
} from '../controllers/admin.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { requireAdmin } from '../middleware/admin.middleware.js'

const router = Router()

router.use(authenticate, requireAdmin)

router.get('/dashboard', getAdminDashboard)
router.get('/users', getAdminUsersList)
router.get('/reports', getAdminReportsList)
router.put('/users/:userId/status', updateAdminUserStatus)

export default router

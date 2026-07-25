import { Router } from 'express'
import {
  getProfile,
  updateProfile,
  updateProfilePassword,
} from '../controllers/profile.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = Router()

router.get('/', authenticate, getProfile)
router.put('/', authenticate, updateProfile)
router.put('/password', authenticate, updateProfilePassword)

export default router

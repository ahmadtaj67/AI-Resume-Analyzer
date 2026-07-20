import { Router } from 'express'
import {
  getCurrentUser,
  loginUser,
  registerUser,
} from '../controllers/auth.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/me', authenticate, getCurrentUser)

export default router

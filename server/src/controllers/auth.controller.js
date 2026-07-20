import { registerUser as registerUserService } from '../services/auth.service.js'

export const registerUser = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body
    const user = await registerUserService({ fullName, email, password })

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user,
      },
    })
  } catch (error) {
    next(error)
  }
}

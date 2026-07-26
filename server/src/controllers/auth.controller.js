import {
  loginUser as loginUserService,
  registerUser as registerUserService,
} from '../services/auth.service.js'

export const registerUser = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body
    const { accessToken, user } = await registerUserService({ fullName, email, password })

    res.status(201).json({
      success: true,
      message: 'Account created and login successful',
      data: {
        accessToken,
        user,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const { accessToken, user } = await loginUserService({ email, password })

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        user,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const getCurrentUser = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Current user retrieved successfully',
    data: {
      user: req.user,
    },
  })
}

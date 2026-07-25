const createHttpError = (statusCode, message) => {
  const error = new Error(message)
  error.statusCode = statusCode
  error.expose = true
  return error
}

export const requireAdmin = (req, res, next) => {
  if (!req.user?.id) {
    next(createHttpError(401, 'Authentication required'))
    return
  }

  if (req.user.role !== 'admin') {
    next(createHttpError(403, 'Admin access required'))
    return
  }

  next()
}

const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500
  const message =
    err.expose || statusCode < 500
      ? err.message
      : 'Internal server error'

  res.status(statusCode).json({
    success: false,
    message: message || 'Internal server error',
  })
}

export default errorMiddleware

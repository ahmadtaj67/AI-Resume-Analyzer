export const getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AI Resume Analyzer API is running',
    environment: process.env.NODE_ENV || 'development',
  })
}

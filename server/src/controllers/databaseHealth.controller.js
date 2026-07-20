import { checkDatabaseConnection } from '../services/database.service.js'

export const getDatabaseHealth = async (req, res, next) => {
  try {
    await checkDatabaseConnection()

    res.status(200).json({
      success: true,
      message: 'Supabase database connection is working',
    })
  } catch (error) {
    next(error)
  }
}

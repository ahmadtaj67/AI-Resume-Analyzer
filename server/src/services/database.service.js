import supabase from '../config/supabase.js'

export const checkDatabaseConnection = async () => {
  const { error } = await supabase.from('profiles').select('id').limit(1)

  if (error) {
    const databaseError = new Error('Unable to verify Supabase database connection')
    databaseError.statusCode = 503
    throw databaseError
  }

  return true
}

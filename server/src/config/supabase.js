import { createClient } from '@supabase/supabase-js'

const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SECRET_KEY']
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar])

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required Supabase configuration: ${missingEnvVars.join(', ')}`,
  )
}

const supabaseUrl = process.env.SUPABASE_URL.trim().replace(/\/rest\/v1\/?$/, '')

const supabase = createClient(
  supabaseUrl,
  process.env.SUPABASE_SECRET_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  },
)

export default supabase

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import adminRoutes from './routes/admin.routes.js'
import authRoutes from './routes/auth.routes.js'
import healthRoutes from './routes/health.routes.js'
import databaseHealthRoutes from './routes/databaseHealth.routes.js'
import profileRoutes from './routes/profile.routes.js'
import resumeRoutes from './routes/resume.routes.js'
import serverConfig from './config/environment.js'
import notFoundMiddleware from './middleware/notFound.middleware.js'
import errorMiddleware from './middleware/error.middleware.js'

const app = express()

app.disable('x-powered-by')

const createHttpError = (statusCode, message) => {
  const error = new Error(message)
  error.statusCode = statusCode
  error.expose = true
  return error
}

app.use(helmet())
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || serverConfig.clientOrigins.includes(origin)) {
        callback(null, true)
        return
      }

      callback(createHttpError(403, 'Origin is not allowed by CORS'))
    },
    credentials: true,
  }),
)
app.use(express.json({ limit: '1mb' }))

if (serverConfig.isDevelopment) {
  app.use(morgan('dev'))
}

app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/health', healthRoutes)
app.use('/api/health/database', databaseHealthRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/resumes', resumeRoutes)

app.use(notFoundMiddleware)
app.use(errorMiddleware)

export default app

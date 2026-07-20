import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import authRoutes from './routes/auth.routes.js'
import healthRoutes from './routes/health.routes.js'
import databaseHealthRoutes from './routes/databaseHealth.routes.js'
import notFoundMiddleware from './middleware/notFound.middleware.js'
import errorMiddleware from './middleware/error.middleware.js'

const app = express()

const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
const isDevelopment = process.env.NODE_ENV !== 'production'

app.use(helmet())
app.use(
  cors({
    origin: clientUrl,
  }),
)
app.use(express.json())

if (isDevelopment) {
  app.use(morgan('dev'))
}

app.use('/api/auth', authRoutes)
app.use('/api/health', healthRoutes)
app.use('/api/health/database', databaseHealthRoutes)

app.use(notFoundMiddleware)
app.use(errorMiddleware)

export default app

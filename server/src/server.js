import 'dotenv/config'
import app from './app.js'

const port = process.env.PORT || 5000

const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})

const shutdown = (signal) => {
  console.log(`${signal} received. Shutting down server...`)
  server.close(() => {
    console.log('Server closed.')
    process.exit(0)
  })
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

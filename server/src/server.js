import 'dotenv/config'
import serverConfig, { validateEnvironment } from './config/environment.js'

validateEnvironment()

const { default: app } = await import('./app.js')

const server = app.listen(serverConfig.port, () => {
  console.log(`Server listening on port ${serverConfig.port}`)
})

let isShuttingDown = false

const shutdown = (signal) => {
  if (isShuttingDown) {
    return
  }

  isShuttingDown = true
  console.log(`${signal} received. Shutting down server...`)

  const forceExitTimer = setTimeout(() => {
    console.error('Forced shutdown after timeout.')
    process.exit(1)
  }, 10000)

  server.close((error) => {
    clearTimeout(forceExitTimer)

    if (error) {
      console.error('Server shutdown failed.')
      process.exit(1)
    }

    console.log('Server closed.')
    process.exit(0)
  })
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

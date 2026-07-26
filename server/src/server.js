import 'dotenv/config'
import http from 'node:http'
import serverConfig, { validateEnvironment } from './config/environment.js'

validateEnvironment()

const { default: app } = await import('./app.js')

const server = http.createServer(app)

server.on('listening', () => {
  console.log(`Server listening on port ${serverConfig.port}`)
})

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${serverConfig.port} is already in use.`)
  } else {
    console.error('Server failed to start.', error)
  }

  process.exit(1)
})

server.listen(serverConfig.port)

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

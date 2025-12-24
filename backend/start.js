import 'dotenv/config'
import express from 'express'
import connectDB from './config/database.js'
import { setupMiddleware, setupRoutes, setupErrorHandling } from './config/app.js'

// Initialize Express app
const app = express()

// Connect to MongoDB
connectDB()

// Setup middleware
setupMiddleware(app)

// Setup routes (await it)
await setupRoutes(app)

// Setup error handling
setupErrorHandling(app)

// Start server
const PORT = process.env.EXECUTION_PORT || 3000
const server = app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║  Project Execution Dashboard API Server                  ║
║  Port: ${PORT}                                           ║
║  Environment: ${process.env.NODE_ENV || 'development'}   ║
║  Time: ${new Date().toISOString()}                       ║
╚══════════════════════════════════════════════════════════╝
  `)
})

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`${signal} signal received: closing HTTP server`)
  server.close(() => {
    console.log('HTTP server closed')
    process.exit(0)
  })
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

export default app

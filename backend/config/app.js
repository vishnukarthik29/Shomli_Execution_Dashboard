import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

// ESM __dirname replacement
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/* ===========================
   Middleware setup
=========================== */
export const setupMiddleware = (app) => {
  // CORS configuration
  app.use(
    cors({
      origin: true,
      credentials: true,
    }),
  )

  // Body parser middleware
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  // Static files (photo uploads)
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

  // Request logging middleware
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
    next()
  })
}

/* ===========================
   Routes setup
=========================== */
// export const setupRoutes = async (app) => {
//   const { default: projectRoutes } = await import('../routes/projectRoutes.js')

//   // API routes
//   app.use('/api', projectRoutes)

//   // Health check
//   app.get('/health', (req, res) => {
//     res.json({
//       status: 'OK',
//       timestamp: new Date().toISOString(),
//       uptime: process.uptime(),
//     })
//   })

//   // 404 handler
//   app.use((req, res) => {
//     res.status(404).json({ error: 'Route not found' })
//   })
// }
/* ===========================
   Routes setup
=========================== */
export const setupRoutes = (app) => {
  import('../routes/projectRoutes.js').then(({ default: projectRoutes }) => {
    // API routes
    app.use('/api', projectRoutes)

    // Health check
    app.get('/health', (req, res) => {
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      })
    })

    // 404 handler
    app.use((req, res) => {
      res.status(404).json({ error: 'Route not found' })
    })
  })
}

/* ===========================
   Error handling
=========================== */
export const setupErrorHandling = (app) => {
  app.use((err, req, res, next) => {
    console.error('Error:', err.stack)

    res.status(err.status || 500).json({
      error: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
      }),
    })
  })
}

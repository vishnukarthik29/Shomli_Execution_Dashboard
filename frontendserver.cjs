const express = require('express')
const path = require('path')

const app = express()
const PORT = 7174

const distPath = path.join(__dirname, 'dist')

// Serve static files
app.use(express.static(distPath))

// SPA fallback — Express v5 compatible
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Frontend running on http://0.0.0.0:${PORT}`)
})

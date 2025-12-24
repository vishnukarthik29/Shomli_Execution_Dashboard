import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

// ESM __dirname replacement
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Multer storage configuration (DISK – for photos)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

// File filter
const fileFilter = (req, file, cb) => {
  const allowedExt = /\.(jpeg|jpg|png|gif|xlsx|xls)$/i
  const allowedMime = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ]

  const extname = allowedExt.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedMime.includes(file.mimetype)

  if (extname && mimetype) {
    return cb(null, true)
  }

  cb(
    new Error(
      `Invalid file type.
Allowed: JPG, PNG, GIF, XLS, XLSX
Received: ${file.mimetype}`,
    ),
  )
}

// Export multer instance (ESM)
export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter,
})

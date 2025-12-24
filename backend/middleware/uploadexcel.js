import multer from 'multer'

// Memory storage (NO FILE SAVED)
const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  const allowedExt = /\.(xlsx|xls)$/i
  const allowedMime = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ]

  if (allowedExt.test(file.originalname) && allowedMime.includes(file.mimetype)) {
    return cb(null, true)
  }

  cb(new Error('Invalid Excel file'))
}

export const uploadExcelOnly = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
})

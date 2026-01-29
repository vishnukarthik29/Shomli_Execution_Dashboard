import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import * as projectController from '../controllers/projectController.js'
import * as uploadController from '../controllers/uploadController.js'
import * as materialController from '../controllers/materialController.js'
import { upload } from '../middleware/upload.js'
import { uploadExcelOnly } from '../middleware/uploadexcel.js'
import { sendTDSMail } from '../controllers/projectController.js'

const router = Router()

const uploadPath = 'uploads/tds'

// Ensure folder exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const ext = path.extname(file.originalname)
    cb(null, uniqueName + ext)
  },
})

const emailupload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
  // NO fileFilter = Accept ALL file types
})

router.post('/materials/send-tds-mail', emailupload.single('file'), sendTDSMail)
// Dashboard & summary routes
router.get('/dashboard/summary', projectController.getSummary)
router.get('/sites', projectController.getSites)

// Line item CRUD routes
router.get('/line-items', projectController.getAllLineItems)
router.get('/alerts', projectController.getAlertCardData)
router.get('/line-items/:id', projectController.getLineItemById)
router.post('/line-items', projectController.createLineItem)
router.put('/line-items/:id', projectController.updateLineItem)
router.delete('/line-items/:id', projectController.deleteLineItem)

// Upload routes
router.post('/upload/excel', uploadExcelOnly.single('file'), uploadController.uploadExcel)

router.post('/upload/photos', upload.array('photos', 10), uploadController.uploadPhotos)
// routes/projectRoutes.js
router.get('/line-items/:id/photos', uploadController.getLineItemPhotos)

router.delete('/upload/photos', uploadController.deletePhoto)

router.get('/materials/unique', projectController.getUniqueMaterials)

// Material routes
router.get('/materials', materialController.getAllMaterials)
router.get('/materials/categories', materialController.getMaterialCategories)
router.get('/materials/:id', materialController.getMaterialById)
router.post('/materials', materialController.createMaterial)
router.put('/materials/:id', materialController.updateMaterial)
router.delete('/materials/:id', materialController.deleteMaterial)

export default router

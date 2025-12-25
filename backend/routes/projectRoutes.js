import { Router } from 'express'
import * as projectController from '../controllers/projectController.js'
import * as uploadController from '../controllers/uploadController.js'
import { upload } from '../middleware/upload.js'
import { uploadExcelOnly } from '../middleware/uploadexcel.js'

const router = Router()

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

export default router

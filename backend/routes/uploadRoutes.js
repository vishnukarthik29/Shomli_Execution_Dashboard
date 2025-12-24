import express from 'express'
import { upload } from '../middlewares/multer.js'
import { uploadPhotos } from '../controllers/upload.controller.js'

const router = express.Router()

router.post('/upload/photos', upload.array('photos', 10), uploadPhotos)

export default router

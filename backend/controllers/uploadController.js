import XLSX from 'xlsx'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import ProjectLineItem from '../models/ProjectLineItem.js'

// ESM __dirname replacement
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/* ===========================
   Upload Excel file
=========================== */

export const uploadExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const { siteName } = req.body
    if (!siteName) {
      return res.status(400).json({ error: 'Site name is required' })
    }

    // READ DIRECTLY FROM MEMORY
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]

    const data = XLSX.utils.sheet_to_json(worksheet, {
      defval: '',
      raw: false,
      blankrows: false,
    })

    const lineItems = []
    const errors = []

    for (let i = 0; i < data.length; i++) {
      const row = data[i]

      // normalize headers
      const normalized = {}
      Object.keys(row).forEach((k) => {
        normalized[k.toLowerCase().replace(/\s+/g, '').replace('%', 'percent')] = row[k]
      })

      const lineItem = {
        siteName,
        sno: String(normalized['s.no'] || i + 1),
        projectName: siteName,
        category: String(normalized['category'] || ''),
        itemDescription: String(normalized['itemdescription'] || ''),
        quantity: Number(normalized['quantity'] || 0),
        units: String(normalized['units'] || ''),
        rate: Number(normalized['rate'] || 0),
        amount: Number(normalized['amount'] || 0),
        materialStatus: String(normalized['materialstatus'] || 'Pending'),
        workStatusInUnits: Number(normalized['workstatusinunits'] || 0),
        workCompletionPercentage: Number(normalized['workcompletionpercent'] || 0),
        workCompletionAmount: Number(normalized['workcompletionamount'] || 0),
        materialPhoto: [],
        workCompletionPhoto: [],
        finishedPhoto: [],
      }

      if (!lineItem.category || !lineItem.itemDescription) {
        errors.push(`Row ${i + 1}: Missing required fields`)
        continue
      }

      lineItems.push(lineItem)
    }

    if (!lineItems.length) {
      return res.status(400).json({ error: 'No valid line items found', errors })
    }

    const saved = await ProjectLineItem.insertMany(lineItems)

    res.json({
      message: `Uploaded ${saved.length} items successfully`,
      count: saved.length,
      errors: errors.length ? errors : undefined,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// /* ===========================
//    Upload photos
// =========================== */
// export const uploadPhotos = async (req, res) => {
//   try {
//     const { lineItemId, photoType } = req.body

//     if (!lineItemId || !photoType) {
//       return res.status(400).json({ error: 'Line item ID and photo type are required' })
//     }

//     if (!['materialPhoto', 'workCompletionPhoto', 'finishedPhoto'].includes(photoType)) {
//       return res.status(400).json({ error: 'Invalid photo type' })
//     }

//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ error: 'No files uploaded' })
//     }

//     const photos = req.files.map((file) => ({
//       url: `/uploads/${file.filename}`,
//       uploadedAt: new Date(),
//     }))

//     const updatedLineItem = await ProjectLineItem.findByIdAndUpdate(
//       lineItemId,
//       {
//         $push: {
//           [photoType]: { $each: photos },
//         },
//       },
//       { new: true },
//     )

//     if (!updatedLineItem) {
//       return res.status(404).json({ error: 'Line item not found' })
//     }

//     res.json({
//       message: 'Photos uploaded successfully',
//       photos,
//       lineItem: updatedLineItem,
//     })
//   } catch (error) {
//     console.error(error)
//     res.status(500).json({ error: error.message })
//   }
// }
export const uploadPhotos = async (req, res) => {
  try {
    const { lineItemId, photoType } = req.body

    if (!lineItemId || !photoType) {
      return res.status(400).json({ error: 'Line item ID and photo type are required' })
    }

    if (!['materialPhoto', 'workCompletionPhoto', 'finishedPhoto'].includes(photoType)) {
      return res.status(400).json({ error: 'Invalid photo type' })
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' })
    }

    // 🔹 Fetch existing line item first
    const lineItem = await ProjectLineItem.findById(lineItemId)
    if (!lineItem) {
      return res.status(404).json({ error: 'Line item not found' })
    }

    const photos = req.files.map((file) => ({
      url: `/uploads/${file.filename}`,
      uploadedAt: new Date(),
    }))

    // 🔹 Prepare update object
    const update = {
      $push: {
        [photoType]: { $each: photos },
      },
    }

    // 🔥 BUSINESS RULE:
    // First material photo → mark material as Initialized/Delivered
    if (
      photoType === 'materialPhoto' &&
      (!lineItem.materialPhoto || lineItem.materialPhoto.length === 0)
    ) {
      update.$set = {
        materialStatus: 'Intialized/Delivered',
      }
    }

    const updatedLineItem = await ProjectLineItem.findByIdAndUpdate(lineItemId, update, {
      new: true,
    })

    res.json({
      message: 'Photos uploaded successfully',
      photos,
      materialStatusUpdated: photoType === 'materialPhoto' && lineItem.materialPhoto.length === 0,
      lineItem: updatedLineItem,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
}

// /* ===========================
//    Get photos for a line item
// =========================== */

export const getLineItemPhotos = async (req, res) => {
  try {
    const { id } = req.params
    const { photoType } = req.query

    if (!photoType) {
      return res.status(400).json({ error: 'photoType is required' })
    }

    if (!['materialPhoto', 'workCompletionPhoto', 'finishedPhoto'].includes(photoType)) {
      return res.status(400).json({ error: 'Invalid photo type' })
    }

    const lineItem = await ProjectLineItem.findById(id).select(photoType)

    if (!lineItem) {
      return res.status(404).json({ error: 'Line item not found' })
    }

    const photos = (lineItem[photoType] || []).sort(
      (a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt),
    )

    res.json({
      lineItemId: id,
      photoType,
      count: photos.length,
      photos,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
}

/* ===========================
   Delete photo
=========================== */
export const deletePhoto = async (req, res) => {
  try {
    const { lineItemId, photoType, photoUrl } = req.body

    if (!lineItemId || !photoType || !photoUrl) {
      return res.status(400).json({
        error: 'lineItemId, photoType and photoUrl are required',
      })
    }

    if (!['materialPhoto', 'workCompletionPhoto', 'finishedPhoto'].includes(photoType)) {
      return res.status(400).json({ error: 'Invalid photoType' })
    }

    const lineItem = await ProjectLineItem.findById(lineItemId)
    if (!lineItem) {
      return res.status(404).json({ error: 'Line item not found' })
    }

    // ✅ Find photo index by URL
    const index = lineItem[photoType].findIndex((photo) => photo.url === photoUrl)

    if (index === -1) {
      return res.status(404).json({ error: 'Photo not found' })
    }

    // Remove from DB
    lineItem[photoType].splice(index, 1)

    // Remove file from disk
    const filePath = path.join(__dirname, '..', '..', photoUrl)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    await lineItem.save()

    res.json({
      message: 'Photo deleted successfully',
      photoType,
      remainingPhotos: lineItem[photoType],
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
}

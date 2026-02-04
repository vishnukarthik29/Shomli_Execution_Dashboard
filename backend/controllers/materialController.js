// controllers/materialController.js
import ProjectLineItem from '../models/ProjectLineItem.js'
import Material from '../models/Material.js'
import path from 'path'
import fs from 'fs'

// Get all materials
export const getAllMaterials = async (req, res) => {
  try {
    const { search, category, isActive } = req.query

    const filter = {}

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ]
    }

    if (category) {
      filter.category = category
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true'
    }

    const materials = await Material.find(filter).sort({ name: 1 })
    res.json(materials)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get material by ID
export const getMaterialById = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)

    if (!material) {
      return res.status(404).json({ error: 'Material not found' })
    }

    res.json(material)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Create material
export const createMaterial = async (req, res) => {
  try {
    const { name, unit, description, category } = req.body

    // Check for duplicate (case-insensitive)
    const existing = await Material.findOne({
      name: { $regex: `^${name}$`, $options: 'i' },
    })

    if (existing) {
      return res.status(400).json({
        error: 'Material with this name already exists',
        material: existing,
      })
    }

    const material = new Material({
      name: name.trim(),
      unit: unit?.trim() || '',
      description: description?.trim() || '',
      category: category || 'General',
    })

    await material.save()
    res.status(201).json(material)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// Update material
export const updateMaterial = async (req, res) => {
  try {
    const { name, unit, description, category, isActive } = req.body

    const material = await Material.findById(req.params.id)

    if (!material) {
      return res.status(404).json({ error: 'Material not found' })
    }

    // Check for duplicate name if changing name
    if (name && name !== material.name) {
      const existing = await Material.findOne({
        name: { $regex: `^${name}$`, $options: 'i' },
        _id: { $ne: req.params.id },
      })

      if (existing) {
        return res.status(400).json({ error: 'Material with this name already exists' })
      }

      material.name = name.trim()
    }

    if (unit !== undefined) material.unit = unit.trim()
    if (description !== undefined) material.description = description.trim()
    if (category !== undefined) material.category = category
    if (isActive !== undefined) material.isActive = isActive

    await material.save()
    res.json(material)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// Delete material
export const deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findByIdAndDelete(req.params.id)

    if (!material) {
      return res.status(404).json({ error: 'Material not found' })
    }

    res.json({ message: 'Material deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get unique categories
export const getMaterialCategories = async (req, res) => {
  try {
    const categories = await Material.distinct('category')
    res.json(categories.sort())
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
// export const uploadSampleFiles = async (req, res) => {
//   try {
//     const { materialId, lineItemId } = req.body

//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ message: 'No files uploaded' })
//     }

//     const lineItem = await ProjectLineItem.findById(lineItemId)
//     if (!lineItem) {
//       return res.status(404).json({ message: 'Line item not found' })
//     }

//     const material = lineItem.materials.id(materialId)
//     if (!material) {
//       return res.status(404).json({ message: 'Material not found' })
//     }

//     // Initialize sampleHistory if it doesn't exist
//     if (!material.sampleHistory) {
//       material.sampleHistory = []
//     }

//     // Add all uploaded files to sampleHistory
//     const uploadedFiles = req.files.map((file) => ({
//       fileUrl: `/uploads/samples/${file.filename}`,
//       fileName: file.originalname,
//       fileType: file.mimetype,
//       uploadedAt: new Date(),
//     }))

//     material.sampleHistory.push(...uploadedFiles)

//     await lineItem.save()

//     res.status(200).json({
//       message: 'Files uploaded successfully',
//       files: uploadedFiles,
//       material,
//     })
//   } catch (error) {
//     console.error('Error uploading sample files:', error)
//     res.status(500).json({ message: 'Failed to upload files', error: error.message })
//   }
// }
// materialController.js
// export const uploadSampleFiles = async (req, res) => {
//   try {
//     console.log('Request body:', req.body)
//     console.log('Request files:', req.files)

//     const { materialId, lineItemId } = req.body

//     // Validate IDs
//     if (!lineItemId || lineItemId === 'undefined' || lineItemId === 'null') {
//       return res.status(400).json({ message: 'Line item ID is required' })
//     }

//     if (!materialId || materialId === 'undefined' || materialId === 'null') {
//       return res.status(400).json({ message: 'Material ID is required' })
//     }

//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ message: 'No files uploaded' })
//     }

//     console.log('Finding line item:', lineItemId)
//     const lineItem = await ProjectLineItem.findById(lineItemId)
//     if (!lineItem) {
//       return res.status(404).json({ message: 'Line item not found' })
//     }

//     console.log('Finding material:', materialId)
//     const material = lineItem.materials.id(materialId)
//     if (!material) {
//       return res.status(404).json({ message: 'Material not found in line item' })
//     }

//     // Initialize sampleHistory if it doesn't exist
//     if (!material.sampleHistory) {
//       material.sampleHistory = []
//     }

//     // Add all uploaded files to sampleHistory
//     const uploadedFiles = req.files.map((file) => ({
//       fileUrl: `/uploads/samples/${file.filename}`,
//       fileName: file.originalname,
//       fileType: file.mimetype,
//       uploadedAt: new Date(),
//     }))

//     material.sampleHistory.push(...uploadedFiles)

//     await lineItem.save()

//     res.status(200).json({
//       message: 'Files uploaded successfully',
//       files: uploadedFiles,
//       material,
//     })
//   } catch (error) {
//     console.error('Error uploading sample files:', error)
//     res.status(500).json({ message: 'Failed to upload files', error: error.message })
//   }
// }
// export const uploadSampleFiles = async (req, res) => {
//   try {
//     console.log('Request body:', req.body)
//     console.log('Request files:', req.files)

//     const { materialId, lineItemId } = req.body

//     // Validate IDs
//     if (!materialId || materialId === 'undefined' || materialId === 'null') {
//       return res.status(400).json({ message: 'Material ID is required' })
//     }

//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ message: 'No files uploaded' })
//     }

//     // Find the material directly
//     console.log('Finding material:', materialId)
//     const material = await Material.findById(materialId)
//     if (!material) {
//       return res.status(404).json({ message: 'Material not found' })
//     }

//     // Initialize samples array if it doesn't exist
//     if (!material.samples) {
//       material.samples = []
//     }

//     // Add all uploaded files to samples
//     const uploadedFiles = req.files.map((file) => ({
//       fileUrl: `/uploads/samples/${file.filename}`,
//       fileName: file.originalname,
//       fileType: file.mimetype,
//       uploadedAt: new Date(),
//       relatedLineItems: lineItemId ? [lineItemId] : [],
//     }))

//     material.samples.push(...uploadedFiles)
//     await material.save()

//     res.status(200).json({
//       message: 'Files uploaded successfully',
//       files: uploadedFiles,
//       material,
//     })
//   } catch (error) {
//     console.error('Error uploading sample files:', error)
//     res.status(500).json({ message: 'Failed to upload files', error: error.message })
//   }
// }
export const uploadSampleFiles = async (req, res) => {
  try {
    const { materialId } = req.body

    if (!materialId) {
      return res.status(400).json({ message: 'materialId is required' })
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' })
    }

    // Find ALL line items that use this material
    const lineItems = await ProjectLineItem.find({
      'materials.materialId': materialId,
    })

    if (!lineItems.length) {
      return res.status(404).json({
        message: 'No project items use this material',
      })
    }

    const uploadedFiles = req.files.map((file) => ({
      fileUrl: `/uploads/samples/${file.filename}`,
      fileName: file.originalname,
      fileType: file.mimetype,
      uploadedAt: new Date(),
    }))

    let updatedCount = 0

    for (const item of lineItems) {
      let changed = false

      item.materials.forEach((mat) => {
        if (mat.materialId.toString() === materialId) {
          if (!mat.sampleHistory) {
            mat.sampleHistory = []
          }

          mat.sampleHistory.push(...uploadedFiles)
          mat.Samples = 'yes'
          changed = true
        }
      })

      if (changed) {
        await item.save()
        updatedCount++
      }
    }

    res.json({
      message: 'Samples saved to all project items using this material',
      files: uploadedFiles,
      updatedLineItems: updatedCount,
    })
  } catch (err) {
    console.error('Upload error:', err)
    res.status(500).json({
      message: 'Upload failed',
      error: err.message,
    })
  }
}

// export const getSampleHistory = async (req, res) => {
//   try {
//     const { lineItemId, materialId } = req.params

//     const lineItem = await ProjectLineItem.findById(lineItemId)
//     if (!lineItem) {
//       return res.status(404).json({ message: 'Line item not found' })
//     }

//     const material = lineItem.materials.id(materialId)
//     if (!material) {
//       return res.status(404).json({ message: 'Material not found' })
//     }

//     res.status(200).json({
//       sampleHistory: material.sampleHistory || [],
//     })
//   } catch (error) {
//     console.error('Error fetching sample history:', error)
//     res.status(500).json({ message: 'Failed to fetch sample history', error: error.message })
//   }
// }
export const getSampleHistory = async (req, res) => {
  try {
    const { lineItemId, materialId } = req.params

    const lineItem = await ProjectLineItem.findById(lineItemId)
    if (!lineItem) {
      return res.status(404).json({ message: 'Line item not found' })
    }

    const material = lineItem.materials.find((m) => m.materialId.toString() === materialId)

    if (!material) {
      return res.status(404).json({ message: 'Material not found' })
    }

    res.json({
      sampleHistory: material.sampleHistory || [],
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getGlobalSamples = async (req, res) => {
  try {
    const { materialId } = req.params

    // if (!mongoose.Types.ObjectId.isValid(materialId)) {
    //   return res.status(400).json({ message: 'Invalid materialId' })
    // }

    // Find ONE line item that uses this material
    const lineItem = await ProjectLineItem.findOne({
      'materials.materialId': materialId,
    })

    if (!lineItem) {
      return res.json({ sampleHistory: [] })
    }

    const material = lineItem.materials.find((m) => m.materialId.toString() === materialId)

    res.json({
      sampleHistory: material?.sampleHistory || [],
    })
  } catch (err) {
    console.error('Fetch samples error:', err)
    res.status(500).json({
      message: 'Failed to fetch samples',
      error: err.message,
    })
  }
}

export const deleteSampleFile = async (req, res) => {
  try {
    const { lineItemId, materialId, sampleId } = req.params

    const lineItem = await ProjectLineItem.findById(lineItemId)
    if (!lineItem) {
      return res.status(404).json({ message: 'Line item not found' })
    }

    const material = lineItem.materials.id(materialId)
    if (!material) {
      return res.status(404).json({ message: 'Material not found' })
    }

    const sampleIndex = material.sampleHistory.findIndex((s) => s._id.toString() === sampleId)

    if (sampleIndex === -1) {
      return res.status(404).json({ message: 'Sample not found' })
    }

    const sample = material.sampleHistory[sampleIndex]

    // Delete physical file
    const filePath = path.join(process.cwd(), sample.fileUrl.replace(/^\//, ''))
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    material.sampleHistory.splice(sampleIndex, 1)
    await lineItem.save()

    res.status(200).json({ message: 'Sample deleted successfully' })
  } catch (error) {
    console.error('Error deleting sample:', error)
    res.status(500).json({ message: 'Failed to delete sample', error: error.message })
  }
}

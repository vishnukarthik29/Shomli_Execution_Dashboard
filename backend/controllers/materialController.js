// controllers/materialController.js
import Material from '../models/Material.js'

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

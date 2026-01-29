// models/Material.js
import mongoose from 'mongoose'

const materialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    unit: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: 'General',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

// Case-insensitive index for faster searches
materialSchema.index({ name: 'text' })

const Material = mongoose.model('Material', materialSchema)

export default Material
